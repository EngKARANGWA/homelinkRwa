# Backend gaps found during the property/unit/tenant workflow review

Reviewed against the live OpenAPI spec at `https://api.homelink.rw/api-docs` on 2026-09-05,
while implementing the Landlord → Property → Unit → Tenant → Rent Payment workflow on the
frontend. This lists what the **backend** would need to change; everything else in that workflow
(unit CRUD/bulk-generate/Excel import+preview+template, lease creation with a new tenant +
per-lease rent override, property document upload, `terms`/`attributes` custom fields) is already
fully supported by the live API and just needed frontend wiring — see the corresponding frontend
changes for details.

## 1. Property/unit status has no MAINTENANCE or INACTIVE state

**Where:** `Property.status` and the unit status returned by `GET/POST /properties/{id}/units*`.

**Current behavior:** the enum is only `available | occupied` (confirmed directly in the OpenAPI
schema — searched for every `status` enum in the spec, this is the only one used for
properties/units).

**Why it matters:** the intended business rules for units are:

```
AVAILABLE | OCCUPIED | MAINTENANCE | INACTIVE
```

A unit that's being repaired, or one a landlord wants to temporarily pull off the market, has no
way to be represented today — it either has to stay `available` (and could get assigned a tenant
by mistake) or get force-marked `occupied` (which is misleading and would break occupancy/rent
statistics).

**Suggested fix:** extend the unit status enum to `available | occupied | maintenance |
inactive`, and:
- Exclude `maintenance`/`inactive` units from `GET /properties/units` (available-units search) and
  from `POST /leases` (reject assignment attempts with a clear error).
- Add a way to set a unit's status directly (e.g. `PATCH /properties/{id}/units/{unitId}` already
  exists for other fields — extending it to accept `status` would be the natural place) rather
  than only ever deriving it from lease assignment/vacancy.

This is scoped to units specifically — property-level `status` can likely stay
`available|occupied` as-is, since a property's own status is really just "does it have any
occupied unit," which doesn't need `maintenance`/`inactive`.

## 2. CORS allow-list blocks local frontend development entirely

**Where:** every endpoint — this isn't route-specific, it's the server's global CORS config.

**Confirmed directly** (bypassing the browser, so this isn't a frontend misconfiguration):

```
curl -i -X POST https://api.homelink.rw/api/v1/auth/login \
  -H "Origin: http://localhost:3000" -H "Content-Type: application/json" \
  -d '{"email":"tenant.demo@homelink.dev","password":"wrongpass"}'
```

The backend processes the request normally (returns a real `401 Invalid email or password`), but
the response has **no `Access-Control-Allow-Origin` header** for `Origin: http://localhost:3000`.
The same is true for the CORS preflight (`OPTIONS`) response — it includes
`Access-Control-Allow-Methods`/`Access-Control-Allow-Headers` but never
`Access-Control-Allow-Origin` for this origin. Since the browser requires that header on both the
preflight and the actual response, it silently discards every response before any frontend code
ever sees it — the request appears to "fail" with no readable error, even though the backend
answered correctly.

**Why it matters:** this is the only backend available to develop against (confirmed — both
entries in the spec's `servers` list are labeled production, there's no dev/staging instance), so
right now nobody can run the frontend locally against real data at all without a workaround.

**Suggested fix:** add `http://localhost:3000` (and whatever other local/staging origins the team
uses) to the CORS allow-list, ideally driven by an env var so each environment can list its own
allowed origins without a code change per addition.

**Frontend workaround in place until this is fixed:** a Next.js rewrite in `next.config.ts`
proxies `/api/v1/*` to the real backend server-side (server-to-server calls aren't subject to
browser CORS), so local dev works today without waiting on this fix. Safe to remove once the
allow-list is updated, but no harm in leaving it either way.

## 3. Landlord/house-manager-created tenants have no password to share

**Where:** `POST /leases` with `newTenant`, and `POST /admin/house-owners` (same pattern, per that
endpoint's own response description).

**Current behavior:** the response description literally says *"a 'set your password' email is
sent"* — no password is generated or returned anywhere. The new tenant/owner must open that email
and set their own password before they can log in.

**Why it matters:** confirmed with the product owner — many tenants don't have a working/checked
email address at all, so the landlord needs to hand over working login credentials directly via
WhatsApp or SMS right after registering them (the tenant's phone number is already collected at
registration). The current email-only flow leaves those tenants unable to log in at all.

**Suggested fix:** have `POST /leases` (`newTenant` case) generate a random temporary password for
the new account and return it **once** in the response, e.g.:

```json
{
  "data": {
    "id": "...",            // the lease, as today
    "...": "...",
    "newTenantCredentials": {
      "email": "tenant@example.com",
      "tempPassword": "Xk9-Rt42"
    }
  }
}
```

(Field name/shape is a suggestion, not a requirement — whatever fits the existing response
pattern is fine, the frontend just needs *some* one-time field with the plaintext temp password.)

Strongly recommend pairing this with a `mustChangePassword` flag on the account so the tenant is
forced to set their own password on first login — that keeps the "landlord can see it once to
hand it over" convenience without it staying valid long-term. Whether to keep sending the
"set your password" email alongside this (as a backup channel) is a product call for whoever owns
that decision.

**Frontend status:** `AddTenantForm.tsx` already reads `lease.newTenantCredentials` and shows a
one-time "share these with your tenant" panel when present (falling back to the current "check
their email" message when it's absent), with:
- Copy buttons for the email and temp password individually.
- A **"Send via WhatsApp"** button (`wa.me/<phone>?text=...`) and a **"Send via SMS"** button
  (`sms:<phone>?body=...`), both pre-filled with a message containing the email, temp password,
  and login link, using the phone number already collected on the same form.

This will start working the moment the backend adds the field — no further frontend change
needed.

## 4. Tenants and house managers can't be looked up by id (name/email/phone) by their owner

**Where:** every place a lease, payment, or invoice only carries a bare `tenantId` — there is no
endpoint an owner or house manager can call to resolve that id into an actual name.

**Confirmed directly:** `GET /admin/users` (the only user-lookup endpoint that exists) returns
`403 Forbidden` for an owner-role token. There is no owner/house-manager-scoped equivalent — compare
to `GET /iam/managers`, which *does* let an owner list their own house managers, but there's no
equivalent for tenants.

**Why it matters:** every tenant-facing list in the app (owner dashboard, Tenants page, Leases
page, Payments page, and the same on house-manager pages) can only show a computed placeholder like
`Tenant A1B2C3D4` instead of the tenant's real name, because the frontend has no legal way to ask
"who is this tenant id."

**Suggested fix:** either (a) add an owner/house-manager-scoped endpoint analogous to
`GET /iam/managers` but for tenants (e.g. `GET /iam/tenants`, scoped to tenants with an active
lease on one of the caller's properties), or (b) denormalize a `tenant: {firstName, lastName,
email, phone}` object directly onto the `Lease`/`Payment`/`Invoice` API responses so no separate
lookup is ever needed. Either works from the frontend's side — (b) is less request-chatty.

## 5. Unit records have fields with no way to actually set them

**Where:** `POST /properties/{id}/units`, `POST /properties/{id}/units/generate`,
`PATCH /properties/{id}/units/{unitId}`, and the Excel import (`/units/import`).

**Confirmed directly:** a real unit object returned by `GET /properties/units` includes
`unitType`, `description`, and `deposit` fields (e.g. `"unitType":null,"description":null,...`) —
but none of the write endpoints accept any of those three. Every one of them only takes some
subset of `label`, `floor` (generate only), `bedrooms`, `bathrooms`, `rentAmount`. There's
currently no way, ever, to set a unit's type, description, or deposit amount.

**Why it matters:** this is directly called for in the original spec — a unit is supposed to carry
"Unit type, ... Monthly rent, Status, Description" and (elsewhere) "Deposit." Right now those three
fields exist in the data model and just sit permanently `null`.

**Suggested fix:** accept `unitType`, `description`, and `deposit` on create, generate (as a shared
default, same pattern as `bedrooms`/`bathrooms`), update, and the Excel import's column list.

## Everything else checked and found already correct

- The auto-generated lease PDF (`GET /leases/{id}/document`) now returns a real PDF — verified
  live against a signed-in owner account and an actual lease id. This was previously broken
  ("Internal server error", missing Chromium for the server-side PDF renderer) but is fixed as of
  this pass on `api.homelink.rw`.
- `POST /leases` already supports `newTenant` (creates the account) and a per-lease `rentAmount`
  that can differ from the unit's own default rent — this is exactly what the frontend needed for
  "register tenant + assign unit + let the landlord edit the price" and needs no further change
  beyond item 3 above.
- `POST /properties/{id}/units/import` correctly returns per-row `{row, message}` errors and
  imports nothing on any invalid row (confirmed via the endpoint doc comment) — good, matches the
  "show validation errors, don't partially import" requirement.
- `CreatePropertyInput.terms` (string list) and `.attributes` ({label,value} list) already exist
  and needed no backend change — the frontend property form simply never sent them.

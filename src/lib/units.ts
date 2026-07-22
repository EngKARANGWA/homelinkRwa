import { LEASES, PAYMENTS, TENANTS, TODAY, type Lease, type Payment, type Property } from "./mock-admin-data";

export type UnitPayment = {
  month: string;
  amount: number;
  status: "Paid" | "Overdue";
  paidDate: string | null;
};

export type Unit = {
  id: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
  leaseId: string | null;
  tenant: string | null;
  monthlyRent: number;
  deposit: number | null;
  startDate: string | null;
  endDate: string | null;
  rentDueDay: number | null;
  occupancyStatus: "Occupied" | "Vacant";
  currentPaymentStatus: "Paid" | "Overdue" | "Vacant";
  phone: string | null;
  paymentMethod: string | null;
  documents: string[];
  paymentHistory: UnitPayment[];
  isReal: boolean;
};

export type TenantEditValues = {
  tenant: string;
  phone: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string | null;
  paymentMethod: string;
};

export type PaymentOverride = {
  amount: number;
  method: string;
  paidDate: string;
};

export type UnitOverrides = {
  /** New leases created via the landlord "Add Tenant" flow. */
  extraLeases?: Lease[];
  /** Ids of leases (global or extra) the landlord has removed. */
  removedLeaseIds?: string[];
  /** Edits keyed by unit id, applied to both real and generated-filler units. */
  unitEdits?: Record<string, Partial<TenantEditValues>>;
  /** Unit ids the landlord has explicitly vacated (removed a filler tenant). */
  vacatedUnitIds?: string[];
  /** Manually recorded payments (e.g. cash) keyed by unit id, applied to the current month. */
  paymentOverrides?: Record<string, PaymentOverride>;
};

const FILLER_FIRST_NAMES = [
  "Alice",
  "Eric",
  "Diane",
  "Patrick",
  "Grace",
  "Vestine",
  "Faustin",
  "Clarisse",
  "Innocent",
  "Aline",
  "Marie",
  "Jean",
  "Christine",
  "Bosco",
  "Yvonne",
];
const FILLER_LAST_NAMES = [
  "Uwimana",
  "Mukamana",
  "Niyonsenga",
  "Habimana",
  "Keza",
  "Mutesi",
  "Gasana",
  "Ingabire",
  "Ndayisenga",
  "Nkurunziza",
  "Rugamba",
  "Uwase",
  "Mugisha",
  "Byiringiro",
];
const PAYMENT_METHODS = [
  "MTN Mobile Money",
  "Airtel Money",
  "Bank Transfer",
  "Cash",
] as const;

function fillerName(seed: number): string {
  const first = FILLER_FIRST_NAMES[seed % FILLER_FIRST_NAMES.length];
  const last = FILLER_LAST_NAMES[(seed * 7 + 3) % FILLER_LAST_NAMES.length];
  return `${first} ${last}`;
}

function fillerPhone(seed: number): string {
  const d1 = seed % 10;
  const p1 = String(100 + ((seed * 37) % 900)).padStart(3, "0");
  const p2 = String(100 + ((seed * 53) % 900)).padStart(3, "0");
  return `+250 78${d1} ${p1} ${p2}`;
}

function unitLabel(index: number): string {
  const block = String.fromCharCode(65 + Math.floor(index / 5));
  const n = (index % 5) + 1;
  return `${block}${String(n).padStart(2, "0")}`;
}

function monthsBack(count: number): string[] {
  const [y, m] = TODAY.split("-").map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    let year = y;
    let month = m - i;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }
    out.push(`${year}-${String(month).padStart(2, "0")}`);
  }
  return out;
}

function generatePaymentHistory(
  monthlyRent: number,
  seed: number,
  options: { realPayments?: Payment[]; allowOverdueFiller: boolean; sinceMonth?: string },
): UnitPayment[] {
  return monthsBack(5)
    .filter((month) => !options.sinceMonth || month >= options.sinceMonth)
    .map((month, i) => {
      const real = options.realPayments?.find((p) => p.dueDate.startsWith(month));
      if (real) {
        const isOverdue =
          real.status === "Late" ||
          ((real.status === "Pending" || real.status === "Pending Approval") &&
            real.dueDate < TODAY);
        return {
          month,
          amount: real.amount,
          status: real.status === "Paid" ? "Paid" : isOverdue ? "Overdue" : "Paid",
          paidDate: real.paidDate,
        };
      }
      const overdue = options.allowOverdueFiller && (seed + i) % 6 === 0;
      return {
        month,
        amount: monthlyRent,
        status: overdue ? "Overdue" : "Paid",
        paidDate: overdue ? null : `${month}-01`,
      };
    });
}

function isActiveLease(lease: Lease): boolean {
  return lease.status === "Active" || lease.status === "Renewal Requested";
}

function buildRealUnit(
  property: Property,
  lease: Lease,
  unitNumber: string,
  id: string,
  seed: number,
): Unit {
  const tenantRecord = TENANTS.find((t) => t.name === lease.tenant);
  const realPayments = PAYMENTS.filter(
    (p) => p.tenant === lease.tenant && p.property === property.name,
  );
  const paymentHistory = generatePaymentHistory(lease.rent, seed, {
    realPayments,
    allowOverdueFiller: false,
    sinceMonth: lease.startDate.slice(0, 7),
  });

  return {
    id,
    unitNumber,
    propertyId: property.id,
    propertyName: property.name,
    leaseId: lease.id,
    tenant: lease.tenant,
    monthlyRent: lease.rent,
    deposit: lease.deposit,
    startDate: lease.startDate,
    endDate: lease.endDate,
    rentDueDay: 1,
    occupancyStatus: "Occupied",
    currentPaymentStatus: paymentHistory[paymentHistory.length - 1]?.status ?? "Paid",
    phone: tenantRecord?.phone ?? lease.momoNumber,
    paymentMethod: realPayments[realPayments.length - 1]?.method ?? "MTN Mobile Money",
    documents: [lease.documentName, property.documentName].filter(
      (d): d is string => Boolean(d),
    ),
    paymentHistory,
    isReal: true,
  };
}

function buildFillerUnit(property: Property, unitNumber: string, id: string, seed: number): Unit {
  const rent = property.rent;
  const paymentHistory = generatePaymentHistory(rent, seed, { allowOverdueFiller: true });

  return {
    id,
    unitNumber,
    propertyId: property.id,
    propertyName: property.name,
    leaseId: null,
    tenant: fillerName(seed),
    monthlyRent: rent,
    deposit: rent * 2,
    startDate: null,
    endDate: null,
    rentDueDay: 1,
    occupancyStatus: "Occupied",
    currentPaymentStatus: paymentHistory[paymentHistory.length - 1]?.status ?? "Paid",
    phone: fillerPhone(seed),
    paymentMethod: PAYMENT_METHODS[seed % PAYMENT_METHODS.length],
    documents: [],
    paymentHistory,
    isReal: false,
  };
}

function buildVacantUnit(property: Property, unitNumber: string, id: string): Unit {
  return {
    id,
    unitNumber,
    propertyId: property.id,
    propertyName: property.name,
    leaseId: null,
    tenant: null,
    monthlyRent: property.rent,
    deposit: null,
    startDate: null,
    endDate: null,
    rentDueDay: null,
    occupancyStatus: "Vacant",
    currentPaymentStatus: "Vacant",
    phone: null,
    paymentMethod: null,
    documents: [],
    paymentHistory: [],
    isReal: false,
  };
}

export function getUnitsForProperty(
  property: Property,
  overrides: UnitOverrides = {},
): Unit[] {
  const {
    extraLeases = [],
    removedLeaseIds = [],
    unitEdits = {},
    vacatedUnitIds = [],
    paymentOverrides = {},
  } = overrides;

  const total =
    property.totalUnits && property.totalUnits > 0 ? property.totalUnits : 1;
  const baselineOccupied =
    property.occupiedUnits ?? (property.availability === "Occupied" ? 1 : 0);

  const allGlobalLeases = LEASES.filter(
    (l) => l.property === property.name && isActiveLease(l),
  );
  const globalRealLeases = allGlobalLeases.filter((l) => !removedLeaseIds.includes(l.id));
  const removedGlobalCount = allGlobalLeases.length - globalRealLeases.length;

  const extraRealLeases = extraLeases.filter(
    (l) => l.property === property.name && isActiveLease(l) && !removedLeaseIds.includes(l.id),
  );

  const pinnedByUnit = new Map(
    extraRealLeases
      .filter((l): l is Lease & { unitNumber: string } => Boolean(l.unitNumber))
      .map((l) => [l.unitNumber, l]),
  );
  const unpinnedQueue = [...globalRealLeases, ...extraRealLeases.filter((l) => !l.unitNumber)];

  const effectiveBaseline = Math.max(baselineOccupied - removedGlobalCount, 0);

  const units: Unit[] = [];
  let queueIndex = 0;
  let occupiedFillerCount = Math.max(effectiveBaseline - globalRealLeases.length, 0);

  for (let i = 0; i < total; i++) {
    const unitNumber = total === 1 ? "Main" : unitLabel(i);
    const id = `${property.id}-${unitNumber}`;
    const seed = i + 1;

    const pinned = pinnedByUnit.get(unitNumber);
    if (pinned) {
      units.push(buildRealUnit(property, pinned, unitNumber, id, seed));
      continue;
    }

    if (queueIndex < unpinnedQueue.length) {
      const lease = unpinnedQueue[queueIndex];
      queueIndex += 1;
      units.push(buildRealUnit(property, lease, unitNumber, id, seed));
      continue;
    }

    if (occupiedFillerCount > 0) {
      occupiedFillerCount -= 1;
      units.push(buildFillerUnit(property, unitNumber, id, seed));
      continue;
    }

    units.push(buildVacantUnit(property, unitNumber, id));
  }

  return units.map((unit) => {
    if (vacatedUnitIds.includes(unit.id)) {
      return buildVacantUnit(property, unit.unitNumber, unit.id);
    }
    let result = unit;

    const edits = unitEdits[unit.id];
    if (edits && result.occupancyStatus === "Occupied") {
      result = { ...result, ...edits };
    }

    const paymentOverride = paymentOverrides[unit.id];
    if (paymentOverride && result.occupancyStatus === "Occupied") {
      const currentMonth = TODAY.slice(0, 7);
      const history = [...result.paymentHistory];
      const idx = history.findIndex((p) => p.month === currentMonth);
      const entry: UnitPayment = {
        month: currentMonth,
        amount: paymentOverride.amount,
        status: "Paid",
        paidDate: paymentOverride.paidDate,
      };
      if (idx >= 0) history[idx] = entry;
      else history.push(entry);
      result = {
        ...result,
        paymentHistory: history,
        currentPaymentStatus: "Paid",
        paymentMethod: paymentOverride.method,
      };
    }

    return result;
  });
}

export function getUnit(
  property: Property,
  unitId: string,
  overrides: UnitOverrides = {},
): Unit | undefined {
  return getUnitsForProperty(property, overrides).find((u) => u.id === unitId);
}

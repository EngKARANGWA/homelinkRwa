"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { AlertCircle, ArrowLeft, Check, Pencil, X } from "lucide-react";
import { getUser, listUsers } from "@/lib/api/admin";
import {
  approveProperty,
  getProperty,
  rejectProperty,
  updateProperty,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Property, UpdatePropertyInput, User } from "@/lib/api/types";
import { PropertyDetail } from "@/components/admin/PropertyDetail";
import { PropertyForm } from "@/components/admin/PropertyForm";
=======
import { AlertCircle, ArrowLeft, Check, X } from "lucide-react";
import { getUser } from "@/lib/api/admin";
import { approveProperty, getProperty, rejectProperty } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Property, User } from "@/lib/api/types";
import { PropertyDetail } from "@/components/admin/PropertyDetail";
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
import { Modal } from "@/components/admin/Modal";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
<<<<<<< HEAD
  const [owners, setOwners] = useState<User[]>([]);
=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
<<<<<<< HEAD
  const [isEditing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3

  const load = () => {
    setLoading(true);
    setError(null);
<<<<<<< HEAD
    Promise.all([
      getProperty(params.id),
      listUsers({ role: "owner", limit: 100 }),
    ])
      .then(async ([p, ownersRes]) => {
        setProperty(p);
        setOwners(ownersRes.data);
=======
    getProperty(params.id)
      .then(async (p) => {
        setProperty(p);
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
        const u = await getUser(p.ownerId).catch(() => null);
        setOwner(u);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load property."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [params.id]);

<<<<<<< HEAD
  const handleUpdateProperty = async (values: UpdatePropertyInput) => {
    if (!property) return;
    setEditError(null);
    try {
      await updateProperty(property.id, values);
      setEditing(false);
      load();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to update property.");
    }
  };

=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  const handleApprove = async () => {
    if (!property) return;
    setActionError(null);
    try {
      await approveProperty(property.id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to approve property.");
    }
  };

  const handleReject = async () => {
    if (!property || !rejectionReason.trim()) return;
    setActionError(null);
    try {
      await rejectProperty(property.id, rejectionReason.trim());
      setRejecting(false);
      setRejectionReason("");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to reject property.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-slate-400">Loading property...</p>
        </div>
      ) : error || !property ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <p className="text-sm font-medium text-red-700">
            {error ?? "Property not found."}
          </p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy">{property.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {property.addressLine}, {property.city}
              </p>
            </div>
<<<<<<< HEAD
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              {property.approvalStatus === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejecting(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
=======
            {property.approvalStatus === "pending" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
          </div>

          {actionError && (
            <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4" />
              {actionError}
            </p>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <PropertyDetail
              property={property}
              ownerName={owner ? `${owner.firstName} ${owner.lastName}` : "—"}
            />
          </div>
        </>
      )}

<<<<<<< HEAD
      {isEditing && property && (
        <Modal
          title="Edit Property"
          description="Update this property's details."
          onClose={() => setEditing(false)}
        >
          {editError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {editError}
            </p>
          )}
          <PropertyForm
            owners={owners}
            initialProperty={property}
            onCancel={() => setEditing(false)}
            onSuccess={handleUpdateProperty}
          />
        </Modal>
      )}

=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
      {isRejecting && (
        <Modal
          title="Reject Property"
          description="Provide a reason so the landlord knows what to fix."
          onClose={() => {
            setRejecting(false);
            setRejectionReason("");
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Rejection reason
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Missing valid address details"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setRejectionReason("");
              }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              Reject Property
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

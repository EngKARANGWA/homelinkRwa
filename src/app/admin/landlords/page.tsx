"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Plus } from "lucide-react";
import { LANDLORDS, type Landlord } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { LandlordForm } from "@/components/admin/LandlordForm";
import { LandlordDetail } from "@/components/admin/LandlordDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

export default function LandlordsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [viewingLandlord, setViewingLandlord] = useState<Landlord | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(LANDLORDS.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedLandlords = LANDLORDS.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Landlords</h1>
          <p className="mt-1 text-sm text-slate-500">
            Property owners registered on the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Register Landlord
        </button>
      </div>

      {justRegistered && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Landlord registered successfully.
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-4 py-3 sm:px-6">Name</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Email</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Phone</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Properties</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Registered</Th>
            <Th className="px-4 py-3 text-right sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedLandlords.map((landlord) => (
            <Tr key={landlord.id}>
              <Td className="max-w-[9rem] px-4 py-3 font-medium text-navy sm:max-w-none sm:px-6">
                <p className="truncate sm:overflow-visible sm:whitespace-normal">
                  {landlord.name}
                </p>
                <p className="truncate text-xs font-normal text-slate-400 md:hidden sm:overflow-visible sm:whitespace-normal">
                  {landlord.email}
                </p>
                <p className="text-xs font-normal text-slate-400 sm:hidden">
                  {landlord.properties} properties
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {landlord.email}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {landlord.phone}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {landlord.properties}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[landlord.status]}`}
                >
                  {landlord.status}
                </span>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {landlord.registeredAt}
              </Td>
              <Td className="whitespace-nowrap px-4 py-3 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => setViewingLandlord(landlord)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={LANDLORDS.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <Modal
          title="Register Landlord"
          description="Add a new property owner to the platform."
          onClose={() => setModalOpen(false)}
        >
          <LandlordForm
            onCancel={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false);
              setJustRegistered(true);
            }}
          />
        </Modal>
      )}

      {viewingLandlord && (
        <Modal
          title="Landlord Details"
          description={viewingLandlord.name}
          onClose={() => setViewingLandlord(null)}
        >
          <LandlordDetail landlord={viewingLandlord} />
        </Modal>
      )}
    </div>
  );
}

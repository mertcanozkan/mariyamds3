"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StudentEditDialog } from "@/components/admin/student-edit-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  isActive: boolean;
};

interface Props {
  student: StudentData;
}

export function StudentDetailActions({ student }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Delete failed");
    toast({ title: "Student deleted" });
    router.push("/admin/students");
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="h-4 w-4 mr-1.5" /> Edit Student
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
      </Button>

      <StudentEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Student"
        description={`Are you sure you want to permanently delete ${student.firstName} ${student.lastName}? Students with existing bookings cannot be deleted — deactivate them instead.`}
        onConfirm={handleDelete}
      />
    </>
  );
}

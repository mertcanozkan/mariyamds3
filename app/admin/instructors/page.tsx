"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ShieldCheck, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InstructorDialog } from "@/components/admin/instructor-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Loader2 } from "lucide-react";

type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dvsaAdiNumber: string;
  bio: string | null;
  specialisations: string[];
  availableFrom: string;
  availableTo: string;
  isActive: boolean;
  pendingApproval: boolean;
  createdAt: string;
  user: { email: string };
};

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Instructor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/instructors");
    if (res.ok) {
      const json = await res.json();
      setInstructors(json.instructors);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(inst: Instructor) {
    setApproving(inst.id);
    try {
      const res = await fetch(`/api/admin/instructors/${inst.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, pendingApproval: false }),
      });
      if (res.ok) {
        toast({ title: "Instructor approved", description: `${inst.firstName} ${inst.lastName} can now accept students.` });
        setInstructors((prev) => prev.map((i) =>
          i.id === inst.id ? { ...i, isActive: true, pendingApproval: false } : i
        ));
      } else {
        toast({ title: "Approval failed", variant: "destructive" });
      }
    } finally {
      setApproving(null);
    }
  }

  async function reject(inst: Instructor) {
    setRejecting(inst.id);
    try {
      const res = await fetch(`/api/admin/instructors/${inst.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingApproval: false }),
      });
      if (res.ok) {
        toast({ title: "Application declined", description: `${inst.firstName} ${inst.lastName}'s application has been declined.` });
        setInstructors((prev) => prev.map((i) =>
          i.id === inst.id ? { ...i, pendingApproval: false } : i
        ));
      } else {
        toast({ title: "Action failed", variant: "destructive" });
      }
    } finally {
      setRejecting(null);
    }
  }

  async function toggleActive(inst: Instructor) {
    const res = await fetch(`/api/admin/instructors/${inst.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !inst.isActive }),
    });
    if (res.ok) {
      setInstructors((prev) => prev.map((i) =>
        i.id === inst.id ? { ...i, isActive: !i.isActive } : i
      ));
    } else {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  }

  async function handleDelete(inst: Instructor) {
    const res = await fetch(`/api/admin/instructors/${inst.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast({
        title: json.code === "HAS_BOOKINGS" ? "Cannot delete instructor" : "Delete failed",
        description: json.error ?? "An unexpected error occurred.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Instructor deleted" });
    load();
  }

  const pending = instructors.filter((i) => i.pendingApproval);
  const active = instructors.filter((i) => !i.pendingApproval && i.isActive);
  const inactive = instructors.filter((i) => !i.pendingApproval && !i.isActive);

  return (
    <div className="lg:pt-0 pt-14 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Instructors</h1>
        <Button variant="amber" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Instructor
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          {/* ── Pending Approvals ── */}
          {pending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-amber" />
                <h2 className="font-semibold text-navy">Pending Approval</h2>
                <Badge variant="warning" className="text-xs">{pending.length}</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((inst) => (
                  <Card key={inst.id} className="border-amber/40 bg-amber/5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-amber/20 flex items-center justify-center font-bold text-amber flex-shrink-0">
                          {inst.firstName[0]}{inst.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-navy">{inst.firstName} {inst.lastName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{inst.user.email}</div>
                        </div>
                        <Badge variant="warning" className="text-xs flex-shrink-0">Pending</Badge>
                      </div>

                      <div className="space-y-1.5 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ADI Number</span>
                          <span className="font-mono text-xs text-navy">{inst.dvsaAdiNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-navy">{inst.phone}</span>
                        </div>
                        {inst.bio && (
                          <p className="text-xs text-muted-foreground pt-1 border-t border-amber/20 leading-relaxed line-clamp-2">
                            {inst.bio}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Applied {new Date(inst.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="amber"
                          className="flex-1 h-8 text-xs"
                          disabled={approving === inst.id || rejecting === inst.id}
                          onClick={() => approve(inst)}
                        >
                          {approving === inst.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <><CheckCircle2 className="h-3 w-3 mr-1" />Approve</>
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                          disabled={approving === inst.id || rejecting === inst.id}
                          onClick={() => reject(inst)}
                        >
                          {rejecting === inst.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <><XCircle className="h-3 w-3 mr-1" />Decline</>
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                          title="Delete application"
                          onClick={() => setDeleteTarget(inst)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* ── Active Instructors ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <h2 className="font-semibold text-navy">Active Instructors</h2>
              <span className="text-xs text-muted-foreground">({active.length})</span>
            </div>
            {active.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No active instructors</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((inst) => (
                  <InstructorCard
                    key={inst.id}
                    inst={inst}
                    onToggle={() => toggleActive(inst)}
                    onEdit={() => setEditTarget(inst)}
                    onDelete={() => setDeleteTarget(inst)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Inactive Instructors ── */}
          {inactive.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-navy">Inactive</h2>
                <span className="text-xs text-muted-foreground">({inactive.length})</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactive.map((inst) => (
                  <InstructorCard
                    key={inst.id}
                    inst={inst}
                    onToggle={() => toggleActive(inst)}
                    onEdit={() => setEditTarget(inst)}
                    onDelete={() => setDeleteTarget(inst)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <InstructorDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={load} />

      <InstructorDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        instructor={editTarget ?? undefined}
        onSuccess={load}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Instructor"
        description={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This will also remove their login account.`}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </div>
  );
}

function InstructorCard({
  inst,
  onToggle,
  onEdit,
  onDelete,
}: {
  inst: Instructor;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={`hover:border-amber/40 transition-colors ${!inst.isActive ? "opacity-60" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy flex-shrink-0">
            {inst.firstName[0]}{inst.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-navy">{inst.firstName} {inst.lastName}</div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">{inst.user.email}</div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ADI Number</span>
            <span className="font-mono text-xs text-navy">{inst.dvsaAdiNumber ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="text-navy">{inst.phone ?? "—"}</span>
          </div>
          {inst.specialisations.length > 0 && (
            <div className="flex justify-between items-start gap-2">
              <span className="text-muted-foreground flex-shrink-0">Specialisations</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {inst.specialisations.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <Badge variant={inst.isActive ? "success" : "destructive"}>
            {inst.isActive ? "Active" : "Inactive"}
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={inst.isActive ? "Deactivate" : "Activate"}
              onClick={onToggle}
            >
              {inst.isActive
                ? <ToggleRight className="h-4 w-4 text-green-600" />
                : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              }
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

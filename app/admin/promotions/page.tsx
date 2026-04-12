"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PromotionDialog } from "@/components/admin/promotion-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { formatCurrency } from "@/lib/utils";

type Promotion = {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderPence: number;
  maxUsages: number | null;
  usageCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/promotions");
    if (res.ok) {
      const json = await res.json();
      setPromotions(json.promotions);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(promo: Promotion) {
    const res = await fetch(`/api/admin/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    if (res.ok) {
      setPromotions((prev) => prev.map((p) => p.id === promo.id ? { ...p, isActive: !p.isActive } : p));
    } else {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  }

  async function handleDelete(promo: Promotion) {
    const res = await fetch(`/api/admin/promotions/${promo.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Delete failed");
    toast({ title: "Promotion deleted" });
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `${code} copied to clipboard` });
  }

  // Convert Promotion (API shape) to what PromotionDialog expects
  function toDialogShape(p: Promotion) {
    return {
      id: p.id,
      code: p.code,
      description: p.description,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderPence: p.minOrderPence,
      maxUsages: p.maxUsages,
      validFrom: p.validFrom ? new Date(p.validFrom) : null,
      validUntil: p.validUntil ? new Date(p.validUntil) : null,
      isActive: p.isActive,
    };
  }

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Promotions</h1>
        <Button variant="amber" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Promotion
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No promotions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <Card key={promo.id} className={!promo.isActive ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(promo.code)}
                      className="font-mono font-bold text-navy text-sm bg-navy/5 px-2 py-0.5 rounded hover:bg-navy/10 transition-colors flex items-center gap-1"
                      title="Copy code"
                    >
                      {promo.code}
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <Badge variant={promo.isActive ? "success" : "secondary"}>
                    {promo.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promo.description}</p>

                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold text-amber">
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : formatCurrency(promo.discountValue)
                      }
                    </span>
                  </div>
                  {promo.minOrderPence > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min order</span>
                      <span className="text-navy">{formatCurrency(promo.minOrderPence)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uses</span>
                    <span className="text-navy">
                      {promo.usageCount}
                      {promo.maxUsages ? ` / ${promo.maxUsages}` : " (unlimited)"}
                    </span>
                  </div>
                  {(promo.validFrom || promo.validUntil) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid</span>
                      <span className="text-navy text-xs">
                        {promo.validFrom ? formatDate(promo.validFrom) : "—"}
                        {" → "}
                        {promo.validUntil ? formatDate(promo.validUntil) : "∞"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={promo.isActive ? "Deactivate" : "Activate"}
                    onClick={() => toggleActive(promo)}
                  >
                    {promo.isActive
                      ? <ToggleRight className="h-4 w-4 text-green-600" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditTarget(promo)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(promo)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PromotionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={load}
      />

      <PromotionDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        promotion={editTarget ? toDialogShape(editTarget) : undefined}
        onSuccess={load}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Promotion"
        description={`Are you sure you want to delete the "${deleteTarget?.code}" promotion? This cannot be undone.`}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </div>
  );
}

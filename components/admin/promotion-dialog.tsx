"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  code: z.string().min(1, "Required").toUpperCase(),
  description: z.string().min(1, "Required"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().int().positive("Must be positive"),
  minOrderPence: z.coerce.number().int().min(0),
  maxUsages: z.coerce.number().int().positive().nullable().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  isActive: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

type PromotionData = {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderPence: number;
  maxUsages: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: PromotionData;
  onSuccess: () => void;
}

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export function PromotionDialog({ open, onOpenChange, promotion, onSuccess }: Props) {
  const isEdit = !!promotion;
  const [loading, setLoading] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: promotion?.code ?? "",
      description: promotion?.description ?? "",
      discountType: (promotion?.discountType as "percentage" | "fixed") ?? "percentage",
      discountValue: promotion?.discountValue ?? 10,
      minOrderPence: promotion?.minOrderPence ?? 0,
      maxUsages: promotion?.maxUsages ?? undefined,
      validFrom: toDateInput(promotion?.validFrom ?? null),
      validUntil: toDateInput(promotion?.validUntil ?? null),
      isActive: promotion?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        code: promotion?.code ?? "",
        description: promotion?.description ?? "",
        discountType: (promotion?.discountType as "percentage" | "fixed") ?? "percentage",
        discountValue: promotion?.discountValue ?? 10,
        minOrderPence: promotion?.minOrderPence ?? 0,
        maxUsages: promotion?.maxUsages ?? undefined,
        validFrom: toDateInput(promotion?.validFrom ?? null),
        validUntil: toDateInput(promotion?.validUntil ?? null),
        isActive: promotion?.isActive ?? true,
      });
    }
  }, [open, promotion, form]);

  async function onSubmit(values: FormInput) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        maxUsages: values.maxUsages || null,
        validFrom: values.validFrom || null,
        validUntil: values.validUntil || null,
      };

      const url = isEdit ? `/api/admin/promotions/${promotion!.id}` : "/api/admin/promotions";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      toast({ title: isEdit ? "Promotion updated" : "Promotion created" });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const discountType = form.watch("discountType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                {...form.register("code")}
                placeholder="SUMMER25"
                className="uppercase font-mono"
                onChange={(e) => form.setValue("code", e.target.value.toUpperCase())}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select
                value={form.watch("discountType")}
                onValueChange={(v) => form.setValue("discountType", v as "percentage" | "fixed")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input {...form.register("description")} placeholder="Summer discount for new students" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{discountType === "percentage" ? "Discount %" : "Discount Amount (£)"}</Label>
              <Input
                {...form.register("discountValue")}
                type="number"
                min={1}
                max={discountType === "percentage" ? 100 : undefined}
                placeholder={discountType === "percentage" ? "10" : "5.00"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min. Order (£)</Label>
              <Input {...form.register("minOrderPence")} type="number" min={0} step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Max Uses <span className="text-muted-foreground text-xs">(blank = unlimited)</span></Label>
              <Input {...form.register("maxUsages")} type="number" min={1} placeholder="100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valid From</Label>
              <Input {...form.register("validFrom")} type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Valid Until</Label>
              <Input {...form.register("validUntil")} type="date" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input id="promoActive" type="checkbox" className="h-4 w-4 rounded accent-amber" {...form.register("isActive")} />
            <Label htmlFor="promoActive">Active</Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

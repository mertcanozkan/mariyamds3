"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CourseDialog } from "@/components/admin/course-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

type Course = {
  id: string;
  name: string;
  description: string;
  type: "hourly" | "package" | "intensive";
  pricePence: number;
  pricePerHourPence: number | null;
  hoursIncluded: number | null;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/courses");
    if (res.ok) {
      const json = await res.json();
      setCourses(json.courses);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(course: Course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !course.isActive }),
    });
    if (res.ok) {
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, isActive: !c.isActive } : c));
    } else {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  }

  async function toggleFeatured(course: Course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !course.isFeatured }),
    });
    if (res.ok) {
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, isFeatured: !c.isFeatured } : c));
    } else {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(course: Course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Delete failed");
    toast({ title: "Course deleted" });
    load();
  }

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Courses</h1>
        <Button variant="amber" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className={`${course.isFeatured ? "border-amber" : ""} ${!course.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy leading-tight">{course.name}</div>
                    <div className="text-xs text-muted-foreground capitalize mt-0.5">
                      {course.type.replace("_", " ")}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    {course.isFeatured && (
                      <Badge variant="amber" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />Featured
                      </Badge>
                    )}
                    <Badge variant={course.isActive ? "success" : "secondary"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {course.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                )}

                <div className="space-y-1 text-sm mb-3">
                  {course.pricePerHourPence && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price/hr</span>
                      <span className="font-semibold text-navy">{formatCurrency(course.pricePerHourPence)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total price</span>
                    <span className="font-semibold text-amber">{formatCurrency(course.pricePence)}</span>
                  </div>
                  {course.hoursIncluded && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours</span>
                      <span className="text-navy flex items-center gap-1">
                        <Clock className="h-3 w-3" />{course.hoursIncluded}h
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={course.isFeatured ? "Unfeature" : "Feature"}
                    onClick={() => toggleFeatured(course)}
                  >
                    <Star className={`h-3.5 w-3.5 ${course.isFeatured ? "text-amber fill-amber" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={course.isActive ? "Deactivate" : "Activate"}
                    onClick={() => toggleActive(course)}
                  >
                    {course.isActive
                      ? <ToggleRight className="h-4 w-4 text-green-600" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditTarget(course)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(course)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={load}
      />

      <CourseDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        course={editTarget ?? undefined}
        onSuccess={load}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </div>
  );
}

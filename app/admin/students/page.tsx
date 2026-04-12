import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";
import { ilike, or, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 20;

export default async function AdminStudentsPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const whereClause = q
    ? or(
        ilike(studentProfiles.firstName, `%${q}%`),
        ilike(studentProfiles.lastName, `%${q}%`),
        ilike(studentProfiles.phone, `%${q}%`)
      )
    : undefined;

  const [students, totalResult] = await Promise.all([
    db.query.studentProfiles.findMany({
      where: whereClause,
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      limit: PAGE_SIZE,
      offset,
    }),
    db.select({ count: count() }).from(studentProfiles).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Students</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Search */}
      <form method="GET" className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or phone..."
          className="pl-9"
        />
      </form>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No students found</div>
          ) : (
            students.map((student) => (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy text-sm flex-shrink-0">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-navy text-sm">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{student.phone ?? "No phone"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(student.createdAt).toLocaleDateString("en-GB")}
                  </div>
                  {student.provisionalLicenceNumber && (
                    <div className="text-xs text-muted-foreground font-mono">{student.provisionalLicenceNumber}</div>
                  )}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?q=${q ?? ""}&page=${currentPage - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?q=${q ?? ""}&page=${currentPage + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

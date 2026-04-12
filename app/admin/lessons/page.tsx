import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default async function AdminLessonsPage() {
  const records = await db.query.lessonProgress.findMany({
    with: { student: true, instructor: true },
    orderBy: (lp, { desc }) => [desc(lp.createdAt)],
    limit: 50,
  });

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Lesson Progress Logs</h1>
        <span className="text-sm text-muted-foreground">{records.length} recent records</span>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No lesson progress records yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {records.map((record) => {
              const competencies = record.competencies as Record<string, number>;
              const avgScore =
                Object.values(competencies).length > 0
                  ? Object.values(competencies).reduce((a, b) => a + b, 0) /
                    Object.values(competencies).length
                  : 0;

              return (
                <div key={record.id} className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-navy">
                      {record.student.firstName} {record.student.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(record.createdAt)} · Instructor: {record.instructor.firstName} {record.instructor.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {parseFloat(String(record.hoursLogged)).toFixed(1)}h logged ·{" "}
                      {Object.keys(competencies).length} skills assessed
                    </div>
                    {record.feedback && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        &ldquo;{record.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-amber">{avgScore.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">avg score</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

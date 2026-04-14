import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, lessonProgress } from "@/lib/db/schema";
import { calculateTestReadiness, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ProgressRadarChart } from "@/components/dashboard/progress-radar";

const COMPETENCY_LABELS: Record<string, string> = {
  junctions: "Junctions",
  motorway: "Motorway Driving",
  townDriving: "Town Driving",
  parking: "Parking",
  emergencyStop: "Emergency Stop",
  roundabouts: "Roundabouts",
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register/student");

  const progressRecords = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.studentId, profile.id),
    orderBy: (lp, { desc }) => [desc(lp.createdAt)],
    with: { instructor: true },
  });

  const totalHours = progressRecords.reduce(
    (sum, r) => sum + parseFloat(String(r.hoursLogged)),
    0
  );

  // Aggregate competencies
  const allCompetencies: Record<string, number[]> = {};
  for (const r of progressRecords) {
    for (const [key, val] of Object.entries(r.competencies as Record<string, number>)) {
      if (!allCompetencies[key]) allCompetencies[key] = [];
      allCompetencies[key].push(val);
    }
  }
  const avgCompetencies: Record<string, number> = {};
  for (const [key, vals] of Object.entries(allCompetencies)) {
    avgCompetencies[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  const testReadiness = calculateTestReadiness(avgCompetencies);

  return (
    <div className="lg:pt-0 pt-14 space-y-6">
      <h1 className="font-playfair text-2xl font-bold text-navy">Progress Tracker</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-navy">{totalHours.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground mt-1">Total Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-navy">{progressRecords.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Lessons Logged</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber">{testReadiness}%</div>
            <div className="text-xs text-muted-foreground mt-1">Test Readiness</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Competency Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(avgCompetencies).length > 0 ? (
              <ProgressRadarChart competencies={avgCompetencies} />
            ) : (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No progress data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competency breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(avgCompetencies).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Complete lessons to see your scores</p>
            ) : (
              Object.entries(avgCompetencies).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-navy">{COMPETENCY_LABELS[key] ?? key}</span>
                    <span className="font-medium text-navy">{val.toFixed(1)}/10</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full transition-all"
                      style={{ width: `${(val / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lesson history */}
      {progressRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Lesson History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {progressRecords.map((record) => (
              <div key={record.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-navy text-sm">
                      {record.instructor.firstName} {record.instructor.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(record.createdAt)} · {parseFloat(String(record.hoursLogged)).toFixed(1)}h
                    </div>
                    {record.feedback && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        &ldquo;{record.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-amber">
                      {Object.keys(record.competencies as Record<string, number>).length} skills assessed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

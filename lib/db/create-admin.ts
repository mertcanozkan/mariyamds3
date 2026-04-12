/**
 * One-off script to create or update an admin user.
 * Usage: npx tsx lib/db/create-admin.ts
 */
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMINS: { email: string; password: string }[] = [
  { email: "mert@mcodev.co.uk", password: "My$exyCar" },
];

async function run() {
  for (const { email, password } of ADMINS) {
    const hash = await bcrypt.hash(password, 12);

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      await db
        .update(users)
        .set({ passwordHash: hash, role: "admin", updatedAt: new Date() })
        .where(eq(users.id, existing.id));
      console.log(`✅ Updated existing user → ${email} (role: admin)`);
    } else {
      await db.insert(users).values({ email, passwordHash: hash, role: "admin" });
      console.log(`✅ Created new admin user → ${email}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Proxies the user's private avatar blob back to the browser.
// The BLOB_READ_WRITE_TOKEN is used server-side; the browser never sees it.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { image: true },
    });

    if (!user?.image) {
      return new NextResponse(null, { status: 404 });
    }

    // OAuth images (Google etc.) are already public — redirect directly
    if (!user.image.includes("blob.vercel-storage.com")) {
      return NextResponse.redirect(user.image);
    }

    // Fetch the private blob server-side using the token
    const blobRes = await fetch(user.image, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobRes.ok) {
      return new NextResponse(null, { status: blobRes.status });
    }

    const contentType = blobRes.headers.get("content-type") ?? "image/jpeg";
    const buffer = await blobRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // Cache for 5 minutes in the browser, revalidate with server
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[avatar-url]", err);
    return new NextResponse(null, { status: 500 });
  }
}

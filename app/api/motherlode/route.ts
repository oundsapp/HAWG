import { NextResponse } from "next/server";

const GMORE_API_BASE = "https://ore-api.gmore.fun";

export async function GET() {
  try {
    const response = await fetch(`${GMORE_API_BASE}/state`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`gmore.fun API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract motherlode from treasury data
    const motherlode = data.treasury?.motherlodeFormatted || "0.000000000 ORE";
    const motherlodeRaw = data.treasury?.motherlodeRaw || "0";
    const observedAt = data.treasury?.observedAt || null;

    return NextResponse.json({
      motherlode,
      motherlodeRaw,
      observedAt,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching motherlode:", error);
    return NextResponse.json(
      { error: "Failed to fetch motherlode", motherlode: "0.000000000 ORE", motherlodeRaw: "0" },
      { status: 500 }
    );
  }
}


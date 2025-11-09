import { NextResponse } from "next/server";

const GMORE_API_BASE = "https://ore-api.gmore.fun";

export async function GET() {
  try {
    const response = await fetch(`${GMORE_API_BASE}/state`, {
      next: { revalidate: 1 },
    });

    if (!response.ok) {
      throw new Error(`gmore.fun API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract total deployed SOL from round data
    const deployedSol = data.round?.totals?.deployedSol || "0.000000000";
    const roundId = data.round?.roundId || "0";
    const observedAt = data.round?.observedAt || null;
    const miningStatus = data.round?.mining?.status || "idle";
    const uniqueMiners = data.round?.uniqueMiners || "0";

    return NextResponse.json({
      deployedSol,
      roundId,
      observedAt,
      miningStatus,
      uniqueMiners,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching round data:", error);
    return NextResponse.json(
      { error: "Failed to fetch round data", deployedSol: "0.000000000", roundId: "0", miningStatus: "idle", uniqueMiners: "0" },
      { status: 500 }
    );
  }
}


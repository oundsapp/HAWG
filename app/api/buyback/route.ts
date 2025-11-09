import { NextResponse } from "next/server";

const BUYBACK_ADDRESS = "45db2FSR4mcXdSVVZbKbwojU6uYDpMyhpEi7cC8nHaWG";
const MIN_SOL = 0; // 100% health at or below this amount
const MAX_SOL = 1000; // 0% health at or above this amount

export async function GET() {
  try {
    // Fetch SOL balance from Solana RPC
    const response = await fetch(
      "https://api.mainnet-beta.solana.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [BUYBACK_ADDRESS],
        }),
        next: { revalidate: 60 },
      }
    );

    const data = await response.json();
    const lamports = data.result?.value || 0;
    const solBalance = lamports / 1e9; // Convert lamports to SOL

    // Calculate health: MIN_SOL = 100%, MAX_SOL = 0%
    // Linear interpolation: health = 100 * (MAX_SOL - balance) / (MAX_SOL - MIN_SOL)
    let health = 100;
    if (solBalance > MIN_SOL) {
      if (solBalance >= MAX_SOL) {
        health = 0;
      } else {
        health = ((MAX_SOL - solBalance) / (MAX_SOL - MIN_SOL)) * 100;
      }
    }

    return NextResponse.json({
      solBalance,
      health: Math.round(health),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching buyback balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch buyback data", solBalance: 0, health: 0 },
      { status: 500 }
    );
  }
}

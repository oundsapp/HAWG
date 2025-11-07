import { NextResponse } from "next/server";

const ORE_TOKEN_ADDRESS = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";
const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

export async function GET() {
  try {
    // Fetch SOL price from CoinGecko
    const solResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    const solData = await solResponse.json();
    const solPrice = solData.solana?.usd || 0;

    // Fetch ORE token price from DexScreener API
    let orePrice = 0;
    try {
      const dexscreenerResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${ORE_TOKEN_ADDRESS}`,
        { 
          next: { revalidate: 60 },
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (dexscreenerResponse.ok) {
        const dexscreenerData = await dexscreenerResponse.json();
        // Get the first pair's price
        if (dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
          const pair = dexscreenerData.pairs[0];
          orePrice = parseFloat(pair.priceUsd || pair.priceNative || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching ORE price from DexScreener:", error);
      // Fallback: try Helius API
      try {
        const heliusResponse = await fetch(
          `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY || ''}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mintAccounts: [ORE_TOKEN_ADDRESS]
            }),
            next: { revalidate: 60 },
          }
        );
        // Helius doesn't provide price, so we'll skip this fallback
      } catch (heliusError) {
        console.error("Error with Helius API:", heliusError);
      }
    }

    return NextResponse.json({
      sol: solPrice,
      ore: orePrice,
      oreIcon: "https://ore.supply/assets/icon.png",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices", sol: 0, ore: 0 },
      { status: 500 }
    );
  }
}


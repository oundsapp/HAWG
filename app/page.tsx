"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

interface Prices {
  sol: number;
  ore: number;
  oreIcon?: string;
}

interface Health {
  solBalance: number;
  health: number;
}

interface Motherlode {
  motherlode: string;
}

export default function Home() {
  const [prices, setPrices] = useState<Prices>({ sol: 0, ore: 0, oreIcon: "" });
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<Health>({ solBalance: 0, health: 100 });
  const [healthLoading, setHealthLoading] = useState(true);
  const [motherlode, setMotherlode] = useState<Motherlode>({ motherlode: "0.000000000 ORE" });
  const [motherlodeLoading, setMotherlodeLoading] = useState(true);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices");
        const data = await response.json();
        setPrices({ sol: data.sol || 0, ore: data.ore || 0, oreIcon: data.oreIcon || "" });
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/buyback");
        const data = await response.json();
        setHealth({ solBalance: data.solBalance || 0, health: data.health || 100 });
      } catch (error) {
        console.error("Error fetching health:", error);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    // Refresh health every 60 seconds
    const interval = setInterval(fetchHealth, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMotherlode = async () => {
      try {
        const response = await fetch("/api/motherlode");
        const data = await response.json();
        setMotherlode({ motherlode: data.motherlode || "0.000000000 ORE" });
      } catch (error) {
        console.error("Error fetching motherlode:", error);
      } finally {
        setMotherlodeLoading(false);
      }
    };

    fetchMotherlode();
    // Refresh motherlode every 60 seconds
    const interval = setInterval(fetchMotherlode, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "0.00";
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getHealthStatus = (health: number) => {
    if (health < 25) return "VERY HUNGRY";
    if (health < 50) return "HUNGRY";
    if (health < 75) return "RAISED APPETITE";
    if (health < 95) return "SCRATCHING STOMACH";
    return "FULL";
  };

  return (
    <main 
      className="relative flex flex-col min-h-screen items-center justify-center" 
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="flex items-center justify-center w-full h-screen">
        <ModelViewer modelPath="/hawg-3d/base.obj" />
      </div>
      
      {/* Motherlode Box - Desktop Only - Top Left */}
      <div className="hidden md:block absolute left-8 top-8">
        <Card className="bg-transparent border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">MOTHERLODE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Image
                src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
                alt="ORE"
                width={32}
                height={32}
                className="rounded-full w-8 h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-white text-2xl font-bold">
                {motherlodeLoading ? "..." : motherlode.motherlode}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enter Mines Button - Desktop Only - Top Right */}
      <div className="hidden md:block absolute right-8 top-8">
        <Button
          asChild
          className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
        >
          <a
            href="https://ore.supply"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enter Mines
          </a>
        </Button>
      </div>
      
      {/* Community Tools Box - Desktop Only */}
      <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2">
        <Card className="bg-transparent border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Community Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="https://refinore.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block"
              >
                RefinORE
              </a>
              <a
                href="https://ore-mining-tracker.supply/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block"
              >
                ORE Mining Tracker
              </a>
              <a
                href="https://gmore.fun/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block"
              >
                gmore.fun
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Bar - Above Prices */}
      <div className="absolute top-2 md:top-8 w-full px-4">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className="w-full max-w-2xl bg-gray-800 rounded-full h-6 md:h-8">
            <div
              className={`h-6 md:h-8 rounded-full transition-all duration-500 ${
                    health.health >= 50 ? 'bg-green-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${health.health}%` }}
                />
              </div>
          <div className="text-white text-lg md:text-4xl font-bold text-center">
            {healthLoading ? "..." : getHealthStatus(health.health)}
            </div>
          {/* Mobile Menu Button - Below Health Text */}
          <div className="md:hidden">
            <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 text-sm text-white border border-gray-700 rounded hover:border-gray-600 transition-colors">
                  Menu
            </button>
          </DialogTrigger>
              <DialogContent className="bg-transparent border border-gray-700 p-6 max-w-sm">
            <DialogHeader>
                  <DialogTitle className="text-white text-lg mb-4">Menu</DialogTitle>
            </DialogHeader>
                <div className="space-y-6">
                  {/* Enter Mines Button */}
                  <div className="space-y-3">
                    <Button
                      asChild
                      className="w-full bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
                    >
                      <a
                        href="https://ore.supply"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMenuModalOpen(false)}
                      >
                        Enter Mines
                      </a>
                    </Button>
                  </div>

                  {/* Prices Section */}
                  <div className="space-y-3">
                    <div className="text-white text-sm font-semibold opacity-70">Prices</div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
                          alt="ORE"
                          width={32}
                          height={32}
                          className="rounded-full w-8 h-8"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="text-white text-lg font-bold">
                          {loading ? "..." : `$${formatPrice(prices.ore)}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Image
                          src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                          alt="SOL"
                          width={32}
                          height={32}
                          className="rounded-full w-8 h-8"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="text-white text-lg font-bold">
                          {loading ? "..." : `$${formatPrice(prices.sol)}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Community Tools Section */}
            <div className="space-y-3">
                    <div className="text-white text-sm font-semibold opacity-70">Community Tools</div>
                    <div className="space-y-2">
              <a
                href="https://refinore.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                        onClick={() => setIsMenuModalOpen(false)}
              >
                RefinORE
              </a>
              <a
                href="https://ore-mining-tracker.supply/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                        onClick={() => setIsMenuModalOpen(false)}
              >
                ORE Mining Tracker
              </a>
              <a
                href="https://gmore.fun/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                        onClick={() => setIsMenuModalOpen(false)}
              >
                gmore.fun
              </a>
                    </div>
                  </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-16 md:bottom-4 md:left-8 md:top-auto w-full md:w-auto px-4 hidden md:flex">
        <div className="flex justify-center md:justify-start items-center gap-8 md:gap-6 flex-col md:flex-row">
          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
              alt="ORE"
              width={48}
              height={48}
              className="rounded-full w-6 h-6 md:w-8 md:h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-white text-lg md:text-2xl font-bold">
              {loading ? "..." : `$${formatPrice(prices.ore)}`}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
              alt="SOL"
              width={48}
              height={48}
              className="rounded-full w-6 h-6 md:w-8 md:h-8"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-white text-lg md:text-2xl font-bold">
              {loading ? "..." : `$${formatPrice(prices.sol)}`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Credit - Bottom Right */}
      <div className="absolute bottom-4 right-4">
        <div className="text-white text-sm opacity-70">
          created by{" "}
          <a
            href="https://x.com/glocktoshi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors underline"
          >
            glocktoshi
          </a>
        </div>
      </div>
    </main>
  );
}


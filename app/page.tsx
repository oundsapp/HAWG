"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Heart } from "lucide-react";
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

export default function Home() {
  const [prices, setPrices] = useState<Prices>({ sol: 0, ore: 0, oreIcon: "" });
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<Health>({ solBalance: 0, health: 100 });
  const [healthLoading, setHealthLoading] = useState(true);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

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

  const formatPrice = (price: number) => {
    if (price === 0) return "0.00";
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  return (
    <main 
      className="relative flex flex-col min-h-screen items-center justify-center" 
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="flex items-center justify-center w-full h-screen">
        <ModelViewer modelPath="/hawg-3d/base.obj" />
      </div>
      
      {/* HAWG HEALTH Box - Desktop Only */}
      <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2">
        <Card className="bg-transparent border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">HAWG HEALTH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart 
                  className={`w-5 h-5 ${
                    health.health >= 50 ? 'text-green-500 fill-green-500' :
                    'text-red-500 fill-red-500'
                  }`}
                />
                <span className="text-white text-sm font-semibold">{healthLoading ? "..." : `${health.health}%`}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    health.health >= 50 ? 'bg-green-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${health.health}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Mobile Buttons */}
      <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
        {/* Health Button */}
        <Dialog open={isHealthModalOpen} onOpenChange={setIsHealthModalOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 text-sm text-white border border-gray-700 rounded hover:border-gray-600 transition-colors">
              Health
            </button>
          </DialogTrigger>
          <DialogContent className="bg-transparent border border-gray-700 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-lg mb-4">HAWG HEALTH</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart 
                  className={`w-5 h-5 ${
                    health.health >= 50 ? 'text-green-500 fill-green-500' :
                    'text-red-500 fill-red-500'
                  }`}
                />
                <span className="text-white text-sm font-semibold">{healthLoading ? "..." : `${health.health}%`}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    health.health >= 50 ? 'bg-green-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${health.health}%` }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tools Button */}
        <Dialog open={isToolsModalOpen} onOpenChange={setIsToolsModalOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 text-sm text-white border border-gray-700 rounded hover:border-gray-600 transition-colors">
              Tools
            </button>
          </DialogTrigger>
          <DialogContent className="bg-transparent border border-gray-700 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-lg mb-4">Community Tools</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <a
                href="https://refinore.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                onClick={() => setIsToolsModalOpen(false)}
              >
                RefinORE
              </a>
              <a
                href="https://ore-mining-tracker.supply/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                onClick={() => setIsToolsModalOpen(false)}
              >
                ORE Mining Tracker
              </a>
              <a
                href="https://gmore.fun/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block py-2"
                onClick={() => setIsToolsModalOpen(false)}
              >
                gmore.fun
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="absolute top-4 md:top-16 w-full px-4">
        <div className="flex justify-center items-center gap-8 md:gap-24">
          <div className="flex items-center gap-2 md:gap-4">
            <Image
              src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
              alt="ORE"
              width={48}
              height={48}
              className="rounded-full w-6 h-6 md:w-12 md:h-12"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-white text-lg md:text-5xl font-bold">
              {loading ? "..." : `$${formatPrice(prices.ore)}`}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Image
              src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
              alt="SOL"
              width={48}
              height={48}
              className="rounded-full w-6 h-6 md:w-12 md:h-12"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-white text-lg md:text-5xl font-bold">
              {loading ? "..." : `$${formatPrice(prices.sol)}`}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


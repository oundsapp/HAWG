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

interface Round {
  deployedSol: string;
  miningStatus: string;
  uniqueMiners: string;
}

export default function Home() {
  const [prices, setPrices] = useState<Prices>({ sol: 0, ore: 0, oreIcon: "" });
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<Health>({ solBalance: 0, health: 100 });
  const [healthLoading, setHealthLoading] = useState(true);
  const [motherlode, setMotherlode] = useState<Motherlode>({ motherlode: "0.000000000 ORE" });
  const [motherlodeLoading, setMotherlodeLoading] = useState(true);
  const [round, setRound] = useState<Round>({ deployedSol: "0.000000000", miningStatus: "idle", uniqueMiners: "0" });
  const [roundLoading, setRoundLoading] = useState(true);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const showHallOfDevs = false;
  const showProductionCost = false;

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
    // Refresh health every 5 seconds for real-time updates
    const interval = setInterval(fetchHealth, 5000);

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
    // Refresh motherlode every 5 seconds for real-time updates
    const interval = setInterval(fetchMotherlode, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRound = async () => {
      try {
        const response = await fetch("/api/round");
        const data = await response.json();
        setRound({ 
          deployedSol: data.deployedSol || "0.000000000",
          miningStatus: data.miningStatus || "idle",
          uniqueMiners: data.uniqueMiners || "0"
        });
      } catch (error) {
        console.error("Error fetching round data:", error);
      } finally {
        setRoundLoading(false);
      }
    };

    fetchRound();
    // Refresh round data every 1 second for real-time updates
    const interval = setInterval(fetchRound, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "0.00";
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const getMiningStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-yellow-500";
      case "finished":
        return "border-green-500";
      case "expired":
        return "border-gray-500";
      case "idle":
      default:
        return "border-gray-700";
    }
  };

  const getHealthStatus = (health: number) => {
    if (health < 25) return "VERY HUNGRY";
    if (health < 50) return "HUNGRY";
    if (health < 75) return "RAISED APPETITE";
    if (health < 95) return "SCRATCHING STOMACH";
    return "FULL";
  };

  // Expected production cost for 1 ORE using p = 1/625
  const motherlodeOreAmount = (() => {
    const parts = motherlode.motherlode?.split(" ");
    const numeric = parseFloat(parts?.[0] ?? "0");
    return Number.isFinite(numeric) ? numeric : 0;
  })();
  const deployedSolAmount = (() => {
    const numeric = parseFloat(round.deployedSol ?? "0");
    return Number.isFinite(numeric) ? numeric : 0;
  })();
  const costLoading = loading || motherlodeLoading || roundLoading;
  const costPerOreSol = !costLoading && motherlodeOreAmount > 0 && deployedSolAmount > 0
    ? (625 * deployedSolAmount) / motherlodeOreAmount
    : 0;
  const costPerOreUsd = !costLoading && costPerOreSol > 0
    ? costPerOreSol * (prices.sol ?? 0)
    : 0;
  const uniqueMinersNumber = (() => {
    const numeric = parseInt(round.uniqueMiners ?? "0", 10);
    return Number.isFinite(numeric) ? numeric : 0;
  })();
  const minersPerCostSol = !costLoading && uniqueMinersNumber > 0 && costPerOreSol > 0
    ? (uniqueMinersNumber / costPerOreSol) * 1.11
    : 0;
  // USD equivalent of the SOL value displayed above
  const usdFromDisplayedSol = !costLoading && minersPerCostSol > 0
    ? minersPerCostSol * (prices.sol ?? 0)
    : 0;
  // Multiplier vs ORE market price
  const oreMultiplier = !costLoading && (prices.ore ?? 0) > 0
    ? usdFromDisplayedSol / (prices.ore ?? 1)
    : 0;
  // Average deployed SOL per miner (for miners box title)
  const avgDeployedSolPerMiner = uniqueMinersNumber > 0
    ? deployedSolAmount / uniqueMinersNumber
    : 0;

  return (
    <main 
      className="relative flex flex-col min-h-screen items-center justify-start md:justify-center" 
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Center Image */}
      <div className="flex-1 flex items-center justify-center">
        <Image
          src="/hawg-phd.png"
          alt="HAWG PHD"
          width={512}
          height={512}
          className="w-40 md:w-80 lg:w-[28rem] h-auto"
          priority
        />
      </div>

      {/* Model + Health stack - Desktop Only - Bottom Right above credit */}
      <div className="hidden md:flex flex-col items-end gap-0 absolute bottom-12 right-0 z-10 items-center max-w-[250px]">
        {/* Desktop Model */}
        <ModelViewer
          modelPath={health.health < 50 ? "/hawg-3d-hungry/base.obj" : "/hawg-3d/base.obj"}
          basePath={health.health < 50 ? "/hawg-3d-hungry" : "/hawg-3d"}
          variant="compact"
        />
        {/* Desktop Health Bar below model */}
        <div className="w-48">
          <div className="w-full bg-gray-800 rounded-full h-6">
            <div
              className={`h-6 rounded-full transition-all duration-500 ${
                health.health >= 50 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${health.health}%` }}
            />
          </div>
          <div className="text-white text-xl font-bold text-center mt-1">
            {healthLoading ? "..." : getHealthStatus(health.health)}
          </div>
        </div>
      </div>
      
      {/* Mobile Controls - Top Right */}
      <div className="md:hidden absolute top-2 right-4">
        <div className="flex items-center gap-2">
          {/* Menu Modal */}
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
                  <div className="text-white text-sm font-thin opacity-70">Prices</div>
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
                  <div className="text-white text-sm font-thin opacity-70">Community Tools</div>
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
                    <a
                      href="https://www.ore.monster/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors block py-2"
                      onClick={() => setIsMenuModalOpen(false)}
                    >
                      ore.monster
                    </a>
                    {showHallOfDevs && (
                      <Button
                        asChild
                        className="w-full bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
                      >
                        <a href="/hall-of-devs" onClick={() => setIsMenuModalOpen(false)}>
                          Hall of Devs
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Health Modal */}
          <Dialog open={isHealthModalOpen} onOpenChange={setIsHealthModalOpen}>
            <DialogTrigger asChild>
              <button className="px-4 py-2 text-sm text-white border border-gray-700 rounded hover:border-gray-600 transition-colors">
                Health
              </button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border border-gray-700 p-6 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-white text-lg mb-4">Health</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ModelViewer
                    modelPath={health.health < 50 ? "/hawg-3d-hungry/base.obj" : "/hawg-3d/base.obj"}
                    basePath={health.health < 50 ? "/hawg-3d-hungry" : "/hawg-3d"}
                    variant="compact"
                  />
                </div>
                <div className="w-full max-w-sm mx-auto">
                  <div className="w-full bg-gray-800 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 ${
                        health.health >= 50 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${health.health}%` }}
                    />
                  </div>
                  <div className="text-white text-lg font-bold text-center mt-1">
                    {healthLoading ? "..." : getHealthStatus(health.health)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
      
      {/* Buyback SOL Balance Box - Desktop Only - Below Motherlode */}
      <div className="hidden md:block absolute left-8 top-48">
        <Card className="bg-transparent border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">BUYBACK POWER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
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
                <div className="text-white text-2xl font-bold">
                  {healthLoading ? "..." : `${formatPrice(health.solBalance)} SOL`}
                </div>
              </div>
              <div className="text-white text-lg font-thin opacity-50 pl-11">
                {healthLoading || loading ? "..." : `$${formatPrice(health.solBalance * prices.sol)} USD`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Deployed SOL Box - Desktop Only - Below Buyback Power */}
      <div className="hidden md:block absolute left-8 top-96">
        <Card className={`bg-transparent border ${getMiningStatusColor(round.miningStatus)}`}>
          <CardHeader>
            <CardTitle className="text-white text-xl">
              {roundLoading ? "..." : `${round.uniqueMiners} MINERS`}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="text-white text-2xl font-bold">
                {roundLoading ? "..." : `${parseFloat(round.deployedSol).toFixed(4)} SOL`}
              </div>
            </div>
            <div className="text-white text-lg font-thin opacity-50 pl-11">
              {roundLoading ? "..." : `${avgDeployedSolPerMiner.toFixed(4)} SOL average`}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Production Cost (1 ORE) - Desktop Only - Below Current Round */}
      {showProductionCost && (
        <div className="hidden md:block absolute left-8 top-[36rem]">
          <Card className="bg-transparent border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Image
                  src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
                  alt="ORE"
                  width={20}
                  height={20}
                  className="rounded-full w-5 h-5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                PRODUCTION COST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
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
                  <div className="text-white text-2xl font-bold">
                    {costLoading ? "..." : `${minersPerCostSol.toFixed(4)}`}
                  </div>
                </div>
                <div className="text-white text-lg font-thin opacity-50 pl-11">
                  {costLoading ? "..." : `$${formatPrice(usdFromDisplayedSol)} (${formatPrice(oreMultiplier)}x)`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Top Right Buttons - Desktop Only */}
      <div className="hidden md:flex absolute right-8 top-8 items-center gap-3 z-30">
        {showHallOfDevs && (
          <Button
            asChild
            className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
          >
            <a href="/hall-of-devs">Hall of Devs</a>
          </Button>
        )}
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
      <div className="hidden md:block absolute right-8 top-48 z-20">
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
              <a
                href="https://www.ore.monster/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors block"
              >
                ore.monster
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Stats Grid - below buttons */}
      <div className="md:hidden w-full px-4 mt-16">
        <div className="grid grid-cols-2 gap-3">
          {/* Motherlode - Mobile */}
          <Card className="bg-transparent border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-base">MOTHERLODE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Image
                  src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
                  alt="ORE"
                  width={24}
                  height={24}
                  className="rounded-full w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-white text-lg font-bold">
                  {motherlodeLoading ? "..." : motherlode.motherlode}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyback - Mobile */}
          <Card className="bg-transparent border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-base">BUYBACK POWER</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                    alt="SOL"
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-white text-lg font-bold">
                    {healthLoading ? "..." : `${formatPrice(health.solBalance)} SOL`}
                  </div>
                </div>
                <div className="text-white text-sm font-thin opacity-50 pl-8">
                  {healthLoading || loading ? "..." : `$${formatPrice(health.solBalance * prices.sol)} USD`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Miners - Mobile */}
          <Card className={`bg-transparent border ${getMiningStatusColor(round.miningStatus)}`}>
            <CardHeader>
              <CardTitle className="text-white text-base">
                {roundLoading ? "..." : `${round.uniqueMiners} MINERS`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Image
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                    alt="SOL"
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-white text-lg font-bold">
                    {roundLoading ? "..." : `${parseFloat(round.deployedSol).toFixed(4)} SOL`}
                  </div>
                </div>
                <div className="text-white text-sm font-thin opacity-50 pl-8">
                  {roundLoading ? "..." : `${avgDeployedSolPerMiner.toFixed(4)} SOL average`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Cost - Mobile */}
          {showProductionCost && (
            <Card className="bg-transparent border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-1">
                  <Image
                    src={prices.oreIcon || "https://ore.supply/assets/icon.png"}
                    alt="ORE"
                    width={16}
                    height={16}
                    className="rounded-full w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  PRODUCTION COST
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Image
                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                      alt="SOL"
                      width={24}
                      height={24}
                      className="rounded-full w-6 h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-white text-lg font-bold">
                      {costLoading ? "..." : `${minersPerCostSol.toFixed(4)}`}
                    </div>
                  </div>
                  <div className="text-white text-sm font-thin opacity-50 pl-8">
                    {costLoading ? "..." : `$${formatPrice(usdFromDisplayedSol)} (${formatPrice(oreMultiplier)}x)`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* (Removed hidden mobile health bar block to avoid hiding controls) */}
      
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
        <div className="text-white text-sm font-thin opacity-70">
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


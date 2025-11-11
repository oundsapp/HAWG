"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HallOfDevsPage() {
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center px-6 py-10"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-3xl font-bold">Hall of Devs</h1>
          <Button asChild className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors">
            <Link href="/">Back Home</Link>
          </Button>
        </div>

        <p className="text-gray-300 mb-8">
          Celebrating developers who contribute to the ORE ecosystem by building tools for the community.
        </p>

        <Card className="bg-transparent border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400">
              No inductees yet. Have a tool to feature? Reach out to us to be listed here.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}



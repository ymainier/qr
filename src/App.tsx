"use client";

import { useState } from "react";
import { QRGenerator } from "@/components/qr-generator";
// import { QRScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { QrCode, Scan } from "lucide-react";
import { Scanner } from "./components/scanner";

type Mode = "generate" | "scan";

export default function Home() {
  const [mode, setMode] = useState<Mode>("generate");

  return <Scanner />;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex gap-2 mb-8 justify-center">
          <Button
            variant={mode === "generate" ? "default" : "outline"}
            onClick={() => setMode("generate")}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            Generate
          </Button>
          <Button
            variant={mode === "scan" ? "default" : "outline"}
            onClick={() => setMode("scan")}
            className="gap-2"
          >
            <Scan className="w-4 h-4" />
            Scan
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          {mode === "generate" ? <QRGenerator /> : <QRScanner />}
        </div>
      </div>
    </main>
  );
}

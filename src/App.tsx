"use client";

import { Link, Route, Switch } from "wouter";
import { Generator } from "@/components/generator";
import { Button } from "@/components/ui/button";
import { QrCode, Scan } from "lucide-react";
import { Scanner } from "@/components/scanner";

export default function Home() {
  return (
    <Switch>
      <Route path="/generate">
        <Generator />
      </Route>
      <Route path="/scan">
        <Scanner />
      </Route>
      <Route>
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex gap-2 mb-8 justify-center">
              <Link href="/generate" asChild>
                <Button className="gap-2">
                  <QrCode className="w-4 h-4" />
                  Generate
                </Button>
              </Link>
              <Link href="/scan" asChild>
                <Button className="gap-2">
                  <Scan className="w-4 h-4" />
                  Scan
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </Route>
    </Switch>
  );
}

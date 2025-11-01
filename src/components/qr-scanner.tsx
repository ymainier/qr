"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, Copy, CheckCircle2 } from "lucide-react";

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScanning = async () => {
    try {
      setError("");
      setScannedData("");

      console.log("[v0] Starting camera...");

      // Check if BarcodeDetector is supported
      if (!("BarcodeDetector" in window)) {
        setError(
          "QR code scanning is not supported in this browser. Please try Chrome, Edge, or another Chromium-based browser."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      console.log("[v0] Camera stream obtained:", stream);

      if (videoRef.current) {
        // attach stream first
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // wait for metadata to be loaded before calling play()
        await new Promise<void>((resolve) => {
          const video = videoRef.current!;
          if (video.readyState >= 1) {
            resolve();
            return;
          }
          const handler = () => {
            video.removeEventListener("loadedmetadata", handler);
            resolve();
          };
          video.addEventListener("loadedmetadata", handler);
        });

        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn("Video play() was blocked or failed:", err);
        }
        console.log("[v0] Video playing");

        setIsScanning(true);

        // Start detecting QR codes
        // @ts-expect-error BarcodeDetector exists
        const barcodeDetector = new window.BarcodeDetector({
          formats: ["qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (
            videoRef.current &&
            videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
          ) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                console.log("[v0] QR code detected:", barcodes[0].rawValue);
                setScannedData(barcodes[0].rawValue);
                stopScanning();
              }
            } catch (err) {
              console.error("Detection error:", err);
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error("[v0] Camera error:", err);
      setError(
        "Unable to access camera. Please ensure you have granted camera permissions."
      );
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const copyToClipboard = async () => {
    if (scannedData) {
      await navigator.clipboard.writeText(scannedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // start camera on mount and ensure cleanup on unmount
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  console.log(isScanning);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        {!isScanning ? (
          <Button onClick={startScanning} size="lg" className="gap-2">
            <Camera className="w-5 h-5" />
            Start Camera
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <CameraOff className="w-5 h-5" />
            Stop Camera
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-4 border-primary rounded-lg shadow-lg" />
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
            Position QR code within the frame
          </p>
        </div>
      </div>

      {scannedData && (
        <Alert className="bg-primary/10 border-primary max-w-xl mx-auto">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-start justify-between gap-4">
            <div className="flex-1 break-all">
              <p className="font-semibold mb-1">Scanned successfully!</p>
              <p className="text-sm">{scannedData}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="gap-2 shrink-0 bg-transparent"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isScanning && !scannedData && !error && (
        <div className="text-center py-12 text-muted-foreground">
          Click the button above to start scanning QR codes
        </div>
      )}
    </div>
  );
}

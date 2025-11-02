import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function Hud() {
  return (
    <div
      className="absolute inset-0 z-40 pointer-events-none"
      // CSS var --size will be used to size the square responsively
      style={{ "--size": "min(90vw,80vh)" } as React.CSSProperties}
    >
      {/* Top dim */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: "calc((100vh - var(--size)) / 2)",
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      {/* Middle row: left dim, transparent square (center), right dim */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "calc((100vh - var(--size)) / 2)",
          height: "var(--size)",
        }}
      >
        {/* Left dim */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: "calc((100vw - var(--size)) / 2)",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        />

        {/* Center square (transparent) */}
        <div
          className="mx-auto relative w-[var(--size)] h-[var(--size)] flex items-end justify-end"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 0 0 4px rgba(255,255,255,0.02) inset, 0 8px 24px rgba(0,0,0,0.25)",
            borderRadius: "0.25rem",
            overflow: "hidden",
          }}
        >
          <div className="absolute bottom-3 right-3 text-sm text-white/85 font-medium">
            scanning...
          </div>
        </div>

        {/* Right dim */}
        <div
          className="absolute right-0 top-0 bottom-0"
          style={{
            width: "calc((100vw - var(--size)) / 2)",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        />
      </div>

      {/* Bottom dim */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "calc((100vh - var(--size)) / 2)",
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />
    </div>
  );
}

export function Scanner() {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startScanning() {
    if (!videoRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
    try {
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.();
      const facing = settings?.facingMode;
      if (facing === "environment") {
        videoRef.current.style.transform = "scaleX(1)";
      } else {
        videoRef.current.style.transform = "scaleX(-1)";
      }
    } catch {
      videoRef.current.style.transform = "scaleX(-1)";
    }

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
            setScannedData(barcodes[0].rawValue);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }
    }, 100);
  }

  function stopScanning() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (!videoRef.current) return;
    videoRef.current.srcObject = null;
    videoRef.current.style.transform = "";
  }

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const copyToClipboard = async () => {
    if (scannedData) {
      await navigator.clipboard.writeText(scannedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-backround">
      <div className="absolute top-4 left-4 z-50">
        <Link href="/" asChild>
          <Button variant="ghost" className="gap-2 bg-white/50">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover z-0"
      />

      {/* HUD overlay: centered adaptive square with dimmed outside and highlighted border */}
      <Hud />

      {scannedData && (
        <Alert
          key={scannedData}
          className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 w-[min(95%,48rem)] bg-primary border-primary text-primary-foreground pointer-events-auto alert-entrance"
        >
          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
          <AlertDescription className="flex items-start justify-between gap-4">
            <div className="flex-1 break-all text-primary-foreground">
              {/* <p className="font-semibold mb-1">Scanned successfully!</p> */}
              <p className="text-sm">{scannedData}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="gap-2 shrink-0 bg-transparent text-primary-foreground"
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
    </div>
  );
}

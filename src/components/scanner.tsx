import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "./ui/button";

export function Scanner() {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      console.log({ track, settings, facing });
      if (facing === "environment") {
        videoRef.current.style.transform = "scaleX(1)";
      } else {
        videoRef.current.style.transform = "scaleX(-1)";
      }
    } catch {
      console.log("catch");
      videoRef.current.style.transform = "scaleX(-1)";
    }
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
    const id = setInterval(() => {
      setScannedData(`https://yann.mainier.fr/q=${Date.now()}`);
    }, 3000);
    return () => {
      clearInterval(id);
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover z-0"
      />

      {scannedData && (
        <Alert key={scannedData} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[min(95%,48rem)] bg-primary border-primary text-primary-foreground pointer-events-auto alert-entrance">
          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
          <AlertDescription className="flex items-start justify-between gap-4">
            <div className="flex-1 break-all text-primary-foreground">
              <p className="font-semibold mb-1">Scanned successfully!</p>
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

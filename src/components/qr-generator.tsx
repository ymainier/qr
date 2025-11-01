"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export function QRGenerator() {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );

      QRCode.toDataURL(text, { width: 300, margin: 2 }, (err, url) => {
        if (!err) {
          setQrCodeUrl(url);
        }
      });
    }
  }, [text]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = "qrcode.png";
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="qr-text">Enter text or URL to encode</Label>
        <Textarea
          id="qr-text"
          placeholder="https://example.com or any text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      {text && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <canvas ref={canvasRef} />
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      )}

      {!text && (
        <div className="text-center py-12 text-muted-foreground">
          Enter text above to generate a QR code
        </div>
      )}
    </div>
  );
}

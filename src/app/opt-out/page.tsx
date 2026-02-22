"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function OptOutContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    // Auto-opt out if phone param is present
  }, []);

  const handleOptOut = async () => {
    if (!phone) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/clients/opt-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563EB] mb-4">
            <Scissors className="w-7 h-7 text-white" />
          </div>

          {status === "done" ? (
            <>
              <h1 className="text-2xl font-bold mb-2">
                You&apos;ve been unsubscribed
              </h1>
              <p className="text-muted-foreground">
                You will no longer receive SMS reminders. If you change your
                mind, contact your barber directly.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">
                Unsubscribe from Reminders
              </h1>
              <p className="text-muted-foreground mb-6">
                Click below to stop receiving monthly haircut reminder texts.
              </p>
              {!phone ? (
                <p className="text-red-500 text-sm">
                  Invalid opt-out link. Please reply STOP to any reminder text.
                </p>
              ) : (
                <Button
                  onClick={handleOptOut}
                  disabled={status === "loading"}
                  variant="destructive"
                  className="w-full"
                >
                  {status === "loading"
                    ? "Processing..."
                    : "Unsubscribe Me"}
                </Button>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm mt-3">
                  Something went wrong. Please reply STOP to any text instead.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OptOutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OptOutContent />
    </Suspense>
  );
}

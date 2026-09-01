"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CaptchaFieldProps {
  error?: string;
}

export function CaptchaField({ error }: CaptchaFieldProps) {
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/captcha");
      const data = await res.json();
      setQuestion(data.question ?? "");
      setToken(data.token ?? "");
    } catch {
      setQuestion("");
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  return (
    <div className="rounded-lg border border-border bg-soft-gray/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="captchaAnswer" className="text-navy">
          Security check *
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void loadChallenge()}
          disabled={loading}
          aria-label="Refresh captcha"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </Button>
      </div>
      {loading ? (
        <p className="mt-2 text-sm text-muted">Loading challenge...</p>
      ) : (
        <p className="mt-2 text-sm font-medium text-navy">{question}</p>
      )}
      <input type="hidden" name="captchaToken" value={token} />
      <Input
        id="captchaAnswer"
        name="captchaAnswer"
        type="text"
        inputMode="numeric"
        required
        autoComplete="off"
        placeholder="Your answer"
        className="mt-2"
        disabled={loading || !token}
      />
      {error && <p className="mt-1 text-xs text-buffalo-red">{error}</p>}
      <p className="mt-1 text-xs text-muted">Please answer to confirm you are not a robot.</p>
    </div>
  );
}

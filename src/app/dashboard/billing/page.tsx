"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface WalletData {
  balance: number;
  transactions: {
    id: string;
    type: string;
    status: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }[];
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState("50");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment successful! Your wallet will be updated shortly.");
    }
    if (searchParams.get("cancelled")) {
      toast.info("Payment cancelled");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/billing/wallet")
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => {});
  }, []);

  async function handleAddFunds() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Checkout failed");
        return;
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Billing</h1>
        <p className="text-muted mt-1">Manage your advertising wallet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-navy">
              {formatCurrency(wallet?.balance ?? 0)}
            </p>
            <p className="text-sm text-muted mt-1">Available for advertising campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                max="10000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              {["25", "50", "100", "250"].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset)}
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <Button variant="accent" onClick={handleAddFunds} disabled={loading} className="w-full">
              {loading && <Loader2 className="animate-spin" />}
              Add Funds via Stripe
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!wallet?.transactions?.length ? (
            <p className="text-sm text-muted">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{tx.description ?? tx.type}</p>
                    <p className="text-xs text-muted">
                      {format(new Date(tx.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === "DEPOSIT" ? "text-navy" : "text-buffalo-red"}`}>
                      {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-muted">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}

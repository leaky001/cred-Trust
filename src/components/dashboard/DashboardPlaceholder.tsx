"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useWallet } from "@/contexts/WalletContext";

function PlaceholderCard({
  icon: Icon,
  title,
  description,
  emptyMessage,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  emptyMessage: string;
}) {
  const { isConnected } = useWallet();

  return (
    <Card variant="elevated" className="flex flex-col">
      <CardHeader>
        <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
          <Icon className="size-6" aria-hidden />
        </div>
        <CardTitle>{title}</CardTitle>
        <p className="text-small text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-surface-secondary/50 p-6 text-center">
          <p className="text-body text-gray-500">
            {isConnected ? emptyMessage : "Connect your wallet to view"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreditScore() {
  return (
    <PlaceholderCard
      icon={CreditScoreIcon}
      title="Credit Score"
      description="Your on-chain reputation"
      emptyMessage="Credit score will appear once you have loan history."
    />
  );
}

export function FileText() {
  return (
    <PlaceholderCard
      icon={FileTextIcon}
      title="Active Loans"
      description="Loans you've requested or funded"
      emptyMessage="No active loans."
    />
  );
}

export function TrendingUp() {
  return (
    <PlaceholderCard
      icon={TrendingUpIcon}
      title="Loan History"
      description="Past repayments and activity"
      emptyMessage="No loan history yet."
    />
  );
}

function CreditScoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

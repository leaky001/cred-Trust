import { CreditScore, FileText, TrendingUp } from "@/components/dashboard/DashboardPlaceholder";
import { LoansList } from "@/app/loans/LoansList";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-h2 font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-body text-gray-600">
        Your credit profile, active loans, and lending activity.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <CreditScore />
        <FileText />
        <TrendingUp />
      </div>

      <div className="mt-12">
        <h2 className="text-h3 font-semibold mb-4">Your Loans</h2>
        <LoansList />
      </div>
    </div>
  );
}

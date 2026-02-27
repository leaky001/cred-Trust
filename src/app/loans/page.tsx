import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoansList } from "./LoansList";

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-bold text-gray-900">Browse Loan Requests</h1>
          <p className="mt-2 text-body text-gray-600">
            Fund loan requests and earn interest. Review borrower credit scores before lending.
          </p>
        </div>
        <Link href="/loans/create">
          <Button variant="primary" size="md" leftIcon={<Plus className="size-4" />}>
            Create Loan Request
          </Button>
        </Link>
      </div>

      <div className="mt-12">
        <Card variant="elevated" className="flex flex-col">
          <CardHeader>
            <CardTitle>Loan Marketplace</CardTitle>
            <p className="text-small text-gray-500">
              Loan requests from borrowers. Fund to earn interest.
            </p>
          </CardHeader>
          <CardContent>
            <LoansList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

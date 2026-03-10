export type LoanStatus =
  | "Requested"
  | "Funded"
  | "Active"
  | "Repaid"
  | "Defaulted";

export interface Loan {
  id: string;
  borrower: string;
  lender: string | null; // Keeps backward compatibility (first lender or null)
  lendersCount: number;
  totalFunded: string;
  principal: string;
  remaining?: string;
  interestRate: string;
  duration: number; // days
  status: LoanStatus;
  createdAt: number;
  fundedAt?: number;
  repaymentDeadline?: number;
}

export interface CreateLoanParams {
  amount: string;
  interestRate?: string;
  duration: number;
}

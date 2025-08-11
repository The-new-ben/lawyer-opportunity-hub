import { api } from "@/lib/api";

type DepositPayload = {
  lead_id: string;
  lawyer_id: string;
  amount: number;
  deposit_type: string;
  payment_method: string;
};

export const createDeposit = (payload: DepositPayload) => {
  return api("/api/payments/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

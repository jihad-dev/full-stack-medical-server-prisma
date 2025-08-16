export interface IPaymentData {
  amount: number;
  transactionId: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string; // ✅ required
}

import { Schema, model, models, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    bookingId: { type: Types.ObjectId, ref: "Booking", required: true, index: true },
    paymentType: { type: String, enum: ["Booking", "Downpayment", "Installment"], required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    paidDate: { type: String },
    status: { type: String, enum: ["Due", "Paid", "Overdue"], default: "Due", required: true },
    method: { type: String, enum: ["Bank", "Card", "MFS", "Cash", "Cheque"], default: "Bank" },
    referenceNo: { type: String },
  },
  { timestamps: true }
);

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;

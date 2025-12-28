import { Schema, model, models, Types } from "mongoose";

const InstallmentSchema = new Schema(
  {
    dueDate: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const PaymentPlanSchema = new Schema(
  {
    unitId: { type: Types.ObjectId, ref: "Unit", required: true, index: true },
    ownershipType: { type: String, enum: ["Full", "TimeShare"], required: true },
    totalPrice: { type: Number, required: true },
    bookingPercent: { type: Number, default: 10 },
    downpaymentPercent: { type: Number, default: 30 },
    paymentMode: { type: String, enum: ["OneTime", "Installment"], required: true },
    installmentFrequency: { type: String, enum: ["Monthly", "Quarterly"], default: "Monthly" },
    tenureYears: { type: Number, enum: [1, 2, 3], default: 1 },
    bookingAmount: { type: Number, required: true },
    downpaymentAmount: { type: Number, required: true },
    installmentAmount: { type: Number, required: true },
    numberOfInstallments: { type: Number, required: true },
    schedule: { type: [InstallmentSchema], default: [] },
  },
  { timestamps: true }
);

const PaymentPlan = models.PaymentPlan || model("PaymentPlan", PaymentPlanSchema);
export default PaymentPlan;

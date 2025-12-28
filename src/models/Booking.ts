import { Schema, model, models, Types } from "mongoose";

const BookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    unitId: { type: Types.ObjectId, ref: "Unit", required: true, index: true },
    ownershipType: { type: String, enum: ["Full", "TimeShare"], required: true },
    customerId: { type: Types.ObjectId, ref: "Customer", required: true, index: true },
    paymentPlanId: { type: Types.ObjectId, ref: "PaymentPlan", required: true },
    bookingStatus: { type: String, enum: ["Initiated", "Booked", "Allotted", "Cancelled", "Completed"], default: "Initiated", required: true },
    bookingDate: { type: Date, default: () => new Date() },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Booking = models.Booking || model("Booking", BookingSchema);
export default Booking;

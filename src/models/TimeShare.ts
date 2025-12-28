import { Schema, model, models, Types } from "mongoose";

const TimeShareSchema = new Schema(
  {
    unitId: { type: Types.ObjectId, ref: "Unit", required: true, index: true },
    ownerName: { type: String },
    ownerContact: { type: String },
    shareCode: { type: String, required: true, unique: true, index: true },
    daysPerMonth: { type: Number, default: 3 },
    daysPerYear: { type: Number, default: 36 },
    status: { type: String, enum: ["Available", "Reserved", "Sold"], default: "Available", required: true },
    bookingCalendar: { type: [String], default: [] },
  },
  { timestamps: true }
);

const TimeShare = models.TimeShare || model("TimeShare", TimeShareSchema);
export default TimeShare;

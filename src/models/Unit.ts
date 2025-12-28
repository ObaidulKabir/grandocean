import { Schema, model, models } from "mongoose";

const UnitSchema = new Schema(
  {
    unitCode: { type: String, required: true, unique: true },
    floor: { type: Number, required: true },
    totalAreaSqft: { type: Number, required: true },
    totalComponentArea: { type: Number, default: 0 },
    maxShares: { type: Number },
    sharesSold: { type: Number, default: 0 },
    basePrice: { type: Number, min: 0 },
    pricePerSqft: { type: Number, min: 0 },
    viewMarkupPercent: { type: Number, default: 0, min: 0, max: 100 },
    qualityMarkupPercent: { type: Number, default: 0, min: 0, max: 100 },
    floorMarkupPercent: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice: { type: Number, default: 0 },
    timeSharePrice: { type: Number, default: 0 },
    sizeCategory: {
      type: String,
      enum: ["Studio", "1BR", "2BR", "3BR"],
      required: true,
    },
    quality: { type: String, enum: ["Premium", "Regular"], required: true },
    viewType: { type: String, enum: ["Sea View", "Hill View", "Other"], required: true },
    ownershipAllowed: { type: String, enum: ["Full", "TimeShare", "Both"], required: true },
    status: {
      type: String,
      enum: ["Available", "Hold", "Booked", "Sold"],
      default: "Available",
      required: true,
    },
  },
  { timestamps: true }
);

UnitSchema.index({ status: 1 });
UnitSchema.index({ floor: 1 });
UnitSchema.index({ viewType: 1 });
UnitSchema.index({ sizeCategory: 1 });
UnitSchema.index({ quality: 1 });

export type UnitType = {
  unitCode: string;
  floor: number;
  totalAreaSqft: number;
  totalComponentArea?: number;
  maxShares?: number;
  sharesSold?: number;
  basePrice?: number;
  pricePerSqft?: number;
  viewMarkupPercent?: number;
  qualityMarkupPercent?: number;
  floorMarkupPercent?: number;
  finalPrice?: number;
  timeSharePrice?: number;
  sizeCategory: "Studio" | "1BR" | "2BR" | "3BR";
  quality: "Premium" | "Regular";
  viewType: "Sea View" | "Hill View" | "Other";
  ownershipAllowed: "Full" | "TimeShare" | "Both";
  status: "Available" | "Hold" | "Booked" | "Sold";
};

const Unit = models.Unit || model("Unit", UnitSchema);
export default Unit;

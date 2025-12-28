import { Schema, model, models } from "mongoose";

const LeadSchema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    city: { type: String },
    message: { type: String },
    source: { type: String, default: "website" },
  },
  { timestamps: true }
);

export type LeadType = {
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  message?: string;
  source?: string;
};

const Lead = models.Lead || model("Lead", LeadSchema);
export default Lead;


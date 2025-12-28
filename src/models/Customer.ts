import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    nationalIdOrPassport: { type: String },
    address: { type: String },
    country: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Customer = models.Customer || model("Customer", CustomerSchema);
export default Customer;

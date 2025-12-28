import { Schema, model, models, Types } from "mongoose";

const SuiteComponentSchema = new Schema(
  {
    unitId: { type: Types.ObjectId, ref: "Unit", required: true, index: true },
    componentName: { type: String, required: true },
    areaSqft: { type: Number, required: true, min: 1 },
    remarks: { type: String },
  },
  { timestamps: true }
);

SuiteComponentSchema.index({ unitId: 1, componentName: 1 }, { unique: true });

export type SuiteComponentType = {
  unitId: string;
  componentName: string;
  areaSqft: number;
  remarks?: string;
};

const SuiteComponent = models.SuiteComponent || model("SuiteComponent", SuiteComponentSchema);
export default SuiteComponent;

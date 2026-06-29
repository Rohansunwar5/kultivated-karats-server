import mongoose from "mongoose";

const goldRateSchema = new mongoose.Schema({
    rate24K: { type: Number, required: true, default: 15398 },
    rate18K: { type: Number, required: true },
    rate14K: { type: Number, required: true },
    rate9K: { type: Number, required: true },
}, { timestamps: true });

goldRateSchema.pre("save", function (next) {
    this.rate18K = Math.round(this.rate24K * (75 / 100));
    this.rate14K = Math.round(this.rate24K * (58.33 / 100));
    this.rate9K = Math.round(this.rate24K * (37.5 / 100));
    next();
});

export const GoldRate = mongoose.model("GoldRate", goldRateSchema);

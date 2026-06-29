import { GoldCoin } from "../models/goldCoins.model.js";
import { GoldRate } from "../models/goldRate.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DEFAULT_RATE_24K = 15398; // matches goldRate controller fallback

// Same values the frontend used to hardcode.
const SEED_WEIGHTS = [1, 2, 5, 10, 20, 50, 100];
const seedCoins = SEED_WEIGHTS.map((w) => ({
    name: `${w}g Gold Coin`,
    weight: w,
    karats: 24,
    imageUrl: [{ url: `/gc-${w}.png`, publicId: "" }],
    premiumPercent: 16,
}));

const getAllGoldCoins = asyncHandler(async (_, res) => {
    // ponytail: seed-on-empty so there's no separate seed script to run. Drops to a no-op once populated.
    // ordered:false + catch makes a concurrent first-request race a no-op (unique weight index dedupes).
    if ((await GoldCoin.estimatedDocumentCount()) === 0)
        await GoldCoin.insertMany(seedCoins, { ordered: false }).catch(() => {});

    const rateDoc = await GoldRate.findOne().sort({ createdAt: -1 });
    const rate24K = rateDoc?.rate24K || DEFAULT_RATE_24K;

    const coins = await GoldCoin.find().sort({ weight: 1 });

    // Shape mirrors the old hardcoded object exactly. _id is the weight string so
    // the order flow keeps treating coins as non-ObjectId items (see normaliseCart.js).
    const data = coins.map((c) => ({
        _id: String(c.weight),
        name: c.name,
        weight: c.weight,
        karats: c.karats,
        imageUrl: c.imageUrl,
        price: Math.round((rate24K + (rate24K * c.premiumPercent / 100)) * c.weight),
    }));

    return res.status(200).json(new ApiResponse(200, data, "Gold coins fetched successfully!"));
});

export { getAllGoldCoins };

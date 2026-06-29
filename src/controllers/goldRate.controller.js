import { GoldRate } from "../models/goldRate.model.js";
import { Product } from "../models/products.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProductPriceDetails, setCachedRates, loadRatesFromDB } from "../utils/DiamondPriceCalculation.js";

const getGoldRate = asyncHandler(async (req, res) => {
    const doc = await GoldRate.findOne().sort({ createdAt: -1 });
    if (!doc) {
        return res.status(200).json(new ApiResponse(200, {
            rate24K: 15398,
            rate18K: Math.round(15398 * (75 / 100)),
            rate14K: Math.round(15398 * (58.33 / 100)),
            rate9K: Math.round(15398 * (37.5 / 100)),
        }, "Using default rates (no custom rate set yet)."));
    }
    return res.status(200).json(new ApiResponse(200, doc, "Gold rate fetched successfully!"));
});

const updateGoldRate = asyncHandler(async (req, res) => {
    try {
        const { rate24K } = req.body;

        if (!rate24K || rate24K <= 0)
            throw new ApiError(400, "Valid 24K gold rate is required!");

        const existing = await GoldRate.findOne().sort({ createdAt: -1 });

        let doc;
        if (existing) {
            existing.rate24K = rate24K;
            doc = await existing.save();
        } else {
            doc = await GoldRate.create({ rate24K });
        }

        // Update in-memory cache immediately
        setCachedRates({
            rate24K: doc.rate24K,
            rate18K: doc.rate18K,
            rate14K: doc.rate14K,
            rate9K: doc.rate9K,
        });

        return res.status(200).json(new ApiResponse(200, doc, "Gold rate updated successfully!"));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

const recalculateAllPrices = asyncHandler(async (req, res) => {
    try {
        // Reload latest rates from DB into cache
        await loadRatesFromDB();

        const products = await Product.find();
        let updated = 0;

        for (const product of products) {
            const priceDetails = getProductPriceDetails({
                isGemStoneProduct: product?.containsGemstone || false,
                isChainAdded: false,
                chainKarat: 14,
                isColouredDiamond: false,
                karat: product?.karat || 14,
                pointersWeight: product?.pointersWeight || 0,
                solitareWeight: product?.solitareWeight || 0,
                gemStonePointerWeight: product?.gemStoneWeightPointer || 0,
                gemStoneSolWeight: product?.gemStoneWeightSol || 0,
                multiDiaWeight: product?.multiDiamondWeight || 0,
                netWeight: product?.netWeight || 0,
            });

            await Product.findByIdAndUpdate(product._id, {
                $set: { price: priceDetails?.subTotal }
            });
            updated++;
        }

        return res.status(200).json(new ApiResponse(200, {
            totalProducts: products.length,
            updatedProducts: updated
        }, `Recalculated prices for ${updated} products!`));
    } catch (error) {
        return res.status(error?.statusCode || 500).json(error);
    }
});

export { getGoldRate, updateGoldRate, recalculateAllPrices };

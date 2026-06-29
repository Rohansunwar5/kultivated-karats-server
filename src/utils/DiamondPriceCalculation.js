import { GoldRate } from "../models/goldRate.model.js";

const GST = 3;
const CERTIFICATION_CHARGES = 1200;
const COLOUREDDAIMONDRATEPERCARAT = 95000;
const GEMSTONEPERKARAT = 500;

const FALLBACK_RATES = {
    rate24K: 15398,
    rate18K: Math.round(15398 * (75 / 100)),
    rate14K: Math.round(15398 * (58.33 / 100)),
    rate9K: Math.round(15398 * (37.5 / 100)),
};

let cachedRates = { ...FALLBACK_RATES };

export async function loadRatesFromDB() {
    try {
        const doc = await GoldRate.findOne().sort({ createdAt: -1 });
        if (doc) {
            cachedRates = { rate24K: doc.rate24K, rate18K: doc.rate18K, rate14K: doc.rate14K, rate9K: doc.rate9K };
        }
    } catch {
        cachedRates = { ...FALLBACK_RATES };
    }
    return cachedRates;
}

export function setCachedRates(rates) {
    cachedRates = { ...rates };
}

function r(karat) {
    const rates = cachedRates || FALLBACK_RATES;
    if (karat == 9) return rates.rate9K;
    if (karat == 14) return rates.rate14K;
    return rates.rate18K;
}

const getSolRate = (value) => {
    if ( value <= 2.99 ) return 60000;    
    if ( value >= 3.00 ) return 75000;    
    return 0;
};

export const getProductPriceDetails = ({ isGemStoneProduct, isChainAdded, chainKarat, isColouredDiamond, karat, pointersWeight, solitareWeight, gemStonePointerWeight, gemStoneSolWeight, multiDiaWeight, netWeight }) => {
    const safeNumber = (number) => {
        if ( number == undefined || number == null || number == NaN )
            return 0;
        return number;
    };
    const newMultiDaiWeight = safeNumber(multiDiaWeight);
    const newSolitareWeight = safeNumber(solitareWeight);
    const newPointerWeight = safeNumber(pointersWeight);
    const grossWeight = (netWeight + ((newPointerWeight == undefined ? (newSolitareWeight + newMultiDaiWeight + newPointerWeight) : (newSolitareWeight + newMultiDaiWeight)) * 0.2));
    const goldRate = (netWeight * r(karat));
    const makingCharges = grossWeight * 1200;
    const solitareRate = newSolitareWeight ? getSolRate(newSolitareWeight) : 0;
    const gemstoneSolRate = isGemStoneProduct ? isColouredDiamond ? newSolitareWeight * COLOUREDDAIMONDRATEPERCARAT : gemStoneSolWeight * GEMSTONEPERKARAT : 0;
    const gemstonePointerRate = isGemStoneProduct ? isColouredDiamond ? newPointerWeight * COLOUREDDAIMONDRATEPERCARAT : gemStonePointerWeight * GEMSTONEPERKARAT : 0;
    const multiDiaRate = newMultiDaiWeight * 30000;
    const pointersRate = newPointerWeight ? newPointerWeight * 48000 : 0;   
    const diamondRate = solitareRate + multiDiaRate + pointersRate + gemstonePointerRate + gemstoneSolRate;
    const pendantChainPrice = isChainAdded ? 2.5 * r(chainKarat) : 0;
    const subTotal = (goldRate + diamondRate + makingCharges + pendantChainPrice + CERTIFICATION_CHARGES);
    const total = (subTotal + (subTotal * (GST / 100)));
    return { subTotal, total, grossWeight, goldRate, solitareRate, multiDiaRate, pointersRate, diamondRate, makingCharges, pendantChainPrice, gemstonePointerRate, gemstoneSolRate };
};

export const getDiamondPrice = ({ karat, netWeight, solitareWeight, multiDiaWeight, pointersWeight }) => {
    const grossWeight = Math.round(netWeight + ((pointersWeight ? (solitareWeight + multiDiaWeight + pointersWeight) : (solitareWeight + multiDiaWeight)) * 0.2));
    const GoldRate = Math.round(netWeight * r(karat));
    const solitareRate = getSolRate(solitareWeight);
    const multiDiaRate = multiDiaWeight * 30000;
    const pointersRate = pointersWeight ? pointersWeight * 48000 : 0;
    const diamondRate = solitareRate + multiDiaRate + pointersRate;
    const makingCharges = grossWeight * 1200;
    const subTotal = Math.round(GoldRate + diamondRate + makingCharges);
    const total = Math.round(subTotal + (subTotal * (GST / 100)));
    return { subTotal, total, grossWeight, GoldRate, solitareRate, multiDiaRate, pointersRate, diamondRate, makingCharges };
};

export const getGemstoneWeight = ({ isGemstone, isColouredDaimond, netWeight, karat, multiDiaWeight, pointersWeight, solitareWeight, pointerWeight }) => {
    const grossWeight = (netWeight + ((solitareWeight + multiDiaWeight + pointersWeight) * 0.2));
    const GoldRate = netWeight * r(karat);
    const solitareRate = isGemstone ? solitareWeight * GEMSTONEPERKARAT : isColouredDaimond ? solitareWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const pointersRate = isGemstone ? pointerWeight * GEMSTONEPERKARAT : isColouredDaimond ? pointerWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const multiDiaRate = multiDiaWeight * 30000;
    const diamondRate = solitareRate + multiDiaRate + pointersRate;
    const makingCharges = (grossWeight * 1200);
    const subTotal = GoldRate + diamondRate + makingCharges;
    const total = Math.round(subTotal + (subTotal * (GST / 100)));
    return { grossWeight, GoldRate, solitareRate, multiDiaRate, diamondRate, makingCharges, subTotal, total };
};

// Load rates from DB at startup
loadRatesFromDB();
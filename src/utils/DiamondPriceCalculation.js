const goldRate24K = 15398;
const goldRate18K = Math.round(goldRate24K * (75 / 100));    // ₹11,549/g
const goldRate14K = Math.round(goldRate24K * (58.33 / 100)); // ₹8,982/g
const goldRate9K  = Math.round(goldRate24K * (37.5 / 100));  // ₹5,774/g

const GST = 3;

const getSolRate = (value) => {
    // if ( value <= 0.10 )
    //     return 30000;
    // if ( value > 0.10 && value <= 0.49 )    
    //     return 48000;    

    // if ( value >= 0.50 && value <= 2.99 )    
    if ( value <= 2.99 )    
        return 60000;    
    if ( value >= 3.00 )    
        return 75000;    
    return 0;
};

const CERTIFICATION_CHARGES = 1200;

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
    const goldRate = (netWeight * (karat == 9 ? goldRate9K : karat == 14 ? goldRate14K : goldRate18K)); // Todo: Confirm
    const makingCharges = grossWeight * 1200;
    const solitareRate = newSolitareWeight ? getSolRate(newSolitareWeight) : 0;
    const gemstoneSolRate = isGemStoneProduct ? isColouredDiamond ? newSolitareWeight * COLOUREDDAIMONDRATEPERCARAT : gemStoneSolWeight * GEMSTONEPERKARAT : 0;
    const gemstonePointerRate = isGemStoneProduct ? isColouredDiamond ? newPointerWeight * COLOUREDDAIMONDRATEPERCARAT : gemStonePointerWeight * GEMSTONEPERKARAT : 0;
    const multiDiaRate = newMultiDaiWeight * 30000;
    const pointersRate = newPointerWeight ? newPointerWeight * 48000 : 0;   
    const diamondRate = solitareRate + multiDiaRate + pointersRate + gemstonePointerRate + gemstoneSolRate;
    const pendantChainPrice = isChainAdded ? 2.5 * (chainKarat == 9 ? goldRate9K : chainKarat == 14 ? goldRate14K : goldRate18K) : 0;
    const subTotal = (goldRate + diamondRate + makingCharges + pendantChainPrice + CERTIFICATION_CHARGES);
    const total = (subTotal + (subTotal * (GST / 100)));
    console.log(`isGemStoneProduct: ${isGemStoneProduct}, isChainAdded: ${isChainAdded}, chainKarat: ${chainKarat}, isColouredDiamond: ${isColouredDiamond}, karat: ${karat}, newPointerWeight: ${newPointerWeight}, newSolitareWeight: ${newSolitareWeight}, gemStonePointerWeight: ${gemstonePointerRate}, gemStoneSolWeight: ${gemStoneSolWeight}, multiDiaWeight: ${multiDiaWeight}, netWeight: ${netWeight}`);
    console.log(`subTotal: ${subTotal}, total: ${total}, grossWeight: ${grossWeight}, netWeight: ${netWeight}, multiDiaWeight: ${newMultiDaiWeight}, newPointerWeight: ${newPointerWeight}, goldRate: ${goldRate}, solitareRate: ${solitareRate}, multiDiaRate: ${multiDiaRate}, pointersRate: ${pointersRate}, diamondRate: ${diamondRate}, makingCharges: ${makingCharges}, pendantChainPrice: ${pendantChainPrice}, gemstonePointerRate: ${gemstonePointerRate}, gemstoneSolRate: ${gemstoneSolRate}`)
    return { subTotal, total, grossWeight, goldRate, solitareRate, multiDiaRate, pointersRate, diamondRate, makingCharges, pendantChainPrice, gemstonePointerRate, gemstoneSolRate };
};

export const getDiamondPrice = ({ karat, netWeight, solitareWeight, multiDiaWeight, pointersWeight }) => {
    // const grossWeight = ((solitareWeight + multiDiaWeight) / 5) + netWeight;
    const grossWeight = Math.round(netWeight + ((pointersWeight ? (solitareWeight + multiDiaWeight + pointersWeight) : (solitareWeight + multiDiaWeight)) * 0.2));
    const GoldRate = Math.round(netWeight * (karat == 9 ? goldRate9K : karat == 14 ? goldRate14K : goldRate18K));
    const solitareRate = getSolRate(solitareWeight);
    const multiDiaRate = multiDiaWeight * 30000;
    const pointersRate = pointersWeight ? pointersWeight * 48000 : 0;
    const diamondRate = solitareRate + multiDiaRate + pointersRate;
    const makingCharges = grossWeight * 1200;
    const subTotal = Math.round(GoldRate + diamondRate + makingCharges);
    const total = Math.round(subTotal + (subTotal * (GST / 100)));
    console.log(grossWeight, GoldRate, solitareRate, multiDiaRate, diamondRate, makingCharges, subTotal, total);
    return { subTotal, total, grossWeight, GoldRate, solitareRate, multiDiaRate, pointersRate, diamondRate, makingCharges };
};

const COLOUREDDAIMONDRATEPERCARAT = 95000;
const GEMSTONEPERKARAT = 500;

export const getGemstoneWeight= ({ isGemstone, isColouredDaimond, netWeight, karat, multiDiaWeight, pointersWeight, solitareWeight, pointerWeight }) => {
    const grossWeight = (netWeight + ((solitareWeight + multiDiaWeight + pointersWeight) * 0.2));
    const GoldRate = netWeight * (karat == 9 ? goldRate9K : karat == 14 ? goldRate14K : goldRate18K);
    const solitareRate = isGemstone ? solitareWeight * GEMSTONEPERKARAT : isColouredDaimond ? solitareWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const pointersRate = isGemstone ? pointerWeight * GEMSTONEPERKARAT : isColouredDaimond ? pointerWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const multiDiaRate = multiDiaWeight * 30000;
    const diamondRate = solitareRate + multiDiaRate + pointersRate;
    const makingCharges = (grossWeight * 1200);
    const subTotal = GoldRate + diamondRate + makingCharges;
    const total = Math.round(subTotal + (subTotal * (GST / 100)));
    return { grossWeight, GoldRate, solitareRate, multiDiaRate, diamondRate, makingCharges, subTotal, total };
}
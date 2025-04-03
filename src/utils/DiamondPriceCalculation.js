const goldRate14K = 5072; 
const goldRate18K = 6525;

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

export const getDiamondPrice = ({ karat, netWeight, solitareWeight, multiDiaWeight, pointersWeight }) => {
    // const grossWeight = ((solitareWeight + multiDiaWeight) / 5) + netWeight;
    const grossWeight = Math.round(netWeight + ((pointersWeight ? (solitareWeight + multiDiaWeight + pointersWeight) : (solitareWeight + multiDiaWeight)) * 0.2));
    const GoldRate = Math.round(netWeight * (karat == 14 ? goldRate14K : goldRate18K));
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
    const GoldRate = netWeight * (karat == 14 ? goldRate14K : goldRate18K);
    const solitareRate = isGemstone ? solitareWeight * GEMSTONEPERKARAT : isColouredDaimond ? solitareWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const pointersRate = isGemstone ? pointerWeight * GEMSTONEPERKARAT : isColouredDaimond ? pointerWeight * COLOUREDDAIMONDRATEPERCARAT : 0;
    const multiDiaRate = multiDiaWeight * 30000;
    const diamondRate = solitareRate + multiDiaRate + pointersRate;
    const makingCharges = (grossWeight * 1200);
    const subTotal = GoldRate + diamondRate + makingCharges;
    const total = Math.round(subTotal + (subTotal * (GST / 100)));
    return { grossWeight, GoldRate, solitareRate, multiDiaRate, diamondRate, makingCharges, subTotal, total };
}
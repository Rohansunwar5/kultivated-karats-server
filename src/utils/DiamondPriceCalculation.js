const goldRate14K = 5072; 
const goldRate18K = 6525;

const GST = 18;

const getSolRate = (value) => {
    if ( value <= 0.10 )
        return 30000;
    if ( value > 0.10 && value <= 0.49 )    
        return 40000;    
    if ( value >= 0.50 && value <= 2.99 )    
        return 60000;    
    if ( value >= 3.00 )    
        return 75000;    
};

export const getDiamondPrice = ({ netWeight, diamondWeight, solitareWeight, multiDiaWeight }) => {
    const grossWeight = (diamondWeight / 5) + netWeight;
    const GoldRate = grossWeight * 1; // fix this
    const solitareRate = getSolRate(solitareWeight);
    const multiDiaRate = getSolRate(multiDiaWeight);
    const diamondRate = solitareRate + multiDiaRate;
    const makingCharges = grossWeight * 1200;
    const subTotal = GoldRate + diamondRate + makingCharges;
    const total = subTotal + GST;
    return total;
};
const goldRate14K = 5072; 
const goldRate18K = 6525;

const GST = 3;

const getSolRate = (value) => {
    if ( value <= 0.10 )
        return 30000;
    if ( value > 0.10 && value <= 0.49 )    
        return 40000;    
    if ( value >= 0.50 && value <= 2.99 )    
        return 60000;    
    if ( value >= 3.00 )    
        return 75000;    
    return 0;
};

export const getDiamondPrice = ({ karat, netWeight, diamondWeight, solitareWeight, multiDiaWeight }) => {
    const grossWeight = ((solitareWeight + multiDiaWeight) / 5) + netWeight;
    const GoldRate = netWeight * (karat == 14 ? goldRate14K : goldRate18K);
    const solitareRate = getSolRate(solitareWeight);
    // const multiDiaRate = getSolRate(multiDiaWeight);
    const multiDiaRate = multiDiaWeight * 30000;
    const diamondRate = solitareRate + multiDiaRate;
    const makingCharges = grossWeight * 1200;
    const subTotal = GoldRate + diamondRate + makingCharges ;
    const total = subTotal + (subTotal * (GST / 100));
    console.log(grossWeight, GoldRate, solitareRate, multiDiaRate, diamondRate, makingCharges, diamondWeight, subTotal, total);
    return subTotal;
};

export const getDiamondWithGemstonePrice = ({}) => {
    
}
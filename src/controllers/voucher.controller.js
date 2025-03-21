import { Voucher } from "../models/vouchers.model.js";

const getAllVouchers = async () => {
    try {
        const vouchers = await Voucher.find().populate("usedBy");
        
        if ( !vouchers ) throw new ApiError(500, "Coundn't find vouchers!");
        
        return res.status(200).json(new ApiResponse(200, vouchers, "Vouchers fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
};

const getAVoucher = async (req, res) => {
    try {
        const { voucherCode } = req.body;
        const voucher = await Voucher.find({code: voucherCode}).populate("usedBy");
        
        if ( !voucher ) throw new ApiError(500, "Voucher not found!");
        
        return res.status(200).json(new ApiResponse(200, voucher, "Voucher fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
};

const editAVoucher = async () => {
    try {
        const { voucherData } = req.body;
        const updatedVoucher = await Voucher.findOneAndUpdate({code: voucherCode}, voucherData).populate("usedBy");
        
        if ( !updatedVoucher ) throw new ApiError(500, "Voucher updation failed!");
        
        return res.status(200).json(new ApiResponse(200, voucher, "Voucher updated successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
};

const createAVoucher = async () => {
    try {
        const { voucherData } = req.body;
        const updatedVoucher = await Voucher.create(voucherData);
        
        if ( !updatedVoucher ) throw new ApiError(500, "Voucher creation failed!");
        
        return res.status(200).json(new ApiResponse(200, voucher, "Voucher created successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
};

const deleteAVoucher = async () => {
    try {
        const { voucherCode } = req.body;

        if ( !voucherCode )
            throw new ApiError(400, "Voucher code not found!");

        const deleteResponse = await Voucher.deleteOne({code: voucherCode});
        
        if ( !deleteResponse ) throw new ApiError(500, "Voucher deletion failed!");
        
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Voucher deleted successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
};

const validateVoucher = async () => {
    try {
        const { voucherCode } = req.body;

        if ( !voucherCode )
            throw new ApiError(400, "Voucher code missing from the req body!");

        const voucher = Voucher.find({ code: voucherCode });

        return res.status(200).json(new ApiResponse(200, voucher ? true : false, "")); 
    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);
    }
};

export { createAVoucher, getAVoucher, getAllVouchers, editAVoucher, deleteAVoucher, validateVoucher };
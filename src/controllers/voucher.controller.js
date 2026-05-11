import { Voucher } from "../models/vouchers.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().populate("usedBy");
        
        if (!vouchers) throw new ApiError(500, "Couldn't find vouchers!");
        
        return res.status(200).json(new ApiResponse(200, vouchers, "Vouchers fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const getAVoucher = async (req, res) => {
    try {
        const { voucherCode } = req.body;
        
        if (!voucherCode) throw new ApiError(400, "Voucher code is required!");
        
        const voucher = await Voucher.findOne({code: voucherCode}).populate("usedBy");
        
        if (!voucher) throw new ApiError(404, "Voucher not found!");
        
        return res.status(200).json(new ApiResponse(200, voucher, "Voucher fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const editAVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const voucherData = req.body;
        
        if (!voucherId) throw new ApiError(400, "Voucher ID is required!");
        
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            voucherId, 
            voucherData,
            { new: true, runValidators: true }
        ).populate("usedBy");
        
        if (!updatedVoucher) throw new ApiError(404, "Voucher not found or update failed!");
        
        return res.status(200).json(new ApiResponse(200, updatedVoucher, "Voucher updated successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const createAVoucher = async (req, res) => {
    try {
        const voucherData = req.body;
        
        // Validate required fields
        const { name, code, amount, minimumValue, used, startFrom, validUpto } = voucherData;
        
        if (!name || !code || !amount || minimumValue === undefined || used === undefined || !startFrom || !validUpto) {
            throw new ApiError(400, "All required fields must be provided!");
        }
        
        const newVoucher = await Voucher.create(voucherData);
        
        if (!newVoucher) throw new ApiError(500, "Voucher creation failed!");
        
        return res.status(201).json(new ApiResponse(201, newVoucher, "Voucher created successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const deleteAVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;

        if (!voucherId)
            throw new ApiError(400, "Voucher ID is required!");

        const deleteResponse = await Voucher.findByIdAndDelete(voucherId);
        
        if (!deleteResponse) throw new ApiError(404, "Voucher not found or deletion failed!");
        
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Voucher deleted successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const validateAndApplyVoucher = async (req, res) => {
    try {
        const { voucherCode, cartTotal, userId } = req.body;

        // Validations
        if (!voucherCode)
            throw new ApiError(400, "Voucher code is required!");

        if (!cartTotal || cartTotal <= 0)
            throw new ApiError(400, "Valid cart total is required!");

        // Find voucher
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() }).populate("usedBy");

        if (!voucher)
            throw new ApiError(404, "Voucher not found!");

        // Check if voucher is already used
        if (voucher.used)
            throw new ApiError(400, "This voucher has already been used!");

        // Check if current user has already used this voucher
        if (userId && voucher.usedBy && voucher.usedBy._id.toString() === userId.toString())
            throw new ApiError(400, "You have already used this voucher!");

        // Check validity dates
        const now = new Date();
        if (now < new Date(voucher.startFrom))
            throw new ApiError(400, "This voucher is not yet active!");

        if (now > new Date(voucher.validUpto))
            throw new ApiError(400, "This voucher has expired!");

        // Check minimum cart value
        if (cartTotal < voucher.minimumValue)
            throw new ApiError(400, `Minimum cart value of ₹${voucher.minimumValue} is required to use this voucher!`);

        // Calculate discount
        const discount = voucher.amount;
        const finalAmount = Math.max(0, cartTotal - discount);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    isValid: true,
                    voucher: {
                        code: voucher.code,
                        name: voucher.name,
                        amount: voucher.amount,
                        minimumValue: voucher.minimumValue
                    },
                    discount: discount,
                    cartTotal: cartTotal,
                    finalAmount: finalAmount,
                    savings: discount
                },
                "Voucher applied successfully!"
            )
        );

    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

// Simple validation endpoint (just checks if voucher exists and is valid)
const validateVoucher = async (req, res) => {
    try {
        const { voucherCode } = req.query;

        if (!voucherCode)
            throw new ApiError(400, "Voucher code missing from the request!");

        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });

        if (!voucher)
            throw new ApiError(404, "Voucher not found!");

        const now = new Date();
        const isExpired = now > new Date(voucher.validUpto);
        const isNotStarted = now < new Date(voucher.startFrom);
        const isUsed = voucher.used;

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    isValid: !isExpired && !isNotStarted && !isUsed,
                    voucher: {
                        code: voucher.code,
                        name: voucher.name,
                        amount: voucher.amount,
                        minimumValue: voucher.minimumValue,
                        validUpto: voucher.validUpto,
                        used: voucher.used
                    },
                    reasons: {
                        expired: isExpired,
                        notStarted: isNotStarted,
                        alreadyUsed: isUsed
                    }
                },
                "Voucher validation complete!"
            )
        );
    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

// Helper function to generate random alphanumeric string
const generateRandomCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const createBulkVouchers = async (req, res) => {
    try {
        const { 
            name, 
            codePrefix, // e.g., "SALE" - first 4 characters
            count, // number of vouchers to generate
            amount, 
            minimumValue, 
            startFrom, 
            validUpto 
        } = req.body;

        // Validation
        if (!name || !codePrefix || !count || !amount || minimumValue === undefined || !startFrom || !validUpto) {
            throw new ApiError(400, "All required fields must be provided!");
        }

        if (count < 1 || count > 1000) {
            throw new ApiError(400, "Count must be between 1 and 1000!");
        }

        if (codePrefix.length > 10) {
            throw new ApiError(400, "Code prefix should not exceed 10 characters!");
        }

        const vouchersToCreate = [];
        const generatedCodes = new Set();

        // Generate unique codes
        for (let i = 0; i < count; i++) {
            let uniqueCode;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                const randomPart = generateRandomCode(8);
                uniqueCode = `${codePrefix.toUpperCase()}-${randomPart}`;
                attempts++;

                if (attempts >= maxAttempts) {
                    throw new ApiError(500, "Failed to generate unique codes. Try a different prefix.");
                }
            } while (generatedCodes.has(uniqueCode) || await Voucher.exists({ code: uniqueCode }));

            generatedCodes.add(uniqueCode);

            vouchersToCreate.push({
                name,
                code: uniqueCode,
                amount,
                minimumValue,
                used: false,
                startFrom,
                validUpto,
                usedBy: null
            });
        }

        // Bulk insert
        const createdVouchers = await Voucher.insertMany(vouchersToCreate);

        if (!createdVouchers || createdVouchers.length === 0) {
            throw new ApiError(500, "Bulk voucher creation failed!");
        }

        return res.status(201).json(
            new ApiResponse(
                201, 
                {
                    vouchers: createdVouchers,
                    count: createdVouchers.length,
                    codes: createdVouchers.map(v => v.code)
                }, 
                `${createdVouchers.length} vouchers created successfully!`
            )
        );

    } catch (error) {
        console.log(error);
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

export { 
    createAVoucher, 
    getAVoucher, 
    getAllVouchers, 
    editAVoucher, 
    deleteAVoucher, 
    validateVoucher,
    createBulkVouchers,
    validateAndApplyVoucher
};

import { Order } from "../models/orders.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllOrders = asyncHandler( async (req, res) => {
    try {
        const orders = await Order.find().populate("cart.product").populate("customerId");
        
        if ( !orders ) 
            throw new ApiError(500, "Internal server error!");

        console.log(products[0]);
        return res.status(200).json(new ApiResponse(200, products, "Orders fetched successfully!"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

// const getAnOrder = asyncHandler( async (req, res) => {});

const createAnOrder = asyncHandler( async (req, res) => {
    try {
        const { order } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !order )
            throw new ApiError(400, "No order object recieved!");
    
        const newOrder = await Order.create(order);
    
        if ( !newOrder )
            throw new ApiError(500, "Error while creating order!");
    
        return res.status(200).json(new ApiResponse(200, newOrder, "order created successfully!"));    
    } catch (error) {
        let errorMessage;
        let type;
        if ( error.code == 11000 ){
            type = "orderId";
            errorMessage = `Order with ID: ${error?.keyValue?.productId}, already exists!`;
        } 
        console.log(error);
        return res.status(400).json({ error, errorMessage, type });
    }
});

const updateAnOrder = asyncHandler( async (req, res) => {
    try{
        const { id } = req.params;
        const { updatedOrderFromReq } = req.body;

        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");

        if ( !id )
            throw new ApiError(400, "No id found!");

        if ( !updatedOrderFromReq )
            throw new ApiError(400, "No updatedOrderFromReq found!");

        const updatedOrder = await Product.findByIdAndUpdate(id, updatedOrderFromReq, {runValidators: true, new: true}).populate("productCategory").populate("customerId").populate("cart.product");

        console.log(updatedOrder);

        if ( !updatedOrder )
            throw new ApiError(500, "Internal server error!");
        
        return res.status(200).json(new ApiResponse(200, updatedProduct, "Order updated successfully"));
    } catch (error) {
        let errorMessage;
        let type;
        console.log(error);
        return res.status(400).json({ error, errorMessage, type });
    }
});

const deleteAnOrder = asyncHandler( async (req, res) => {});

const deleteMultipleOrders = asyncHandler( async(req, res) => {
    try {
        const { ids } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !ids ) 
            throw new ApiError(404, "No ids found!");
    
        if ( !(ids instanceof Array) )
            throw new ApiError(400, "No array provided!");
    
        const deleteResponse = await Order.deleteMany({ _id: { $in: ids } });

        console.log(deleteResponse);
        

        if ( !deleteResponse )  
            throw new ApiError(400, "Order deletion unsuccessfull!");

        res.status(200).json(new ApiResponse(200, deleteResponse, "Orders deleted successfully!"));
    
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { getAllOrders, createAnOrder, updateAnOrder, deleteAnOrder, deleteMultipleOrders };
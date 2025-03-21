import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Testimonial } from "../models/testimonials.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};

const getAllTestimonials = asyncHandler( async ( _, res ) => {
    try {
        const response = await Testimonial.find();
        
        if ( !response ) throw new ApiError(500, "Failed to fetch testimonials!");
        
        return res.status(200).json(new ApiResponse(200, response, "Testimonial fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
});

const createATestimonial = asyncHandler( async (req, res) => {
    try {
        const { testimonialData } = req.body; 
        
        if ( !testimonialData ) throw new ApiError(400, "Testimonial data missing in the req body!!");
        
        const response = await Testimonial.create(testimonialData);

        console.log(response);

        if ( !response ) throw new ApiError(500, "Response error!!");

        return res.status(200).json(new ApiResponse(200, response, "Testimonial created successfully!"));
    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);
    }
});

const deleteATestimonial = asyncHandler( async (req, res) => {
    try {
        const { testimonialId } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !testimonialId )
            throw new ApiError(400, "ID not received!");
    
        const deleteResponse = await Testimonial.deleteOne({ _id: testimonialId });
    
        console.log(deleteResponse);

        if  ( !deleteResponse )
            throw new ApiError(500, "Unable to delete testimonial!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Testimonial deleted successfully"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { getAllTestimonials, createATestimonial, deleteATestimonial };
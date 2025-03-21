import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
};

const editABlog = asyncHandler( async(req, res) => {
    try {
        const { blogId } = req.params;
        const { updatedBlog } = req.body;

        if ( !blogId ) throw new ApiError(400, "Blog id absent in request!!");

        const response = await Blog.findByIdAndUpdate(blogId, updatedBlog);

        if ( !response ) throw new ApiError(400, "Response curropt!!");

        return res.status(200).json(new ApiResponse(200, response, "Blog updated successfully!"));    
    
    } catch (error) {
        return res.status((error?.status || 500)).json(new ApiResponse((error?.status || 500), {}, "Blog updation failed!"));
    }
});

const getAllBlogs = asyncHandler( async ( _, res ) => {
    try {
        const response = await Blog.find();
        
        if ( !response ) throw new ApiError(500, "Failed to fetch blogs!");
        
        return res.status(200).json(new ApiResponse(200, response, "Blogs fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
});

const getABlog = asyncHandler( async ( req, res ) => {
    try {

        const { blogId } = req.params;

        if ( !blogId ) throw new ApiError(400, "blog ID not present in the request params!!");

        const response = await Blog.findById(blogId);
        
        console.log(response);
        

        if ( !response ) throw new ApiError(500, "Failed to fetch blog!");
        
        return res.status(200).json(new ApiResponse(200, response, "Blog fetched successfully!"));
    
    } catch (error) {
        console.log(error);        
        return res.status(error?.status || 500).json(error);
    }
});

const createABlog = asyncHandler( async (req, res) => {
    try {
        const { blogData } = req.body; 
        
        if ( !blogData ) throw new ApiError(400, "blogData missing in the req body!!");
        
        const response = await Blog.create(blogData);

        console.log(response);

        if ( !response ) throw new ApiError(500, "Response error!!");

        return res.status(200).json(new ApiResponse(200, response, "Blog created successfully!"));

    } catch (error) {
        console.log(error);
        return res.status(error?.status || 500).json(error);
    }
});

const deleteABlog = asyncHandler( async (req, res) => {
    try {
        const { blogId } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !blogId )
            throw new ApiError(400, "blog ID not received!");
    
        const deleteResponse = await Blog.deleteOne({ _id: blogId });
    
        console.log(deleteResponse);

        if  ( !deleteResponse )
            throw new ApiError(500, "Unable to delete the blog!");
    
        return res.status(200).json(new ApiResponse(200, deleteResponse, "Blog deleted successfully"));
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

export { getAllBlogs, createABlog, editABlog, deleteABlog, getABlog };
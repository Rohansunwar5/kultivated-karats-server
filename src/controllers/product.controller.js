import mongoose from "mongoose";
import { Product } from "../models/products.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDiamondPrice } from "../utils/DiamondPriceCalculation.js";

const getAllProducts = asyncHandler( async (req, res) => {

    
    const products = await Product.find().populate("category");
    
    if ( !products ) 
        throw new ApiError(500, "Internal server error!");

    console.log(products[0]);
    return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully!"));
});

const getAProduct = asyncHandler( async (req, res) => {
    try {
        const { id } = req.params;
    
        if ( !id )
            throw new ApiError(404, "No product Id present!");
    
        const product = await Product.findOne({ _id : id }).populate("category");
    
        if ( !product ) 
            throw new ApiError(404, "No product with the id '"+id+"' found");
    
        return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
    } catch (error) {
        console.log(error);
        
        return res.status(error.status || 500).json(error);
    }
});

const getAllProductsInACategory = asyncHandler( async (req, res) => {
    const { category } = req.params;

    if ( !category )
        throw new ApiError(404, "No category found!");

    const productsInCategory = await Product.find({ productCategory: category }).populate("productCategory");

    if ( !productsInCategory )
        throw new ApiError(404, "No products in this category or no such category found");

    return res.status(200).json(new ApiResponse(200, productsInCategory, "Products fetched successfully!"));
});

const updateAProduct = asyncHandler( async(req, res) => {
    try{
        const { id } = req.params;
        const { updatedProductFromReq } = req.body;

        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");

        if ( !id )
            throw new ApiError(400, "No id found!");

        if ( !updatedProductFromReq )
            throw new ApiError(400, "No updated product found!");

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductFromReq, {runValidators: true, new: true}).populate("productCategory");

        console.log(updatedProduct);

        if ( !updatedProduct )
            throw new ApiError(500, "Internal server error!");
        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
    } catch (error) {
        let errorMessage;
        let type;
        console.log(error);
        
        if ( error.path === "productCategory" ) {
            type = "productCategory";
            errorMessage = `Please select a product category!`;
        }

        if ( error.code == 11000 ){
            type = "productId";
            errorMessage = `product with ID: ${error?.keyValue?.productId}, not found!`;
        } 
        return res.status(400).json({ error, errorMessage, type });
    }
});

const deleteAProduct = asyncHandler( async(req, res) => {
    try {
        const { id } = req.params;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");

        if ( !id )
            throw new ApiError(400, "No id found!");

        const deleteResponse = await Product.deleteOne({ _id: id });

        if ( !deleteResponse )
            throw new ApiError(400, "Product deletion unsuccessfull!");

        return res.status(200).json(new ApiResponse(200, deleteResponse, "Product deletion successfull!"));
    } catch (error) {
        console.log(error);        
        return res.json(error);
    }
});

const deleteMultipleProducts = asyncHandler( async(req, res) => {
    try {
        const { ids } = req.body;
    
        if ( !(req?.user?.role === "Admin") )
            throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !ids ) 
            throw new ApiError(404, "No ids found!");
    
        if ( !(ids instanceof Array) )
            throw new ApiError(400, "No array provided!");
    
        const deleteResponse = await Product.deleteMany({ _id: { $in: ids } });

        console.log(deleteResponse);
        

        if ( !deleteResponse )  
            throw new ApiError(400, "Product deletion unsuccessfull!");

        res.status(200).json(new ApiResponse(200, deleteResponse, "Products deleted successfully!"));
    
    } catch (error) {
        return res.status(error.status || 500).json(error);
    }
});

const createAProduct = asyncHandler( async (req, res) => {
    try {
        const { product } = req.body;
    
        // if ( !(req?.user?.role === "Admin") )
        //     throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !product )
            throw new ApiError(400, "No product object recieved!");
    
        const newProduct = await Product.create(product);
    
        /* Todo: Handle images */
    
        if ( !newProduct )
            throw new ApiError(500, "Error while creating the product!");
    
        return res.status(200).json(new ApiResponse(200, newProduct, "Product created successfully!"));    
    } catch (error) {
        let errorMessage;
        let type;
        if ( error.code == 11000 ){
            type = "productId";
            errorMessage = `product with ID: ${error?.keyValue?.productId}, already exists!`;
        } 
        console.log(error);
        return res.status(400).json({ error, errorMessage, type });
    }
});

const uploadProductsFromExcel = asyncHandler(async (req, res) => {
    try {

        if (!req.file) {
            throw new ApiError(400, "No file uploaded.");
        }
        console.log("Uploaded file path:", req.file.path);

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        for (const row of data) {
            const {
                productId,
                collections,
                name,
                netWeight,
                solitareWeight,
                diamondWeight,
                multiDiamondWeight,
                shapeOfMultiDiamonds,
                goldColor,
                gender
            } = row;

            const collectionNames = collections.split(",").map((name) => name.trim().toLowerCase());
            const collectionIds = [];
            for (const collectionName of collectionNames) {
                let collectionDoc = await Collection.findOne({ name: collectionName });
                if (!collectionDoc) {
                    collectionDoc = await Collection.create({ name: collectionName });
                    console.log(`New collection created: ${collectionDoc.name}`);
                }
                collectionIds.push(collectionDoc._id); 
            }
        
            const product = await Product.findOneAndUpdate(
                { productId },
                {
                    productId,
                    code: productId,
                    name,
                    collections: collectionIds,
                    netWeight,
                    diamondWeight,
                    solitareWeight,
                    multiDiamondWeight,
                    shapeOfMultiDiamonds,
                    goldColor: goldColor.split(",").map((color) => color.trim().toLowerCase()),
                    gender
                },
                { upsert: true, new: true }
            );
         
            for (const collectionId of collectionIds) {
                await Collection.findByIdAndUpdate(
                    collectionId,
                    { $addToSet: { products: product._id } },
                    { new: true }
                );
            }
            console.log(`Product processed: ${product.name}`);
        }
        fs.unlinkSync(req.file.path);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Products uploaded successfully."));
    } catch (error) {
        console.error("Error uploading products:", error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }
});


const mapImagesToProducts =  asyncHandler( async (req, res) => {
    try {
        const { imageList } = req.body;
    
        // if ( !(req?.user?.role === "Admin") )
        //     throw new ApiError(400, "Unauthorized requrest!");
    
        if ( !imageList )
            throw new ApiError(500, "Error while mapping the products!");
            
        // const allProducts = await Product.find();

        // imageList?.forEach(element => {
            // console.log(element);
            // const product = Product.find({ productId: ima })
        // });
        // console.log(imageList?.data);

        for (const element in imageList?.data) {
            // const product = Product.find({ productId: element });
            // if ( !product )
                // continue;

            const updatedProduct = await Product.findOneAndUpdate({ productId: element }, { imageUrl: imageList?.data?.[`${element}`] });    
            // console.log(imageList?.data?.[`${element}`], element);
            console.log(updatedProduct);
        };
    
        /* Todo: Handle images */
    
        // if ( !newProduct )
            // throw new ApiError(500, "Error while creating the product!");
    
        return res.status(200).json(new ApiResponse(200, "Images mapped successfully!"));    
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error, errorMessage, type });
    }
});

const setBasePrice =  asyncHandler( async (req, res) => {
    try {
        // const { imageList } = req.body;
    
        // if ( !(req?.user?.role === "Admin") )
        //     throw new ApiError(400, "Unauthorized requrest!");
    
        // if ( !imageList )
            // throw new ApiError(500, "Error while mapping the products!");
    
        const allProducts = await Product.find();

        allProducts.forEach(element => {
            const diamondPrice = getDiamondPrice({ netWeight:element?.netWeight, diamondWeight: element?.diamondWeight, solitareWeight: element?.solitareWeight, multiDiaWeight: element?.multiDiamondWeight });
            const updatedProduct = Product.findOneAndUpdate({ _id: element?._id },{ $set: { price: diamondPrice}}, { new: true});
            console.log(element?.netWeight, element?.diamondWeight, element?.solitareWeight, element?.multiDiamondWeight);
            console.log(updatedProduct);
        });

        // const allProducts = await Product.find();

        // imageList?.forEach(element => {
            // console.log(element);
            // const product = Product.find({ productId: ima })
        // });
        // console.log(imageList?.data);

    
        /* Todo: Handle images */
    
        // if ( !newProduct )
            // throw new ApiError(500, "Error while creating the product!");
    
        return res.status(200).json(new ApiResponse(200, "Base price set successfully!"));    
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error, errorMessage, type });
    }
});

export { getAProduct, setBasePrice, mapImagesToProducts, getAllProducts, updateAProduct, deleteAProduct, deleteMultipleProducts, getAllProductsInACategory, createAProduct, uploadProductsFromExcel};
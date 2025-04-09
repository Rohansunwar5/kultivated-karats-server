import { Product } from "../models/products.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDiamondPrice } from "../utils/DiamondPriceCalculation.js";
import xlsx from "xlsx"; 
import fs from "fs";
import { Category } from "../models/categories.model.js";
import { SubCategory } from "../models/subCategories.model.js";
// import { Collection } from "../models/collections.model.js";

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

        // Helper functions
        const safeNumber = (value) => {
            if (value === null || value === undefined || value === '' || value === 'null') {
                return undefined;
            }
            const num = Number(value);
            return isNaN(num) ? undefined : num;
        };

        const safeArray = (value, delimiter = ',') => {
            if (!value) return undefined;
            return value.split(delimiter).map(item => item.trim().toLowerCase());
        };

        const safeBoolean = (value) => {
            if (value === null || value === undefined || value === '') return undefined;
            return Boolean(value);
        };

        const splitCollections = (collectionsString) => {
            if (!collectionsString) return [];
            return collectionsString
                .split('&')
                .flatMap(part => part.split(','))
                .map(name => name.trim().toLowerCase())
                .filter(name => name);
        };

        // Function to process subcategories (similar to collections but with category relationship)
        const processSubCategories = async (subCategoryString, categoryDoc) => {
            if (!subCategoryString) return [];
            
            const subCategoryNames = subCategoryString
                .split('&')
                .flatMap(part => part.split(','))
                .map(name => name.trim().toLowerCase())
                .filter(name => name);

            const subCategoryIds = [];
            for (const subCatName of subCategoryNames) {
                let subCategoryDoc = await SubCategory.findOne({ name: subCatName });
                if (!subCategoryDoc) {
                    subCategoryDoc = await SubCategory.create({ 
                        name: subCatName,
                        description: "Imported from Excel",
                        parentCategory: categoryDoc?._id
                    });
                    console.log(`New subcategory created: ${subCatName}`);
                }
                subCategoryIds.push(subCategoryDoc._id);
            }
            return subCategoryIds;
        };

        for (const row of data) {
            try {
                const {
                    productId,
                    collections,
                    name,
                    category,
                    subCategory,
                    netWeight,
                    solitareWeight,
                    diamondWeight,
                    multiDiamondWeight,
                    shapeOfMultiDiamonds,
                    goldColor,
                    gender,
                    gemStoneWeightPointer,
                    colouredStone,
                    pointersWeight,
                    addChain,
                    isMrpProduct,
                    gemStoneWeight,
                    containsGemstone,
                    isPendantFixed,
                    shapeOfSolitare,
                } = row;

                // Process category
                let categoryDoc = null;
                if (category) {
                    const categoryName = category.trim().toLowerCase();
                    categoryDoc = await Category.findOne({ name: categoryName });
                    if (!categoryDoc) {
                        categoryDoc = await Category.create({ 
                            name: categoryName,
                            description: "Imported from Excel"
                        });
                        console.log(`New category created: ${categoryName}`);
                    }
                }

                // Process subcategories (handles both & and , as delimiters)
                const subCategoryIds = await processSubCategories(subCategory, categoryDoc);

                // Process collections
                const collectionNames = splitCollections(collections);
                const collectionIds = [];
                for (const collectionName of collectionNames) {
                    let collectionDoc = await Collection.findOne({ name: collectionName });
                    if (!collectionDoc) {
                        collectionDoc = await Collection.create({ name: collectionName });
                        console.log(`New collection created: ${collectionName}`);
                    }
                    collectionIds.push(collectionDoc._id);
                }

                // Build product data
                const productData = {
                    productId,
                    code: productId,
                    name,
                    category: categoryDoc?._id,
                    subCategories: subCategoryIds,
                    collections: collectionIds,
                    netWeight: safeNumber(netWeight),
                    diamondWeight: safeNumber(diamondWeight),
                    solitareWeight: safeNumber(solitareWeight),
                    multiDiamondWeight: safeNumber(multiDiamondWeight),
                    shapeOfMultiDiamonds: shapeOfMultiDiamonds?.trim(),
                    goldColor: safeArray(goldColor),
                    gender: gender?.trim(),
                    gemStoneWeightPointer: gemStoneWeightPointer?.trim(),
                    colouredStone: safeArray(colouredStone),
                    pointersWeight: safeNumber(pointersWeight),
                    addChain: safeBoolean(addChain),
                    isMrpProduct: safeBoolean(isMrpProduct),
                    gemStoneWeight: safeNumber(gemStoneWeight),
                    containsGemstone: safeBoolean(containsGemstone),
                    isPendantFixed: safeBoolean(isPendantFixed),
                    shapeOfSolitare: shapeOfSolitare?.trim(),
                };

                // Remove undefined values
                Object.keys(productData).forEach(key => {
                    if (productData[key] === undefined) {
                        delete productData[key];
                    }
                });

                // Create/update product
                const product = await Product.findOneAndUpdate(
                    { productId },
                    productData,
                    { upsert: true, new: true }
                );

                // Update collections with product reference
                for (const collectionId of collectionIds) {
                    await Collection.findByIdAndUpdate(
                        collectionId,
                        { $addToSet: { products: product._id } },
                        { new: true }
                    );
                }

                console.log(`Product processed: ${product.name}`);
            } catch (rowError) {
                console.error(`Error processing row with productId ${row.productId || 'unknown'}:`, rowError);
            }
        }

        fs.unlinkSync(req.file.path);
        return res.status(200).json(new ApiResponse(200, {}, "Products uploaded successfully."));
    } catch (error) {
        console.error("Error uploading products:", error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(500, error.message || "Internal Server Error");
    }   // rohan sunwar is a handsome guy
});

const mapImagesToProducts = asyncHandler(async (req, res) => {
    try {
        const { imageList } = req.body;

        if (!imageList) {
            throw new ApiError(400, "Image list is required");
        }

        // Get all products at once for efficiency
        const allProducts = await Product.find({});
        
        // Create a map of normalized product IDs to product documents
        const productMap = {};
        allProducts.forEach(product => {
            const normalizedId = product.productId.toLowerCase().replace(/\s+/g, ' ').trim();
            productMap[normalizedId] = product;
        });

        let updateCount = 0;
        const updatePromises = [];

        for (const [imageKey, imageDataArray] of Object.entries(imageList)) {
            if (!Array.isArray(imageDataArray) || imageDataArray.length === 0) continue;

            // Normalize the image key
            const normalizedImageKey = imageKey
                .replace(/_/g, ' ')          // Replace underscores with spaces
                .replace(/\.(webp|jpg|jpeg|png)$/i, '') // Remove file extensions
                .toLowerCase()
                .trim();

            // Find matching product
            const matchingProduct = productMap[normalizedImageKey];
            
            if (matchingProduct) {
                // Format the image data to match your schema requirements
                const formattedImages = imageDataArray.map(img => ({
                    url: img.url,
                    publicId: img.publicId,
                    // Add any other required fields here
                    isPrimary: false // Example field, adjust as needed
                }));

                updatePromises.push(
                    Product.findByIdAndUpdate(
                        matchingProduct._id,
                        { 
                            $set: { 
                                imageUrl: formattedImages 
                            } 
                        },
                        { new: true }
                    )
                );
                updateCount++;
            }
        }

        await Promise.all(updatePromises);
        
        return res.status(200).json(
            new ApiResponse(200, `Successfully mapped ${updateCount} images to products`)
        );
    } catch (error) {
        console.error("Error in mapImagesToProducts:", error);
        return res.status(500).json(
            new ApiError(500, error.message || "Failed to map images to products")
        );
    }
});

const setBasePrice = asyncHandler(async (req, res) => {

    try {
        const allProducts = await Product.find();

        // Using a for...of loop to handle async updates properly
        for (const element of allProducts) {
            const diamondPrice = getDiamondPrice({ 
                karat: 14, 
                netWeight: element?.netWeight, 
                solitareWeight: element?.solitareWeight, 
                multiDiaWeight: element?.multiDiamondWeight 
            }).subTotal;

            // Awaiting the update to ensure it completes
            await Product.findOneAndUpdate(
                { _id: element?._id }, 
                { $set: { price: diamondPrice } }, 
                { new: true }
            );

            console.log(element?.netWeight, element?.solitareWeight, element?.multiDiamondWeight);
        }

        return res.status(200).json(new ApiResponse(200, "Base price set successfully!"));    
    } catch (error) { 
        console.log(error);
        return res.status(400).json({ error });
    }
});


export { getAProduct, setBasePrice, mapImagesToProducts, getAllProducts, updateAProduct, deleteAProduct, deleteMultipleProducts, getAllProductsInACategory, createAProduct, uploadProductsFromExcel};
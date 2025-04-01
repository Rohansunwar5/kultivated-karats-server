import multer from "multer";
import fs from "fs";
import path from "path";

const tempDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const xlsxFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        "application/vnd.ms-excel" 
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error("Only .xlsx and .xls files are allowed!"), false); 
    }
};

export const uploadXLSX = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(tempDir, "xlsx")); 
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    fileFilter: xlsxFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg", 
        "image/png", 
        "image/jpg",  
        "image/webp"  
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only image files (JPEG, PNG, WebP) are allowed!"), false); 
    }
};

export const uploadImages = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(tempDir, "images")); 
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname); 
        }
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});
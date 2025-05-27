import { Resend } from "resend";
import dotenv from "dotenv";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

dotenv.config({ path: "./.env" });

const resend = new Resend(process.env.RESEND_API);

const sendEmail = asyncHandler( async (req, res) => {
    try {
        const { email } = req.body;

        console.log(email);

        if ( !email?.from || !email?.to || !email?.subject || !email.html )
            throw new ApiError(400, "Fields missing!", [ "Fields missing!" ]);

        const response = await resend.emails.send(email);

        if ( !response )
            throw new ApiError(400, "Failed to send email!", [ "Failed to send email!" ]);

        return res.status(200).json(new ApiResponse(200, response, "Email sent successfully!"));    
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
});

export { sendEmail };
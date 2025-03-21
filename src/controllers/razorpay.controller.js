import Razorpay from "razorpay";
import { Order } from "../models/orders.model";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = asyncHandler( async(req, res) => {
    console.log(mongoose.models);
    try {
        if ( !req?.user?._id )
            throw new ApiError(401, "No user logged in!")

        const { cart } = req.body;
        
        const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0);

        // Create razorpay order

        const order = await razorpay.orders.create({
            amount: (cartTotal * 100),
            currency: "INR",
            receipt: `receipt-${Date.now()}`,
            notes: {}
        }); 

        const dataBaseOrder = await Order.create({
            orderId: order?.id,
            customerId: req?.user?._id,
            total: cartTotal,
            deliveryAddress: req?.user?.deliveryAddress,
            orderStatus: "Pending",
            cart: cart,
            note: ""
        });

        return res.status(200).json(new ApiResponse(200, {
            order: order,
            dataBaseOrder: dataBaseOrder
        }, "order created successfully successfully!!"));
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode).json(error);
    }

});

export { createOrder, };
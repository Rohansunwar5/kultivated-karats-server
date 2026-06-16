import mongoose from "mongoose";

/**
 * Normalises an incoming cart array before it is saved.
 *
 * The frontend sends each item's `product` as a full object. There are two cases:
 *  - Real products: their `_id` is a valid Mongo ObjectId. We store only that
 *    ObjectId in `product` so the field stays a proper ref and keeps working
 *    with .populate("cart.product").
 *  - Gold coins: synthetic items whose ids are "1"/"2"/"5"… (not ObjectIds) and
 *    are not DB documents. They CANNOT live in `product` (populate would try to
 *    $in-cast them and throw — breaking login and every authed request). They go
 *    into a separate Mixed `goldCoin` field instead, with `product` left unset.
 *
 * The User schema's toJSON transform re-exposes `goldCoin` as `product` on the
 * way out, so the frontend keeps reading cartItem.product.* uniformly.
 */
export const normaliseCart = (cart) => {
    if ( !Array.isArray(cart) ) return [];
    return cart.map((item) => {
        const rawProduct = item?.product;
        const productId = rawProduct?._id ?? rawProduct;

        // Already-normalised gold coin coming back from a previous round-trip.
        if ( item?.goldCoin && !mongoose.isValidObjectId(productId) ) {
            const { product, ...rest } = item;
            return { ...rest, goldCoin: item.goldCoin };
        }

        if ( mongoose.isValidObjectId(productId) ) {
            // Real product → keep only the ObjectId in `product`.
            const { goldCoin, ...rest } = item;
            return { ...rest, product: productId };
        }

        // Gold coin (full synthetic object) → move it into `goldCoin`, clear `product`.
        const { product, ...rest } = item;
        return { ...rest, goldCoin: rawProduct };
    });
};

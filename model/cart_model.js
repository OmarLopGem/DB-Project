import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema({
    bookId: {type: mongoose.Schema.Types.ObjectId, ref: "book", required: true},
    quantity: {type: Number, required: true, min: 1, default: 1}
}, {_id: false});

const cartSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true},
    items: [cartItemSchema]
}, {timestamps: true});

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;
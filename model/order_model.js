import mongoose from "mongoose";

const userSnapshotSchema = mongoose.Schema({
    name: String,
    email: String,
    address: String,
}, {_id: false});

const paymentInfoSchema = mongoose.Schema({
    paymentMethod: {type: String, required: true},
    cardHolderName: String,
    cardNumber: String,
    expiryDate: String,
    cvv: String
}, {_id: false});

const orderItemSchema = mongoose.Schema({
    bookId: {type: mongoose.Schema.Types.ObjectId, ref: "book", required: true},
    title: String,
    author: String,
    quantity: {type: Number, required: true},
    unitPrice: Number,
    subtotal: Number,
}, {_id: false});

const ordersSchema = mongoose.Schema({
    invoiceNumber: {type: String, required: true, unique: true},
    orderDate: {type: Date, default: Date.now},
    status: {type: String, enum: ["pending", "completed", "cancelled"], default: "pending"},
    userSnapshot: userSnapshotSchema,
    paymentInfo: paymentInfoSchema,
    items: [orderItemSchema],
    totalAmount: {type: Number, required: true}
}, { timestamps: true});

const orderModel = mongoose.model("order", ordersSchema);
export default orderModel;
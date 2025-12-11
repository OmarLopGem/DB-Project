import orderModel from '../model/order_model.js';
import bookModel from '../model/book_model.js';
import userModel from '../model/user_model.js';
import cartModel from "../model/cart_model.js";
import CartController from "./cart_controller.js";
import reportController from "./ReportController.js";

const generateInvoiceNumber = async () => {
    const prefix = 'INV';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const lastOrder = await orderModel
        .findOne({ invoiceNumber: new RegExp(`^${prefix}-${year}${month}`) })
        .sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
        const lastSequence = parseInt(lastOrder.invoiceNumber.split('-')[2]);
        sequence = lastSequence + 1;
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return null;
    const cleaned = cardNumber.replace(/\s/g, '');
    return `****${cleaned.slice(-4)}`;
};

export const createOrder = async (req, res) => {
    try {
        const { userId, paymentInfo } = req.body;

        // Validar userId
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Obtener información del usuario
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Crear userSnapshot desde el usuario
        const userSnapshot = {
            name: user.name,
            email: user.email,
            address: user.address || ''
        };

        // cart
        const {items} = await cartModel.findOne({userId}).populate('items.bookId') || {items: []};
        if (items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }

        if (!paymentInfo || !paymentInfo.paymentMethod) {
            return res.status(400).json({ message: "Payment information is required" });
        }

        if (paymentInfo.paymentMethod === 'credit_card' || paymentInfo.paymentMethod === 'debit_card') {
            if (!paymentInfo.cardHolderName || !paymentInfo.cardNumber ||
                !paymentInfo.expiryDate || !paymentInfo.cvv) {
                return res.status(400).json({
                    message: "Card information is incomplete"
                });
            }
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const book = await bookModel.findById(item.bookId);

            if (!book) {
                return res.status(404).json({ message: `Book with ID ${item.bookId} not found` });
            }

            if (book.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${book.title}". Available: ${book.stock}`
                });
            }

            const unitPrice = book.discount
                ? book.price - (book.price * book.discount / 100)
                : book.price;

            const subtotal = unitPrice * item.quantity;

            orderItems.push({
                bookId: book._id,
                title: book.title,
                author: book.author,
                quantity: item.quantity,
                unitPrice,
                subtotal
            });

            totalAmount += subtotal;

            // Reduce stock
            book.stock -= item.quantity;
            await book.save();
        }

        const invoiceNumber = await generateInvoiceNumber();

        const securePaymentInfo = {
            paymentMethod: paymentInfo.paymentMethod,
            cardHolderName: paymentInfo.cardHolderName || null,
            cardNumber: maskCardNumber(paymentInfo.cardNumber),
            expiryDate: paymentInfo.expiryDate || null,
            cvv: null
        };

        const newOrder = new orderModel({
            invoiceNumber,
            userSnapshot,
            paymentInfo: securePaymentInfo,
            items: orderItems,
            totalAmount,
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        // Clear user's cart
        await CartController.clearCartByUserId(userId);

        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

export const getAllOrdersoBJECTS = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            email,
            paymentMethod
        } = req.query;

        const filter = {};

        if (status) filter.status = status;
        if (email) filter['userSnapshot.email'] = { $regex: email, $options: 'i' };
        if (paymentMethod) filter['paymentInfo.paymentMethod'] = paymentMethod;
        if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) filter.orderDate.$gte = new Date(startDate);
            if (endDate) filter.orderDate.$lte = new Date(endDate);
        }

        const orders = await orderModel
            .find(filter)
            .populate('items.bookId')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ orderDate: -1 });

        const count = await orderModel.countDocuments(filter);

        res.status(200).json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalOrders: count
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel.findById(id).populate('items.bookId');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
};

export const getOrderByInvoice = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const order = await orderModel.findOne({ invoiceNumber }).populate('items.bookId');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be: pending, completed, or cancelled"
            });
        }

        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // If cancelling, restore stock
        if (status === 'cancelled' && order.status !== 'cancelled') {
            for (const item of order.items) {
                await bookModel.findByIdAndUpdate(
                    item.bookId,
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        order.status = status;
        await order.save();

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const email = user.email;

        const orders = await orderModel
            .find({ 'userSnapshot.email': email })
            .populate('items.bookId')
            .sort({ orderDate: -1 });
        res.render('my_orders', { orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user orders", error: error.message });
    }
};


export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate('items.bookId')
            .sort({ orderDate: -1 });
        res.render('my_orders', { orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user orders", error: error.message });
    }
};

export const getPdfOrderInvoice = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.orderId).populate('items.bookId').lean();
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        await reportController.sendInvoice(
            res,
            order,
            `invoice-${order.invoiceNumber}.pdf`
        );
    }catch (e) {
        console.error('Invoice generation error:', error);
        res.status(500).json({message: "Error generating PDF invoice", error: e.message});
    }
}
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const pendingOrders = await orderModel.countDocuments({ status: 'pending' });
        const completedOrders = await orderModel.countDocuments({ status: 'completed' });
        const cancelledOrders = await orderModel.countDocuments({ status: 'cancelled' });

        const totalRevenue = await orderModel.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const paymentMethodStats = await orderModel.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$paymentInfo.paymentMethod',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.status(200).json({
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            paymentMethodStats
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching statistics", error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== 'cancelled') {
            for (const item of order.items) {
                await bookModel.findByIdAndUpdate(
                    item.bookId,
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        await orderModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting order", error: error.message });
    }
};
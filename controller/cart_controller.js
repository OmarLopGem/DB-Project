import cartModel from '../model/cart_model.js';
import bookModel from '../model/book_model.js';
import {cartUtils} from "../public/js/cart_utils.js";
import userModel from "../model/user_model.js";

export default class CartController {
    static getCartById = async (req, res) => {
        try {
            const {userId} = req.params;

            let cart = await cartModel.findOne({userId}).populate('items.bookId');

            // If cart doesn't exist, create empty cart
            if (!cart) {
                cart = new cartModel({userId, items: []});
                await cart.save();
            }

            let totalItems = 0;
            let totalAmount = 0;

            const itemsWithDetails = cart.items.map(item => {
                if (item.bookId) {
                    const book = item.bookId;
                    const unitPrice = book.discount
                        ? book.price - (book.price * book.discount / 100)
                        : book.price;
                    const subtotal = unitPrice * item.quantity;

                    totalItems += item.quantity;
                    totalAmount += subtotal;

                    return {
                        bookId: book._id,
                        title: book.title,
                        author: book.author,
                        cover: book.cover,
                        price: book.price,
                        discount: book.discount,
                        unitPrice,
                        quantity: item.quantity,
                        subtotal,
                        stock: book.stock
                    };
                }
                return null;
            }).filter(item => item !== null);

            res.status(200).json({
                cart: {
                    _id: cart._id,
                    userId: cart.userId,
                    items: itemsWithDetails,
                    totalItems,
                    totalAmount
                }
            });
        } catch (error) {
            res.status(500).json({message: "Error fetching cart", error: error.message});
        }
    };

    static addBookToCart = async (req, res) => {
        try {
            const {userId} = req.params;
            const {bookId, quantity = 1} = req.body;


            const book = await bookModel.findById(bookId);
            if (!book) {
                return res.status(404).json({message: "Book not found"});
            }

            if (book.stock < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock. Available: ${book.stock}`
                });
            }

            let cart = await cartModel.findOne({userId});

            if (!cart) {
                cart = new cartModel({userId, items: []});
            }

            const existingItemIndex = cart.items.findIndex(
                item => item.bookId.toString() === bookId
            );

            if (existingItemIndex > -1) {
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;

                if (book.stock < newQuantity) {
                    return res.status(400).json({
                        message: `Cannot add more. Maximum available: ${book.stock}`
                    });
                }

                cart.items[existingItemIndex].quantity = newQuantity;
            } else {
                cart.items.push({bookId, quantity});
            }

            await cart.save();
            await cart.populate('items.bookId');

            res.status(200).json({
                message: "Item added to cart successfully",
                cart,
                ...{
                    itemBadge: cart.items.length,
                    subTotal: cartUtils.calculateSubtotal(cart),
                    totalItems: cartUtils.countTotalItems(cart)
                }
            });
        } catch (error) {
            res.status(500).json({message: "Error adding item to cart", error: error.message});
        }
    };

    static updateCartItem = async (req, res) => {
        try {
            const {userId, bookId} = req.params;
            const {quantity} = req.body;

            if (!quantity || quantity < 1) {
                return res.status(400).json({message: "Quantity must be at least 1"});
            }

            const book = await bookModel.findById(bookId);
            if (!book) {
                return res.status(404).json({message: "Book not found"});
            }

            if (book.stock < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock. Available: ${book.stock}`
                });
            }

            const cart = await cartModel.findOne({userId});
            if (!cart) {
                return res.status(404).json({message: "Cart not found"});
            }

            const itemIndex = cart.items.findIndex(
                item => item.bookId.toString() === bookId
            );

            if (itemIndex === -1) {
                return res.status(404).json({message: "Item not found in cart"});
            }

            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate('items.bookId');

            res.status(200).json({
                message: "Cart item updated successfully",
                cart
            });
        } catch (error) {
            res.status(500).json({message: "Error updating cart item", error: error.message});
        }
    };

    static removeFromCart = async (req, res) => {
        try {
            const {userId, bookId} = req.params;

            const cart = await cartModel.findOne({userId});
            if (!cart) {
                return res.status(404).json({message: "Cart not found"});
            }

            cart.items = cart.items.filter(
                item => item.bookId.toString() !== bookId
            );

            await cart.save();
            await cart.populate('items.bookId');

            res.status(200).json({
                message: "Item removed from cart successfully",
                cart
            });
        } catch (error) {
            res.status(500).json({message: "Error removing item from cart", error: error.message});
        }
    };

    static clearCart = async (req, res) => {
        try {
            const {userId} = req.params;

            const cart = await cartModel.findOne({userId});
            if (!cart) {
                return res.status(404).json({message: "Cart not found"});
            }

            cart.items = [];
            await cart.save();

            res.status(200).json({
                message: "Cart cleared successfully",
                cart
            });
        } catch (error) {
            res.status(500).json({message: "Error clearing cart", error: error.message});
        }
    };

    static validateCart = async (req, res) => {
        try {
            const {userId} = req.params;

            const cart = await cartModel.findOne({userId}).populate('items.bookId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({message: "Cart is empty"});
            }

            const issues = [];

            for (const item of cart.items) {
                if (!item.bookId) {
                    issues.push({
                        bookId: item.bookId,
                        issue: "Book no longer exists"
                    });
                    continue;
                }

                if (item.bookId.stock < item.quantity) {
                    issues.push({
                        bookId: item.bookId._id,
                        title: item.bookId.title,
                        requested: item.quantity,
                        available: item.bookId.stock,
                        issue: "Insufficient stock"
                    });
                }
            }

            if (issues.length > 0) {
                return res.status(400).json({
                    message: "Cart validation failed",
                    issues
                });
            }

            res.status(200).json({
                message: "Cart is valid",
                valid: true
            });
        } catch (error) {
            res.status(500).json({message: "Error validating cart", error: error.message});
        }
    };

    static getCartCount = async (req, res) => {
        try {
            const {userId} = req.params;

            const cart = await cartModel.findOne({userId});

            if (!cart) {
                return res.status(200).json({count: 0});
            }

            const count = cart.items.reduce((total, item) => total + item.quantity, 0);

            res.status(200).json({count});
        } catch (error) {
            res.status(500).json({message: "Error fetching cart count", error: error.message});
        }
    };


    static showCart = async (req, res) => {
        try {
            const {userId} = req.params;
            let cart = await cartModel.findOne({userId}).populate('items.bookId');
            let user = await userModel.findById(userId);
            if (!cart) {
                res.status(404).json({message: "Cart not found"});
            }
            const totalItems = cart ? cartUtils.countTotalItems(cart) : 0;
            const subTotal = cart ? cartUtils.calculateSubtotal(cart) : 0;
            const cartCount = cart ? cart.items.length : 0;
            res.render('checkout', {
                'cartItems': cart.items,
                'user': user, 'totalItems': totalItems, 'subTotal': subTotal, 'cartCount': cartCount
            })
        } catch (error) {
            res.status(500).json({message: "Error fetching cart", error: error.message});
        }
    }
}
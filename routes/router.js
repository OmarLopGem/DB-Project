import StoreController from "../controller/controller.js";
import CartController from "../controller/cart_controller.js";
import express from "express"
import salesController from "../controller/sampleController.js";
import {createOrder, getAllOrders, getPdfOrderInvoice, getUserOrders} from "../controller/orderController.js";
import BookController from "../controller/book_controller.js";

const router = express.Router();

router.get('/', StoreController.showLogin);
router.post('/api/reports/sales/pdf', salesController.generateSalesReport);
router.get('/api/reports/inventory/pdf', salesController.generateInventoryReport);
router.get('/home', StoreController.showHome);
router.get('/register', StoreController.showRegister);
router.get('/logout', StoreController.logOutUser);
router.post('/register', StoreController.registerUser);
router.post('/login', StoreController.loginUser);
router.get('/login', StoreController.showLogin);


// cart
router.post('/cart/clear/:userId', CartController.clearCart);
router.post('/cart/add/:userId', CartController.addBookToCart);
router.get('/cart/:userId', CartController.showCart);

// checkout
router.post('/checkout',createOrder)

// order
router.get('/orders/all', getAllOrders);
router.get('/orders/:userId', getUserOrders);
router.get('/order/pdf/:orderId', getPdfOrderInvoice);

// books
router.get('/book/:bookId', BookController.manageBookView);
router.post('/book', BookController.createBook);
router.put('/book/:bookId', BookController.updateBook);
// router.delete('/book/:bookId', BookController.deleteBook);

export default router;
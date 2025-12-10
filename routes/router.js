import StoreController from "../controller/controller.js";
import CartController from "../controller/cart_controller.js";
import express from "express"
import salesController from "../controller/sampleController.js";

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
// router.post('/checkout/:userId', );

export default router;
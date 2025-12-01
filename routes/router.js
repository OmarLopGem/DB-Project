import StoreController from "../controller/controller.js";
import express from 'express'
import salesController from "../controller/sampleController.js";

const router = express.Router();

router.get('/', StoreController.showHome);
router.post('/api/reports/sales/pdf', salesController.generateSalesReport);
router.get('/api/reports/inventory/pdf', salesController.generateInventoryReport);


export default router;
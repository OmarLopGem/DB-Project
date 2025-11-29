import StoreController from "../controller/controller.js";
import express from 'express'

const router = express.Router();

router.get('/', StoreController.showHome);

export default router;
import express from 'express';
import { getProducts, createProduct, getProductDetail, updateProduct, deleteProduct } from '../controllers/ProductController';
import { upload } from '../config/multerConfig';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticate(['customer', 'admin']), upload.array('images'), createProduct);
router.get('/:id', getProductDetail);
router.put('/:id', authenticate(['customer', 'admin']), upload.array('images'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;

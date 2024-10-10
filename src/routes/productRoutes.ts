import express from 'express';
import { getProducts, createProduct, getProductDetail, updateProduct, deleteProduct } from '../controllers/ProductController';
import { upload } from '../config/multerConfig';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authenticate(['customer', 'admin']), getProducts);
router.post('/', authenticate(['customer', 'admin']), upload.array('images'), createProduct);
router.get('/:id', authenticate(['customer', 'admin']), getProductDetail);
router.put('/:id', authenticate(['customer', 'admin']), upload.array('images'), updateProduct);
router.delete('/:id', authenticate(['customer', 'admin']), deleteProduct);

export default router;

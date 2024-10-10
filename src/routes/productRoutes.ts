import express from 'express';
import { getProducts, createProduct, getProductDetail, updateProduct, deleteProduct } from '../controllers/ProductController';
import { upload } from '../config/multerConfig';

const router = express.Router();

router.get('/', getProducts);
router.post('/', upload.array('images'), createProduct);
router.get('/:id', getProductDetail);
router.put('/:id', upload.array('images'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;

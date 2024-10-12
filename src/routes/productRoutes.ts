import express from 'express';
import {
  getProducts,
  createProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from '../controllers/ProductController';
import { upload } from '../config/multerConfig';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticate(['admin']), upload.array('images'), createProduct);
router.get('/:id', getProductDetail);
router.put('/:id', authenticate(['admin']), upload.array('images'), updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id', authenticate(['admin']), restoreProduct);

export default router;

import express from 'express';
import authenticate from '../middlewares/authMiddleware';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getProductsByCategory,
  updateCategory,
} from '../controllers/CategoryController';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticate(['admin']), createCategory);
router.get('/:id', getProductsByCategory);
router.put('/:id', authenticate(['admin']), updateCategory);
router.delete('/:id', authenticate(['admin']), deleteCategory);

export default router;

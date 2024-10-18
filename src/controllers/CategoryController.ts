import { Response } from 'express';
import { supabase } from '../supabaseClient';
import { _parseInt } from '../utils';
import { failedResponse, successResponse } from '../utils/ResponseHelper';
import { RequestWithUser } from '../types/types';

export const getCategories: any = async (req: RequestWithUser, res: Response) => {
  try {
    const page = _parseInt(req.query.page) || 1;
    const limit = _parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const searchQuery = req.query.q ? (req.query.q as string).toLowerCase() : null;

    let query = supabase
      .from('categories')
      .select('id, name, description, created_at, updated_at', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data: categories, error: categoriesError, count: total } = await query;

    if (categoriesError) {
      return res.status(500).json(failedResponse('Terjadi kesalahan', categoriesError.message));
    }

    return res.status(200).json(successResponse({
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total! / limit),
    }, 'Categories fetched successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
}

export const createCategory: any = async (req: RequestWithUser, res: Response) => {
  const { name, description } = req.body;

  try {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .select('*')
      .single();

    if (categoryError) return res.status(500).json(failedResponse('Terjadi kesalahan', categoryError.message));

    return res.status(201).json(successResponse({ ...category }, 'Category created successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
}

export const updateCategory: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update({ name, description })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) return res.status(500).json(failedResponse('Terjadi kesalahan', updateError.message));

    return res.status(200).json(successResponse({ ...updatedCategory }, 'Category updated successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
};

export const deleteCategory: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;

  try {
    const { data: deletedCategory, error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select('*')
      .single();

    if (deleteError) return res.status(500).json(failedResponse('Terjadi kesalahan', deleteError.message));

    return res.status(200).json(successResponse({ ...deletedCategory }, 'Category deleted successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
};

export const getProductsByCategory: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const page = _parseInt(req.query.page) || 1;
  const limit = _parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { data: products, error: productsError, count: total } = await supabase
      .from('products')
      .select('id, name, price, description, created_at', { count: 'exact' })
      .eq('category_id', id)
      .range(offset, offset + limit - 1);

    if (productsError) {
      return res.status(500).json(failedResponse('Terjadi kesalahan', productsError.message));
    }

    return res.status(200).json(successResponse({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total! / limit),
    }, 'Products fetched successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
};


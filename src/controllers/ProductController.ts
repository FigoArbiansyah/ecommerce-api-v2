import { Response } from 'express';
import { supabase } from '../supabaseClient';
import { _parseInt } from '../utils';
import { failedResponse, successResponse } from '../utils/ResponseHelper';
import { RequestWithUser } from '../types/types';

export const getProducts: any = async (req: RequestWithUser, res: Response) => {
  try {
    const page = _parseInt(req.query.page) || 1;
    const limit = _parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const searchQuery = req.query.q ? (req.query.q as string).toLowerCase() : null;

    let query = supabase
      .from('products')
      .select('id, name, description, price, stock, category_id, created_at, updated_at, product_images (id, image_url)', { count: 'exact' })
      .is('deleted_at', null)
      .range(offset, offset + limit - 1);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data: products, error: productsError, count: total } = await query;

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

export const createProduct: any = async (req: RequestWithUser, res: Response) => {
  const { name, price, description, stock, category_id } = req.body;
  const images = req.files as Express.Multer.File[];

  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ name, price, description, stock, category_id }])
      .select('*')
      .single();

    if (productError) return res.status(500).json(failedResponse('Terjadi kesalahan', productError.message));

    if (images && images.length > 0) {
      const host = req.protocol + '://' + req.get('host');
      const newImages = images.map((file) => ({
        product_id: product.id,
        image_url: `${host}/uploads/${file.filename}`,
      }));

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(newImages);

      if (imageError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to insert images'));
    }

    return res.status(201).json(successResponse({ ...product, images }, 'Product created successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
};

export const updateProduct: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const { name, price, description, stock, category_id } = req.body;
  const images = req.files as Express.Multer.File[];

  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({ name, price, description, stock, category_id })
      .eq('id', id)
      .select('*')
      .single();

    if (productError || !product) return res.status(404).json(failedResponse('Product not found', 'Product not found'));

    if (images && images.length > 0) {
      const host = req.protocol + '://' + req.get('host');

      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (deleteError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to update images'));

      const newImages = images.map((file) => ({
        product_id: id,
        image_url: `${host}/uploads/${file.filename}`,
      }));

      const { error: insertError } = await supabase
        .from('product_images')
        .insert(newImages);

      if (insertError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to insert new images'));
    }

    return res.status(200).json(successResponse({ ...product, images }, 'Product updated successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

export const getProductDetail: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) return res.status(404).json(failedResponse('Product not found', 'Product not found'));

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', id);

    if (imagesError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to load images'));

    return res.status(200).json(successResponse({ ...product, images }, 'Product details fetched successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

export const deleteProduct: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) return res.status(500).json(failedResponse('Terjadi kesalahan', error.message));
    return res.status(200).json(successResponse(data, 'Product soft deleted successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

export const restoreProduct: any = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) return res.status(500).json(failedResponse('Terjadi kesalahan', error.message));
    return res.status(200).json(successResponse(data, 'Product restored successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

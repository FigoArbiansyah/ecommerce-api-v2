import { Response } from 'express';
import { supabase } from '../supabaseClient';
import { _parseInt, methodType } from '../utils';
import { failedResponse, successResponse } from '../utils/ResponseHelper';
import { RequestWithUser } from '../types/types';

export const getProducts: methodType = async (req: RequestWithUser, res: Response) => {
  try {
    const page = _parseInt(req.query.page) || 1;
    const limit = _parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch only products that are not soft deleted (deleted_at is NULL)
    const { data: products, error: productsError, count: total } = await supabase
      .from('products')
      .select('id, name, description, price, stock, created_at, updated_at', { count: 'exact' })
      .is('deleted_at', null) // Only select products where deleted_at is null
      .range(offset, offset + limit - 1);

    if (productsError) return res.status(500).json(failedResponse('Terjadi kesalahan', productsError.message));

    // Get all images for all products
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*');

    if (imagesError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to load images'));

    // Map each product to its corresponding images
    const productsWithImages = products.map((product) => {
      const productImages = images
        .filter((img) => img.product_id === product.id)
        .map((img) => img.image_url);
      return { ...product, images: productImages };
    });

    return res.status(200).json(successResponse({
      products: productsWithImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total! / limit),
    }, 'Products fetched successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Terjadi kesalahan'));
  }
};

export const createProduct: methodType = async (req: RequestWithUser, res: Response) => {
  const { name, price, description, stock } = req.body;
  const images = req.files as Express.Multer.File[]; // Mendapatkan file yang di-upload

  try {
    // Insert new product into the products table
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ name, price, description, stock }])
      .select('*')
      .single();

    if (productError) return res.status(500).json(failedResponse('Terjadi kesalahan', productError.message));

    // If images were uploaded, save image information
    if (images && images.length > 0) {
      const host = req.protocol + '://' + req.get('host'); // Mendapatkan host dan protokol
      const newImages = images.map((file) => ({
        product_id: product.id,
        image_url: `${host}/uploads/${file.filename}`, // Membangun URL gambar
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

export const updateProduct: methodType = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  const { name, price, description, stock } = req.body;
  const images = req.files as Express.Multer.File[];

  try {
    // Update the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({ name, price, description, stock })
      .eq('id', id)
      .select('*')
      .single();

    if (productError || !product) return res.status(404).json(failedResponse('Product not found', 'Product not found'));

    // If there are new images, delete old images and save the new ones
    if (images && images.length > 0) {
      const host = req.protocol + '://' + req.get('host'); // Mendapatkan host dan protokol

      // Delete existing images
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (deleteError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to update images'));

      // Save new images
      const newImages = images.map((file) => ({
        product_id: id,
        image_url: `${host}/uploads/${file.filename}`, // Membangun URL gambar
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

// Get detail of a single product by ID including images
export const getProductDetail: methodType = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    // Fetch the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) return res.status(404).json(failedResponse('Product not found', 'Product not found'));

    // Fetch the images related to the product
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', id);

    if (imagesError) return res.status(500).json(failedResponse('Terjadi kesalahan', 'Failed to load images'));

    // Combine product data and images
    return res.status(200).json(successResponse({ ...product, images }, 'Product details fetched successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

// Delete a product by ID and its images
export const deleteProduct: methodType = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete the product by setting deleted_at to current timestamp
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: new Date() }) // Update deleted_at column with the current date
      .eq('id', id);

    if (error) return res.status(500).json(failedResponse('Terjadi kesalahan', error.message));
    return res.status(200).json(successResponse(data, 'Product soft deleted successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};

export const restoreProduct: methodType = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  try {
    // Restore the product by setting deleted_at to NULL
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: null }) // Set deleted_at to null
      .eq('id', id);

    if (error) return res.status(500).json(failedResponse('Terjadi kesalahan', error.message));
    return res.status(200).json(successResponse(data, 'Product restored successfully'));
  } catch (err) {
    return res.status(500).json(failedResponse('Terjadi kesalahan', 'Something went wrong'));
  }
};


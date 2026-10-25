import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, inventoryApi } from '@/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Product, InventoryItem, PagedResponse } from '@/types';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be a positive number')),
  currency: z.string(),
  category: z.string().min(1, 'Category is required'),
});

interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
}

export const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    mode: 'onChange',
  });
  const { data: { products = [], inventory = {} } = {}, error: queryError, refetch: fetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productApi.getAll(0, 50);
      const data = response.data;
      const productList = (data as PagedResponse<Product>).content || (data as Product[]) || [];

      // Fetch inventory for all products in bulk
      const inventoryMap: Record<string, InventoryItem> = {};
      if (productList.length > 0) {
        try {
          const invRes = await inventoryApi.getBulkStock(productList.map((p) => p.id));
          if (Array.isArray(invRes.data)) {
            invRes.data.forEach((item) => {
              inventoryMap[item.productId] = item;
            });
          }
        } catch {
          // Product has no inventory yet
        }
      }
      return { products: productList, inventory: inventoryMap };
    },
  });

  const [formError, setFormError] = useState('');
  const error = queryError ? (queryError as any).response?.data?.message || 'Failed to fetch products' : formError;

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, data as Product);
        toast.success('Product updated!');
      } else {
        await productApi.create(data as Omit<Product, 'id'>);
        toast.success('Product created!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product');
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({ sku: '', name: '', description: '', price: 0, currency: 'USD', category: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: product.price,
      currency: product.currency,
      category: product.category,
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.sku.toLowerCase().includes(search.toLowerCase()) ||
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Products</h1>
          <p className="text-[#1D1D1F]/60 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D1D1F]/40" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-[#FF3B30]/10 rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
          <p className="text-[#FF3B30] text-sm">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setFormError('')}>
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card hoverEffect className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3]/20 to-[#0056CC]/20 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#0071E3]" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-[#1D1D1F] mb-1">{product.name}</h3>
              <p className="text-sm text-[#1D1D1F]/60 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-[#1D1D1F]">${product.price}</p>
                  <p className="text-xs text-[#1D1D1F]/50">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    {inventory[product.id]?.available ?? 0} in stock
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    inventory[product.id]?.available && inventory[product.id].available > 0
                      ? 'bg-[#34C759]/10 text-[#34C759]'
                      : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                  }`}>
                    {inventory[product.id]?.available && inventory[product.id].available > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[#F5F5F7] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F]">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="SKU *"
                  placeholder="Unique product identifier"
                  {...register('sku')}
                  error={errors.sku?.message}
                />
                <Input
                  label="Name *"
                  placeholder="Product name"
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Input
                  label="Description"
                  placeholder="Product description"
                  {...register('description')}
                  error={errors.description?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price *"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price')}
                    error={errors.price?.message}
                  />
                  <select
                    {...register('currency')}
                    className="input-field cursor-pointer"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <Input
                  label="Category *"
                  placeholder="Electronics, Clothing, etc."
                  {...register('category')}
                  error={errors.category?.message}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValid}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

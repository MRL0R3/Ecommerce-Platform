import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi, productApi } from '@/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Table } from '@/components/Table';
import { InventoryItem, Product, PagedResponse } from '@/types';
import { Package, AlertTriangle, Plus, Minus, Search, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Modal state for stock adjustment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState<string>('1');
  const [isAdding, setIsAdding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: inventoryItems = [], refetch: fetchInventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const productsResponse = await productApi.getAll(0, 100);
      const data = productsResponse.data;
      const products = (data as PagedResponse<Product>).content || (data as Product[]) || [];
      if (products.length === 0) return [];

      const productIds = products.map(p => p.id);
      try {
        const bulkStockRes = await inventoryApi.getBulkStock(productIds);
        const stockMap = new Map((bulkStockRes.data || []).map(item => [item.productId, item]));

        return products.map(product => ({
          product,
          inventory: stockMap.get(product.id) || {
            productId: product.id,
            quantity: 0,
            reserved: 0,
            available: 0
          }
        }));
      } catch {
        // Fallback if bulk fails
        return products.map(product => ({
          product,
          inventory: { productId: product.id, quantity: 0, reserved: 0, available: 0 }
        }));
      }
    },
    refetchInterval: 15000,
  });

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      const currentInv = inventoryItems.find(i => i.product.id === selectedProduct.id)?.inventory;
      const changeValue = parseInt(stockChange) || 1;
      const newQuantity = isAdding 
        ? (currentInv?.quantity || 0) + changeValue
        : Math.max(0, (currentInv?.quantity || 0) - changeValue);
      
      await inventoryApi.setStock(selectedProduct.id, {
        productId: selectedProduct.id,
        quantity: newQuantity
      });
      
      toast.success(`Stock updated to ${newQuantity}`);
      setIsModalOpen(false);
      setStockChange('1');
      fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update stock';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = (product: Product, adding: boolean = true) => {
    setSelectedProduct(product);
    setIsAdding(adding);
    setStockChange('1');
    setIsModalOpen(true);
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.product.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const lowStockItems = filteredItems.filter(i => (i.inventory.available || 0) < 10);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Inventory</h1>
        <p className="text-[#1D1D1F]/60 mt-1">Manage stock levels across all products</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-[#FF9F0A]/10 rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0" />
          <p className="text-[#FF9F0A] text-sm">
            {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} have low stock
          </p>
        </motion.div>
      )}

      {/* Search */}
      <Card>
        <div className="p-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D1D1F]/40" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
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
          <Button variant="ghost" size="sm" onClick={() => setError('')}>
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Inventory Table */}
      {/* Inventory Table */}
      <Table<{ product: Product; inventory: InventoryItem }>
        columns={[
          {
            header: 'Product',
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0071E3]/20 to-[#0056CC]/20 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#0071E3]" />
                </div>
                <span className="font-medium text-[#1D1D1F]">{item.product.name}</span>
              </div>
            ),
          },
          {
            header: 'SKU',
            accessor: (item) => <span className="text-[#1D1D1F]/60">{item.product.sku}</span>,
          },
          {
            header: 'Total',
            accessor: (item) => <span className="font-medium text-[#1D1D1F]">{item.inventory.quantity}</span>,
          },
          {
            header: 'Available',
            accessor: (item) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                (item.inventory.available || 0) > 50
                  ? 'bg-[#34C759]/10 text-[#34C759]'
                  : (item.inventory.available || 0) > 10
                    ? 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                    : 'bg-[#FF3B30]/10 text-[#FF3B30]'
              }`}>
                {item.inventory.available}
              </span>
            ),
          },
          {
            header: 'Reserved',
            accessor: (item) => <span className="text-[#1D1D1F]/60">{item.inventory.reserved}</span>,
          },
          {
            header: 'Actions',
            accessor: (item) => (
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openStockModal(item.product, true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openStockModal(item.product, false)}
                  disabled={(item.inventory.available || 0) <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredItems}
        keyExtractor={(item) => item.product.id}
      />

      {/* Stock Adjustment Modal */}
      {isModalOpen && selectedProduct && (
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
            className="w-full max-w-md bg-[#F5F5F7] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F]">
                {isAdding ? 'Add' : 'Remove'} Stock
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/50 rounded-xl">
                <p className="font-medium text-[#1D1D1F]">{selectedProduct.name}</p>
                <p className="text-sm text-[#1D1D1F]/60">{selectedProduct.sku}</p>
              </div>
              <Input
                label={`Quantity to ${isAdding ? 'add' : 'remove'}`}
                type="number"
                value={stockChange}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStockChange(e.target.value)}
                min={1}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleStockUpdate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isAdding ? (
                  'Add Stock'
                ) : (
                  'Remove Stock'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

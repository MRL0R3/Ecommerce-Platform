import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi, productApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Table } from '@/components/Table';
import { Input } from '@/components/Input';
import { Order, Product, PagedResponse } from '@/types';
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, Search, Eye, X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrdersPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Create Order Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Available products for creating order
  const { data: availableProducts = [] } = useQuery({
    queryKey: ['availableProductsForOrder'],
    queryFn: async () => {
      try {
        const res = await productApi.getAll(0, 100);
        const data = res.data;
        return (data as PagedResponse<Product>).content || (data as Product[]) || [];
      } catch {
        return [];
      }
    },
  });

  const { data: { orders = [], products = {} } = {}, error: queryError, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await orderApi.getAll(0, 100);
      const data = response.data;
      const orderList = (data as PagedResponse<Order>).content || (data as Order[]) || [];

      const productMap: Record<string, Product> = {};
      const productIdsToFetch = new Set<string>();
      for (const order of orderList) {
        for (const item of order.items || []) {
          if (item.productId && !item.productName) {
            productIdsToFetch.add(item.productId);
          }
        }
      }

      if (productIdsToFetch.size > 0) {
        try {
          const bulkProducts = await productApi.getBulk(Array.from(productIdsToFetch));
          for (const prod of bulkProducts.data || []) {
            productMap[prod.id] = prod;
          }
        } catch {
          // Bulk fetch fallback
        }
      }
      return { orders: orderList, products: productMap };
    },
    refetchInterval: 30000,
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      await orderApi.updateStatus(selectedOrder.id, newStatus);
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Order status updated to ${newStatus}`);
      refetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    const chosenProduct = availableProducts.find(p => p.id === selectedProductId);
    if (!chosenProduct) {
      toast.error('Product not found');
      return;
    }

    const customerId = user?.id || '2d827839-dc7d-44ca-94b4-cc1182536651';
    setIsSubmittingOrder(true);
    try {
      await orderApi.create({
        customerId,
        items: [
          {
            productId: chosenProduct.id,
            productName: chosenProduct.name,
            unitPrice: chosenProduct.price,
            quantity: orderQuantity,
          },
        ],
      });
      toast.success('Order created successfully and stock reserved!');
      setIsCreateOpen(false);
      setSelectedProductId('');
      setOrderQuantity(1);
      refetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const error = queryError ? (queryError as any).response?.data?.message || 'Failed to fetch orders' : '';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-[#FF9F0A]" />;
      case 'PROCESSING':
        return <Truck className="w-4 h-4 text-[#0071E3]" />;
      case 'SHIPPED':
        return <ShoppingBag className="w-4 h-4 text-[#34C759]" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-[#34C759]" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-[#FF3B30]" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#FF9F0A]/10 text-[#FF9F0A]';
      case 'PROCESSING':
        return 'bg-[#0071E3]/10 text-[#0071E3]';
      case 'SHIPPED':
      case 'DELIVERED':
        return 'bg-[#34C759]/10 text-[#34C759]';
      case 'CANCELLED':
        return 'bg-[#FF3B30]/10 text-[#FF3B30]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.customerId.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Orders</h1>
          <p className="text-[#1D1D1F]/60 mt-1">Manage customer orders</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1D1D1F]/40" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
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
          <p className="text-[#FF3B30] text-sm">{error}</p>
        </motion.div>
      )}

      {/* Orders Table */}
      {/* Orders Table */}
      <Table<Order>
        columns={[
          {
            header: 'Order ID',
            accessor: (order) => <span className="font-medium text-[#1D1D1F]">{order.id.slice(0, 8)}...</span>,
          },
          {
            header: 'Customer',
            accessor: (order) => <span className="text-[#1D1D1F]/60">{order.customerId}</span>,
          },
          {
            header: 'Date',
            accessor: (order) => <span className="text-[#1D1D1F]/60">{new Date(order.createdAt).toLocaleDateString()}</span>,
          },
          {
            header: 'Items',
            accessor: (order) => <span className="text-[#1D1D1F]/60">{order.items.length}</span>,
          },
          {
            header: 'Total',
            accessor: (order) => <span className="font-medium text-[#1D1D1F]">${order.totalAmount.toFixed(2)}</span>,
          },
          {
            header: 'Status',
            accessor: (order) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            ),
          },
          {
            header: 'Actions',
            accessor: (order) => (
              <Button variant="ghost" size="sm" onClick={() => openDrawer(order)}>
                <Eye className="w-4 h-4" />
              </Button>
            ),
          },
        ]}
        data={filteredOrders}
        keyExtractor={(order) => order.id}
      />

      {/* Order Detail Drawer */}
      {isDrawerOpen && selectedOrder && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#F5F5F7] rounded-l-2xl shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1D1D1F]">Order Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Order Info */}
              <Card className="mb-6">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#1D1D1F]/60">Order ID</span>
                    <span className="font-medium text-[#1D1D1F]">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1D1D1F]/60">Customer</span>
                    <span className="font-medium text-[#1D1D1F]">{selectedOrder.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1D1D1F]/60">Date</span>
                    <span className="font-medium text-[#1D1D1F]">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#1D1D1F]/60">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-[#1D1D1F]/60">Change Status</span>
                    <select
                      value={selectedOrder.status}
                      disabled={statusUpdating}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-[#1D1D1F] font-medium outline-none focus:border-[#0071E3]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/20">
                    <span className="text-[#1D1D1F]/60">Total</span>
                    <span className="font-bold text-lg text-[#1D1D1F]">
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Order Items */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1D1D1F] mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => {
                      const product = products[item.productId];
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-white/30 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3]/20 to-[#0056CC]/20 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#0071E3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#1D1D1F] truncate">
                              {item.productName || product?.name || 'Unknown Product'}
                            </p>
                            <p className="text-sm text-[#1D1D1F]/60">
                              {item.productId.slice(0, 8)}...
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#1D1D1F]">
                              ${item.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-[#1D1D1F]/60">
                              x{item.quantity}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}

      {/* Create Order Modal */}
      {isCreateOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#F5F5F7] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1D1D1F]">Create New Order</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-1.5">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]"
                  required
                >
                  <option value="">-- Choose a product --</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${Number(p.price).toFixed(2)}) - {p.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  required
                />
              </div>

              {selectedProductId && (
                <div className="p-4 bg-white/60 rounded-xl space-y-1.5 border border-gray-200/50">
                  <div className="flex justify-between text-xs text-[#1D1D1F]/60">
                    <span>Unit Price:</span>
                    <span>
                      $
                      {Number(
                        availableProducts.find((p) => p.id === selectedProductId)?.price || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#1D1D1F]/60">
                    <span>Quantity:</span>
                    <span>x{orderQuantity}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-sm text-[#1D1D1F]">
                    <span>Total Amount:</span>
                    <span className="text-[#0071E3]">
                      $
                      {(
                        Number(
                          availableProducts.find((p) => p.id === selectedProductId)?.price || 0
                        ) * orderQuantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmittingOrder}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingOrder || !selectedProductId}>
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

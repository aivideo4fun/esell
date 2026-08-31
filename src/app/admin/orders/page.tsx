/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Loader2, 
  RefreshCw,
  Eye,
  X
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Metrics Calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => (o.orderStatus || o.status) === "PENDING" || (o.orderStatus || o.status) === "PROCESSING" || (o.orderStatus || o.status) === "PAID").length;
  const shippedOrders = orders.filter((o) => (o.orderStatus || o.status) === "SHIPPED").length;
  const deliveredOrders = orders.filter((o) => (o.orderStatus || o.status) === "DELIVERED").length;

  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => (o.orderStatus || o.status) === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PROCESSING":
      case "PAID":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">Customer Orders Manager</h1>
          <p className="text-xs text-gray-700 font-semibold mt-1">
            Track real-time prepaid orders, customer delivery addresses, and dispatch statuses
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Orders
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-sm space-y-1">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-black">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[10px] font-bold text-green-700">{orders.length} orders total</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-sm space-y-1">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">To Dispatch</p>
          <p className="text-2xl font-black text-amber-600">{pendingOrders}</p>
          <p className="text-[10px] font-bold text-gray-600">Pending / Processing</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-sm space-y-1">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">In Transit</p>
          <p className="text-2xl font-black text-blue-600">{shippedOrders}</p>
          <p className="text-[10px] font-bold text-gray-600">Shipped with courier</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-sm space-y-1">
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-black text-green-600">{deliveredOrders}</p>
          <p className="text-[10px] font-bold text-gray-600">Successfully completed</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
              statusFilter === st
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-600 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Loading live orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-black text-black">No orders found in this category.</p>
            <p className="text-xs text-gray-600 font-semibold">
              When customers complete checkout, their orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b-2 border-gray-200 text-black font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID &amp; Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total &amp; Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-bold text-black">
                {filteredOrders.map((order) => {
                  const currentAddress = order.address || order.shippingAddress;
                  const firstItem = order.items?.[0];
                  const itemTitle = firstItem?.product?.title || firstItem?.title || "Product item";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      
                      {/* Order ID & Date */}
                      <td className="p-4 align-top">
                        <span className="font-mono text-xs font-black text-blue-700 block">
                          #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4 align-top space-y-0.5">
                        <div className="font-black text-black flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {currentAddress?.fullName || order.user?.name || "Direct Customer"}
                        </div>
                        <div className="text-[11px] text-gray-600 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {currentAddress?.phone || order.user?.phone || "N/A"}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
                          {currentAddress?.street ? `${currentAddress.street}, ` : ""}
                          {currentAddress?.city ? `${currentAddress.city}, ` : ""}
                          {currentAddress?.state ? `${currentAddress.state} - ` : ""}
                          {currentAddress?.pincode || ""}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4 align-top">
                        <span className="font-black text-black">
                          {order.items?.length || 1} Item(s)
                        </span>
                        <div className="text-[10px] text-gray-500 font-semibold line-clamp-1 max-w-[160px]">
                          {itemTitle}
                        </div>
                      </td>

                      {/* Total & Payment Status */}
                      <td className="p-4 align-top space-y-1">
                        <span className="font-black text-black text-sm block">
                          ₹{order.totalAmount}
                        </span>
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 border border-green-300 text-[9px] font-black rounded uppercase">
                          {order.paymentStatus || "PAID"}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4 align-top">
                        <select
                          disabled={updatingId === order.id}
                          value={order.orderStatus || order.status || "PAID"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`p-1.5 rounded-lg text-xs font-black border-2 cursor-pointer focus:outline-none ${getStatusBadge(
                            order.orderStatus || order.status || "PAID"
                          )}`}
                        >
                          <option value="PAID">PAID</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-gray-300 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-black text-black text-lg">
                  Order Details #{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500 font-semibold">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Address Box */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Customer Shipping Address
              </h4>
              <div className="text-xs text-black font-semibold space-y-0.5">
                <p className="font-bold text-sm">
                  {(selectedOrder.address || selectedOrder.shippingAddress)?.fullName || selectedOrder.user?.name || "Direct Customer"}
                </p>
                <p>
                  {(selectedOrder.address || selectedOrder.shippingAddress)?.street || "No street address"}
                </p>
                <p>
                  {(selectedOrder.address || selectedOrder.shippingAddress)?.city ? `${(selectedOrder.address || selectedOrder.shippingAddress).city}, ` : ""}
                  {(selectedOrder.address || selectedOrder.shippingAddress)?.state ? `${(selectedOrder.address || selectedOrder.shippingAddress).state} - ` : ""}
                  {(selectedOrder.address || selectedOrder.shippingAddress)?.pincode || ""}
                </p>
                <p className="pt-1 text-blue-700 font-bold">
                  📞 Phone: {(selectedOrder.address || selectedOrder.shippingAddress)?.phone || selectedOrder.user?.phone || "N/A"}
                </p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-black uppercase tracking-wider">
                Products in this Order ({selectedOrder.items?.length || 1})
              </h4>
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl p-2 bg-white">
                {selectedOrder.items?.map((item: any) => {
                  const itemImg = item.product?.images?.[0]?.url || item.image || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80";
                  const itemTitle = item.product?.title || item.title || "Product item";

                  return (
                    <div key={item.id} className="py-2.5 px-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={itemImg}
                          alt=""
                          className="w-12 h-12 rounded-xl object-contain border border-gray-200 bg-gray-50"
                        />
                        <div>
                          <p className="font-black text-xs text-black">{itemTitle}</p>
                          <p className="text-[11px] text-gray-500 font-semibold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-black">₹{item.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-100 p-4 rounded-2xl space-y-1.5 text-xs font-bold text-black">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-green-700">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-black">
                <span>Total Paid:</span>
                <span className="text-blue-700">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 transition cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
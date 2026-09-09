"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Loader2, RotateCcw, X, Phone, MessageSquare, Truck, ShieldCheck } from "lucide-react";

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  reason: string;
  comments: string;
  amount: number;
  status: "UNDER_REVIEW" | "APPROVED" | "PICKUP_SCHEDULED" | "RETURNED" | "REJECTED";
  createdAt: string;
  images: string[];
  adminReply?: string;
}

export default function ReturnsRefundsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Modal State for Actions & Replies
  const [activeModalItem, setActiveModalItem] = useState<{ item: ReturnRequest; status: string } | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Preview Image Modal State
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        const returnOrders = data.orders
          .filter((o: any) => {
            const st = (o.orderStatus || o.status || "").toUpperCase();
            const track = (o.trackingUrl || "").toUpperCase();
            return (
              st === "RETURN_REQUESTED" ||
              st === "RETURNED" ||
              st === "RETURN_APPROVED" ||
              st === "RETURN_PICKUP" ||
              st === "REFUNDED" ||
              track.includes("RETURN_REQUESTED") ||
              track.includes("IMAGES_JSON:")
            );
          })
          .map((o: any) => {
            let reasonText = "Customer requested return / replacement";
            let commentText = "";
            let parsedImages: string[] = [];

            const rawTrack = o.trackingUrl || "";
            if (rawTrack.includes("[RETURN_REQUESTED]:")) {
              const mainPart = rawTrack.replace("[RETURN_REQUESTED]:", "").trim();
              
              // Extract Images JSON safely
              if (mainPart.includes("IMAGES_JSON:")) {
                const parts = mainPart.split("IMAGES_JSON:");
                reasonText = parts[0].replace(/\|$/, "").trim();
                try {
                  const rawJson = parts[1].split("|")[0]?.trim();
                  parsedImages = JSON.parse(rawJson);
                } catch (e) {
                  console.error("Error parsing return images JSON:", e);
                }
              } else if (mainPart.includes("Photos Uploaded:")) {
                reasonText = mainPart.split("Photos Uploaded:")[0].replace(/\|$/, "").trim();
              } else {
                reasonText = mainPart;
              }

              // Extract Note cleanly without duplicating
              if (rawTrack.includes("Note:")) {
                const notePart = rawTrack.split("Note:")[1];
                commentText = notePart ? notePart.split("|")[0]?.split("IMAGES_JSON:")[0]?.trim() : "";
              }
            }

            // Fallback: If reasonText contains " - Note:", clean it up so it doesn't repeat
            if (reasonText.includes(" - Note:")) {
              const splitArr = reasonText.split(" - Note:");
              reasonText = splitArr[0].trim();
              if (!commentText) {
                commentText = splitArr[1]?.split("|")[0]?.trim() || "";
              }
            }

            // Determine strict lifecycle status
            let currentStatus: ReturnRequest["status"] = "UNDER_REVIEW";
            const stUpper = (o.orderStatus || "").toUpperCase();
            if (stUpper === "RETURNED" || stUpper === "REFUNDED") {
              currentStatus = "RETURNED";
            } else if (stUpper === "RETURN_PICKUP" || o.supplierStatus === "PICKUP_SCHEDULED") {
              currentStatus = "PICKUP_SCHEDULED";
            } else if (stUpper === "RETURN_APPROVED" || o.supplierStatus === "REFUND_APPROVED" || stUpper === "CANCELLED") {
              currentStatus = "APPROVED";
            } else if (o.supplierStatus === "RETURN_REJECTED") {
              currentStatus = "REJECTED";
            }

            return {
              id: `RET-${o.id.slice(-4).toUpperCase()}`,
              orderId: o.id,
              orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
              customerName: o.address?.fullName || o.user?.name || "Direct Customer",
              phone: o.address?.phone || o.user?.phone || "N/A",
              reason: reasonText,
              comments: commentText,
              amount: o.totalAmount,
              status: currentStatus,
              createdAt: o.createdAt,
              images: parsedImages,
            };
          });

        setRequests(returnOrders);
      }
    } catch (err) {
      console.error("Failed to load real refund records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReturns();
  }, [fetchReturns]);

  const handleActionSubmit = async () => {
    if (!activeModalItem) return;
    const { item, status } = activeModalItem;

    try {
      setActionId(item.id);
      let targetOrderStatus = "RETURNED";
      let targetSupplierStatus = "REFUND_APPROVED";

      if (status === "APPROVED") {
        targetOrderStatus = "RETURN_APPROVED";
        targetSupplierStatus = "REFUND_APPROVED";
      } else if (status === "PICKUP_SCHEDULED") {
        targetOrderStatus = "RETURN_PICKUP";
        targetSupplierStatus = "PICKUP_SCHEDULED";
      } else if (status === "RETURNED") {
        targetOrderStatus = "RETURNED";
        targetSupplierStatus = "REFUND_COMPLETED";
      } else if (status === "REJECTED") {
        targetOrderStatus = "DELIVERED";
        targetSupplierStatus = "RETURN_REJECTED";
      }

      const finalReply = replyMessage.trim() || `Your return status has been updated to: ${status.replace("_", " ")}`;

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: item.orderId,
          orderStatus: targetOrderStatus,
          supplierStatus: targetSupplierStatus,
          rejectionReason: finalReply,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: status as any, adminReply: finalReply } : r))
        );
        setActiveModalItem(null);
        setReplyMessage("");
        alert(`Return status for order #${item.orderNumber} successfully updated to ${status}!`);
        void fetchReturns();
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Status update failed due to network error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-600" /> Return &amp; Replacement Desk
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage customer return proofs, lifecycle stages (Approval ➔ Pickup ➔ Returned), and live notifications.
          </p>
        </div>
        <button
          onClick={() => void fetchReturns()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Desk
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Syncing return records &amp; proof photos...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-950">No pending return requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Return ID &amp; Date</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason &amp; Customer Note</th>
                  <th className="p-4">Proof Photos</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Lifecycle Status</th>
                  <th className="p-4 text-right">Manage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 align-top">
                      <span className="font-mono text-slate-900 block">{r.id}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <span className="font-mono text-emerald-600 font-black">
                        #{r.orderNumber}
                      </span>
                    </td>

                    <td className="p-4 align-top space-y-0.5">
                      <span className="block text-slate-900 font-bold">{r.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {r.phone}
                      </span>
                    </td>

                    {/* CLEAN REASON & SINGLE NOTE DISPLAY */}
                    <td className="p-4 align-top max-w-[240px] space-y-1.5">
                      <span className="text-slate-900 block font-bold">{r.reason}</span>
                      {r.comments && r.comments !== r.reason && (
                        <span className="text-[11px] text-slate-600 font-normal block bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <strong>Note:</strong> {r.comments}
                        </span>
                      )}
                    </td>

                    {/* Proof Photos Thumbnail Column */}
                    <td className="p-4 align-top">
                      {r.images && r.images.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {r.images.map((imgSrc, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setPreviewImg(imgSrc)}
                              className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 block shrink-0 hover:scale-105 transition shadow-2xs cursor-pointer bg-slate-100"
                              title="Click to view full image"
                            >
                              <img src={imgSrc} alt="Proof" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">No photos attached</span>
                      )}
                    </td>

                    <td className="p-4 align-top font-black text-slate-950">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 align-top">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase ${
                          r.status === "RETURNED"
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : r.status === "PICKUP_SCHEDULED"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : r.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : r.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 align-top text-right space-x-1 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 flex-wrap justify-end">
                        {r.status === "UNDER_REVIEW" && (
                          <>
                            <button
                              onClick={() => {
                                setActiveModalItem({ item: r, status: "APPROVED" });
                                setReplyMessage("Your return request has been approved by admin.");
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActiveModalItem({ item: r, status: "REJECTED" });
                                setReplyMessage("Your return request was rejected after review.");
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-black transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {r.status === "APPROVED" && (
                          <button
                            onClick={() => {
                              setActiveModalItem({ item: r, status: "PICKUP_SCHEDULED" });
                              setReplyMessage("Return pickup has been scheduled with our courier partner.");
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" /> Schedule Pickup
                          </button>
                        )}

                        {r.status === "PICKUP_SCHEDULED" && (
                          <button
                            onClick={() => {
                              setActiveModalItem({ item: r, status: "RETURNED" });
                              setReplyMessage("Item received at warehouse. Return & Refund successfully completed.");
                            }}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-black transition cursor-pointer flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" /> Mark Returned
                          </button>
                        )}

                        {r.status === "RETURNED" && (
                          <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-3 overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute right-4 top-4 bg-black/70 hover:bg-black text-white rounded-full p-2 z-10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImg} alt="Full Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Admin Reply & Lifecycle Status Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> 
              Update Status to: <span className="text-emerald-700 uppercase">{activeModalItem.status.replace("_", " ")}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Add a custom note or instruction for the customer notification center (`/account`).
            </p>
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-emerald-600"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionId === activeModalItem.item.id}
                onClick={handleActionSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
              >
                {actionId === activeModalItem.item.id ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
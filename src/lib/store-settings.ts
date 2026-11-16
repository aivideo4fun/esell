import { readConfig } from "@/lib/admin-config";
import { storeInfo } from "@/lib/store-info";
export const storeDefaults = {
  storeName: "CatchBuddy", supportEmail: storeInfo.supportEmail, supportPhone: storeInfo.supportPhone,
  currency: "INR", freeShippingThreshold: 0, standardDeliveryFee: 0, prepaidDiscount: 0,
  enablePrepaidDiscount: false, enableCashOnDelivery: false,
};
export const getStoreSettings = () => readConfig("STORE", storeDefaults);
export const homepageDefaults = {
  badge: "LIMITED TIME OFFER", headingMain: "Premium Gadgets,", headingHighlight: "Direct to Your Doorstep.",
  subtitle: "Everyday essentials • Secure online checkout", dealIds: [] as string[],
};

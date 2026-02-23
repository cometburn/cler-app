import {
  BookImageIcon,
  ConciergeBellIcon,
  FileSpreadsheetIcon,
  Key,
  LayoutDashboardIcon,
  Package,
  PackageOpenIcon,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: BookImageIcon,
  },
  {
    title: "Rooms",
    url: "/rooms",
    icon: Key,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ConciergeBellIcon,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: PackageOpenIcon,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileSpreadsheetIcon,
  },
];

export const SETTING_ITEMS = [
  {
    title: "Room Rates",
    url: "/room-rates",
  },
  {
    title: "Room Promos",
    url: "/room-promos",
  },
  {
    title: "Room Types",
    url: "/room-types",
  },
];

export const USER_SETTING_ITEMS = [
  {
    title: "Users",
    url: "/users",
  },
];

export const ROWS_PER_PAGE = [1, 10, 20, 50, 100];

export const RATE_TYPE_OPTIONS = ["hourly", "daily", "weekly", "monthly"];

export const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export const GRACE_PERIOD = 15;
export const ALARM_PERIOD = 10;

export const ROOM_STATUS = ["available", "occupied", "maintenance"];
export const OPERATIONAL_STATUS = ["available", "maintenance", "out of service"];
export const BOOKING_STATUS = ["check_in", "check_out", "reserved", "transfered", "cancelled", "no_show"];
export const PAYMENT_STATUS = ["unpaid", "paid", "refunded", "cancelled"];
export const PAYMENT_TYPE = ["cash", "credit_card", "debit_card", "bank", "e-wallet", "cancelled"]
export const ORDER_STATUS = ['pending', 'confirmed', 'cancelled', 'completed']
export const PRODUCT_MOVEMENT_TYPE = ['in', 'out', 'adjustment']
export const PRODUCT_CATEGORY = ['product', 'service', 'room_addon']
export const PRODUCT_UNIT = ['pack', 'box', 'bottle', 'can', 'kg', 'g', 'l', 'ml', 'pcs']
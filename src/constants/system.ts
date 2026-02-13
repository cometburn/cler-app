import {
  BookImageIcon,
  ConciergeBellIcon,
  FileSpreadsheetIcon,
  Key,
  LayoutDashboardIcon,
  Package,
  PackageOpenIcon,
} from "lucide-react";

export const menuItems = [
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

export const settingItems = [
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

export const userSettingItems = [
  {
    title: "Users",
    url: "/users",
  },
];

export const rowPerPage = [1, 10, 20, 50, 100];

export const rateTypeOptions = ["hourly", "daily", "weekly", "monthly"];

export const days = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export const dateFormat = "mm/dd/yyyy";

export const operationalStatus = ["available", "maintenance", "out of service"];
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, createContext, useReducer } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/AppSidebar";        // ← fixed naming (AppSideBar → AppSidebar)
import Topbar from "@/components/layouts/Topbar";
import { CreateHotelDialog } from "@/features/hotel/components/CreateHotelDialog";

import { menuItems, settingItems } from "@/constants/system";

// Optional: if you have a useMe hook
import { useMe } from "@/features/auth/hooks/useMe";

const routeTitleMap: Record<string, string> = [
  ...menuItems,
  ...settingItems,
].reduce((acc, item) => {
  acc[item.url] = item.title;
  return acc;
}, {} as Record<string, string>);

const sidebarOpenInitialState = false;
const sidebarOpenReducer = (state: boolean) => !state;

const init = () => {
  console.log(localStorage.getItem("sidebarOpen"))
  return localStorage.getItem("sidebarOpen") ? localStorage.getItem("sidebarOpen") === "true" : sidebarOpenInitialState;
}

export default function DefaultLayout() {
  const { data: user, isLoading: isUserLoading } = useMe(); // ← TanStack Query
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useReducer(sidebarOpenReducer, sidebarOpenInitialState, init);


  useEffect(() => {
    const title = routeTitleMap[location.pathname] || "Dashboard";
    setPageTitle(title);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);


  const toggleSidebar = () => {
    setSidebarOpen();
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isAdmin = user?.user_type_id === 2; // ← adjust according to your user shape
  const hasNoHotels = user?.hotels?.length === 0;

  return (
    <SidebarProvider open={sidebarOpen} className="border-0 border-transparent">
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <Topbar pageTitle={pageTitle} toggleSidebar={toggleSidebar} />

        <div className="flex-1 py-6 px-4">
          <Outlet /> {/* Nested page content */}
        </div>
      </main>

      {user && isAdmin && hasNoHotels && <CreateHotelDialog />}
    </SidebarProvider>
  );
}
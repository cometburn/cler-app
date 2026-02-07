import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useReducer } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layouts/AppSidebar";        // ← fixed naming (AppSideBar → AppSidebar)
import Topbar from "@/components/layouts/Topbar";
import { CreateHotelDialog } from "@/features/hotel/components/CreateHotelDialog";

import { menuItems, settingItems } from "@/constants/system";

import { useMe } from "@/features/auth/hooks/useMe";

const routeTitleMap: Record<string, string> = [
  ...menuItems,
  ...settingItems,
].reduce((acc, item) => {
  acc[item.url] = item.title;
  return acc;
}, {} as Record<string, string>);

const sidebarOpenInitialState = true;
const sidebarOpenReducer = (state: boolean) => !state;

const init = () => {
  return localStorage.getItem("sidebarOpen") ? localStorage.getItem("sidebarOpen") === "true" : sidebarOpenInitialState;
}

export default function DefaultLayout() {
  const { data: user, isLoading: isUserLoading } = useMe();
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

  const isAdmin = user?.user_type_id === 2;
  const hasNoHotels = user?.hotels?.length === 0;

  return (
    <SidebarProvider open={sidebarOpen} className="border-0 border-transparent">
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <Topbar pageTitle={pageTitle} toggleSidebar={toggleSidebar} />

        <div className="flex-1 py-6 px-4">
          <Outlet />
        </div>
      </main>

      {user && isAdmin && hasNoHotels && <CreateHotelDialog />}
    </SidebarProvider>
  );
}
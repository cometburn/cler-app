import { ChevronDownIcon, LogOutIcon, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import AppSidebarHeader from "./AppSidebarHeader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { Link, useNavigate } from "react-router-dom";
import { menuItems, settingItems, userSettingItems } from "@/constants/system";
import type { SidebarMenuItem as SidebarMenuItemType } from "@/shared/types/ui.types";
import { useMe } from "@/features/auth/hooks/useMe";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useEffect, useState } from "react";

function SidebarLink({ isSubMenuItem, item, urlLink, setUrlLink }: { isSubMenuItem?: boolean, item: SidebarMenuItemType, urlLink: string, setUrlLink: (url: string) => void }) {
  return (
    <Link
      to={item.url}
      className={
        [
          isSubMenuItem && "flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded",
          urlLink === item.url && "bg-gray-700"
        ].filter(Boolean).join(" ")
      }
      onClick={() => setUrlLink(item.url)}
    >
      <span>{item.title}</span>
    </Link>
  );
}

export const AppSidebar = () => {
  const [urlLink, setUrlLink] = useState("");
  const logout = useLogout();
  const { data: user } = useMe();

  const isAdmin = user?.user_type_id === 2;
  const navigate = useNavigate();

  useEffect(() => {
    setUrlLink(window.location.hash.split("#")[1]);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Sidebar>
      <div className="flex-1 overflow-y-auto">
        <SidebarContent className="gap-0 border-0 min-h-[calc(100%-48px)] flex-none">
          <SidebarHeader className="py-[6px] m-0">
            <AppSidebarHeader />
          </SidebarHeader>
          <SidebarSeparator className="m-0 bg-gray-700" />
          <SidebarGroup className="border-0 border-transparent">
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="active:bg-transparent active:text-white active:bg-gray-700 hover:bg-gray-700 hover:text-white text-white"
                    >
                      <Link
                        to={item.url}
                        className={urlLink === item.url ? "bg-gray-700" : ""}
                        onClick={() => setUrlLink(item.url)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              {isAdmin && (
                <SidebarMenu>
                  <Collapsible className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="cursor-pointer text-white hover:!bg-gray-800 hover:!text-white">
                          <Settings />
                          Settings
                          <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mr-0 text-white border-gray-700">
                          {settingItems.map((item) => (
                            <SidebarMenuItem key={item.title} className="">
                              <SidebarMenuButton asChild className="py-1">
                                <SidebarLink isSubMenuItem={true} item={item} urlLink={urlLink} setUrlLink={setUrlLink} />
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                          <SidebarSeparator className="m-0 bg-gray-700" />
                          {userSettingItems.map((item) => (
                            <SidebarMenuItem key={item.title} className="">
                              <SidebarMenuButton asChild className="py-1">
                                <SidebarLink isSubMenuItem={true} item={item} urlLink={urlLink} setUrlLink={setUrlLink} />
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-gray-900">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                asChild
                className="hover:bg-gray-700 hover:text-white cursor-pointer text-white"
              >
                <a>
                  <LogOutIcon />
                  <span>Logout</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
};
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center w-full h-[50px] text-white text-sm bg-white gap-0">
      <div className="flex flex-row items-center p-3">
        <a onClick={toggleSidebar} className="cursor-pointer text-foreground">
          <Menu className="w-5 h-5" />
        </a>
        <h2 className="text-md ml-2 text-foreground">{pageTitle}</h2>
      </div>
    </div>
  );
}
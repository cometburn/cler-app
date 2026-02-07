import { Menu } from "lucide-react";

interface TopbarProps {
  pageTitle: string;
  toggleSidebar: Function;
}

export default function Topbar({ pageTitle, toggleSidebar }: TopbarProps) {
  return (
    <div className="flex items-center w-full h-[50px] text-white text-sm bg-white gap-0">
      <a
        onClick={() => toggleSidebar()}
        className="flex flex-row cursor-pointer p-3 m-0 text-foreground"
      >
        <Menu className="w-5 h-5" />
        <h2 className="text-md ml-2">{pageTitle}</h2>
      </a>
    </div>
  );
}
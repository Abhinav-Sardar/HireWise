"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, BarChart2, FileText } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "AI Interview", href: "/interview", icon: Target },
    { name: "Resume", href: "/resume", icon: FileText },
    { name: "Reports", href: "/report", icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-[#0A0C10] border-r border-gray-800 flex flex-col h-screen shrink-0">
      <div className="flex items-center gap-3 px-8 pt-8 mb-10">
        <HWLogo className="w-9 h-9" />
        <span className="text-2xl font-semibold text-white tracking-wide">
          HireWise
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium ${
                isActive
                  ? "bg-[#251F3D] text-white shadow-inner"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-white" : "text-gray-400"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


// components/Sidebar.jsx (Snippet)
export const HWLogo = ({ className = "w-8 h-8", color = "#8B5CF6" }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M10 10V30M10 20H20M20 10V30L27 18L34 30V10" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)
import "./globals.css";
import Link from "next/link";
import { Home, Video, FileText, BarChart2, Settings } from "lucide-react";

export const metadata = {
  title: "PrepAI - Interview Prep",
  description: "AI-powered interview preparation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0F111A] text-[#F3F4F6] flex h-screen overflow-hidden font-sans">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-[#1A1D27] border-r border-gray-800 flex flex-col p-4">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-[#8B5CF6] rounded-md flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="text-xl font-bold">PrepAI</span>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem href="/" icon={<Home size={20} />} label="Home" />
            <NavItem
              href="/interview"
              icon={<Video size={20} />}
              label="AI Interview"
            />
            <NavItem
              href="/resume"
              icon={<FileText size={20} />}
              label="Resume"
            />
            <NavItem
              href="/report"
              icon={<BarChart2 size={20} />}
              label="Reports"
            />
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <NavItem
              href="/settings"
              icon={<Settings size={20} />}
              label="Settings"
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "HireWise - AI Interview Prep",
  description: "Brutal AI-powered interview reality checks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0F111A] text-white flex h-screen overflow-hidden font-sans">
        {/* Global Persistent Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}

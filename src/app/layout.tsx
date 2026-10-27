import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AICTE Approval & Compliance Monitor",
  description: "Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = getCurrentUser();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header initialUser={currentUser} />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar
            userRole={currentUser.role}
            institutionName={currentUser.institutionName}
            region={currentUser.region}
          />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}

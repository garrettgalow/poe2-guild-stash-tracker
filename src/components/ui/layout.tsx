import React from "react"
import "../../globals.css"
import { LayoutDashboardIcon, PackageIcon, Search, Upload } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "./sidebar"

// Create a separate component for the sidebar content
function SidebarContents() {
  const location = useLocation()
  const pathname = location.pathname
  const { state } = useSidebar()
  
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="floating" collapsible="offcanvas" className="border-r">
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className={`flex items-center gap-2 text-xl font-bold ${isCollapsed ? "justify-center" : ""}`}>
          <PackageIcon className="h-6 w-6" />
          <span className={isCollapsed ? "hidden" : "block"}>Stash Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Dashboard">
                  <Link to="/">
                    <LayoutDashboardIcon className="h-5 w-5" />
                    <span className={isCollapsed ? "hidden" : "block"}>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/search"} tooltip="Search">
                  <Link to="/search">
                    <Search className="h-5 w-5" />
                    <span className={isCollapsed ? "hidden" : "block"}>Search</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/upload"} tooltip="Upload">
                  <Link to="/upload">
                    <Upload className="h-5 w-5" />
                    <span className={isCollapsed ? "hidden" : "block"}>Upload</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className={`text-xs text-muted-foreground ${isCollapsed ? "hidden" : "block"}`}>
          <p>PoE2 Stash Tracker v1.1</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Create a separate component for the main content
function MainContent() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className="flex-1 transition-all duration-200 ease-linear">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {pathname === "/" && "Stash Dashboard"}
            {pathname === "/search" && "Search Stash Data"}
            {pathname === "/upload" && "Upload CSV Data"}
          </h1>
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <SidebarContents />
        <MainContent />
      </div>
    </SidebarProvider>
  )
}

// import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };

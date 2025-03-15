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
  SidebarTrigger
} from "./sidebar"

export default function Layout() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar variant="floating" collapsible="icon" className="border-r">
          <SidebarHeader className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-xl font-bold">
              <PackageIcon className="h-6 w-6" />
              <span>Stash Tracker</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Dashboard">
                      <Link to="/">
                        <LayoutDashboardIcon className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/search"} tooltip="Search">
                      <Link to="/search">
                        <Search className="h-5 w-5" />
                        <span>Search</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/upload"} tooltip="Upload">
                      <Link to="/upload">
                        <Upload className="h-5 w-5" />
                        <span>Upload</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="text-xs text-muted-foreground">
              <p>PoE Stash Tracker v1.0</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-auto">
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
      </div>
    </SidebarProvider>
  )
}

// import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };

import { useState, useEffect } from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronDown, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useTopUsers } from "../../hooks/use-top-users"
import { Skeleton } from "../../components/ui/skeleton"
import { useUserRatios } from "../../hooks/use-user-ratios"
import { useActivityData } from "../../hooks/use-activity-data"

// Sample data for charts
const activityData = [
  { time: "00:00", added: 12, removed: 8 },
  { time: "04:00", added: 18, removed: 11 },
  { time: "08:00", added: 29, removed: 15 },
  { time: "12:00", added: 42, removed: 22 },
  { time: "16:00", added: 35, removed: 27 },
  { time: "20:00", added: 25, removed: 14 },
]

const currencyData = [
  { name: "Chaos Orb", amount: 245, change: 12 },
  { name: "Exalted Orb", amount: 18, change: -3 },
  { name: "Divine Orb", amount: 7, change: 2 },
  { name: "Vaal Orb", amount: 89, change: -5 },
  { name: "Regal Orb", amount: 56, change: 8 },
]

const weeklyData = [
  { day: "Mon", items: 120 },
  { day: "Tue", items: 145 },
  { day: "Wed", items: 132 },
  { day: "Thu", items: 167 },
  { day: "Fri", items: 189 },
  { day: "Sat", items: 212 },
  { day: "Sun", items: 178 },
]

// Sample data for top users
const topUsers = {
  adders: [
    { account: "ExileHunter", count: 342 },
    { account: "MapMaster", count: 287 },
    { account: "LootGoblin", count: 253 },
    { account: "CurrencyKing", count: 201 },
    { account: "StashManager", count: 187 },
  ],
  removers: [
    { account: "RaidLeader", count: 412 },
    { account: "GearSwapper", count: 376 },
    { account: "BossHunter", count: 298 },
    { account: "CraftMaster", count: 245 },
    { account: "MapRunner", count: 221 },
  ],
  bestRatios: [
    { account: "EfficientTrader", ratio: 2.4 },
    { account: "ProfitMaker", ratio: 2.1 },
    { account: "SmartStasher", ratio: 1.9 },
    { account: "ResourceManager", ratio: 1.7 },
    { account: "InventoryPro", ratio: 1.5 },
  ],
  worstRatios: [
    { account: "ChaoticStasher", ratio: 0.3 },
    { account: "HoarderExile", ratio: 0.4 },
    { account: "DisorganizedOne", ratio: 0.5 },
    { account: "RandomGrabber", ratio: 0.6 },
    { account: "ImpulsiveTrader", ratio: 0.7 },
  ],
}

// Sample data for popular items
const popularItems = [
  { item: "Chaos Orb", users: 87, count: 1245 },
  { item: "Exalted Orb", users: 65, count: 342 },
  { item: "Divine Orb", users: 54, count: 187 },
  { item: "Mirror of Kalandra", users: 12, count: 14 },
  { item: "Awakened Gem", users: 43, count: 98 },
  { item: "Headhunter", users: 8, count: 11 },
  { item: "Mageblood", users: 5, count: 7 },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [timeSlice, setTimeSlice] = useState("day")
  const [excludeSystemAccounts, setExcludeSystemAccounts] = useState(true)
  const navigate = useNavigate();
  
  // Fetch data for all cards
  const { 
    data: topAddersData, 
    loading: topAddersLoading, 
    error: topAddersError 
  } = useTopUsers("added", timeRange, excludeSystemAccounts)
  
  const { 
    data: topRemoversData, 
    loading: topRemoversLoading, 
    error: topRemoversError 
  } = useTopUsers("removed", timeRange, excludeSystemAccounts)
  
  const {
    data: userRatiosDataDesc,
    loading: userRatiosLoadingDesc,
    error: userRatiosErrorDesc
  } = useUserRatios(timeRange, 10, 'desc', excludeSystemAccounts)
  
  const {
    data: userRatiosDataAsc,
    loading: userRatiosLoadingAsc,
    error: userRatiosErrorAsc
  } = useUserRatios(timeRange, 10, 'asc', excludeSystemAccounts)

  // Derived data for best and worst ratios
  // const bestRatios = userRatiosData ? [...userRatiosData].sort((a, b) => b.ratio - a.ratio) : []
  // const worstRatios = userRatiosData ? [...userRatiosData].sort((a, b) => a.ratio - b.ratio) : []

  // Inside the component, add this hook
  const {
    data: activityData,
    loading: activityLoading,
    error: activityError
  } = useActivityData(timeRange, timeSlice, excludeSystemAccounts)

  const handleAccountClick = (account: string) => {
    navigate(`/search?account=${encodeURIComponent(account)}`);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeSlice} onValueChange={setTimeSlice}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time slice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">Hour</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
        <Checkbox 
              id="exclude-system" 
              checked={excludeSystemAccounts} 
              onCheckedChange={(checked) => setExcludeSystemAccounts(checked as boolean)}
            />
            <Label htmlFor="exclude-system" className="text-sm">
              Exclude Officers
            </Label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Adders</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topAddersLoading ? (
                // Show loading skeletons
                <>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </>
              ) : topAddersError ? (
                // Show error message
                <div className="text-sm text-red-500">Error loading data</div>
              ) : topAddersData.length === 0 ? (
                // Show empty state
                <div className="text-sm text-muted-foreground">No data available</div>
              ) : (
                // Show actual data
                topAddersData.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button 
                      onClick={() => handleAccountClick(user.user)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.user}
                    </button>
                    <span className="font-medium">{user.count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Removers</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRemoversLoading ? (
                // Show loading skeletons
                <>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </>
              ) : topRemoversError ? (
                // Show error message
                <div className="text-sm text-red-500">Error loading data</div>
              ) : topRemoversData.length === 0 ? (
                // Show empty state
                <div className="text-sm text-muted-foreground">No data available</div>
              ) : (
                // Show actual data
                topRemoversData.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button 
                      onClick={() => handleAccountClick(user.user)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.user}
                    </button>
                    <span className="font-medium">{user.count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Ratios</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRatiosLoadingDesc ? (
                // Show loading skeletons
                <>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </>
              ) : userRatiosErrorDesc ? (
                // Show error message
                <div className="text-sm text-red-500">Error loading data</div>
              ) : userRatiosDataDesc.length === 0 ? (
                // Show empty state
                <div className="text-sm text-muted-foreground">No data available</div>
              ) : (
                // Show actual data
                userRatiosDataDesc.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button 
                      onClick={() => handleAccountClick(user.user)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.user}
                    </button>
                    <span className="font-medium">{user.ratio.toFixed(1)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Worst Ratios</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRatiosLoadingAsc ? (
                // Show loading skeletons
                <>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </>
              ) : userRatiosErrorAsc ? (
                // Show error message
                <div className="text-sm text-red-500">Error loading data</div>
              ) : userRatiosDataAsc.length === 0 ? (
                // Show empty state
                <div className="text-sm text-muted-foreground">No data available</div>
              ) : (
                // Show actual data
                userRatiosDataAsc.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <button 
                      onClick={() => handleAccountClick(user.user)}
                      className="text-sm text-primary hover:underline"
                    >
                      {user.user}
                    </button>
                    <span className="font-medium">{user.ratio.toFixed(1)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Stash activity trends over the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Activity</TabsTrigger>
                <TabsTrigger value="added">Added</TabsTrigger>
                <TabsTrigger value="removed">Removed</TabsTrigger>
                <TabsTrigger value="modified">Modified</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="h-[300px]">
                {activityLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : activityError ? (
                  <div className="flex h-full items-center justify-center text-red-500">
                    Error loading activity data
                  </div>
                ) : activityData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time_segment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="added" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="removed" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="modified" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="added" className="h-[300px]">
                {activityLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : activityError ? (
                  <div className="flex h-full items-center justify-center text-red-500">
                    Error loading activity data
                  </div>
                ) : activityData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time_segment" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="added" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="removed" className="h-[300px]">
                {activityLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : activityError ? (
                  <div className="flex h-full items-center justify-center text-red-500">
                    Error loading activity data
                  </div>
                ) : activityData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time_segment" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="removed" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              
              <TabsContent value="modified" className="h-[300px]">
                {activityLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : activityError ? (
                  <div className="flex h-full items-center justify-center text-red-500">
                    Error loading activity data
                  </div>
                ) : activityData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time_segment" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="modified" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h1>Coming Soon!</h1>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Items</CardTitle>
            <CardDescription>Based on unique users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularItems}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="item" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#6366f1" name="Unique Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Currency Withdrawn</CardTitle>
            <CardDescription>Most withdrawn currency types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currencyData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#f59e0b" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

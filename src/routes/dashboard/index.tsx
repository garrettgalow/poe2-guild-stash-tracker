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

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [timeSlice, setTimeSlice] = useState("day")
  const [excludeSystemAccounts, setExcludeSystemAccounts] = useState(true)
  const [excludeCommunityAccounts, setExcludeCommunityAccounts] = useState(true)
  const navigate = useNavigate();
  
  // Fetch data for all cards
  const { 
    data: topAddersData, 
    loading: topAddersLoading, 
    error: topAddersError 
  } = useTopUsers("added", timeRange, excludeSystemAccounts, excludeCommunityAccounts)
  
  const { 
    data: topRemoversData, 
    loading: topRemoversLoading, 
    error: topRemoversError 
  } = useTopUsers("removed", timeRange, excludeSystemAccounts, excludeCommunityAccounts)
  
  const {
    data: userRatiosDataDesc,
    loading: userRatiosLoadingDesc,
    error: userRatiosErrorDesc
  } = useUserRatios(timeRange, 10, 'desc', excludeSystemAccounts, excludeCommunityAccounts)
  
  const {
    data: userRatiosDataAsc,
    loading: userRatiosLoadingAsc,
    error: userRatiosErrorAsc
  } = useUserRatios(timeRange, 10, 'asc', excludeSystemAccounts, excludeCommunityAccounts)

  // Derived data for best and worst ratios
  // const bestRatios = userRatiosData ? [...userRatiosData].sort((a, b) => b.ratio - a.ratio) : []
  // const worstRatios = userRatiosData ? [...userRatiosData].sort((a, b) => a.ratio - b.ratio) : []

  // Inside the component, add this hook
  const {
    data: activityData,
    loading: activityLoading,
    error: activityError
  } = useActivityData(timeRange, timeSlice, excludeSystemAccounts, excludeCommunityAccounts)

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
            <SelectItem value="14d">Last 14 Days</SelectItem>
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
        <Checkbox 
              id="exclude-community" 
              checked={excludeCommunityAccounts} 
              onCheckedChange={(checked) => setExcludeCommunityAccounts(checked as boolean)}
            />
            <Label htmlFor="exclude-community" className="text-sm">
              Exclude Community Team
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
        <h1>Currency trackers coming soon!</h1>
      </div>
      {/* Commented out charts section
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
      */}
    </>
  )
}

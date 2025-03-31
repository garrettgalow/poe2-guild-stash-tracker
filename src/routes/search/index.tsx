import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination"
import { useLeague } from "../../contexts/league-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ArrowDownIcon, Filter } from "lucide-react"
import { ArrowUpIcon } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { PackageIcon } from "lucide-react"
import { GemIcon } from "lucide-react"
import { CoinsIcon } from "lucide-react"
import { config } from "../../lib/config"

interface StashRecord {
  id?: number;
  date: string;
  op_id: number;
  league: string;
  account: string;
  action: string;
  stash: string;
  item: string;
  itemCount?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AccountStats {
  totalAdded: number;
  totalRemoved: number;
  currency: Record<string, { added: number; removed: number }>;
  gems: { added: number; removed: number };
  other: { added: number; removed: number };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const dateRangeOptions = [
  { value: "all", label: "All Time" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" }
]

export default function SearchPage() {
  const [filters, setFilters] = useState({
    account: "",
    action: "",
    stash: "",
    item: "",
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StashRecord[]>([])
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null)
  const [statsDateRange, setStatsDateRange] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  })
  const { selectedLeague } = useLeague();

  const fetchAccountStats = async (account: string, dateRange: string) => {
    try {
      const params = new URLSearchParams({
        account,
        league: selectedLeague,
        dateRange
      });
      
      const response = await fetch(`/api/account-stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch account stats');
      }
      
      const result = await response.json() as ApiResponse<AccountStats>;
      
      if (!result.success) {
        throw new Error('Failed to fetch account stats');
      }
      
      setAccountStats(result.data);
    } catch (err) {
      console.error('Error fetching account stats:', err);
      setAccountStats(null);
    }
  };

  const fetchData = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (currentFilters.account) params.append('account', currentFilters.account)
      if (currentFilters.action) params.append('action', currentFilters.action)
      if (currentFilters.stash) params.append('stash', currentFilters.stash)
      if (currentFilters.item) params.append('item', currentFilters.item)
      params.append('league', selectedLeague)
      
      params.append('page', page.toString())
      params.append('pageSize', pagination.pageSize.toString())
      
      const response = await fetch(`/api/stash-data?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json() as { 
        data: StashRecord[], 
        pagination: PaginationInfo,
        success: boolean
      }
      
      if (!result.success) {
        throw new Error('Failed to fetch data')
      }
      
      setData(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [selectedLeague])

  const handleStatsDateRangeChange = (value: string) => {
    setStatsDateRange(value);
    if (filters.account) {
      fetchAccountStats(filters.account, value);
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    // For text inputs, trim the value as it's entered
    const trimmedValue = key === 'action' ? value : value.trim();
    const newFilters = { ...filters, [key]: trimmedValue };
    setFilters(newFilters);

    // If account filter is set, fetch account stats
    if (key === "account") {
      if (value) {
        fetchAccountStats(value, statsDateRange);
      } else {
        setAccountStats(null);
      }
    }

    return newFilters;
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchData(1)
    }
  }

  const handleSearch = () => {
    fetchData(1)
  }

  const handlePageChange = (page: number) => {
    fetchData(page)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={pagination.page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Show ellipsis if needed
    if (pagination.page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Show pages around current page
    for (let i = Math.max(2, pagination.page - 1); i <= Math.min(pagination.totalPages - 1, pagination.page + 1); i++) {
      if (i <= 1 || i >= pagination.totalPages) continue
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={pagination.page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Show ellipsis if needed
    if (pagination.page < pagination.totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Always show last page if there's more than one page
    if (pagination.totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(pagination.totalPages)}
            isActive={pagination.page === pagination.totalPages}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>Filter the stash data by any column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="account-filter" className="text-sm font-medium">
                Account
              </label>
              <Input
                id="account-filter"
                placeholder="Filter by account"
                value={filters.account}
                onChange={(e) => handleFilterChange("account", e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="action-filter" className="text-sm font-medium">
                Action
              </label>
              <Select 
                value={filters.action} 
                onValueChange={async (value) => {
                  const newFilters = await handleFilterChange("action", value);
                  fetchData(1, newFilters);
                }}
              >
                <SelectTrigger id="action-filter">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="added">Added</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                  <SelectItem value="modified">Modified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="stash-filter" className="text-sm font-medium">
                Stash
              </label>
              <Input
                id="stash-filter"
                placeholder="Filter by stash"
                value={filters.stash}
                onChange={(e) => handleFilterChange("stash", e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="item-filter" className="text-sm font-medium">
                Item
              </label>
              <Input
                id="item-filter"
                placeholder="Filter by item"
                value={filters.item}
                onChange={(e) => handleFilterChange("item", e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {accountStats && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">Account Statistics: {filters.account}</CardTitle>
                <CardDescription>In progress. All-time mostly works, but date filters are not working.</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <ArrowUpIcon className="mr-1 h-3 w-3" /> {accountStats.totalAdded} Added
                  </Badge>
                  <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                    <ArrowDownIcon className="mr-1 h-3 w-3" /> {accountStats.totalRemoved} Removed
                  </Badge>
                  <div className="flex items-center gap-2">
                  <Select value={statsDateRange} onValueChange={handleStatsDateRangeChange}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">Item</TableHead>
                    <TableHead className="text-center">Net Change</TableHead>
                    <TableHead className="text-center">Added</TableHead>
                    <TableHead className="text-center">Removed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Currency Items */}
                  {Object.entries(accountStats.currency)
                    .filter(([_, stats]) => stats.added > 0 || stats.removed > 0)
                    .map(([item, stats]) => (
                      <TableRow key={item}>
                        <TableCell className="font-medium">{item}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${
                              stats.added - stats.removed > 0
                                ? "text-emerald-600"
                                : stats.added - stats.removed < 0
                                  ? "text-rose-600"
                                  : ""
                            }`}
                          >
                            {stats.added - stats.removed > 0 && "+"}
                            {stats.added - stats.removed}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-emerald-600 font-medium">{stats.added}</TableCell>
                        <TableCell className="text-center text-rose-600 font-medium">{stats.removed}</TableCell>
                      </TableRow>
                    ))}

                  {/* Skill Gems (Aggregated) */}
                  {accountStats.gems.added > 0 || accountStats.gems.removed > 0 ? (
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Skill Gems (All)</TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">
                        {accountStats.gems.added}
                      </TableCell>
                      <TableCell className="text-center text-rose-600 font-medium">
                        {accountStats.gems.removed}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            accountStats.gems.added - accountStats.gems.removed > 0
                              ? "text-emerald-600"
                              : accountStats.gems.added - accountStats.gems.removed < 0
                                ? "text-rose-600"
                                : ""
                          }`}
                        >
                          {accountStats.gems.added - accountStats.gems.removed > 0 && "+"}
                          {accountStats.gems.added - accountStats.gems.removed}
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {/* Other Items (Aggregated) */}
                  {accountStats.other.added > 0 || accountStats.other.removed > 0 ? (
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium">Other Items</TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">
                        {accountStats.other.added}
                      </TableCell>
                      <TableCell className="text-center text-rose-600 font-medium">
                        {accountStats.other.removed}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            accountStats.other.added - accountStats.other.removed > 0
                              ? "text-emerald-600"
                              : accountStats.other.added - accountStats.other.removed < 0
                                ? "text-rose-600"
                                : ""
                          }`}
                        >
                          {accountStats.other.added - accountStats.other.removed > 0 && "+"}
                          {accountStats.other.added - accountStats.other.removed}
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {/* Show message if no items found */}
                  {Object.entries(accountStats.currency).filter(([_, stats]) => stats.added > 0 || stats.removed > 0)
                    .length === 0 &&
                    accountStats.gems.added === 0 &&
                    accountStats.gems.removed === 0 &&
                    accountStats.other.added === 0 &&
                    accountStats.other.removed === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No item transactions found for this account
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stash Data</CardTitle>
          <CardDescription>
            {loading ? "Loading data..." : 
              error ? `Error: ${error}` : 
              `Showing ${data.length} of ${pagination.total} records`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>OP ID</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Stash</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Item</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Loading data...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-red-500">{error}</TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">No data found</TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id || index}>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.op_id}</TableCell>
                      <TableCell>{row.league}</TableCell>
                      <TableCell>{row.account}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            row.action === "added"
                              ? "bg-emerald-100 text-emerald-700"
                              : row.action === "removed"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {row.action}
                        </span>
                      </TableCell>
                      <TableCell>{row.stash}</TableCell>
                      <TableCell>{row.itemCount || 1}</TableCell>
                      <TableCell>{row.item}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && !error && pagination.totalPages > 0 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}


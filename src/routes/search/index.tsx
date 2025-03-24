import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination"

interface StashRecord {
  id?: number;
  date: string;
  op_id: number;
  league: string;
  account: string;
  action: string;
  stash: string;
  item: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function SearchPage() {
  const [filters, setFilters] = useState({
    account: "",
    action: "",
    stash: "",
    item: "",
    league: "",
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StashRecord[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  })

  const fetchData = async (page = 1) => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.account) params.append('account', filters.account)
      if (filters.action) params.append('action', filters.action)
      if (filters.stash) params.append('stash', filters.stash)
      if (filters.item) params.append('item', filters.item)
      if (filters.league) params.append('league', filters.league)
      
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
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    // For text inputs, trim the value as it's entered
    const trimmedValue = key === 'action' ? value : value.trim();
    setFilters(prev => ({ ...prev, [key]: trimmedValue }))
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label htmlFor="account-filter" className="text-sm font-medium">
                Account
              </label>
              <Input
                id="account-filter"
                placeholder="Filter by account"
                value={filters.account}
                onChange={(e) => handleFilterChange("account", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="action-filter" className="text-sm font-medium">
                Action
              </label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
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
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="league-filter" className="text-sm font-medium">
                League
              </label>
              <Input
                id="league-filter"
                placeholder="Filter by league"
                value={filters.league}
                onChange={(e) => handleFilterChange("league", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Item</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Loading data...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-red-500">{error}</TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No data found</TableCell>
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


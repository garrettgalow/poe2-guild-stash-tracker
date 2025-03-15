import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

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
  const [filteredData, setFilteredData] = useState<StashRecord[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stash-data')
        
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const result = await response.json() as { data: StashRecord[] }
        setData(result.data)
        setFilteredData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Apply filters
    const filtered = data.filter((row) => {
      return Object.entries(newFilters).every(([key, value]) => {
        if (!value) return true // Skip empty filters
        if (key === 'action' && value === 'all') return true // Skip "all" action filter
        return String(row[key as keyof typeof row])
          .toLowerCase()
          .includes(value.toLowerCase())
      })
    })

    setFilteredData(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stash Data</CardTitle>
          <CardDescription>
            {loading ? "Loading data..." : 
              error ? `Error: ${error}` : 
              `Showing ${filteredData.length} of ${data.length} records`}
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
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No data found</TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
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
        </CardContent>
      </Card>
    </>
  )
}


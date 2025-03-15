import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

// Sample data for the table
const sampleData = [
  {
    id: 1,
    date: "2023-06-15T14:32:45",
    op_id: 12345,
    league: "Ancestor",
    account: "ExileHunter",
    action: "added",
    stash: "Currency",
    item: "Chaos Orb",
  },
  {
    id: 2,
    date: "2023-06-15T15:12:22",
    op_id: 12346,
    league: "Ancestor",
    account: "MapMaster",
    action: "removed",
    stash: "Maps",
    item: "Burial Chambers Map",
  },
  {
    id: 3,
    date: "2023-06-15T16:05:11",
    op_id: 12347,
    league: "Ancestor",
    account: "CraftMaster",
    action: "modified",
    stash: "Currency",
    item: "Exalted Orb",
  },
  {
    id: 4,
    date: "2023-06-15T17:22:33",
    op_id: 12348,
    league: "Ancestor",
    account: "BossHunter",
    action: "removed",
    stash: "Unique",
    item: "Headhunter",
  },
  {
    id: 5,
    date: "2023-06-15T18:45:19",
    op_id: 12349,
    league: "Ancestor",
    account: "LootGoblin",
    action: "added",
    stash: "Gems",
    item: "Awakened Multistrike Support",
  },
  {
    id: 6,
    date: "2023-06-16T09:12:05",
    op_id: 12350,
    league: "Ancestor",
    account: "ExileHunter",
    action: "modified",
    stash: "Currency",
    item: "Divine Orb",
  },
  {
    id: 7,
    date: "2023-06-16T10:33:42",
    op_id: 12351,
    league: "Ancestor",
    account: "MapRunner",
    action: "added",
    stash: "Maps",
    item: "Tower Map",
  },
  {
    id: 8,
    date: "2023-06-16T11:55:18",
    op_id: 12352,
    league: "Ancestor",
    account: "CurrencyKing",
    action: "removed",
    stash: "Currency",
    item: "Mirror of Kalandra",
  },
  {
    id: 9,
    date: "2023-06-16T13:22:07",
    op_id: 12353,
    league: "Ancestor",
    account: "GearSwapper",
    action: "added",
    stash: "Equipment",
    item: "Astral Plate",
  },
  {
    id: 10,
    date: "2023-06-16T14:44:59",
    op_id: 12354,
    league: "Ancestor",
    account: "StashManager",
    action: "modified",
    stash: "Currency",
    item: "Chaos Orb",
  },
]

export default function SearchPage() {
  const [filters, setFilters] = useState({
    account: "",
    action: "",
    stash: "",
    item: "",
    league: "",
  })

  const [filteredData, setFilteredData] = useState(sampleData)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Apply filters
    const filtered = sampleData.filter((row) => {
      return Object.entries(newFilters).every(([key, value]) => {
        if (!value) return true // Skip empty filters
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
            Showing {filteredData.length} of {sampleData.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                {filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}


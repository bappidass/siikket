import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import securityScanStore from "@/store/securityscanStore";
import TablePagination from "@/components/ui/TablePagination";

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export const ScannedTicketsTable = () => {
  const {
    history,
    historyLoading,
    fetchHistory,
    page,
    totalPages,
    totalItems,
  } = securityScanStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        fetchHistory(1, value);
      }, 500),
    [fetchHistory]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scanned Tickets</CardTitle>

        <div className="flex items-center w-[60%] md:w-[30%] relative">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search ticket, name, event..."
            className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Ticket Holder</TableHead>
                <TableHead>Scanned At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No tickets scanned yet
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.ticket_number}
                    </TableCell>
                    <TableCell>{item.event_title}</TableCell>
                    <TableCell>{item.zone_name || "-"}</TableCell>
                    <TableCell>{item.contact_name || "-"}</TableCell>
                    <TableCell>
                      {item.used_at
                        ? new Date(item.used_at).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="my-4 w-full flex justify-end">
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => fetchHistory(p, search)}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
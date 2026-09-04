
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Status = "pending" | "processing" | "success" | "failed";

type Payment = {
  id: string;
  amount: number;
  customer: string;
  email: string;
  status: Status;
  date: string;
};

const payments: Payment[] = [
  {
    id: "INV001",
    amount: 350,
    customer: "John Smith",
    email: "john.smith@example.com",
    status: "pending",
    date: "2023-01-23",
  },
  {
    id: "INV002",
    amount: 1250,
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    status: "success",
    date: "2023-01-22",
  },
  {
    id: "INV003",
    amount: 125,
    customer: "Mike Thomas",
    email: "mike@example.com",
    status: "processing",
    date: "2023-01-21",
  },
  {
    id: "INV004",
    amount: 450,
    customer: "Lisa Anderson",
    email: "lisa@example.com",
    status: "failed",
    date: "2023-01-20",
  },
  {
    id: "INV005",
    amount: 950,
    customer: "James Wilson",
    email: "james@example.com",
    status: "success",
    date: "2023-01-19",
  },
];

const statusColors: Record<Status, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export const DataTable = () => {
  const [sorting, setSorting] = useState<"asc" | "desc">("asc");
  const [sortedField, setSortedField] = useState<keyof Payment>("date");
  
  const sortData = (field: keyof Payment) => {
    if (sortedField === field) {
      setSorting(sorting === "asc" ? "desc" : "asc");
    } else {
      setSortedField(field);
      setSorting("asc");
    }
  };
  
  const sortedData = [...payments].sort((a, b) => {
    if (sorting === "asc") {
      return a[sortedField] > b[sortedField] ? 1 : -1;
    } else {
      return a[sortedField] < b[sortedField] ? 1 : -1;
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payment transactions from customers.
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked>
              Invoice ID
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              Amount
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              Customer
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              Status
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked>
              Date
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium" 
                    onClick={() => sortData("id")}
                  >
                    Invoice ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium" 
                    onClick={() => sortData("amount")}
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium" 
                    onClick={() => sortData("customer")}
                  >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium" 
                    onClick={() => sortData("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium" 
                    onClick={() => sortData("date")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {payment.customer}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className={statusColors[payment.status]}>
                        {payment.status}
                      </Badge>
                      <span className="ml-2">{payment.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={statusColors[payment.status]}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{payment.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

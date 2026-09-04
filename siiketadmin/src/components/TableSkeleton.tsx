import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function SkeletonTableBasic() {
  return (
    <div className="border rounded-lg">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(6)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

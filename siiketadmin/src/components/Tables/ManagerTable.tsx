import { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Edit,
  Info,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "../ui/input";

import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../ui/breadcrumb";

import TablePagination from "../ui/TablePagination";

import { toast } from "sonner";

import React from "react";

import managerStore from "@/store/managerStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

type TableProps = {
  items: any[];
  onSearchChange: (value: string) => void;
  loading: Boolean;
  error: Boolean;
};

export const ManagerTable = React.memo(
  ({ items, loading, error, onSearchChange }: TableProps) => {
    const [sorting, setSorting] = useState<"asc" | "desc" | "">("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [sortedField, setSortedField] =
      useState<keyof any>("createdAt");

    const [page, setPage] = useState(1);

    const [open, setOpen] = useState(false);

    const [saveLoading, setSaveLoading] = useState(false);

    const [deleteLoadingId, setDeleteLoadingId] =
      useState("");

    const [formData, setFormData] = useState({
      id: "",
      name: "",
      email: "",
      role: "",
      password: "",
    });

    const pageSize = 5;

    const sortData = useCallback(
      (field: any) => {
        if (sortedField === field) {
          setSorting(sorting === "asc" ? "desc" : "asc");
        } else {
          setSortedField(field);
          setSorting("asc");
        }

        setPage(1);
      },
      [sorting, sortedField]
    );

    const sortedData = useMemo(() => {
      return [...items].sort((a, b) => {
        if (sortedField === "createdAt") {
          return sorting === "asc"
            ? new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime();
        }

        const aVal = a[sortedField];
        const bVal = b[sortedField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sorting === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sorting === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }, [items, sortedField, sorting]);

    const startIndex = (page - 1) * pageSize;

    const endIndex = Math.min(
      startIndex + pageSize,
      sortedData.length
    );

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const paginatedData = sortedData.slice(startIndex, endIndex);

    const {
      deleteRecord: deleteRecordApi,
      saveRecord: createDataApi,
      updateRecord: updateDataApi,
    } = managerStore();

    const handleDelete = async (id: string) => {
      try {
        setDeleteLoadingId(id);

        const result = await deleteRecordApi(id);

        if (!result.status) {
          toast.error("Failed to delete record");
        } else {
          toast.success("Record deleted successfully!");
        }
      } finally {
        setDeleteLoadingId("");
      }
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    const openAddDialog = () => {
      setFormData({
        id: "",
        name: "",
        email: "",
        role: "",
        password: "",
      });

      setOpen(true);
    };

    const openEditDialog = (item: any) => {
      setFormData({
        id: item.id,
        email: item.email || "",
        name: item.name || "",
        role: item.role || "",
        password: "",
      });

      setOpen(true);
    };

    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      try {
        setSaveLoading(true);
        if (formData.id !== "") {
          const body = {
            email: formData.email,
            name: formData.name,
            role: formData.role,
            password: formData.password,
          };

          const result = await updateDataApi(
            {
              id: formData.id,
              ...body
            }
          );

          if (!result.status) {
            toast.error("Failed to update record");
          } else {
            toast.success(
              "Record updated successfully!"
            );

            setOpen(false);
          }

          return;
        }

        const body = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          password: formData.password,
        };

        const result = await createDataApi(body);

        if (!result.status) {
          toast.error("Failed to create record");
        } else {
          toast.success(
            "Record added successfully!"
          );

          setOpen(false);

          setFormData({
            id: "",
            name: "",
            email: "",
            role: "",
            password: "",
          });
        }
      } finally {
        setSaveLoading(false);
      }
    };

    const handleFormChange = (key: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const role = {
      manager: "Manager",
      cashier: "Cashier",
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Breadcrumb className="mb-5">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">Home</Link>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Administrators
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <CardTitle></CardTitle>

            <Button
              className="my-3"
              size="sm"
              onClick={openAddDialog}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </div>

          <div className="flex items-center w-[60%] md:w-[30%] relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />

            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white"
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Name
                    </TableHead>

                    <TableHead>
                      Email
                    </TableHead>

                    <TableHead>
                      Role
                    </TableHead>

                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10"
                      >
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.name}
                        </TableCell>

                        <TableCell>
                          {item.email}
                        </TableCell>

                        <TableCell>
                          {role[item.role]}
                        </TableCell>

                        <TableCell className="flex gap-2">

                          <DropdownMenu
                            open={openMenuId === item.id}
                            onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}
                          >
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-20">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  openEditDialog(
                                    item
                                  )
                                }}
                              >
                                <Info className="h-4 w-4" />
                                Detail
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <DeleteConfirmationDialog
                                  itemId={item.id}
                                  itemName={"record"}
                                  onConfirm={() => handleDelete(item.id)}
                                  onCancel={() => setOpenMenuId(null)}
                                  trigger={
                                    <div className="flex gap-2">
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </div>
                                  }
                                />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                  onPageChange={setPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={sortedData.length}
                />
              </div>
            </div>
          </div>
        </CardContent>


        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {formData.id !== ""
                  ? "Edit Record"
                  : "Add Record"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">
                    Name
                  </Label>

                  <Input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">
                    Email
                  </Label>

                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Role</Label>

                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      handleFormChange('role', value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="manager">
                        Manager
                      </SelectItem>

                      <SelectItem value="cashier">
                        Cashier
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Password
                  </Label>

                  <Input
                    name="password"
                    type="text"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveLoading}
                >
                  {saveLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}

                  {saveLoading
                    ? formData.id !== ""
                      ? "Updating..."
                      : "Saving..."
                    : formData.id !== ""
                      ? "Update Record"
                      : "Save Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }
);
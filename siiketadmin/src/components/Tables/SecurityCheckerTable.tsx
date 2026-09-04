import { useState } from "react";
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
  Info,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Search,
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { DeleteConfirmationDialog } from "../dashboard/DeleteConfirm";

import securityCheckerStore from "@/store/securityCheckerStore";
import { SecurityCheckerAssignmentsDialog } from "./SecurityCheckerAssignmentsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PATH_URL } from "@/utils/api";
import { ImageUpload } from "../ImageUpload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type TableProps = {
  items: any[];
  onSearchChange: (value: string) => void;
  loading: Boolean;
  error: Boolean;
};

export const SecurityCheckerTable = React.memo(
  ({ items, loading, error, onSearchChange }: TableProps) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [assignmentsChecker, setAssignmentsChecker] = useState<{
      id: string;
      name: string;
    } | null>(null);

    const {
      deleteRecord: deleteRecordApi,
      saveRecord: createDataApi,
      updateRecord: updateDataApi,
      loadMore,
      page,
      totalItems,
      totalPages,
    } = securityCheckerStore();

    const [selectedPage, setSelectedPage] = useState(page);

    const [open, setOpen] = useState(false);

    const [saveLoading, setSaveLoading] = useState(false);

    const [deleteLoadingId, setDeleteLoadingId] = useState("");

    const [formData, setFormData] = useState({
      id: "",
      name: "",
      email: "",
      phone: "",
      avatar: "",
      password: "",
      is_active: "true",
    });

    const pageSize = 10;

    const startIndex = (selectedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        phone: "",
        avatar: "",
        password: "",
        is_active: "true",
      });

      setOpen(true);
    };

    const openEditDialog = (item: any) => {
      setFormData({
        id: item.id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        avatar: item.avatar || "",
        password: "",
        is_active: item.is_active === false ? "false" : "true",
      });

      setOpen(true);
    };

    const handleFormChange = (key: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        setSaveLoading(true);

        const body = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
          is_active: formData.is_active === "true",
          ...(formData.password ? { password: formData.password } : {}),
        };

        if (formData.id !== "") {
          const result = await updateDataApi({
            id: formData.id,
            ...body,
          });

          if (!result.status) {
            toast.error("Failed to update record");
          } else {
            toast.success("Record updated successfully!");
            setOpen(false);
          }

          return;
        }

        if (!formData.password) {
          toast.error("Password is required");
          return;
        }

        const result = await createDataApi(body);

        if (!result.status) {
          toast.error("Failed to create record");
        } else {
          toast.success("Record added successfully!");
          setOpen(false);
          setFormData({
            id: "",
            name: "",
            email: "",
            phone: "",
            avatar: "",
            password: "",
            is_active: "true",
          });
        }
      } finally {
        setSaveLoading(false);
      }
    };

    const handlePageChange = async (page: number) => {
      const result = await loadMore(page);
      if (result.status) {
        setSelectedPage(page);
      }
    };

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
                  <BreadcrumbPage>Security Checkers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <CardTitle></CardTitle>

            <Button className="my-3" size="sm" onClick={openAddDialog}>
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell>{item.email}</TableCell>

                        <TableCell>{item.phone}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              item.is_active === false
                                ? "secondary"
                                : "default"
                            }
                          >
                            {item.is_active === false
                              ? "Inactive"
                              : "Active"}
                          </Badge>
                        </TableCell>

                        <TableCell className="flex gap-2">
                          <DropdownMenu
                            open={openMenuId === item.id}
                            onOpenChange={(open) =>
                              setOpenMenuId(open ? item.id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  openEditDialog(item);
                                }}
                              >
                                <Info className="h-4 w-4" />
                                Detail
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setAssignmentsChecker({
                                    id: item.id,
                                    name: item.name,
                                  });
                                  setOpenMenuId(null);
                                }}
                              >
                                <MapPin className="h-4 w-4" />
                                Assignments
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
                  currentPage={selectedPage}
                  totalPages={totalPages}
                  onPageChange={(page) => handlePageChange(page)}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {formData.id !== "" ? "Edit Record" : "Add Record"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 gap-4 max-h-[80vh] overflow-y-auto px-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label className="mb-2 block">Name</Label>

                  <Input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Email</Label>

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
                  <Label className="mb-2 block">Phone</Label>

                  <Input
                    name="phone"
                    type="text"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={saveLoading}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Status</Label>

                  <Select
                    value={formData.is_active}
                    onValueChange={(value) =>
                      handleFormChange("is_active", value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Password
                    {formData.id !== "" && (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        (leave blank to keep unchanged)
                      </span>
                    )}
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

                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <ImageUpload
                      folder={"security-checkers"}
                      initialImage={
                        formData.avatar != ""
                          ? `${PATH_URL}/${formData.avatar}`
                          : ""
                      }
                      onUploadComplete={(url) =>
                        handleFormChange("avatar", url)
                      }
                      onRemoved={() => handleFormChange("avatar", "")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saveLoading}>
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

        <SecurityCheckerAssignmentsDialog
          checker={assignmentsChecker}
          open={!!assignmentsChecker}
          onOpenChange={(open) => {
            if (!open) setAssignmentsChecker(null);
          }}
        />
      </Card>
    );
  }
);
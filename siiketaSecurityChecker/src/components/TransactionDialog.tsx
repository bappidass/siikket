import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "./ui/checkbox";

type Transaction = {
    id: string;
    cn_no: string;
    client_name?: string;
    from_location?: string;
    to_location?: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Transaction[];
    selected: string[];
    onChange: (selected: string[]) => void;
};

export default function TransactionSelectDialog({
    open,
    onOpenChange,
    data,
    selected,
    onChange,
}: Props) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        return data.filter((tx) =>
            `${tx.cn_no} ${tx.client_name ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, data]);

    const toggle = (id: string) => {
        const exists = selected.includes(id);

        const updated = exists
            ? selected.filter((x) => x !== id)
            : [...selected, id];

        onChange(updated);
    };

    const selectAll = () => {
        onChange(filtered.map((t) => t.id));
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Select Consignment Notes</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <Input
                    placeholder="Search CN / Client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                    <Button type="button" onClick={selectAll} variant="outline">
                        Select All
                    </Button>

                    <Button type="button" onClick={clearAll} variant="outline">
                        Clear
                    </Button>
                </div>

                {
                  filtered.length > 0 ?  <div className="mt-3 max-h-80 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filtered.map((tx) => (
                        <label
                            key={tx.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
                        >
                            <Checkbox
                                checked={selected.includes(tx.id)}
                                onCheckedChange={() => toggle(tx.id)}
                            />

                            <div className="text-sm">
                                <div className="font-medium">
                                    CN: {tx.cn_no}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {tx.client_name} • {tx.from_location} →{" "}
                                    {tx.to_location}
                                </div>
                            </div>
                        </label>
                    ))}
                </div> : <p className="text-sm">No records found</p>
                }

                {/* Footer */}
                <div className="flex justify-end mt-4">
                    <Button onClick={() => onOpenChange(false)}>
                        Done ({selected.length} selected)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
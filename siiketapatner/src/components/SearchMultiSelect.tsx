"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface SelectItem {
    id: string;
    label: string;
}

interface SearchMultiSelectProps<T extends SelectItem> {
    items: T[];
    value?: T[];
    placeholder?: string;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
    onChange?: (items: T[]) => void;
    onAdd?: (search: string) => void;
    loading?: boolean;
}

export function SearchMultiSelect<T extends SelectItem>({
    items,
    value = [],
    placeholder = "Select items",
    searchPlaceholder = "Search...",
    onSearch,
    onChange,
    onAdd,
    loading,
}: SearchMultiSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const isSelected = (item: T) =>
        value.some((v) => v.id === item.id);

    const toggleItem = (item: T) => {
        if (isSelected(item)) {
            onChange?.(value.filter((v) => v.id !== item.id));
        } else {
            onChange?.([...value, item]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-auto min-h-[2.8rem] justify-between rounded-xl"
                >
                    <span className="truncate text-left">
                        {value.length > 0
                            ? value.map((v) => v.label).join(", ")
                            : placeholder}
                    </span>

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={(value) => {
                            setSearch(value);
                            onSearch?.(value);
                        }}
                    />

                    <CommandList>
                        {loading && (
                            <div className="p-3 text-sm text-muted-foreground">
                                Loading...
                            </div>
                        )}

                        {!loading && items.length === 0 && (
                            <div className="p-4 space-y-3">
                                <p className="text-center text-sm text-muted-foreground">
                                    No results found
                                </p>

                                {onAdd && search.trim() && (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            onAdd(search.trim());
                                            setSearch("");
                                        }}
                                    >
                                        Add "{search}"
                                    </Button>
                                )}
                            </div>
                        )}

                        {items.length > 0 && (
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.label}
                                        onSelect={() => toggleItem(item)}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${
                                                isSelected(item)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            }`}
                                        />

                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
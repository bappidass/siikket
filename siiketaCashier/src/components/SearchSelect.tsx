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

interface SearchSelectProps<T extends SelectItem> {
    items: T[];
    value?: T | null;
    placeholder?: string;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
    onChange?: (item: T) => void;
    onAdd?: (search: string) => void;
    loading?: boolean;
}

export function SearchSelect<T extends SelectItem>({
    items,
    value,
    placeholder = "Select item",
    searchPlaceholder = "Search...",
    onSearch,
    onChange,
    onAdd,
    loading,
}: SearchSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-[2.8rem] justify-between rounded-xl"
                >
                    <label>{value?.label || (placeholder ?? '')}</label>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                <p className="text-sm text-center text-muted-foreground">
                                    No results found
                                </p>

                                {onAdd && search.trim() && (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                            setOpen(false);
                                            onAdd(search.trim());
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
                                        onSelect={() => {
                                            onChange?.(item);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${value?.id === item.id
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
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  contentClassName?: string;
  id?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  portalled?: boolean;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opcion",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  disabled = false,
  loading = false,
  loadingText = "Cargando...",
  className,
  contentClassName,
  id,
  searchValue,
  onSearchValueChange,
  portalled = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");

  const currentSearch = typeof searchValue === "string" ? searchValue : internalSearch;

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label;
  }, [options, value]);

  const handleSearchChange = (nextValue: string) => {
    if (onSearchValueChange) {
      onSearchValueChange(nextValue);
      return;
    }

    setInternalSearch(nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)} align="start" portalled={portalled}>
        <Command shouldFilter={!onSearchValueChange}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={currentSearch}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading ? <div className="px-3 py-2 text-sm text-muted-foreground">{loadingText}</div> : null}
            {!loading ? <CommandEmpty>{emptyText}</CommandEmpty> : null}
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
  label?: string;
  className?: string;
}

const SearchableSelect = ({ 
  value, 
  onValueChange, 
  placeholder, 
  options, 
  label,
  className 
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-12 w-full justify-between rounded-xl border-2 bg-white/80 dark:bg-slate-700/80",
              className
            )}
          >
            {value || placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
          <Command>
            <CommandInput placeholder={`Поиск города...`} />
            <CommandList>
              <CommandEmpty>Город не найден.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onValueChange(option === value ? "" : option);
                      setOpen(false);
                    }}
                    className="rounded-lg mx-2 my-1 hover:bg-yoldosh-primary/10 focus:bg-yoldosh-primary/10"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchableSelect;

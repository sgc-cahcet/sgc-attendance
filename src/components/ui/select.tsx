import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

export function Select({ value, onChange, children, placeholder }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="w-48 flex justify-between items-center px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500">
        <SelectPrimitive.Value placeholder={placeholder} />
        <ChevronDownIcon />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="bg-white shadow-md rounded-lg overflow-hidden">
          <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white rounded-md"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

import React from "react";
import { Dialog, DialogTrigger, DialogContent } from "./dialog";
import { Search } from "lucide-react";

// Command container
const Command = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-neutral-900 text-white ${className}`}
    {...props}
  >
    {children}
  </div>
));
Command.displayName = "Command";

// Full Dialog + Command wrapper
const CommandDialog = ({ children, ...props }) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-md w-full">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
};

// Search input
const CommandInput = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className="flex items-center border-b border-neutral-700 px-3 py-2 bg-neutral-800">
    <Search className="mr-2 h-5 w-5 text-neutral-400" />
    <input
      ref={ref}
      className={`flex h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-400 ${className}`}
      placeholder="Search..."
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

// List of items
const CommandList = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`max-h-64 overflow-y-auto bg-neutral-900 ${className}`}
    {...props}
  />
));
CommandList.displayName = "CommandList";

// Empty fallback
const CommandEmpty = React.forwardRef(({ children = "No results found.", ...props }, ref) => (
  <div ref={ref} className="py-6 text-center text-sm text-neutral-400" {...props}>
    {children}
  </div>
));
CommandEmpty.displayName = "CommandEmpty";

// Group wrapper
const CommandGroup = React.forwardRef(({ label, children, ...props }, ref) => (
  <div ref={ref} className="p-2" {...props}>
    {label && <p className="px-2 py-1.5 text-xs font-medium text-neutral-400">{label}</p>}
    <div>{children}</div>
  </div>
));
CommandGroup.displayName = "CommandGroup";

// Item
const CommandItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center px-3 py-2 text-sm text-white hover:bg-neutral-800 cursor-pointer select-none ${className}`}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

// Separator
const CommandSeparator = React.forwardRef((props, ref) => (
  <hr ref={ref} className="-mx-2 my-2 border-t border-neutral-700" {...props} />
));
CommandSeparator.displayName = "CommandSeparator";

// Shortcut text
const CommandShortcut = ({ className = "", ...props }) => (
  <span
    className={`ml-auto text-xs tracking-widest text-neutral-500 ${className}`}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

// Exports
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  DialogTrigger // you may still need this
};

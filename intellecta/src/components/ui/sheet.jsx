import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// Basic Sheet wrapper components
const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

// Overlay background
const SheetOverlay = React.forwardRef(({ className = "", ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={`fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className}`}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

// Position and animation variants manually
const getSheetPositionClasses = (side) => {
  switch (side) {
    case "top":
      return "inset-x-0 top-0 border-b animate-slide-in-from-top";
    case "bottom":
      return "inset-x-0 bottom-0 border-t animate-slide-in-from-bottom";
    case "left":
      return "inset-y-0 left-0 w-3/4 border-r animate-slide-in-from-left sm:max-w-sm";
    case "right":
    default:
      return "inset-y-0 right-0 w-3/4 border-l animate-slide-in-from-right sm:max-w-sm";
  }
};

// Content
const SheetContent = React.forwardRef(({ side = "right", className = "", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      ref={ref}
      className={`fixed z-50 h-full bg-white dark:bg-zinc-900 p-6 shadow-lg transition ease-in-out ${getSheetPositionClasses(side)} ${className}`}
      {...props}
    >
      {children}

      <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2">
        <X className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Close</span>
      </SheetClose>
    </Dialog.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

// Header
const SheetHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
);
SheetHeader.displayName = "SheetHeader";

// Footer
const SheetFooter = ({ className = "", ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
);
SheetFooter.displayName = "SheetFooter";

// Title
const SheetTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={`text-lg font-semibold text-foreground ${className}`}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

// Description
const SheetDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={`text-sm text-muted-foreground ${className}`}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

// Export
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetPortal,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
};

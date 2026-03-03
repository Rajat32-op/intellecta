import React, { forwardRef } from "react";

// Card
const Card = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`border bg-white text-black shadow-sm dark:text-white dark:border-zinc-700 ${!className.includes("dark:bg-gradient-to-")?"dark:bg-gradient-to-t from-cyan-500 to-black":className}${className||""}`}
    {...props}
  />
));
Card.displayName = "Card";

// Card Header
const CardHeader = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = forwardRef(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = forwardRef(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground dark:text-zinc-400 ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
};

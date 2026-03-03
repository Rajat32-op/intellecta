import React, { forwardRef } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

// Avatar Root
const Avatar = forwardRef(({ className = "", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

// Avatar Image
const AvatarImage = forwardRef(({ className = "", ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={`aspect-square h-full w-full ${className}`}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// Avatar Fallback
const AvatarFallback = forwardRef(({ className = "", ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground dark:bg-zinc-700 dark:text-zinc-300 ${className}`}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

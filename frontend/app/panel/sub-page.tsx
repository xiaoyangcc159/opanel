"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

export function SubPage({
  children,
  title,
  subTitle,
  icon,
  outerClassName,
  className,
  ...props
}: Readonly<React.ComponentProps<"div"> & {
  children?: React.ReactNode
  title: string
  subTitle?: string
  icon?: React.ReactNode
  outerClassName?: string
  className?: string
}>) {
  useEffect(() => {
    document.title = `OPanel - ${subTitle ?? title}`;
  }, [title, subTitle]);

  return (
    <div className={cn("group bg-sidebar flex-1 flex flex-col gap-8", outerClassName)}>
      <Navbar className="px-16 max-md:px-12 max-sm:px-2"/>
      <div className="pt-4 px-16 max-md:px-12 max-sm:px-8 flex items-center gap-5">
        {icon}
        <h1 className="text-3xl font-bold">{subTitle ?? title}</h1>
      </div>
      <div className={cn(className, "mx-16 max-md:mx-12 max-sm:mx-8 pb-14")} {...props}>
        {children}
      </div>
    </div>
  );
}

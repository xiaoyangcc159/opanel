"use client";

import { type PropsWithChildren, useContext } from "react";
import { type LucideIcon, Computer, Cpu,  Gpu,  MemoryStick,  Server } from "lucide-react";
import { FunctionalCard } from "@/components/functional-card";
import { InfoContext } from "@/contexts/api-context";
import { cn, formatDataSize } from "@/lib/utils";
import { googleSansCode } from "@/lib/fonts";
import { $ } from "@/lib/i18n";

function SystemInfoItem({
  name,
  children,
  className,
  ...props
}: PropsWithChildren & {
  icon: LucideIcon
  name: string
  className?: string
}) {
  return (
    <div className={cn("col-span-2 min-w-fit flex items-center gap-4", className)}>
      <div className="min-w-20 flex items-center gap-2">
        <props.icon size={18}/>
        <span>{name}:</span>
      </div>
      <span className={cn("text-sm text-muted-foreground whitespace-nowrap", googleSansCode.className)}>
        {children}
      </span>
    </div>
  );
}

export function SystemCard({
  className,
}: Readonly<{
  className?: string
}>) {
  const ctx = useContext(InfoContext);

  return (
    <FunctionalCard
      icon={Cpu}
      title={$("dashboard.system.title")}
      className={className}
      innerClassName="h-full mt-2 pb-4 px-6 grid grid-rows-subgrid grid-cols-2 gap-2 overflow-x-auto">
      <SystemInfoItem
        icon={Server}
        name="OS">
        {ctx?.system.os ?? ""}
      </SystemInfoItem>
      <SystemInfoItem
        icon={Computer}
        name={$("dashboard.system.item.arch")}>
        {ctx?.system.arch ?? ""}
      </SystemInfoItem>
      <SystemInfoItem
        icon={Cpu}
        name="CPU">
        {ctx?.system.cpuName ?? ""}
      </SystemInfoItem>
      <SystemInfoItem
        icon={Gpu}
        name="GPU">
        {ctx?.system.gpus[0] ?? ""}
      </SystemInfoItem>
      <SystemInfoItem
        icon={Cpu}
        name={$("dashboard.system.item.core")}
        className="col-span-1 *:text-foreground">
        {ctx?.system.cpuCore ?? 0}
      </SystemInfoItem>
      <SystemInfoItem
        icon={MemoryStick}
        name={$("dashboard.system.item.memory")}
        className="ml-10 col-start-2 col-span-1 *:text-foreground">
        {formatDataSize(ctx?.system.memory ?? 0)}
      </SystemInfoItem>
    </FunctionalCard>
  );
}

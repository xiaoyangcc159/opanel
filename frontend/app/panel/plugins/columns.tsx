import type { ColumnDef } from "@tanstack/react-table";
import type { Plugin } from "@/lib/types";
import { Ban, Check, Download, PackagePlus, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { base64ToString, cn, formatDataSize } from "@/lib/utils";
import { googleSansCode } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { deletePlugin, downloadPlugin, togglePlugin } from "./plugin-utils";

export const enabledPluginColumns: ColumnDef<Plugin>[] = [
  {
    accessorKey: "name",
    header: "插件名称",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <span className="font-semibold">{row.original.name}</span>
        </TooltipTrigger>
        <TooltipContent>{base64ToString(row.original.fileName)}</TooltipContent>
      </Tooltip>
    )
  },
  {
    accessorKey: "version",
    header: "版本",
    cell: ({ row }) => row.original.version ?? ""
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => {
      const { description } = row.original;
      return (
        <span className="max-w-96 overflow-hidden text-ellipsis block">
          {description ? base64ToString(description) : ""}
        </span>
      );
    }
  },
  {
    accessorKey: "size",
    header: "大小",
    cell: ({ row }) => (
      <span className={cn("text-xs", googleSansCode.className)}>
        {formatDataSize(row.original.size)}
      </span>
    )
  },
  {
    accessorKey: "loaded",
    header: () => <div className="text-center">已加载</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {
          row.original.loaded
          ? <Check size={18} color="var(--color-muted-foreground)"/>
          : <></>
        }
      </div>
    )
  },
  {
    header: " ",
    cell: ({ row }) => {
      const { fileName: rawFileName, loaded } = row.original;
      const fileName = base64ToString(rawFileName);
      return (
        <div className="flex justify-end [&>*]:h-4 [&>*]:cursor-pointer [&>*]:hover:!bg-transparent">
          {!loaded && (
            <Button
              variant="ghost"
              size="icon"
              title="禁用插件"
              onClick={() => togglePlugin(fileName, false)}>
              <Ban className="stroke-red-400"/>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="下载插件"
            onClick={() => downloadPlugin(fileName)}>
            <Download />
          </Button>
        </div>
      );
    }
  }
];

export const disabledPluginColumns: ColumnDef<Plugin>[] = [
  {
    accessorKey: "name",
    header: "插件名称",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <span className="font-semibold">{row.original.name}</span>
        </TooltipTrigger>
        <TooltipContent>{base64ToString(row.original.fileName)}</TooltipContent>
      </Tooltip>
    )
  },
  {
    accessorKey: "version",
    header: "版本",
    cell: ({ row }) => row.original.version ?? ""
  },
  {
    accessorKey: "description",
    header: "描述",
  },
  {
    accessorKey: "size",
    header: "大小",
    cell: ({ row }) => (
      <span className={cn("text-xs", googleSansCode.className)}>
        {formatDataSize(row.original.size)}
      </span>
    )
  },
  {
    header: " ",
    cell: ({ row }) => {
      const { fileName: rawFileName } = row.original;
      const fileName = base64ToString(rawFileName);
      return (
        <div className="flex justify-end [&>*]:h-4 [&>*]:cursor-pointer [&>*]:hover:!bg-transparent">
          <Button
            variant="ghost"
            size="icon"
            title="启用插件"
            onClick={() => togglePlugin(fileName, true)}>
            <PackagePlus className="stroke-green-600"/>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="下载插件"
            onClick={() => downloadPlugin(fileName)}>
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="删除插件"
            onClick={() => deletePlugin(fileName)}>
            <Trash2 />
          </Button>
        </div>
      );
    }
  }
];

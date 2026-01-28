import type { Plugin } from "@/lib/types";
import Link from "next/link";
import { type PropsWithChildren } from "react";
import { Download, House, SquareArrowOutUpRight } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { $ } from "@/lib/i18n";
import { base64ToString } from "@/lib/utils";
import { apiUrl } from "@/lib/api";
import { downloadPlugin } from "./plugin-utils";

import PackIcon from "@/assets/images/pack.png";

export function PluginDialog({
  plugin,
  children,
  asChild
}: PropsWithChildren & {
  plugin: Plugin
  asChild?: boolean
}) {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="h-20 flex-row gap-5">
          <img
            className="aspect-square h-full object-cover rounded-xs"
            src={plugin.icon ? (apiUrl + plugin.icon) : PackIcon.src}
            alt={plugin.name}/>
          <div className="flex flex-col gap-2">
            <DialogTitle>{plugin.name}</DialogTitle>
            <DialogDescription className="line-clamp-2">{base64ToString(plugin.description ?? "")}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="pb-2 border-b flex justify-between items-end">
            <div className="pb-1 text-sm leading-5.5">
              <span className="text-muted-foreground">作者：</span>
              <span className="space-x-2 wrap-anywhere *:whitespace-nowrap">
                {plugin.authors.map((author, i) => (
                  <span key={i}>{author}</span>
                ))}
              </span>
            </div>
            {plugin.website && (
              <Button
                variant="ghost"
                size="sm"
                asChild>
                <Link href={plugin.website} target="_blank" rel="noopener noreferrer">
                  <House />
                  插件主页
                  <SquareArrowOutUpRight className="!size-3 ml-1 max-sm:hidden" stroke="var(--color-muted-foreground)"/>
                </Link>
              </Button>
            )}
          </div>
        </div>
        <DialogFooter className="justify-between!">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            title={$ ("plugins.action.download")}
            onClick={() => downloadPlugin(base64ToString(plugin.fileName))}>
            <Download />
          </Button>
          <DialogClose asChild>
            <Button variant="outline">{$("dialog.close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

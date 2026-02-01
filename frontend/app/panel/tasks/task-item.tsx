import type { ScheduledTask } from "@/lib/types";
import { useEffect, useState } from "react";
import { FileClock, Trash } from "lucide-react";
import { FilesEditorSidebarListItem } from "@/components/ui/files-editor";
import { base64ToString, cn } from "@/lib/utils";
import { googleSansCode } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { sendDeleteRequest, sendPatchRequest, toastError } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { emitter } from "@/lib/emitter";

export function TaskItem({
  task,
  isActive,
  onClick
}: {
  task: ScheduledTask
  isActive: boolean
  onClick?: () => void
}) {
  const [enabled, setEnabled] = useState(task.enabled);

  const handleDelete = async () => {
    try {
      await sendDeleteRequest(`/api/tasks/${task.id}`);
      emitter.emit("refresh-data");
    } catch (e: any) {
      toastError(e, "无法删除定时任务", [

      ]);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await sendPatchRequest(`/api/tasks/${task.id}?enabled=${enabled ? "1" : "0"}`);
    } catch (e: any) {
      toastError(e, `无法${enabled ? "启用" : "禁用"}定时任务`, [

      ]);
    }
  };

  useEffect(() => {
    handleToggle(enabled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <FilesEditorSidebarListItem
      className="h-20 hover:bg-muted border grid grid-rows-2 grid-cols-2 gap-1"
      id={task.id}
      isActive={isActive}
      onClick={() => onClick && onClick()}>
      <div className="flex items-center gap-2">
        <FileClock />
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {base64ToString(task.name)}
        </span>
        {task.enabled && (
          <div className="rounded-full w-1 h-1 mr-2 bg-green-600 dark:bg-emerald-500"/>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="ml-auto -mr-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}>
        <Trash />
      </Button>
      <span className={cn("align-bottom text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis", googleSansCode.className)}>
        {task.cron}
      </span>
      <Switch
        className="ml-auto"
        checked={enabled}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={setEnabled}/>
    </FilesEditorSidebarListItem>
  );
}

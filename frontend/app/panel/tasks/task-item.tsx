import type { ScheduledTask } from "@/lib/types";
import { FileClock, Trash } from "lucide-react";
import { FilesEditorSidebarListItem } from "@/components/ui/files-editor";
import { base64ToString, cn } from "@/lib/utils";
import { googleSansCode } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { sendDeleteRequest, toastError } from "@/lib/api";

export function TaskItem({
  task,
  isActive,
  onClick
}: {
  task: ScheduledTask
  isActive: boolean
  onClick?: () => void
}) {
  const handleDelete = async () => {
    try {
      await sendDeleteRequest(`/api/tasks/${task.id}`);
    } catch (e: any) {
      toastError(e, "无法删除定时任务", [

      ]);
    }
  };

  return (
    <FilesEditorSidebarListItem
      className="justify-between"
      id={task.id}
      isActive={isActive}
      onClick={() => onClick && onClick()}>
      <div className="flex items-center gap-2">
        <FileClock />
        <span>{base64ToString(task.name)}</span>
        {task.enabled && (
          <div className="rounded-full w-1 h-1 mr-2 bg-green-600 dark:bg-emerald-500"/>
        )}
        <span className={cn("text-xs text-muted-foreground", googleSansCode.className)}>{task.cron}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}>
        <Trash />
      </Button>
    </FilesEditorSidebarListItem>
  );
}

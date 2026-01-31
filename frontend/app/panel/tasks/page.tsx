"use client";

import type { ScheduledTask, TasksResponse } from "@/lib/types";
import { useEffect, useState } from "react";
import { ClockFading } from "lucide-react";
import { SubPage } from "../sub-page";
import { FilesEditor, FilesEditorContent, FilesEditorSidebar, FilesEditorSidebarList } from "@/components/ui/files-editor";
import { sendGetRequest, toastError } from "@/lib/api";
import { TaskItem } from "./task-item";
import { TaskEditForm } from "./task-edit-form";
import { emitter } from "@/lib/emitter";

export default function Tasks() {
  const [tasks, setTasks] = useState<ScheduledTask[] | null>(null);
  const [currentEditing, setCurrentEditing] = useState<string | null>(null);

  const fetchTaskList = async () => {
    try {
      const res = await sendGetRequest<TasksResponse>("/api/tasks");
      setTasks(res.tasks);
      setCurrentEditing(res.tasks.length > 0 ? res.tasks[0].id : null);
    } catch (e: any) {
      toastError(e, "无法获取定时任务列表", [

      ]);
    }
  };

  useEffect(() => {
    fetchTaskList();

    emitter.on("refresh-data", () => fetchTaskList());
    return () => {
      emitter.off("refresh-data", () => fetchTaskList());
    };
  }, []);

  return (
    <SubPage
      title="定时任务"
      description="在设定的时间自动化执行指定的指令"
      category="配置"
      icon={<ClockFading />}
      className="flex-1 min-h-0">
      <FilesEditor className="min-lg:*:flex-1">
        <FilesEditorSidebar>
          <FilesEditorSidebarList>
            {tasks?.map((task) => (
              <TaskItem
                task={task}
                isActive={currentEditing === task.id}
                onClick={() => setCurrentEditing(task.id)}
                key={task.id}/>
            ))}
          </FilesEditorSidebarList>
        </FilesEditorSidebar>
        <FilesEditorContent className="">
          {(tasks && currentEditing) && (
            <TaskEditForm task={tasks.find(task => task.id === currentEditing)!}/>
          )}
        </FilesEditorContent>
      </FilesEditor>
    </SubPage>
  );
}

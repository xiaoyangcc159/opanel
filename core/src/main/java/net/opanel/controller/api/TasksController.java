package net.opanel.controller.api;

import io.javalin.http.Handler;
import io.javalin.http.HttpStatus;
import net.opanel.OPanel;
import net.opanel.controller.BaseController;
import net.opanel.task.ScheduledTask;
import net.opanel.task.ScheduledTaskManager;

import java.util.HashMap;
import java.util.List;

public class TasksController extends BaseController {
    private ScheduledTaskManager scheduledTaskManager;

    public TasksController(OPanel plugin) {
        super(plugin);

        scheduledTaskManager = plugin.getScheduledTaskManager();
    }

    public Handler getTasks = ctx -> {
        HashMap<String, Object> obj = new HashMap<>();
        obj.put("tasks", scheduledTaskManager.getTasks());
        sendResponse(ctx, obj);
    };

    public Handler createTask = ctx -> {
        TaskEditRequestBodyType reqBody = ctx.bodyAsClass(TaskEditRequestBodyType.class);
        try {
            ScheduledTask task = scheduledTaskManager.createTask(reqBody.name, reqBody.cron, reqBody.commands);

            HashMap<String, Object> obj = new HashMap<>();
            obj.put("taskId", task.getId());
            sendResponse(ctx, obj);
        } catch (IllegalArgumentException e) {
            sendResponse(ctx, HttpStatus.BAD_REQUEST, "Illegal cron expression.");
        }
    };

    public Handler editTask = ctx -> {
        final String id = ctx.pathParam("id");
        TaskEditRequestBodyType reqBody = ctx.bodyAsClass(TaskEditRequestBodyType.class);

        try {
            scheduledTaskManager.setTaskCron(id, reqBody.cron);
            scheduledTaskManager.setTaskName(id, reqBody.name);
            scheduledTaskManager.setTaskCommands(id, reqBody.commands);
            scheduledTaskManager.saveTasks();
            sendResponse(ctx, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            sendResponse(ctx, HttpStatus.BAD_REQUEST, "Illegal cron expression.");
        }
    };

    public Handler toggleTask = ctx -> {
        final String id = ctx.pathParam("id");
        final String enabled = ctx.queryParam("enabled");
        if(enabled == null) {
            sendResponse(ctx, HttpStatus.BAD_REQUEST, "Enabled status is missing.");
            return;
        }

        scheduledTaskManager.setTaskEnabled(id, enabled.equals("1"));
        scheduledTaskManager.saveTasks();
    };

    private static class TaskEditRequestBodyType {
        String name;
        String cron;
        List<String> commands;
    }
}

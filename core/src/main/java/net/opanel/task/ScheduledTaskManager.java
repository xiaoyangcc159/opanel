package net.opanel.task;

import com.cronutils.model.CronType;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import net.opanel.OPanel;
import net.opanel.common.OPanelServer;
import net.opanel.storage.Storage;
import net.opanel.storage.StorageKey;
import net.opanel.utils.Utils;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.*;

public class ScheduledTaskManager {
    private final OPanel plugin;
    private final List<ScheduledTask> tasks;
    private final Set<String> deletedTaskIds = Collections.synchronizedSet(new HashSet<>());

    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
    private final CronParser parser = new CronParser(CronDefinitionBuilder.instanceDefinitionFor(CronType.SPRING));

    @SuppressWarnings("unchecked")
    public ScheduledTaskManager(OPanel plugin) {
        this.plugin = plugin;
        tasks = new CopyOnWriteArrayList<>(
            (List<ScheduledTask>) Storage.get().getStoredData(StorageKey.SCHEDULED_TASKS)
        );

        for(ScheduledTask task : tasks) {
            scheduleTask(ExecutionTime.forCron(task.getCron()), task);
        }
    }

    private void scheduleTask(ExecutionTime executionTime, ScheduledTask task) {
        ZonedDateTime now = ZonedDateTime.now();
        Optional<ZonedDateTime> nextOptional = executionTime.nextExecution(now);
        if(nextOptional.isEmpty()) return;

        ZonedDateTime next = nextOptional.get();
        long timeout = Duration.between(now, next).toMillis();
        executor.schedule(() -> {
            OPanelServer server = plugin.getServer();
            if(server == null) return;

            try {
                if(task.isEnabled()) {
                    for(String command : task.getCommands()) {
                        server.sendServerCommand(command);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            synchronized(deletedTaskIds) {
                for(String id : deletedTaskIds) {
                    if(task.getId().equals(id)) {
                        deletedTaskIds.remove(id);
                        return;
                    }
                }
            }

            scheduleTask(executionTime, task);
        }, timeout, TimeUnit.MILLISECONDS);
    }

    public ScheduledTask createTask(String name, String cronExpression, List<String> commands) throws IllegalArgumentException {
        ScheduledTask task = new ScheduledTask(
            Utils.generateRandomCharSequence(32, false),
            name,
            parser.parse(cronExpression),
            commands,
            true
        );
        tasks.add(task);
        scheduleTask(ExecutionTime.forCron(task.getCron()), task);
        saveTasks();
        return task;
    }

    public void deleteTask(String id) {
        ScheduledTask task = getTask(id);
        if(task == null) {
            throw new NoSuchElementException("Cannot find the task: "+ id);
        }

        tasks.remove(task);
        deletedTaskIds.add(id);
    }

    public List<ScheduledTask> getTasks() {
        return tasks;
    }

    public ScheduledTask getTask(String id) {
        for(ScheduledTask task : tasks) {
            if(task.getId().equals(id)) {
                return task;
            }
        }
        return null;
    }

    public void setTaskName(String id, String name) {
        ScheduledTask task = getTask(id);
        if(task == null) {
            throw new NoSuchElementException("Cannot find the task: "+ id);
        }

        task.setName(name);
    }

    public void setTaskCron(String id, String cronExpression) throws IllegalArgumentException {
        ScheduledTask task = getTask(id);
        if(task == null) {
            throw new NoSuchElementException("Cannot find the task: "+ id);
        }

        task.setCron(parser.parse(cronExpression));
    }

    public void setTaskCommands(String id, List<String> commands) {
        ScheduledTask task = getTask(id);
        if(task == null) {
            throw new NoSuchElementException("Cannot find the task: "+ id);
        }

        task.setCommands(commands);
    }

    public void setTaskEnabled(String id, boolean enabled) {
        ScheduledTask task = getTask(id);
        if(task == null) {
            throw new NoSuchElementException("Cannot find the task: "+ id);
        }

        task.setEnabled(enabled);
    }

    public void saveTasks() {
        Storage.get().setStoredData(StorageKey.SCHEDULED_TASKS, tasks);
    }
}

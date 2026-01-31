package net.opanel.task;

import com.cronutils.model.Cron;
import com.cronutils.model.time.ExecutionTime;

import java.util.List;

public class ScheduledTask {
    private final String id;
    private String name;
    private Cron cron;
    private List<String> commands;
    private boolean enabled;

    public ScheduledTask(String id, String name, Cron cron, List<String> commands, boolean enabled) {
        this.id = id;
        this.name = name;
        this.cron = cron;
        this.commands = commands;
        this.enabled = enabled;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Cron getCron() {
        return cron;
    }

    public void setCron(Cron cron) {
        this.cron = cron;
    }

    public List<String> getCommands() {
        return commands;
    }

    public void setCommands(List<String> commands) {
        this.commands = commands;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}

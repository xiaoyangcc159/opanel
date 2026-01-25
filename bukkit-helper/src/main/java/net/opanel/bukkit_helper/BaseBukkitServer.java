package net.opanel.bukkit_helper;

import net.opanel.common.OPanelPlayer;
import net.opanel.common.OPanelPlugin;
import net.opanel.common.OPanelServer;
import org.bukkit.*;
import org.bukkit.help.HelpTopic;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.PluginDescriptionFile;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public abstract class BaseBukkitServer implements OPanelServer {
    protected final JavaPlugin plugin;
    protected final TaskRunner runner;
    protected final Server server;

    public BaseBukkitServer(JavaPlugin plugin, Server server) {
        this.plugin = plugin;
        runner = (TaskRunner) plugin;
        this.server = server;
    }

    @Override
    public String getMotd() {
        return server.getMotd();
    }

    @Override
    public String getVersion() {
        // getBukkitVersion() -> "<MinecraftVersion>-R0.x-SNAPSHOT"
        return server.getBukkitVersion().split("-")[0];
    }

    @Override
    public int getPort() {
        return server.getPort();
    }

    @Override
    public void saveAll() {
        runner.runTask(() -> {
            for(World world : server.getWorlds()) {
                world.save();
            }
            server.savePlayers();
        });
    }

    @Override
    public int getMaxPlayerCount() {
        return server.getMaxPlayers();
    }

    @Override
    public OPanelPlayer getPlayer(String uuid) {
        for(OPanelPlayer player : getPlayers()) {
            if(player.getUUID().equals(uuid)) {
                return player;
            }
        }
        return null;
    }

    @Override
    public void removePlayerData(String uuid) throws IOException {
        final Path playerDataFolder = server.getWorlds().get(0).getWorldFolder().toPath().resolve("playerdata");
        Files.deleteIfExists(playerDataFolder.resolve(uuid +".dat"));
        Files.deleteIfExists(playerDataFolder.resolve(uuid +".dat_old"));
    }

    @Override
    public List<String> getBannedIps() {
        return new ArrayList<>(server.getIPBans());
    }

    @Override
    public boolean isWhitelistEnabled() {
        return server.hasWhitelist();
    }

    @Override
    public void setWhitelistEnabled(boolean enabled) {
        runner.runTask(() -> server.setWhitelist(enabled));
    }

    @Override
    public List<String> getCommands() {
        List<String> commands = new ArrayList<>();
        for(HelpTopic topic : server.getHelpMap().getHelpTopics()) {
            commands.add(topic.getName().toLowerCase().replaceFirst("/", ""));
        }
        return commands;
    }

    @Override
    public void reload() {
        runner.runTask(server::reload);
    }

    @Override
    public void stop() {
        server.shutdown();
    }

    @Override
    public long getIngameTime() {
        return server.getWorlds().get(0).getTime();
    }

    @Override
    public List<OPanelPlugin> getPlugins() {
        List<OPanelPlugin> plugins = new ArrayList<>();
        Path pluginsPath = getPluginsPath();
        
        // Get loaded plugins from Bukkit
        for(Plugin p : server.getPluginManager().getPlugins()) {
            PluginDescriptionFile desc = p.getDescription();
            String fileName = p.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
            // Extract just the filename
            fileName = fileName.substring(fileName.lastIndexOf('/') + 1);
            
            long fileSize = 0;
            try {
                Path filePath = pluginsPath.resolve(fileName);
                if(Files.exists(filePath)) {
                    fileSize = Files.size(filePath);
                }
            } catch (IOException e) {
                //
            }
            
            plugins.add(new OPanelPlugin(
                fileName,
                desc.getName(),
                desc.getVersion(),
                desc.getDescription(),
                desc.getAuthors(),
                fileSize,
                p.isEnabled(),
                true
            ));
        }
        
        // Scan for disabled plugins (.jar.disabled files)
        try(Stream<Path> stream = Files.list(pluginsPath)) {
            stream.filter(path -> path.toString().endsWith(".jar"+ OPanelPlugin.DISABLED_SUFFIX))
                .forEach(path -> {
                    try {
                        String fileName = path.getFileName().toString();
                        long fileSize = Files.size(path);
                        plugins.add(OPanelPlugin.createDisabled(fileName, fileSize));
                    } catch (IOException e) {
                        //
                    }
                });
        } catch (IOException e) {
            //
        }
        
        return plugins;
    }

    @Override
    public Path getPluginsPath() {
        return plugin.getDataFolder().getParentFile().toPath();
    }

    @Override
    public void togglePlugin(String fileName) throws IOException {
        Path pluginsPath = getPluginsPath();
        
        if(fileName.endsWith(OPanelPlugin.DISABLED_SUFFIX)) {
            // Enable: rename from .jar.disabled to .jar
            Path disabledPath = pluginsPath.resolve(fileName);
            if(!Files.exists(disabledPath)) {
                throw new IOException("Plugin file not found: " + fileName);
            }
            String enabledName = fileName.substring(0, fileName.length() - OPanelPlugin.DISABLED_SUFFIX.length()); // remove ".disabled"
            Path enabledPath = pluginsPath.resolve(enabledName);
            Files.move(disabledPath, enabledPath);
        } else {
            // Disable: rename from .jar to .jar.disabled
            Path enabledPath = pluginsPath.resolve(fileName);
            if(!Files.exists(enabledPath)) {
                throw new IOException("Plugin file not found: " + fileName);
            }
            Path disabledPath = pluginsPath.resolve(fileName + OPanelPlugin.DISABLED_SUFFIX);
            Files.move(enabledPath, disabledPath);
        }
    }

    @Override
    public void deletePlugin(String fileName) throws IOException {
        Path pluginsPath = getPluginsPath();
        Path filePath = pluginsPath.resolve(fileName);
        
        if(!Files.exists(filePath)) {
            // Try with .disabled suffix
            filePath = pluginsPath.resolve(fileName + OPanelPlugin.DISABLED_SUFFIX);
        }
        
        if(!Files.exists(filePath)) {
            throw new IOException("Plugin file not found: " + fileName);
        }
        
        Files.delete(filePath);
    }
}


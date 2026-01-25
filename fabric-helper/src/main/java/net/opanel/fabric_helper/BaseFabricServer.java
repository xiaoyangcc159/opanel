package net.opanel.fabric_helper;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.tree.CommandNode;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import net.fabricmc.loader.api.metadata.ModMetadata;
import net.fabricmc.loader.api.metadata.Person;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.command.CommandManager;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.util.WorldSavePath;
import net.opanel.common.OPanelPlayer;
import net.opanel.common.OPanelPlugin;
import net.opanel.common.OPanelServer;
import net.opanel.common.ServerType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.stream.Stream;

public abstract class BaseFabricServer implements OPanelServer {
    protected final MinecraftServer server;

    public BaseFabricServer(MinecraftServer server) {
        this.server = server;
    }

    @Override
    public ServerType getServerType() {
        return ServerType.FABRIC;
    }

    @Override
    public String getMotd() {
        return server.getServerMotd();
    }

    @Override
    public void setMotd(String motd) throws IOException {
        // Call setMotd() first
        server.setMotd(motd);
        // Directly modify motd in server.properties
        String formatted = motd.replaceAll("\n", Matcher.quoteReplacement("\\n"));
        OPanelServer.writePropertiesContent(OPanelServer.getPropertiesContent().replaceAll("motd=.+", Matcher.quoteReplacement("motd="+ formatted)));
    }

    @Override
    public String getVersion() {
        return server.getVersion();
    }

    @Override
    public int getPort() {
        return server.getServerPort();
    }

    @Override
    public void saveAll() {
        server.saveAll(true, true, true);
    }

    @Override
    public int getMaxPlayerCount() {
        return server.getMaxPlayerCount();
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
        final Path playerDataFolder = server.getSavePath(WorldSavePath.PLAYERDATA);
        Files.deleteIfExists(playerDataFolder.resolve(uuid +".dat"));
        Files.deleteIfExists(playerDataFolder.resolve(uuid +".dat_old"));
    }

    @Override
    public List<String> getCommands() {
        List<String> commands = new ArrayList<>();
        CommandDispatcher<ServerCommandSource> dispatcher = server.getCommandManager().getDispatcher();
        for(CommandNode<ServerCommandSource> node : dispatcher.getRoot().getChildren()) {
            commands.add(node.getName());
        }
        return commands;
    }

    @Override
    public List<String> getCommandTabList(int argIndex, String command) {
        if(argIndex == 1) return getCommands();

        List<String> tabList = new ArrayList<>();
        String[] args = command.split(" ");
        CommandDispatcher<ServerCommandSource> dispatcher = server.getCommandManager().getDispatcher();
        CommandNode<ServerCommandSource> currentNode = dispatcher.getRoot();
        for(int i = 0; i <= args.length; i++) {
            if(currentNode == null) break;
            if(i + 1 == argIndex) {
                for(CommandNode<ServerCommandSource> subNode : currentNode.getChildren()) {
                    tabList.add(subNode.getName());
                }
                break;
            }
            if(i == args.length) break;
            currentNode = currentNode.getChild(args[i]);
        }
        return tabList;
    }

    @Override
    public void reload() {
        // directly execute /reload
        sendServerCommand("reload");
    }

    @Override
    public void stop() {
        server.stop(false);
    }

    @Override
    public long getIngameTime() {
        return server.getOverworld().getTimeOfDay();
    }

    @Override
    public List<OPanelPlugin> getPlugins() {
        List<OPanelPlugin> mods = new ArrayList<>();
        Path modsPath = getPluginsPath();
        
        // Get loaded mods from FabricLoader
        for(ModContainer modContainer : FabricLoader.getInstance().getAllMods()) {
            ModMetadata metadata = modContainer.getMetadata();
            
            // Skip built-in mods (fabric-api internals, minecraft, java, etc.)
            String modId = metadata.getId();
            if(modId.equals("minecraft") || modId.equals("java") || modId.equals("fabricloader")) {
                continue;
            }
            
            // Try to find the mod file
            String fileName = modId + ".jar"; // Default name
            long fileSize = 0;
            
            // Try to get the actual file from the mod's origin
            List<Path> origins = modContainer.getOrigin().getPaths();
            if(!origins.isEmpty() && Files.exists(origins.get(0))) {
                fileName = origins.get(0).getFileName().toString();
                try {
                    fileSize = Files.size(origins.get(0));
                } catch (IOException e) {
                    //
                }
            }
            
            // Get authors
            List<String> authorList = new ArrayList<>();
            for(Person author : metadata.getAuthors()) {
                authorList.add(author.getName());
            }
            
            mods.add(new OPanelPlugin(
                fileName,
                metadata.getName(),
                metadata.getVersion().getFriendlyString(),
                metadata.getDescription(),
                authorList,
                fileSize,
                true, // All loaded mods are enabled
                true  // All loaded mods are loaded
            ));
        }
        
        // Scan for disabled mods (.jar.disabled files)
        try(Stream<Path> stream = Files.list(modsPath)) {
            stream.filter(path -> path.toString().endsWith(".jar"+ OPanelPlugin.DISABLED_SUFFIX))
                .forEach(path -> {
                    try {
                        String fileName = path.getFileName().toString();
                        long fileSize = Files.size(path);
                        mods.add(OPanelPlugin.createDisabled(fileName, fileSize));
                    } catch (IOException e) {
                        //
                    }
                });
        } catch (IOException e) {
            //
        }
        
        return mods;
    }

    @Override
    public Path getPluginsPath() {
        return Paths.get("").resolve("mods").toAbsolutePath();
    }

    @Override
    public void togglePlugin(String fileName) throws IOException {
        Path modsPath = getPluginsPath();
        
        if(fileName.endsWith(OPanelPlugin.DISABLED_SUFFIX)) {
            // Enable: rename from .jar.disabled to .jar
            Path disabledPath = modsPath.resolve(fileName);
            if(!Files.exists(disabledPath)) {
                throw new IOException("Mod file not found: " + fileName);
            }
            String enabledName = fileName.substring(0, fileName.length() - OPanelPlugin.DISABLED_SUFFIX.length()); // remove ".disabled"
            Path enabledPath = modsPath.resolve(enabledName);
            Files.move(disabledPath, enabledPath);
        } else {
            // Disable: rename from .jar to .jar.disabled
            Path enabledPath = modsPath.resolve(fileName);
            if(!Files.exists(enabledPath)) {
                throw new IOException("Mod file not found: " + fileName);
            }
            Path disabledPath = modsPath.resolve(fileName + OPanelPlugin.DISABLED_SUFFIX);
            Files.move(enabledPath, disabledPath);
        }
    }

    @Override
    public void deletePlugin(String fileName) throws IOException {
        Path modsPath = getPluginsPath();
        Path filePath = modsPath.resolve(fileName);
        
        if(!Files.exists(filePath)) {
            // Try with .disabled suffix
            filePath = modsPath.resolve(fileName + OPanelPlugin.DISABLED_SUFFIX);
        }
        
        if(!Files.exists(filePath)) {
            throw new IOException("Mod file not found: " + fileName);
        }
        
        Files.delete(filePath);
    }
}


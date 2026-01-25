package net.opanel.controller.api;

import io.javalin.http.*;
import net.opanel.OPanel;
import net.opanel.common.OPanelPlugin;
import net.opanel.controller.BaseController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class PluginsController extends BaseController {
    private final DownloadController downloadController = getControllerInstance(DownloadController.class);

    public PluginsController(OPanel plugin) {
        super(plugin);
    }

    /**
     * GET /api/plugins - Get all plugins (including disabled ones)
     */
    public Handler getPlugins = ctx -> {
        HashMap<String, Object> obj = new HashMap<>();

        List<HashMap<String, Object>> plugins = new ArrayList<>();
        for (OPanelPlugin p : server.getPlugins()) {
            HashMap<String, Object> pluginInfo = new HashMap<>();
            pluginInfo.put("fileName", p.getFileName());
            pluginInfo.put("name", p.getName());
            pluginInfo.put("version", p.getVersion());
            pluginInfo.put("description", p.getDescription());
            pluginInfo.put("authors", p.getAuthors());
            pluginInfo.put("fileSize", p.getFileSize());
            pluginInfo.put("enabled", p.isEnabled());
            pluginInfo.put("loaded", p.isLoaded());
            plugins.add(pluginInfo);
        }
        obj.put("plugins", plugins);
        obj.put("pluginsPath", server.getPluginsPath().toString());

        sendResponse(ctx, obj);
    };

    /**
     * POST /api/plugins - Upload a new plugin
     */
    public Handler uploadPlugin = ctx -> {
        try {
            UploadedFile file = ctx.uploadedFile("file");
            if (file == null || file.size() <= 0) {
                sendResponse(ctx, HttpStatus.BAD_REQUEST, "File is missing.");
                return;
            }

            final String fileName = file.filename();
            if (!fileName.endsWith(".jar")) {
                sendResponse(ctx, HttpStatus.BAD_REQUEST, "Plugin file should be a .jar file.");
                return;
            }

            final Path pluginsPath = server.getPluginsPath();
            final Path targetPath = pluginsPath.resolve(fileName);
            
            // Check if file already exists (either enabled or disabled)
            if (Files.exists(targetPath) || Files.exists(pluginsPath.resolve(fileName + ".disabled"))) {
                sendResponse(ctx, HttpStatus.CONFLICT, "Plugin file already exists.");
                return;
            }

            // Copy file to plugins directory
            try (InputStream is = file.content()) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            sendResponse(ctx, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(ctx, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    };

    /**
     * POST /api/plugins/{fileName}/toggle - Toggle plugin enabled/disabled status
     */
    public Handler togglePlugin = ctx -> {
        final String fileName = ctx.pathParam("fileName");

        try {
            server.togglePlugin(fileName);
            sendResponse(ctx, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            sendResponse(ctx, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    };

    /**
     * DELETE /api/plugins/{fileName} - Delete a plugin file
     */
    public Handler deletePlugin = ctx -> {
        final String fileName = ctx.pathParam("fileName");

        try {
            server.deletePlugin(fileName);
            sendResponse(ctx, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            sendResponse(ctx, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    };

    /**
     * GET /api/plugins/{fileName}/download - Download a plugin file
     */
    public Handler downloadPlugin = ctx -> {
        final String fileName = ctx.pathParam("fileName");

        final Path pluginsPath = server.getPluginsPath();
        Path filePath = pluginsPath.resolve(fileName);
        
        // Also check for disabled version
        if (!Files.exists(filePath)) {
            filePath = pluginsPath.resolve(fileName + ".disabled");
        }
        
        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            sendResponse(ctx, HttpStatus.NOT_FOUND, "Cannot find the specified plugin.");
            return;
        }

        try {
            // Copy to temp dir for download
            Path tempPath = OPanel.TMP_DIR_PATH.resolve(UUID.randomUUID() + ".jar");
            Files.copy(filePath, tempPath, StandardCopyOption.REPLACE_EXISTING);

            Path finalFilePath = filePath;
            final String downloadId = downloadController.registerPath(tempPath, () -> {
                Files.deleteIfExists(tempPath);
            });

            HashMap<String, Object> obj = new HashMap<>();
            obj.put("download", downloadId);
            sendResponse(ctx, obj);
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(ctx, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    };
}

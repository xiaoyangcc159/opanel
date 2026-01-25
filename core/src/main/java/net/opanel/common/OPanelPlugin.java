package net.opanel.common;

import java.util.List;

/**
 * Represents a plugin or mod installed on the server
 */
public class OPanelPlugin {
    public static final String DISABLED_SUFFIX = ".disabled";

    private final String fileName;
    private final String name;
    private final String version;
    private final String description;
    private final List<String> authors;
    private final long fileSize;
    private final boolean enabled;
    private final boolean loaded;

    public OPanelPlugin(String fileName, String name, String version, String description, List<String> authors, long fileSize, boolean enabled, boolean loaded) {
        this.fileName = fileName;
        this.name = name;
        this.version = version;
        this.description = description;
        this.authors = authors;
        this.fileSize = fileSize;
        this.enabled = enabled;
        this.loaded = loaded;
    }

    /**
     * Create a plugin from a disabled file (only filename and size available)
     */
    public static OPanelPlugin createDisabled(String fileName, long fileSize) {
        // Remove .disabled suffix to get original name
        String originalFileName = fileName.endsWith(DISABLED_SUFFIX)
            ? fileName.substring(0, fileName.length() - 9) 
            : fileName;
        String name = originalFileName.replace(".jar", "");
        return new OPanelPlugin(fileName, name, "Unknown", null, null, fileSize, false, false);
    }

    public String getFileName() {
        return fileName;
    }

    public String getName() {
        return name;
    }

    public String getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getAuthors() {
        return authors;
    }

    public long getFileSize() {
        return fileSize;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isLoaded() {
        return loaded;
    }
}

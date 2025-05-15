package org.bigbluebutton.api.domain;

public class PluginManifest {

    private static String htmlPluginSdkVersion;
    private String url = "";
    private String checksum = "";
    public PluginManifest(
            String url,
             String checksum) {
        this.url = url;
        this.checksum = checksum;
    }
    public PluginManifest(
            String url) {
        this.url = url;
    }

    public static String replaceAllPlaceholdersInManifestUrls(String url) {
        return url.replaceAll("%%HTML_PLUGIN_SDK_VERSION%%", htmlPluginSdkVersion);
    }

    public String getUrl() {
        return replaceAllPlaceholdersInManifestUrls(url);
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    static public void setHtmlPluginSdkVersion(String contextHtmlPluginSdkVersion) {
        htmlPluginSdkVersion = contextHtmlPluginSdkVersion;
    }
}
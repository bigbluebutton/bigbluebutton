package org.bigbluebutton.api.domain;

import java.util.Arrays;
import java.util.List;



public class PluginManifest {

    private static final String HTML5_PLUGIN_SDK_VERSION = "%%HTML5_PLUGIN_SDK_VERSION%%";
    private static final String BBB_VERSION = "%%BBB_VERSION%%";
    private static final String MEETING_ID = "%%MEETING_ID%%";
    private static String bbbVersion;
    private static String html5PluginSdkVersion;
    private String meetingId;
    private String url = "";
    private String checksum = "";
    private static final List<String> LIST_PLACEHOLDERS_FOR_MANIFEST_URLS = Arrays.asList(
        HTML5_PLUGIN_SDK_VERSION,
        BBB_VERSION,
        MEETING_ID
    );
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


    public static String replaceAllPlaceholdersInManifestUrls(String url, String meetingId) {
        return LIST_PLACEHOLDERS_FOR_MANIFEST_URLS.stream().reduce(
                url, (resultingUrl, placeholder) -> switch (placeholder) {
                case HTML5_PLUGIN_SDK_VERSION -> resultingUrl.replaceAll(HTML5_PLUGIN_SDK_VERSION, html5PluginSdkVersion);
                case BBB_VERSION -> resultingUrl.replaceAll(BBB_VERSION, bbbVersion);
                case MEETING_ID -> resultingUrl.replaceAll(MEETING_ID, meetingId);
                default -> resultingUrl;
        });
    }

    public static void setBbbVersion(String version) {
        bbbVersion = version;
    }

    public String getUrl() {
        return replaceAllPlaceholdersInManifestUrls(url, meetingId);
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

    static public void setHtml5PluginSdkVersion(String contextHtml5PluginSdkVersion) {
        html5PluginSdkVersion = contextHtml5PluginSdkVersion;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }
}
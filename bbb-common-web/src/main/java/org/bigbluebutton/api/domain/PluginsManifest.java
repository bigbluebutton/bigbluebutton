package org.bigbluebutton.api.domain;

import java.util.Vector;

public class PluginsManifest {

    private String url = "";
    private String checksum = "";
    public PluginsManifest(
            String url,
             String checksum) {
        this.url = url;
        this.checksum = checksum;
    }
    public PluginsManifest(
            String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
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
}
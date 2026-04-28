package org.bigbluebutton.api.service;

import java.net.InetAddress;

public record ValidatedUrl(
        String originalUrl,
        String host,
        int port,
        String protocol,
        String path,
        InetAddress[] resolvedAddresses
) {
    public int effectivePort() {
        if (port != -1) {
            return port;
        }
        return "https".equalsIgnoreCase(protocol) ? 443 : 80;
    }

    public boolean isHttps() {
        return "https".equalsIgnoreCase(protocol);
    }

    public InetAddress primaryAddress() {
        return resolvedAddresses[0];
    }

    public String primaryIpAddress() {
        return primaryAddress().getHostAddress();
    }
}

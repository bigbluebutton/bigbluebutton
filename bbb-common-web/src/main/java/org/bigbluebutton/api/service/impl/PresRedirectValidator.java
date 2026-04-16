package org.bigbluebutton.api.service.impl;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bigbluebutton.api.service.RedirectValidator;
import org.bigbluebutton.api.service.ValidatedUrl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.*;
import java.util.ArrayList;
import java.util.List;

public class PresRedirectValidator implements RedirectValidator {
    private List<String> fetchUrlSupportedProtocols;
    private List<String> fetchUrlBlockedExternalHosts;
    private List<String> fetchUrlAllowedLocalHosts = new ArrayList<>();
    private String defaultUploadedPresentation;
    private static final Logger log = LoggerFactory.getLogger(PresRedirectValidator.class);

    public boolean isRedirectValid(String redirectUrl) {
        log.info("Validating redirect URL [{}]", redirectUrl);
        URL url;

        try {
            url = new URL(redirectUrl);
            String protocol = url.getProtocol();
            String host = url.getHost();

            if (fetchUrlSupportedProtocols.stream().noneMatch(p -> p.equalsIgnoreCase(protocol))) {
                if (fetchUrlSupportedProtocols.size() == 1 && fetchUrlSupportedProtocols.get(0).equalsIgnoreCase("all")) {
                    log.warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS.");
                } else {
                    log.error("Invalid protocol [{}]", protocol);
                    return false;
                }
            }

            if (fetchUrlBlockedExternalHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host))) {
                log.error("Attempted to download from blocked host [{}]", host);
                return false;
            }
        } catch (MalformedURLException e) {
            log.error("Malformed URL [{}]", redirectUrl);
            return false;
        }

        // Skip local address checks for default presentation
        if (redirectUrl.equals(defaultUploadedPresentation)) {
            return true;
        }

        boolean isAllowedLocalHost = fetchUrlAllowedLocalHosts.stream()
                .anyMatch(h -> h.equalsIgnoreCase(url.getHost()));

        try {
            InetAddress[] addresses = InetAddress.getAllByName(url.getHost());
            InetAddressValidator validator = InetAddressValidator.getInstance();

            for (InetAddress address : addresses) {
                if (!validator.isValid(address.getHostAddress())) {
                    log.error("Invalid address [{}]", address.getHostAddress());
                    return false;
                }

                // Skip local address checks for allowed local hosts
                if (isAllowedLocalHost) {
                    continue;
                }

                if (address instanceof Inet6Address inet6) {
                    if (isNotGlobalUnicastIPv6(inet6)) {
                        log.error("Address [{}] is not a globally routable IPv6 address", address.getHostAddress());
                        return false;
                    }
                } else {
                    if (address.isAnyLocalAddress()) {
                        log.error("Address [{}] is a local address", address.getHostAddress());
                        return false;
                    }

                    if (address.isLoopbackAddress()) {
                        log.error("Address [{}] is a loopback address", address.getHostAddress());
                        return false;
                    }

                    if (address.isSiteLocalAddress()) {
                        log.error("Address [{}] is a private/site-local address", address.getHostAddress());
                        return false;
                    }

                    if (address.isLinkLocalAddress()) {
                        log.error("Address [{}] is a link local address", address.getHostAddress());
                        return false;
                    }
                }
            }
        } catch (UnknownHostException e) {
            log.error("Unknown host [{}]", url.getHost());
            return false;
        }

        return true;
    }

    @Override
    public ValidatedUrl validateUrl(String redirectUrl) {
        log.info("Validating and resolving URL [{}]", redirectUrl);
        URL url;

        try {
            url = new URL(redirectUrl);
        } catch (MalformedURLException e) {
            log.error("Malformed URL [{}]", redirectUrl);
            return null;
        }

        String protocol = url.getProtocol();
        String host = url.getHost();
        int port = url.getPort();
        String path = url.getFile(); // includes query string

        // Validate protocol
        if (fetchUrlSupportedProtocols.stream().noneMatch(p -> p.equalsIgnoreCase(protocol))) {
            if (fetchUrlSupportedProtocols.size() == 1 && fetchUrlSupportedProtocols.get(0).equalsIgnoreCase("all")) {
                log.warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS.");
            } else {
                log.error("Invalid protocol [{}]", protocol);
                return null;
            }
        }

        // Check blocked hosts
        if (fetchUrlBlockedExternalHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host))) {
            log.error("Attempted to download from blocked host [{}]", host);
            return null;
        }

        // Resolve DNS once and validate all resolved addresses
        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(host);
        } catch (UnknownHostException e) {
            log.error("Unknown host [{}]", host);
            return null;
        }

        if (addresses.length == 0) {
            log.error("No addresses resolved for host [{}]", host);
            return null;
        }

        InetAddressValidator validator = InetAddressValidator.getInstance();
        boolean isDefaultPresentation = redirectUrl.equals(defaultUploadedPresentation);
        boolean isAllowedLocalHost = fetchUrlAllowedLocalHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host));

        // Validate all resolved addresses
        for (InetAddress address : addresses) {
            if (!validator.isValid(address.getHostAddress())) {
                log.error("Invalid address [{}]", address.getHostAddress());
                return null;
            }

            // Skip local address checks for default presentation or allowed local hosts
            if (isDefaultPresentation || isAllowedLocalHost) {
                continue;
            }

            if (address instanceof Inet6Address inet6) {
                if (isNotGlobalUnicastIPv6(inet6)) {
                    log.error("Address [{}] is not a globally routable IPv6 address", address.getHostAddress());
                    return null;
                }
            } else {
                if (address.isAnyLocalAddress()) {
                    log.error("Address [{}] is a local address", address.getHostAddress());
                    return null;
                }

                if (address.isLoopbackAddress()) {
                    log.error("Address [{}] is a loopback address", address.getHostAddress());
                    return null;
                }

                if (address.isSiteLocalAddress()) {
                    log.error("Address [{}] is a private/site-local address", address.getHostAddress());
                    return null;
                }

                if (address.isLinkLocalAddress()) {
                    log.error("Address [{}] is a link local address", address.getHostAddress());
                    return null;
                }
            }
        }

        // Return all validated addresses for subsequent connections
        log.info("URL [{}] validated, resolved to {} address(es): {}", redirectUrl, addresses.length,
                java.util.Arrays.stream(addresses).map(InetAddress::getHostAddress).toList());

        return new ValidatedUrl(redirectUrl, host, port, protocol, path, addresses);
    }

    public void setFetchUrlSupportedProtocols(List<String> fetchUrlSupportedProtocols) {
        this.fetchUrlSupportedProtocols = fetchUrlSupportedProtocols;
    }

    public void setFetchUrlBlockedExternalHosts(List<String> fetchUrlBlockedExternalHosts) {
        this.fetchUrlBlockedExternalHosts = fetchUrlBlockedExternalHosts;
    }

    public void setFetchUrlAllowedLocalHosts(List<String> fetchUrlAllowedLocalHosts) {
        this.fetchUrlAllowedLocalHosts = fetchUrlAllowedLocalHosts != null ? fetchUrlAllowedLocalHosts : new ArrayList<>();
    }

    public void setDefaultUploadedPresentation(String defaultUploadedPresentation) {
        this.defaultUploadedPresentation = defaultUploadedPresentation;
    }

    private boolean isNotGlobalUnicastIPv6(Inet6Address address) {
        byte[] bytes = address.getAddress();
        // Global unicast is 2000::/3 — first 3 bits must be 001
        if ((bytes[0] & 0xE0) != 0x20) return true;
        // 6to4 (2002::/16) embeds arbitrary IPv4 in bytes 2-3; block it explicitly
        return bytes[0] == 0x20 && bytes[1] == 0x02;
    }
}

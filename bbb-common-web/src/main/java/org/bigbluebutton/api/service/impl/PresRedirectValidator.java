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
    private List<String> insertDocumentSupportedProtocols;
    private List<String> insertDocumentBlockedHosts;
    private List<String> insertDocumentAllowedLocalHosts = new ArrayList<>();
    private String defaultUploadedPresentation;
    private static final Logger log = LoggerFactory.getLogger(PresRedirectValidator.class);

    public boolean isRedirectValid(String redirectUrl) {
        log.info("Validating redirect URL [{}]", redirectUrl);
        URL url;

        try {
            url = new URL(redirectUrl);
            String protocol = url.getProtocol();
            String host = url.getHost();

            if(insertDocumentSupportedProtocols.stream().noneMatch(p -> p.equalsIgnoreCase(protocol))) {
                if(insertDocumentSupportedProtocols.size() == 1 && insertDocumentSupportedProtocols.get(0).equalsIgnoreCase("all")) {
                    log.warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS.");
                } else {
                    log.error("Invalid protocol [{}]", protocol);
                    return false;
                }
            }

            if(insertDocumentBlockedHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host))) {
                log.error("Attempted to download from blocked host [{}]", host);
                return false;
            }
        } catch(MalformedURLException e) {
            log.error("Malformed URL [{}]", redirectUrl);
            return false;
        }

        try {
            InetAddress[] addresses = InetAddress.getAllByName(url.getHost());
            InetAddressValidator validator = InetAddressValidator.getInstance();

            boolean localhostBlocked = insertDocumentBlockedHosts.stream().anyMatch(h -> h.equalsIgnoreCase("localhost"));

            for(InetAddress address: addresses) {
                if(!validator.isValid(address.getHostAddress())) {
                    log.error("Invalid address [{}]", address.getHostAddress());
                    return false;
                }

                if (redirectUrl.equalsIgnoreCase(defaultUploadedPresentation)) {
                    return true;
                }

                if (!localhostBlocked) {
                    return true;
                }

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
        } catch(UnknownHostException e) {
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
        if (insertDocumentSupportedProtocols.stream().noneMatch(p -> p.equalsIgnoreCase(protocol))) {
            if (insertDocumentSupportedProtocols.size() == 1 && insertDocumentSupportedProtocols.get(0).equalsIgnoreCase("all")) {
                log.warn("Warning: All protocols are supported for presentation download. It is recommended to only allow HTTPS.");
            } else {
                log.error("Invalid protocol [{}]", protocol);
                return null;
            }
        }

        // Check blocked hosts
        if (insertDocumentBlockedHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host))) {
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
        boolean localhostBlocked = insertDocumentBlockedHosts.stream().anyMatch(h -> h.equalsIgnoreCase("localhost"));
        boolean isDefaultPresentation = redirectUrl.equalsIgnoreCase(defaultUploadedPresentation);
        boolean isAllowedLocalHost = insertDocumentAllowedLocalHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host));

        // Validate all resolved addresses
        for (InetAddress address : addresses) {
            if (!validator.isValid(address.getHostAddress())) {
                log.error("Invalid address [{}]", address.getHostAddress());
                return null;
            }

            // Skip local address checks for default presentation or allowed local hosts
            if (isDefaultPresentation || isAllowedLocalHost || !localhostBlocked) {
                continue;
            }

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

            if (address instanceof Inet6Address) {
                if (isUniqueLocalAddress(address)) {
                    log.error("Address [{}] is a private IPv6 ULA", address.getHostAddress());
                    return null;
                }
            }
        }

        // Return all validated addresses for subsequent connections
        log.info("URL [{}] validated, resolved to {} address(es): {}", redirectUrl, addresses.length,
                java.util.Arrays.stream(addresses).map(InetAddress::getHostAddress).toList());

        return new ValidatedUrl(redirectUrl, host, port, protocol, path, addresses);
    }

    public void setInsertDocumentSupportedProtocols(List<String> insertDocumentSupportedProtocols) {
        this.insertDocumentSupportedProtocols = insertDocumentSupportedProtocols;
    }

    public void setInsertDocumentBlockedHosts(List<String> insertDocumentBlockedHosts) {
        this.insertDocumentBlockedHosts = insertDocumentBlockedHosts;
    }

    public void setInsertDocumentAllowedLocalHosts(List<String> insertDocumentAllowedLocalHosts) {
        this.insertDocumentAllowedLocalHosts = insertDocumentAllowedLocalHosts != null ? insertDocumentAllowedLocalHosts : new ArrayList<>();
    }

    public void setDefaultUploadedPresentation(String defaultUploadedPresentation) {
        this.defaultUploadedPresentation = defaultUploadedPresentation;
    }

    private boolean isUniqueLocalAddress(InetAddress address) {
        if (!(address instanceof Inet6Address)) {
            return false;
        }
        byte[] bytes = address.getAddress();
        return (bytes[0] & 0xFE) == 0xFC;
    }
}

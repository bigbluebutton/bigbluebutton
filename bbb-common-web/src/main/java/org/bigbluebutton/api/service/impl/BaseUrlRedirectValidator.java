package org.bigbluebutton.api.service.impl;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bigbluebutton.api.service.RedirectValidator;
import org.bigbluebutton.api.service.ValidatedUrl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Base class for URL redirect validators that apply consistent security rules:
 * protocol allowlist, blocked external hosts, allowed local hosts, and DNS
 * rebinding protection via IP address resolution and validation.
 *
 * Subclasses may override {@link #isUrlBypassed(String)} to skip local-address
 * checks for specific URLs (e.g. the default uploaded presentation).
 */
public abstract class BaseUrlRedirectValidator implements RedirectValidator {

    private static final Logger log = LoggerFactory.getLogger(BaseUrlRedirectValidator.class);

    protected List<String> fetchUrlSupportedProtocols = new ArrayList<>();
    protected List<String> fetchUrlBlockedExternalHosts = new ArrayList<>();
    protected List<String> fetchUrlAllowedLocalHosts = new ArrayList<>();

    /**
     * Subclasses override this to whitelist specific URLs from local-address checks.
     */
    protected boolean isUrlBypassed(String redirectUrl) {
        return false;
    }

    @Override
    public boolean isRedirectValid(String redirectUrl) {
        log.info("Validating redirect URL [{}]", redirectUrl);

        URL url;
        try {
            url = new URL(redirectUrl);
        } catch (MalformedURLException e) {
            log.error("Malformed URL [{}]", redirectUrl);
            return false;
        }

        String protocol = url.getProtocol();
        String host = url.getHost();

        if (!isProtocolAllowed(protocol)) {
            return false;
        }

        if (isHostBlocked(host)) {
            return false;
        }

        if (isUrlBypassed(redirectUrl)) {
            return true;
        }

        boolean isAllowedLocalHost = fetchUrlAllowedLocalHosts.stream()
                .anyMatch(h -> h.equalsIgnoreCase(host));

        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            InetAddressValidator validator = InetAddressValidator.getInstance();

            for (InetAddress address : addresses) {
                if (!validator.isValid(address.getHostAddress())) {
                    log.error("Invalid address [{}]", address.getHostAddress());
                    return false;
                }

                if (isAllowedLocalHost) {
                    continue;
                }

                if (!isAddressPubliclyRoutable(address)) {
                    return false;
                }
            }
        } catch (UnknownHostException e) {
            log.error("Unknown host [{}]", host);
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
        String path = url.getFile();

        if (!isProtocolAllowed(protocol)) {
            return null;
        }

        if (isHostBlocked(host)) {
            return null;
        }

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
        boolean bypassed = isUrlBypassed(redirectUrl);
        boolean isAllowedLocalHost = fetchUrlAllowedLocalHosts.stream()
                .anyMatch(h -> h.equalsIgnoreCase(host));

        for (InetAddress address : addresses) {
            if (!validator.isValid(address.getHostAddress())) {
                log.error("Invalid address [{}]", address.getHostAddress());
                return null;
            }

            if (bypassed || isAllowedLocalHost) {
                continue;
            }

            if (!isAddressPubliclyRoutable(address)) {
                return null;
            }
        }

        log.info("URL [{}] validated, resolved to {} address(es): {}", redirectUrl, addresses.length,
                java.util.Arrays.stream(addresses).map(InetAddress::getHostAddress).toList());

        return new ValidatedUrl(redirectUrl, host, port, protocol, path, addresses);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private boolean isProtocolAllowed(String protocol) {
        if (fetchUrlSupportedProtocols.isEmpty()) {
            return true;
        }
        if (fetchUrlSupportedProtocols.size() == 1
                && fetchUrlSupportedProtocols.get(0).equalsIgnoreCase("all")) {
            log.warn("Warning: All protocols are supported for URL download. It is recommended to only allow HTTPS.");
            return true;
        }
        if (fetchUrlSupportedProtocols.stream().noneMatch(p -> p.equalsIgnoreCase(protocol))) {
            log.error("Invalid protocol [{}]", protocol);
            return false;
        }
        return true;
    }

    private boolean isHostBlocked(String host) {
        if (fetchUrlBlockedExternalHosts.stream().anyMatch(h -> h.equalsIgnoreCase(host))) {
            log.error("Attempted to download from blocked host [{}]", host);
            return true;
        }
        return false;
    }

    /**
     * Returns true if the address is globally routable (not local/loopback/private/link-local).
     */
    private boolean isAddressPubliclyRoutable(InetAddress address) {
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
        return true;
    }

    private boolean isNotGlobalUnicastIPv6(Inet6Address address) {
        byte[] bytes = address.getAddress();
        // Global unicast is 2000::/3 — first 3 bits must be 001
        if ((bytes[0] & 0xE0) != 0x20) return true;
        // 6to4 (2002::/16) embeds arbitrary IPv4 in bytes 2-3; block it explicitly
        return bytes[0] == 0x20 && bytes[1] == 0x02;
    }

    // -------------------------------------------------------------------------
    // Setters (for Spring injection)
    // -------------------------------------------------------------------------

    public void setFetchUrlSupportedProtocols(List<String> fetchUrlSupportedProtocols) {
        this.fetchUrlSupportedProtocols = fetchUrlSupportedProtocols != null ? fetchUrlSupportedProtocols : new ArrayList<>();
    }

    public void setFetchUrlBlockedExternalHosts(List<String> fetchUrlBlockedExternalHosts) {
        this.fetchUrlBlockedExternalHosts = fetchUrlBlockedExternalHosts != null ? fetchUrlBlockedExternalHosts : new ArrayList<>();
    }

    public void setFetchUrlAllowedLocalHosts(List<String> fetchUrlAllowedLocalHosts) {
        this.fetchUrlAllowedLocalHosts = fetchUrlAllowedLocalHosts != null ? fetchUrlAllowedLocalHosts : new ArrayList<>();
    }
}

package org.bigbluebutton.api.service.impl;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bigbluebutton.api.service.RedirectValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.List;

public class PresRedirectValidator implements RedirectValidator {
    private List<String> insertDocumentSupportedProtocols;
    private List<String> insertDocumentBlockedHosts;
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

    public void setInsertDocumentSupportedProtocols(List<String> insertDocumentSupportedProtocols) {
        this.insertDocumentSupportedProtocols = insertDocumentSupportedProtocols;
    }

    public void setInsertDocumentBlockedHosts(List<String> insertDocumentBlockedHosts) {
        this.insertDocumentBlockedHosts = insertDocumentBlockedHosts;
    }

    public void setDefaultUploadedPresentation(String defaultUploadedPresentation) {
        this.defaultUploadedPresentation = defaultUploadedPresentation;
    }
}

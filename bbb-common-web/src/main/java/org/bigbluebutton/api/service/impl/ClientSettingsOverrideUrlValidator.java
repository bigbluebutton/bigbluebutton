package org.bigbluebutton.api.service.impl;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bigbluebutton.api.service.RedirectValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;

public class ClientSettingsOverrideUrlValidator implements RedirectValidator {
    private static final Logger log = LoggerFactory.getLogger(ClientSettingsOverrideUrlValidator.class);

    public boolean isRedirectValid(String redirectUrl) {
        log.info("Validating clientSettingsOverrideJsonUrl [{}]", redirectUrl);
        URL url;

        try {
            url = new URL(redirectUrl);
        } catch (MalformedURLException e) {
            log.error("Malformed clientSettingsOverrideJsonUrl [{}]", redirectUrl);
            return false;
        }

        try {
            InetAddress[] addresses = InetAddress.getAllByName(url.getHost());
            InetAddressValidator validator = InetAddressValidator.getInstance();

            for (InetAddress address : addresses) {
                if (!validator.isValid(address.getHostAddress())) {
                    log.error("Invalid address [{}] for clientSettingsOverrideJsonUrl", address.getHostAddress());
                    return false;
                }

                if (address.isLoopbackAddress()) {
                    log.error("Loopback address [{}] is not allowed for clientSettingsOverrideJsonUrl", address.getHostAddress());
                    return false;
                }

                if (address.isAnyLocalAddress()) {
                    log.error("Local address [{}] is not allowed for clientSettingsOverrideJsonUrl", address.getHostAddress());
                    return false;
                }

                if (address.isSiteLocalAddress()) {
                    log.error("Site-local address [{}] is not allowed for clientSettingsOverrideJsonUrl", address.getHostAddress());
                    return false;
                }
            }
        } catch (UnknownHostException e) {
            log.error("Unknown host [{}] for clientSettingsOverrideJsonUrl", url.getHost());
            return false;
        }

        return true;
    }
}

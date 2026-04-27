package org.bigbluebutton.api.service.impl;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bigbluebutton.api.service.RedirectValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;

public class SharedNotesRedirectValidatorService implements RedirectValidator {
    private static final Logger log = LoggerFactory.getLogger(SharedNotesRedirectValidatorService.class);
    public boolean isRedirectValid(String redirectUrl) {
        log.info("Validating redirect URL [{}]", redirectUrl);
        URL url;

        try {
            url = new URL(redirectUrl);
        } catch(MalformedURLException e) {
            log.error("Malformed URL [{}]", redirectUrl);
            return false;
        }

        try {
            InetAddress[] addresses = InetAddress.getAllByName(url.getHost());
            InetAddressValidator validator = InetAddressValidator.getInstance();

            for(InetAddress address: addresses) {
                if(!validator.isValid(address.getHostAddress())) {
                    log.error("Invalid address [{}]", address.getHostAddress());
                    return false;
                }
            }
        } catch(UnknownHostException e) {
            log.error("Unknown host [{}]", url.getHost());
            return false;
        }

        return true;
    }
}

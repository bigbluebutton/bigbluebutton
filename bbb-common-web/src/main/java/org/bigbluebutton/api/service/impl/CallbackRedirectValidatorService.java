package org.bigbluebutton.api.service.impl;

/**
 * Redirect validator for callback URLs (endCallbackUrl, meetingEndedURL).
 *
 * Extends {@link BaseUrlRedirectValidator} with the full set of security
 * checks (protocol allowlist, blocked hosts, allowed local hosts, DNS
 * rebinding protection via IP address resolution and validation).
 */
public class CallbackRedirectValidatorService extends BaseUrlRedirectValidator {
    // No additional behaviour needed beyond what BaseUrlRedirectValidator provides.
}

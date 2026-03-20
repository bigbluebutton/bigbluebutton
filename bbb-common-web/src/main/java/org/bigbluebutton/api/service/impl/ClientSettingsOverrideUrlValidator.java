package org.bigbluebutton.api.service.impl;

/**
 * Redirect validator for the clientSettingsOverrideJsonUrl.
 *
 * Extends {@link BaseUrlRedirectValidator} with the full set of security
 * checks (protocol allowlist, blocked hosts, allowed local hosts, DNS
 * rebinding protection) — identical to the presentation validator, but
 * without any bypass for a default URL.
 */
public class ClientSettingsOverrideUrlValidator extends BaseUrlRedirectValidator {
    // No additional behaviour needed beyond what BaseUrlRedirectValidator provides.
}

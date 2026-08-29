package org.bigbluebutton.api.service.impl;

/**
 * Redirect validator for shared notes initial-content URLs
 * (sharedNotesInitialContentJsonUrl, sharedNotesInitialContentMarkdownUrl).
 *
 * Extends {@link BaseUrlRedirectValidator} with the full set of security
 * checks (protocol allowlist, blocked hosts, allowed local hosts, DNS
 * rebinding protection via IP address resolution and validation).
 */
public class SharedNotesRedirectValidatorService extends BaseUrlRedirectValidator {
    // No additional behaviour needed beyond what BaseUrlRedirectValidator provides.
}

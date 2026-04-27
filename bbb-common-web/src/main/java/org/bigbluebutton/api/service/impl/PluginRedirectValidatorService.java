package org.bigbluebutton.api.service.impl;

/**
 * Redirect validator for plugin manifest URL fetches.
 *
 * Inherits the full set of security checks from {@link BaseUrlRedirectValidator}
 * (protocol allowlist, blocked hosts, allowed local hosts, and IPv4/IPv6
 * SSRF protection — loopback, link-local, private, IPv6 non-globally-routable).
 */
public class PluginRedirectValidatorService extends BaseUrlRedirectValidator {
}

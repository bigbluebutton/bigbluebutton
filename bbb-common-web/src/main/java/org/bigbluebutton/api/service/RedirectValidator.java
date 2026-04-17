package org.bigbluebutton.api.service;

public interface RedirectValidator {
    boolean isRedirectValid(String redirectURL);

    /**
     * Validates a URL and returns a ValidatedUrl with the resolved IP address pinned.
     * This prevents DNS rebinding attacks by resolving DNS once and using that IP
     * for all subsequent connections.
     *
     * @param redirectURL The URL to validate
     * @return A ValidatedUrl with the pinned IP address, or null if validation fails
     */
    default ValidatedUrl validateUrl(String redirectURL) {
        throw new UnsupportedOperationException("IP pinning not implemented for this validator");
    }
}

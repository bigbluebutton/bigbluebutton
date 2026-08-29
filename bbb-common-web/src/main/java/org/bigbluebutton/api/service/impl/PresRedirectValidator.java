package org.bigbluebutton.api.service.impl;

/**
 * Redirect validator for presentation URL downloads.
 *
 * Extends {@link BaseUrlRedirectValidator} with an additional bypass for the
 * default uploaded presentation URL, which may resolve to a local address.
 */
public class PresRedirectValidator extends BaseUrlRedirectValidator {

    private String defaultUploadedPresentation;

    @Override
    protected boolean isUrlBypassed(String redirectUrl) {
        return redirectUrl != null && redirectUrl.equals(defaultUploadedPresentation);
    }

    public void setDefaultUploadedPresentation(String defaultUploadedPresentation) {
        this.defaultUploadedPresentation = defaultUploadedPresentation;
    }
}

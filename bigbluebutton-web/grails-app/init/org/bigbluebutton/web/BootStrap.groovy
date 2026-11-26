package org.bigbluebutton.web

import org.springframework.beans.factory.annotation.Value

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

class BootStrap {

    private static final String API_SENTINEL = 'CHANGE_ME_API_SECRET'
    private static final String PAGE_TOKEN_SENTINEL = 'CHANGE_ME_PAGE_TOKEN_SECRET'
    private static final String RETIRED_DEFAULT_SHA256 = 'f85c8c2934b5a89cea99f26c887ecef1216d900e8652bba4ac9a7982d68ec96a'

    @Value('${securitySalt:}')
    String securitySalt

    @Value('${pageTokenSecret:}')
    String pageTokenSecret

    String retiredDefaultSha256 = RETIRED_DEFAULT_SHA256

    def init = { servletContext ->
        if (isUnusable(securitySalt, API_SENTINEL) || isUnusable(pageTokenSecret, PAGE_TOKEN_SENTINEL)) {
            throw new IllegalStateException(
                'Refusing to start with unusable API or page-token secrets. ' +
                'Run bbb-conf --setsecret for securitySalt and set an independent pageTokenSecret ' +
                'in /etc/bigbluebutton/bbb-web.properties, then restart bbb-web.'
            )
        }
    }
    def destroy = {
    }

    private boolean isUnusable(String value, String sentinel) {
        !value || value == sentinel || sha256(value) == retiredDefaultSha256
    }

    private static String sha256(String value) {
        MessageDigest.getInstance('SHA-256')
            .digest(value.getBytes(StandardCharsets.UTF_8))
            .encodeHex()
            .toString()
    }
}

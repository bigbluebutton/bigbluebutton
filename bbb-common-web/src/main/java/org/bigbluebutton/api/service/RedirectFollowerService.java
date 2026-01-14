package org.bigbluebutton.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class RedirectFollowerService {
    private static final Logger log = LoggerFactory.getLogger(RedirectFollowerService.class);
    private static final int MAX_REDIRECTS = 5;

    public String followRedirect(
            String meetingId, String redirectUrl,
            int redirectCount, String origUrl,
            RedirectValidator redirectValidator,
            int downloadReadTimeoutInMs
    ) {
        if (redirectCount > MAX_REDIRECTS) {
            log.error("Max redirect reached for meeting=[{}] with url=[{}]",
                    meetingId, origUrl);
            return null;
        }

        if(!redirectValidator.isRedirectValid(redirectUrl)) return null;

        URL attemptUrl;
        try {
            attemptUrl = new URL(redirectUrl);
        } catch (MalformedURLException e) {
            log.error("Malformed url=[{}] for meeting=[{}]", redirectUrl, meetingId, e);
            return null;
        }

        HttpURLConnection conn;
        try {
            conn = (HttpURLConnection) attemptUrl.openConnection();
            conn.setReadTimeout(downloadReadTimeoutInMs);
            conn.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
            conn.addRequestProperty("User-Agent", "Mozilla");
            conn.setInstanceFollowRedirects(false);

            // normally, 3xx is redirect
            int status = conn.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) {
                if (status == HttpURLConnection.HTTP_MOVED_TEMP
                        || status == HttpURLConnection.HTTP_MOVED_PERM
                        || status == HttpURLConnection.HTTP_SEE_OTHER) {
                    String newUrl = conn.getHeaderField("Location");
                    return followRedirect(
                            meetingId, newUrl, redirectCount + 1,
                            origUrl, redirectValidator, downloadReadTimeoutInMs
                    );
                } else {
                    log.error(
                            "Invalid HTTP response=[{}] for url=[{}] with meeting[{}]",
                            status, redirectUrl, meetingId);
                    return null;
                }
            } else {
                return redirectUrl;
            }
        } catch (IOException e) {
            log.error("IOException for url=[{}] with meeting[{}]", redirectUrl, meetingId, e);
            return null;
        }
    }
}

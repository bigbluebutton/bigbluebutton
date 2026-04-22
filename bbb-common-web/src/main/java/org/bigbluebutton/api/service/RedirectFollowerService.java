package org.bigbluebutton.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.apache.http.HttpStatus;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.DnsResolver;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;

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

    public ValidatedUrl followRedirectSecure(
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

        // Validate URL and get pinned IP address
        ValidatedUrl validatedUrl = redirectValidator.validateUrl(redirectUrl);
        if (validatedUrl == null) {
            log.error("URL validation failed for url=[{}] meeting=[{}]", redirectUrl, meetingId);
            return null;
        }

        RequestConfig requestConfig = RequestConfig.custom()
                .setRedirectsEnabled(false)
                .setConnectTimeout(downloadReadTimeoutInMs)
                .setSocketTimeout(downloadReadTimeoutInMs)
                .setConnectionRequestTimeout(downloadReadTimeoutInMs)
                .build();

        DnsResolver pinnedDnsResolver = host -> {
            if (host.equalsIgnoreCase(validatedUrl.host())) {
                return validatedUrl.resolvedAddresses();
            }
            throw new UnknownHostException("DNS resolution blocked for unpinned host: " + host);
        };

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setDnsResolver(pinnedDnsResolver)
                .build()) {

            HttpGet request = new HttpGet(validatedUrl.originalUrl());
            request.setHeader("Accept-Language", "en-US,en;q=0.8");
            request.setHeader("User-Agent", "Mozilla");

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int status = response.getStatusLine().getStatusCode();
                if (status != HttpStatus.SC_OK) {
                    if (status == HttpStatus.SC_MOVED_TEMPORARILY
                            || status == HttpStatus.SC_MOVED_PERMANENTLY
                            || status == HttpStatus.SC_SEE_OTHER) {
                        org.apache.http.Header locationHeader = response.getFirstHeader("Location");
                        String newUrl = locationHeader != null ? locationHeader.getValue() : null;
                        if (newUrl == null || newUrl.isEmpty()) {
                            log.error("Redirect response missing Location header for url=[{}] meeting=[{}]",
                                    redirectUrl, meetingId);
                            return null;
                        }
                        // Handle relative redirects
                        if (!newUrl.toLowerCase().startsWith("http://") && !newUrl.toLowerCase().startsWith("https://")) {
                            try {
                                URL base = new URL(redirectUrl);
                                newUrl = new URL(base, newUrl).toString();
                            } catch (MalformedURLException e) {
                                log.error("Failed to resolve relative redirect url=[{}] base=[{}] meeting=[{}]",
                                        newUrl, redirectUrl, meetingId);
                                return null;
                            }
                        }
                        return followRedirectSecure(
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
                    return validatedUrl;
                }
            }
        } catch (IOException e) {
            log.error("IOException for url=[{}] with meeting[{}]", redirectUrl, meetingId, e);
            return null;
        }
    }
}

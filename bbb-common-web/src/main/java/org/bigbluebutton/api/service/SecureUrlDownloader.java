package org.bigbluebutton.api.service;

import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.DnsResolver;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;

/**
 * Generic service for securely downloading content from a pre-validated URL.
 *
 * Both {@code downloadToFile} and {@code downloadToString} use an HTTP client
 * with a pinned DNS resolver built from the {@link ValidatedUrl}, preventing
 * DNS rebinding between validation time and connection time.
 *
 * Callers are responsible for obtaining a {@link ValidatedUrl} via
 * {@link RedirectFollowerService#followRedirectSecure} before invoking these
 * methods.
 */
public class SecureUrlDownloader {

    private static final Logger log = LoggerFactory.getLogger(SecureUrlDownloader.class);

    /**
     * Downloads the content at {@code validatedUrl} and writes it to {@code destination},
     * aborting (and deleting the partial file) if {@code maxBytes} is exceeded.
     *
     * @param contextId    Identifier for log messages (e.g. meeting ID).
     * @param validatedUrl The pre-validated, DNS-pinned URL to download.
     * @param destination  The file to write the downloaded content to.
     * @param timeoutMs    Connect/socket timeout in milliseconds.
     * @param maxBytes     Maximum allowed payload size in bytes. Pass {@link Long#MAX_VALUE} for no limit.
     * @return {@link DownloadResult#SUCCESS} if the file was written within the size limit,
     *         {@link DownloadResult#TOO_LARGE} if the response exceeded {@code maxBytes},
     *         or {@link DownloadResult#DOWNLOAD_ERROR} for any other failure.
     */
    public DownloadResult downloadToFile(String contextId, ValidatedUrl validatedUrl, File destination,
                                         int timeoutMs, long maxBytes) {
        try (CloseableHttpClient httpClient = buildPinnedClient(validatedUrl, timeoutMs)) {
            HttpGet request = buildRequest(validatedUrl);

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                    throw new ClientProtocolException("Download failed: " + response.getStatusLine());
                }
                if (response.getEntity() == null || response.getEntity().getContent() == null) {
                    log.warn("Empty response body from [{}] for context [{}]", validatedUrl.originalUrl(), contextId);
                    return DownloadResult.DOWNLOAD_ERROR;
                }

                File parent = destination.getParentFile();
                if (parent != null && !parent.isDirectory() && !parent.mkdirs()) {
                    log.error("Cannot create parent directory [{}] for context [{}]", parent, contextId);
                    return DownloadResult.DOWNLOAD_ERROR;
                }

                try (InputStream in = response.getEntity().getContent();
                     OutputStream out = new FileOutputStream(destination)) {
                    byte[] buf = new byte[8192];
                    long total = 0;
                    int n;
                    while ((n = in.read(buf)) != -1) {
                        total += n;
                        if (total > maxBytes) {
                            log.warn("Response from [{}] exceeded maximum allowed payload size ({} bytes) for context [{}]",
                                    validatedUrl.originalUrl(), maxBytes, contextId);
                            out.close();
                            destination.delete();
                            return DownloadResult.TOO_LARGE;
                        }
                        out.write(buf, 0, n);
                    }
                }
            }

            return DownloadResult.SUCCESS;
        } catch (IOException e) {
            log.error("IOException while downloading [{}] for context [{}]", validatedUrl.originalUrl(), contextId, e);
            destination.delete();
            return DownloadResult.DOWNLOAD_ERROR;
        }
    }

    /**
     * Downloads the content at {@code validatedUrl} and returns it as a String.
     *
     * @param contextId    Identifier for log messages.
     * @param validatedUrl The pre-validated, DNS-pinned URL to download.
     * @param timeoutMs    Connect/socket timeout in milliseconds.
     * @param maxSizeKib   Maximum allowed payload size in KiB. If exceeded, returns {@code null}.
     * @return The downloaded content as a UTF-8 string, or {@code null} on failure.
     */
    public String downloadToString(String contextId, ValidatedUrl validatedUrl, int timeoutMs, int maxSizeKib) {
        try (CloseableHttpClient httpClient = buildPinnedClient(validatedUrl, timeoutMs)) {
            HttpGet request = buildRequest(validatedUrl);

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                    log.warn("URL [{}] responded with HTTP {} for context [{}]",
                            validatedUrl.originalUrl(), response.getStatusLine().getStatusCode(), contextId);
                    return null;
                }

                if (response.getEntity() == null || response.getEntity().getContent() == null) {
                    log.warn("Empty response body from [{}] for context [{}]", validatedUrl.originalUrl(), contextId);
                    return null;
                }

                StringBuilder sb = new StringBuilder(8192);
                int remaining = maxSizeKib * 1024;

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8))) {
                    char[] buf = new char[4096];
                    int n;
                    while ((n = reader.read(buf)) != -1) {
                        remaining -= n;
                        if (remaining < 0) {
                            log.warn("Response from [{}] exceeded maximum allowed payload size ({} KiB) for context [{}]",
                                    validatedUrl.originalUrl(), maxSizeKib, contextId);
                            return null;
                        }
                        sb.append(buf, 0, n);
                    }
                }

                return sb.toString();
            }
        } catch (IOException e) {
            log.error("IOException while downloading [{}] for context [{}]", validatedUrl.originalUrl(), contextId, e);
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private CloseableHttpClient buildPinnedClient(ValidatedUrl validatedUrl, int timeoutMs) {
        final String pinnedHost = validatedUrl.host();

        DnsResolver pinnedDnsResolver = host -> {
            if (host.equalsIgnoreCase(pinnedHost)) {
                return validatedUrl.resolvedAddresses();
            }
            throw new UnknownHostException("DNS resolution blocked for unpinned host: " + host);
        };

        RequestConfig requestConfig = RequestConfig.custom()
                .setRedirectsEnabled(false)
                .setConnectTimeout(timeoutMs)
                .setSocketTimeout(timeoutMs)
                .build();

        return HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setDnsResolver(pinnedDnsResolver)
                .build();
    }

    private HttpGet buildRequest(ValidatedUrl validatedUrl) {
        HttpGet request = new HttpGet(validatedUrl.originalUrl());
        request.setHeader("Host", validatedUrl.host() +
                (validatedUrl.port() != -1 ? ":" + validatedUrl.port() : ""));
        request.setHeader("Accept-Language", "en-US,en;q=0.8");
        request.setHeader("User-Agent", "Mozilla");
        return request;
    }
}

package org.bigbluebutton.presentation;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.SSLContext;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.DnsResolver;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.apache.http.impl.nio.conn.PoolingNHttpClientConnectionManager;
import org.apache.http.impl.nio.reactor.DefaultConnectingIOReactor;
import org.apache.http.impl.nio.reactor.IOReactorConfig;
import org.apache.http.nio.client.methods.HttpAsyncMethods;
import org.apache.http.nio.client.methods.ZeroCopyConsumer;
import org.apache.http.nio.conn.NoopIOSessionStrategy;
import org.apache.http.nio.conn.SchemeIOSessionStrategy;
import org.apache.http.nio.conn.ssl.SSLIOSessionStrategy;
import org.apache.http.nio.reactor.ConnectingIOReactor;
import org.apache.http.nio.reactor.IOReactorException;
import org.apache.http.ssl.SSLContexts;
import org.bigbluebutton.api.Util;
import org.bigbluebutton.api.service.RedirectFollowerService;
import org.bigbluebutton.api.service.ValidatedUrl;
import org.bigbluebutton.api.service.impl.PresRedirectValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PresentationUrlDownloadService {
    private static Logger log = LoggerFactory
            .getLogger(PresentationUrlDownloadService.class);

    private PageExtractor pageExtractor;
    private DocumentConversionService documentConversionService;
    private String presentationBaseURL;
    private String presentationDir;
    private String BLANK_PRESENTATION;
    private RedirectFollowerService redirectFollower;
    private PresRedirectValidator presRedirectValidator;
    private int presDownloadReadTimeoutInMs;

    private ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(3);

    public void stop() {
        scheduledThreadPool.shutdownNow();
    }

    public void processUploadedPresentation(final UploadedPresentation uploadedPres, final boolean scanUploadedPresentationFiles) {
        /**
         * We delay processing of the presentation to make sure that the meeting has already been created.
         * Otherwise, the meeting won't get the conversion events.
         */
        ScheduledFuture scheduledFuture =
                scheduledThreadPool.schedule(new Runnable() {
                    public void run() {
                        documentConversionService.processDocument(uploadedPres, scanUploadedPresentationFiles);
                    }
                }, 5, TimeUnit.SECONDS);

    }

    public void processUploadedFile(String podId, String meetingId, String presId,
                                    String filename, File presFile, Boolean current, String authzToken,
                                    Boolean uploadFailed, ArrayList<String> uploadFailReasons, Boolean scanUploadedPresentationFiles) {
        // TODO add podId
        UploadedPresentation uploadedPres = new UploadedPresentation(
          podId,
          meetingId,
          presId,
          filename,
          presentationBaseURL,
          current,
          authzToken,
          uploadFailed,
          uploadFailReasons);
        uploadedPres.setUploadedFile(presFile);
        processUploadedPresentation(uploadedPres, scanUploadedPresentationFiles);
    }

    public void extractPresentationPage(final String sourceMeetingId, final String presentationId,
                                        final Integer presentationSlide, final String destinationMeetingId, final Boolean scanUploadedPresentationFiles)  {
        /**
         * We delay processing of the presentation to make sure that the meeting has already been created.
         * Otherwise, the meeting won't get the conversion events.
         */
        ScheduledFuture scheduledFuture =
                scheduledThreadPool.schedule(new Runnable() {
                    public void run() {
                        extractPage(sourceMeetingId, presentationId, presentationSlide, destinationMeetingId, scanUploadedPresentationFiles);
                    }
                }, 5, TimeUnit.SECONDS);
    }

    // A negative presentationSlide indicates the entire presentation deck should be used.
    private void extractPage(final String sourceMeetingId, final String presentationId,
                             final Integer presentationSlide, final String destinationMeetingId, final Boolean scanUploadedPresentationFiles) {

        Boolean uploadFailed = false;
        ArrayList<String> uploadFailedReasons = new ArrayList<String>();

        // Build the source meeting path
        File sourceMeetingPath = new File(presentationDir + File.separatorChar
                + sourceMeetingId + File.separatorChar + sourceMeetingId
                + File.separatorChar + presentationId);

        // Find the source meeting presentation file
        final String presentationFilter = presentationId;
        FilenameFilter pdfFilter = new FilenameFilter() {
            public boolean accept(File dir, String name) {
                return name.startsWith(presentationFilter)
                        && name.toLowerCase().endsWith("pdf");
            }
        };

        File[] matches = sourceMeetingPath.listFiles(pdfFilter);
        if (matches != null && matches.length != 1) {
            // No PDF presentation was found, we look for an image presentation
            FilenameFilter imgFlter = new FilenameFilter() {
                public boolean accept(File dir, String name) {
                    return name.startsWith(presentationFilter);
                }
            };

            matches = sourceMeetingPath.listFiles(imgFlter);
        }
        File sourcePresentationFile;
        if (matches == null || matches.length != 1) {
            log.warn(
                    "Not matching PDF file with prefix {} found at {}. Using the default blank PDF",
                    sourceMeetingId, sourceMeetingPath);
            sourcePresentationFile = new File(BLANK_PRESENTATION);
        } else {
            sourcePresentationFile = matches[0];
        }

        // Build the target meeting path
        String filenameExt = FilenameUtils.getExtension(sourcePresentationFile.getName());
        String presId = Util.generatePresentationId(presentationId);
        String newFilename = Util.createNewFilename(presId, filenameExt);

        File uploadDir = Util.createPresentationDir(destinationMeetingId,
                presentationDir, presId);
        String newFilePath = uploadDir.getAbsolutePath() + File.separatorChar
                + newFilename;
        File newPresentation = new File(newFilePath);

        if (sourcePresentationFile.getName().toLowerCase().endsWith("pdf") && presentationSlide >= 0) {
            pageExtractor.extractPage(sourcePresentationFile, new File(
                    newFilePath), presentationSlide);
        } else {
            try {
                FileUtils.copyFile(sourcePresentationFile, newPresentation);
            } catch (IOException e) {
                log.error("Could not copy presentation {} to {}", sourcePresentationFile.getAbsolutePath(),
                        newPresentation.getAbsolutePath(), e);
            }
        }

        // Hardcode pre-uploaded presentation for breakout room to the default presentation window
        processUploadedFile("DEFAULT_PRESENTATION_POD",
          destinationMeetingId,
          presId,
          "default-" + presentationSlide.toString() + "." + filenameExt,
          newPresentation,
          true,
          "breakout-authz-token",
          uploadFailed,
          uploadFailedReasons,
          scanUploadedPresentationFiles);
    }



    public boolean savePresentation(final String meetingId,
            final String filename, final String urlString) {

        // Use the secure redirect follower that pins IP addresses
        ValidatedUrl validatedUrl = redirectFollower.followRedirectSecure(
                meetingId, urlString, 0, urlString, presRedirectValidator, presDownloadReadTimeoutInMs
        );

        if (validatedUrl == null) {
            log.error("Failed to validate and resolve URL [{}] for meeting [{}]", urlString, meetingId);
            return false;
        }

        if (!validatedUrl.originalUrl().equals(urlString)) {
            log.info("Redirected to Final URL [{}], pinned to IP [{}]",
                    validatedUrl.originalUrl(), validatedUrl.resolvedIpAddress());
        } else {
            log.info("URL [{}] pinned to IP [{}]", urlString, validatedUrl.resolvedIpAddress());
        }

        boolean success = false;
        CloseableHttpAsyncClient httpclient = null;

        try {
            httpclient = createPinnedHttpClient(validatedUrl);
            httpclient.start();

            File download = new File(filename);
            ZeroCopyConsumer<File> consumer = new ZeroCopyConsumer<>(download) {
                @Override
                protected File process(
                        final HttpResponse response,
                        final File file,
                        final ContentType contentType) throws Exception {
                    if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                        throw new ClientProtocolException("Upload failed: " + response.getStatusLine());
                    }
                    return file;
                }
            };

            // Build request to the pinned IP with proper Host header
            HttpGet request = createPinnedRequest(validatedUrl);
            Future<File> future = httpclient.execute(HttpAsyncMethods.create(request), consumer, null);
            File result = future.get();
            success = result.exists();
        } catch (IOReactorException ex) {
            log.error("IOReactorException while saving presentation for meeting [{}]", meetingId, ex);
        } catch (java.lang.InterruptedException ex) {
            log.error("InterruptedException while saving presentation for meeting [{}]", meetingId, ex);
        } catch (java.util.concurrent.ExecutionException ex) {
            log.error("ExecutionException while saving presentation for meeting [{}]", meetingId, ex);
        } catch (java.io.FileNotFoundException ex) {
            log.error("FileNotFoundException while saving presentation for meeting [{}]", meetingId, ex);
        } finally {
            if (httpclient != null) {
                try {
                    httpclient.close();
                } catch (java.io.IOException ex) {
                    log.error("IOException while closing httpclient for meeting [{}]", meetingId, ex);
                }
            }
        }

        return success;
    }

    private CloseableHttpAsyncClient createPinnedHttpClient(ValidatedUrl validatedUrl) throws IOReactorException {
        // Create a custom DNS resolver that always returns the pinned IP
        final InetAddress pinnedAddress = validatedUrl.resolvedAddress();
        final String originalHost = validatedUrl.host();

        DnsResolver pinnedDnsResolver = host -> {
            if (host.equalsIgnoreCase(originalHost) || host.equals(validatedUrl.resolvedIpAddress())) {
                return new InetAddress[]{pinnedAddress};
            }
            // For any other host (shouldn't happen), fail fast
            throw new java.net.UnknownHostException("DNS resolution blocked for unpinned host: " + host);
        };

        RequestConfig requestConfig = RequestConfig.custom()
                .setRedirectsEnabled(false)
                .setConnectTimeout(presDownloadReadTimeoutInMs)
                .setSocketTimeout(presDownloadReadTimeoutInMs)
                .build();

        IOReactorConfig ioReactorConfig = IOReactorConfig.custom()
                .setConnectTimeout(presDownloadReadTimeoutInMs)
                .setSoTimeout(presDownloadReadTimeoutInMs)
                .build();

        ConnectingIOReactor ioReactor = new DefaultConnectingIOReactor(ioReactorConfig);

        // Configure SSL with hostname verification against the original hostname
        SSLContext sslContext = SSLContexts.createDefault();
        SSLIOSessionStrategy sslStrategy = new SSLIOSessionStrategy(
                sslContext,
                new String[]{"TLSv1.2", "TLSv1.3"},
                null,
                new DefaultHostnameVerifier()
        );

        PoolingNHttpClientConnectionManager connectionManager = new PoolingNHttpClientConnectionManager(
                ioReactor,
                null,
                org.apache.http.config.RegistryBuilder.<SchemeIOSessionStrategy>create()
                        .register("http", NoopIOSessionStrategy.INSTANCE)
                        .register("https", sslStrategy)
                        .build(),
                pinnedDnsResolver
        );

        return HttpAsyncClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .build();
    }

    private HttpGet createPinnedRequest(ValidatedUrl validatedUrl) {
        // Create request URL using the original URL (the pinned DNS resolver will handle routing)
        HttpGet request = new HttpGet(validatedUrl.originalUrl());

        // Ensure proper Host header is set (should already be set by default,
        // but we set it explicitly to be safe)
        request.setHeader("Host", validatedUrl.host() +
                (validatedUrl.port() != -1 ? ":" + validatedUrl.port() : ""));
        request.setHeader("Accept-Language", "en-US,en;q=0.8");
        request.setHeader("User-Agent", "Mozilla");

        return request;
    }

    public void setPageExtractor(PageExtractor extractor) {
        this.pageExtractor = extractor;
    }

    public void setPresentationDir(String presDir) {
        presentationDir = presDir;
    }

    public void setPresentationBaseURL(String presentationBaseUrl) {
        presentationBaseURL = presentationBaseUrl;
    }

    public void setDocumentConversionService(
            DocumentConversionService documentConversionService) {
        this.documentConversionService = documentConversionService;
    }

    public void setBlankPresentation(String blankPresentation) {
        this.BLANK_PRESENTATION = blankPresentation;
    }

    public void setRedirectFollower(RedirectFollowerService redirectFollower) {
        this.redirectFollower = redirectFollower;
    }

    public void setPresRedirectValidator(PresRedirectValidator presRedirectValidator) {
        this.presRedirectValidator = presRedirectValidator;
    }

    public void setPresDownloadReadTimeoutInMs(int presDownloadReadTimeoutInMs) {
        this.presDownloadReadTimeoutInMs = presDownloadReadTimeoutInMs;
    }
}

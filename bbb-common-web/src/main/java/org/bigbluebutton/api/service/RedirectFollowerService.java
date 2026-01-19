package org.bigbluebutton.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.*;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;

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

        HttpURLConnection conn = null;
        try {
            conn = createConnectionToPinnedIp(validatedUrl, downloadReadTimeoutInMs);
            conn.setInstanceFollowRedirects(false);

            int status = conn.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) {
                if (status == HttpURLConnection.HTTP_MOVED_TEMP
                        || status == HttpURLConnection.HTTP_MOVED_PERM
                        || status == HttpURLConnection.HTTP_SEE_OTHER) {
                    String newUrl = conn.getHeaderField("Location");
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
        } catch (IOException e) {
            log.error("IOException for url=[{}] with meeting[{}]", redirectUrl, meetingId, e);
            return null;
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private HttpURLConnection createConnectionToPinnedIp(ValidatedUrl validatedUrl, int timeoutMs) throws IOException {
        int port = validatedUrl.effectivePort();
        InetAddress pinnedAddress = validatedUrl.resolvedAddress();
        String originalHost = validatedUrl.host();

        // Use the original URL with hostname (not IP) for proper SSL hostname verification
        URL url = new URL(validatedUrl.originalUrl());

        HttpURLConnection conn;

        if (validatedUrl.isHttps()) {
            HttpsURLConnection httpsConn = (HttpsURLConnection) url.openConnection();

            try {
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, null, null);
                SSLSocketFactory defaultFactory = sslContext.getSocketFactory();

                // Create a custom socket factory that connects to the pinned IP
                // but uses the original hostname for SSL handshake (SNI and verification)
                httpsConn.setSSLSocketFactory(new PinnedIPSSLSocketFactory(
                        defaultFactory, pinnedAddress, port, originalHost, timeoutMs));

            } catch (NoSuchAlgorithmException | KeyManagementException e) {
                throw new IOException("Failed to configure SSL for pinned IP connection", e);
            }

            conn = httpsConn;
        } else {
            // For HTTP, use a custom connection that goes to the pinned IP
            conn = new PinnedIPHttpURLConnection(url, pinnedAddress, port, timeoutMs);
        }

        conn.setReadTimeout(timeoutMs);
        conn.setConnectTimeout(timeoutMs);
        conn.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
        conn.addRequestProperty("User-Agent", "Mozilla");

        return conn;
    }

    private static class PinnedIPSSLSocketFactory extends SSLSocketFactory {
        private final SSLSocketFactory delegate;
        private final InetAddress pinnedAddress;
        private final int port;
        private final String hostname;
        private final int timeoutMs;

        PinnedIPSSLSocketFactory(SSLSocketFactory delegate, InetAddress pinnedAddress,
                                  int port, String hostname, int timeoutMs) {
            this.delegate = delegate;
            this.pinnedAddress = pinnedAddress;
            this.port = port;
            this.hostname = hostname;
            this.timeoutMs = timeoutMs;
        }

        @Override
        public String[] getDefaultCipherSuites() {
            return delegate.getDefaultCipherSuites();
        }

        @Override
        public String[] getSupportedCipherSuites() {
            return delegate.getSupportedCipherSuites();
        }

        @Override
        public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
            // If the socket is already connected (e.g., a PinnedSocket), use it directly
            // Otherwise, create a new connection to the pinned IP
            Socket socketToWrap;
            if (s != null && s.isConnected()) {
                socketToWrap = s;
            } else {
                socketToWrap = new Socket();
                socketToWrap.connect(new InetSocketAddress(pinnedAddress, this.port), timeoutMs);
            }

            // Wrap with SSL using the original hostname for SNI and verification
            SSLSocket sslSocket = (SSLSocket) delegate.createSocket(socketToWrap, hostname, this.port, autoClose);
            configureSSLSocket(sslSocket);
            return sslSocket;
        }

        @Override
        public Socket createSocket(String host, int port) throws IOException {
            Socket plainSocket = new Socket();
            plainSocket.connect(new InetSocketAddress(pinnedAddress, this.port), timeoutMs);

            SSLSocket sslSocket = (SSLSocket) delegate.createSocket(plainSocket, hostname, this.port, true);
            configureSSLSocket(sslSocket);
            return sslSocket;
        }

        @Override
        public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
            Socket plainSocket = new Socket();
            plainSocket.bind(new InetSocketAddress(localHost, localPort));
            plainSocket.connect(new InetSocketAddress(pinnedAddress, this.port), timeoutMs);

            SSLSocket sslSocket = (SSLSocket) delegate.createSocket(plainSocket, hostname, this.port, true);
            configureSSLSocket(sslSocket);
            return sslSocket;
        }

        @Override
        public Socket createSocket(InetAddress host, int port) throws IOException {
            // Ignore the passed address, use pinned address instead
            Socket plainSocket = new Socket();
            plainSocket.connect(new InetSocketAddress(pinnedAddress, this.port), timeoutMs);

            SSLSocket sslSocket = (SSLSocket) delegate.createSocket(plainSocket, hostname, this.port, true);
            configureSSLSocket(sslSocket);
            return sslSocket;
        }

        @Override
        public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
            // Ignore the passed address, use pinned address instead
            Socket plainSocket = new Socket();
            plainSocket.bind(new InetSocketAddress(localAddress, localPort));
            plainSocket.connect(new InetSocketAddress(pinnedAddress, this.port), timeoutMs);

            SSLSocket sslSocket = (SSLSocket) delegate.createSocket(plainSocket, hostname, this.port, true);
            configureSSLSocket(sslSocket);
            return sslSocket;
        }

        @Override
        public Socket createSocket() throws IOException {
            // This method is called by HttpsURLConnection
            // Return a socket that will connect to the pinned IP when connect() is called
            return new PinnedSocket(pinnedAddress, port, timeoutMs);
        }

        private void configureSSLSocket(SSLSocket socket) {
            SSLParameters params = socket.getSSLParameters();
            params.setServerNames(java.util.Collections.singletonList(new SNIHostName(hostname)));
            // Enable endpoint identification for hostname verification
            params.setEndpointIdentificationAlgorithm("HTTPS");
            socket.setSSLParameters(params);
        }
    }

    private static class PinnedSocket extends Socket {
        private final InetAddress pinnedAddress;
        private final int pinnedPort;
        private final int timeoutMs;

        PinnedSocket(InetAddress pinnedAddress, int pinnedPort, int timeoutMs) {
            this.pinnedAddress = pinnedAddress;
            this.pinnedPort = pinnedPort;
            this.timeoutMs = timeoutMs;
        }

        @Override
        public void connect(SocketAddress endpoint) throws IOException {
            // Ignore the endpoint, connect to pinned address instead
            super.connect(new InetSocketAddress(pinnedAddress, pinnedPort), timeoutMs);
        }

        @Override
        public void connect(SocketAddress endpoint, int timeout) throws IOException {
            // Ignore the endpoint, connect to pinned address instead
            super.connect(new InetSocketAddress(pinnedAddress, pinnedPort), timeout > 0 ? timeout : timeoutMs);
        }
    }

    private static class PinnedIPHttpURLConnection extends HttpURLConnection {
        private final InetAddress pinnedAddress;
        private final int pinnedPort;
        private final int timeoutMs;
        private Socket socket;
        private java.io.InputStream inputStream;
        private java.io.OutputStream outputStream;
        private boolean connected = false;
        private int responseCode = -1;
        private String responseMessage;
        private java.util.Map<String, java.util.List<String>> headerFields;

        PinnedIPHttpURLConnection(URL url, InetAddress pinnedAddress, int pinnedPort, int timeoutMs) {
            super(url);
            this.pinnedAddress = pinnedAddress;
            this.pinnedPort = pinnedPort;
            this.timeoutMs = timeoutMs;
        }

        @Override
        public void connect() throws IOException {
            if (connected) return;

            socket = new Socket();
            socket.connect(new InetSocketAddress(pinnedAddress, pinnedPort), timeoutMs);
            socket.setSoTimeout(timeoutMs);

            outputStream = socket.getOutputStream();
            inputStream = socket.getInputStream();

            // Send HTTP request
            StringBuilder request = new StringBuilder();
            request.append(getRequestMethod()).append(" ").append(url.getFile()).append(" HTTP/1.1\r\n");
            request.append("Host: ").append(url.getHost());
            if (url.getPort() != -1 && url.getPort() != 80) {
                request.append(":").append(url.getPort());
            }
            request.append("\r\n");

            // Add request properties
            for (java.util.Map.Entry<String, java.util.List<String>> entry : getRequestProperties().entrySet()) {
                for (String value : entry.getValue()) {
                    request.append(entry.getKey()).append(": ").append(value).append("\r\n");
                }
            }
            request.append("Connection: close\r\n");
            request.append("\r\n");

            outputStream.write(request.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            outputStream.flush();

            // Parse response
            parseResponse();
            connected = true;
        }

        private void parseResponse() throws IOException {
            java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(inputStream, java.nio.charset.StandardCharsets.UTF_8));

            String statusLine = reader.readLine();
            if (statusLine == null || !statusLine.startsWith("HTTP/")) {
                throw new IOException("Invalid HTTP response");
            }

            String[] parts = statusLine.split(" ", 3);
            responseCode = Integer.parseInt(parts[1]);
            responseMessage = parts.length > 2 ? parts[2] : "";

            headerFields = new java.util.LinkedHashMap<>();
            headerFields.put(null, java.util.Collections.singletonList(statusLine));

            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    String key = line.substring(0, colonIndex).trim();
                    String value = line.substring(colonIndex + 1).trim();
                    headerFields.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(value);
                }
            }
        }

        @Override
        public void disconnect() {
            try {
                if (socket != null) socket.close();
            } catch (IOException ignored) {}
        }

        @Override
        public boolean usingProxy() {
            return false;
        }

        @Override
        public int getResponseCode() throws IOException {
            if (!connected) connect();
            return responseCode;
        }

        @Override
        public String getResponseMessage() throws IOException {
            if (!connected) connect();
            return responseMessage;
        }

        @Override
        public String getHeaderField(String name) {
            try {
                if (!connected) connect();
            } catch (IOException e) {
                return null;
            }
            java.util.List<String> values = headerFields.get(name);
            return values != null && !values.isEmpty() ? values.get(values.size() - 1) : null;
        }

        @Override
        public java.util.Map<String, java.util.List<String>> getHeaderFields() {
            try {
                if (!connected) connect();
            } catch (IOException e) {
                return java.util.Collections.emptyMap();
            }
            return headerFields;
        }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            if (!connected) connect();
            return inputStream;
        }
    }
}

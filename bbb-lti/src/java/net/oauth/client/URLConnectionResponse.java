/*
 * Copyright 2008 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.oauth.client;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import net.oauth.OAuth;
import net.oauth.http.HttpMessage;
import net.oauth.http.HttpResponseMessage;

/**
 * The response part of a URLConnection, encapsulated as an HttpMessage.
 * 
 * @author John Kristian
 */
public class URLConnectionResponse extends HttpResponseMessage {

    /**
     * Construct an OAuthMessage from the HTTP response, including parameters
     * from OAuth WWW-Authenticate headers and the body. The header parameters
     * come first, followed by the ones from the response body.
     */
    public URLConnectionResponse(HttpMessage request, String requestHeaders,
            byte[] requestExcerpt, URLConnection connection) throws IOException {
        super(request.method, request.url);
        this.requestHeaders = requestHeaders;
        this.requestExcerpt = requestExcerpt;
        this.requestEncoding = request.getContentCharset();
        this.connection = connection;
        this.headers.addAll(getHeaders());
    }

    private final String requestHeaders;
    private final byte[] requestExcerpt;
    private final String requestEncoding;
    private final URLConnection connection;

    @Override
    public int getStatusCode() throws IOException {
        if (connection instanceof HttpURLConnection) {
            return ((HttpURLConnection) connection).getResponseCode();
        }
        return STATUS_OK;
    }

    @Override
    public InputStream openBody() {
        try {
            return connection.getInputStream();
        } catch (IOException ohWell) {
        }
        return null;
    }

    private List<Map.Entry<String, String>> getHeaders() {
        List<Map.Entry<String, String>> headers = new ArrayList<Map.Entry<String, String>>();
        boolean foundContentType = false;
        String value;
        for (int i = 0; (value = connection.getHeaderField(i)) != null; ++i) {
            String name = connection.getHeaderFieldKey(i);
            if (name != null) {
                headers.add(new OAuth.Parameter(name, value));
                if (CONTENT_TYPE.equalsIgnoreCase(name)) {
                    foundContentType = true;
                }
            }
        }
        if (!foundContentType) {
            headers.add(new OAuth.Parameter(CONTENT_TYPE, connection
                    .getContentType()));
        }
        return headers;
    }
    /** Return a complete description of the HTTP exchange. */
    @Override
    public void dump(Map<String, Object> into) throws IOException {
        super.dump(into);
        {
            StringBuilder request = new StringBuilder(requestHeaders);
            request.append(EOL);
            if (requestExcerpt != null) {
                request.append(new String(requestExcerpt, requestEncoding));
            }
            into.put(REQUEST, request.toString());
        }
        {
            HttpURLConnection http = (connection instanceof HttpURLConnection) ? (HttpURLConnection) connection
                    : null;
            StringBuilder response = new StringBuilder();
            String value;
            for (int i = 0; (value = connection.getHeaderField(i)) != null; ++i) {
                String name = connection.getHeaderFieldKey(i);
                if (i == 0 && name != null && http != null) {
                    String firstLine = "HTTP " + getStatusCode();
                    String message = http.getResponseMessage();
                    if (message != null) {
                        firstLine += (" " + message);
                    }
                    response.append(firstLine).append(EOL);
                }
                if (name != null) {
                    response.append(name).append(": ");
                    name = name.toLowerCase();
                }
                response.append(value).append(EOL);
            }
            response.append(EOL);
            if (body != null) {
                response.append(new String(((ExcerptInputStream) body)
                        .getExcerpt(), getContentCharset()));
            }
            into.put(HttpMessage.RESPONSE, response.toString());
        }
    }

}

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

package net.oauth.http;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import net.oauth.client.ExcerptInputStream;
import net.oauth.OAuth;
import net.oauth.OAuthMessage;
import net.oauth.ParameterStyle;

// TODO: move this class into oauth-core-consumer, together with ExcerptInputStream.
// The sticky part is deleting the method OAuthMessage.toHttpRequest.
/**
 * An HTTP request or response.
 * 
 * @author John Kristian
 */
public class HttpMessage
{

    public HttpMessage()
    {
        this(null, null);
    }

    public HttpMessage(String method, URL url)
    {
        this(method, url, null);
    }

    public HttpMessage(String method, URL url, InputStream body)
    {
        this.method = method;
        this.url = url;
        this.body = body;
    }

    public String method;
    public URL url;
    public final List<Map.Entry<String, String>> headers = new ArrayList<Map.Entry<String, String>>();
    protected InputStream body = null;

    /**
     * Get the value of the last header of the given name. The name is
     * case-insensitive.
     */
    public final String getHeader(String name)
    {
        String value = null;
        for (Map.Entry<String, String> header : headers) {
            if (equalsIgnoreCase(name, header.getKey())) {
                value = header.getValue();
            }
        }
        return value;
    }

    /**
     * Remove all headers of the given name. The name is case insensitive.
     * 
     * @return the value of the last header with that name, or null to indicate
     *         there was no such header
     */
    public String removeHeaders(String name)
    {
        String value = null;
        for (Iterator<Map.Entry<String, String>> i = headers.iterator(); i.hasNext();) {
            Map.Entry<String, String> header = i.next();
            if (equalsIgnoreCase(name, header.getKey())) {
                value = header.getValue();
                i.remove();
            }
        }
        return value;
    }

    public final String getContentCharset()
    {
        return getCharset(getHeader(CONTENT_TYPE));
    }

    public final InputStream getBody() throws IOException
    {
        if (body == null) {
            InputStream raw = openBody();
            if (raw != null) {
                body = new ExcerptInputStream(raw);
            }
        }
        return body;
    }

    protected InputStream openBody() throws IOException
    {
        return null;
    }

    /** Put a description of this message and its origins into the given Map. */
    public void dump(Map<String, Object> into) throws IOException
    {
    }

    /**
     * Construct an HTTP request from this OAuth message.
     * 
     * @param style
     *            where to put the OAuth parameters, within the HTTP request
     */
    public static HttpMessage newRequest(OAuthMessage from, ParameterStyle style) throws IOException {
        final boolean isPost = OAuthMessage.POST.equalsIgnoreCase(from.method);
        InputStream body = from.getBodyAsStream();
        if (style == ParameterStyle.BODY && !(isPost && body == null)) {
            style = ParameterStyle.QUERY_STRING;
        }
        String url = from.URL;
        final List<Map.Entry<String, String>> headers = new ArrayList<Map.Entry<String, String>>(from.getHeaders());
        switch (style) {
        case QUERY_STRING:
            url = OAuth.addParameters(url, from.getParameters());
            break;
        case BODY: {
            byte[] form = OAuth.formEncode(from.getParameters()).getBytes(from.getBodyEncoding());
            headers.add(new OAuth.Parameter(CONTENT_TYPE, OAuth.FORM_ENCODED));
            headers.add(new OAuth.Parameter(CONTENT_LENGTH, form.length + ""));
            body = new ByteArrayInputStream(form);
            break;
        }
        case AUTHORIZATION_HEADER:
            headers.add(new OAuth.Parameter("Authorization", from.getAuthorizationHeader(null)));
            // Find the non-OAuth parameters:
            List<Map.Entry<String, String>> others = from.getParameters();
            if (others != null && !others.isEmpty()) {
                others = new ArrayList<Map.Entry<String, String>>(others);
                for (Iterator<Map.Entry<String, String>> p = others.iterator(); p.hasNext();) {
                    if (p.next().getKey().startsWith("oauth_")) {
                        p.remove();
                    }
                }
                // Place the non-OAuth parameters elsewhere in the request:
                if (isPost && body == null) {
                    byte[] form = OAuth.formEncode(others).getBytes(from.getBodyEncoding());
                    headers.add(new OAuth.Parameter(CONTENT_TYPE, OAuth.FORM_ENCODED));
                    headers.add(new OAuth.Parameter(CONTENT_LENGTH, form.length + ""));
                    body = new ByteArrayInputStream(form);
                } else {
                    url = OAuth.addParameters(url, others);
                }
            }
            break;
        }
        HttpMessage httpRequest = new HttpMessage(from.method, new URL(url), body);
        httpRequest.headers.addAll(headers);
        return httpRequest;
    }

    private static boolean equalsIgnoreCase(String x, String y)
    {
        if (x == null)
            return y == null;
        else
            return x.equalsIgnoreCase(y);
    }

    private static final String getCharset(String mimeType)
    {
        if (mimeType != null) {
            Matcher m = CHARSET.matcher(mimeType);
            if (m.find()) {
                String charset = m.group(1);
                if (charset.length() >= 2 && charset.charAt(0) == '"'
                        && charset.charAt(charset.length() - 1) == '"') {
                    charset = charset.substring(1, charset.length() - 1);
                    charset = charset.replace("\\\"", "\"");
                }
                return charset;
            }
        }
        return DEFAULT_CHARSET;
    }

    /** The name of a dump entry whose value is the HTTP request. */
    public static final String REQUEST = "HTTP request";

    /** The name of a dump entry whose value is the HTTP response. */
    public static final String RESPONSE = "HTTP response";

    /** The name of a dump entry whose value is the HTTP status code. */
    public static final String STATUS_CODE = "HTTP status";

    public static final String ACCEPT_ENCODING = "Accept-Encoding";
    public static final String CONTENT_ENCODING = "Content-Encoding";
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String DEFAULT_CHARSET = "ISO-8859-1";

    private static final Pattern CHARSET = Pattern
            .compile("; *charset *= *([^;\"]*|\"([^\"]|\\\\\")*\")(;|$)");

}

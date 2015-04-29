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

package net.oauth.server;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import net.oauth.OAuth;
import net.oauth.OAuthMessage;

/**
 * An HttpServletRequest, encapsulated as an OAuthMessage.
 * 
 * @author John Kristian
 */
public class HttpRequestMessage extends OAuthMessage {

    public HttpRequestMessage(HttpServletRequest request, String URL) {
        super(request.getMethod(), URL, getParameters(request));
        this.request = request;
        copyHeaders(request, getHeaders());
    }

    private final HttpServletRequest request;

    @Override
    public InputStream getBodyAsStream() throws IOException {
        return request.getInputStream();
    }

    @Override
    public String getBodyEncoding() {
        return request.getCharacterEncoding();
    }

    private static void copyHeaders(HttpServletRequest request, Collection<Map.Entry<String, String>> into) {
        Enumeration<String> names = request.getHeaderNames();
        if (names != null) {
            while (names.hasMoreElements()) {
                String name = names.nextElement();
                Enumeration<String> values = request.getHeaders(name);
                if (values != null) {
                    while (values.hasMoreElements()) {
                        into.add(new OAuth.Parameter(name, values.nextElement()));
                    }
                }
            }
        }
    }

    public static List<OAuth.Parameter> getParameters(HttpServletRequest request) {
        List<OAuth.Parameter> list = new ArrayList<OAuth.Parameter>();
        for (Enumeration<String> headers = request.getHeaders("Authorization"); headers != null
                && headers.hasMoreElements();) {
            String header = headers.nextElement();
            for (OAuth.Parameter parameter : OAuthMessage
                    .decodeAuthorization(header)) {
                if (!"realm".equalsIgnoreCase(parameter.getKey())) {
                    list.add(parameter);
                }
            }
        }
        for (Object e : request.getParameterMap().entrySet()) {
            Map.Entry<String, String[]> entry = (Map.Entry<String, String[]>) e;
            String name = entry.getKey();
            for (String value : entry.getValue()) {
                list.add(new OAuth.Parameter(name, value));
            }
        }
        return list;
    }

}

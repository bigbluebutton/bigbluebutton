/*
 * Copyright 2007 Netflix, Inc.
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

import net.oauth.http.HttpMessage;

import java.io.IOException;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.oauth.OAuth;
import net.oauth.OAuthMessage;
import net.oauth.OAuthProblemException;

/**
 * Utility methods for servlets that implement OAuth.
 * 
 * @author John Kristian
 */
public class OAuthServlet {

    /**
     * Extract the parts of the given request that are relevant to OAuth.
     * Parameters include OAuth Authorization headers and the usual request
     * parameters in the query string and/or form encoded body. The header
     * parameters come first, followed by the rest in the order they came from
     * request.getParameterMap().
     * 
     * @param URL
     *            the official URL of this service; that is the URL a legitimate
     *            client would use to compute the digital signature. If this
     *            parameter is null, this method will try to reconstruct the URL
     *            from the HTTP request; which may be wrong in some cases.
     */
    public static OAuthMessage getMessage(HttpServletRequest request, String URL) {
        if (URL == null) {
            URL = request.getRequestURL().toString();
        }
        int q = URL.indexOf('?');
        if (q >= 0) {
            URL = URL.substring(0, q);
            // The query string parameters will be included in
            // the result from getParameters(request).
        }
        return new HttpRequestMessage(request, URL);
    }

    /** Reconstruct the requested URL, complete with query string (if any). */
    public static String getRequestURL(HttpServletRequest request) {
        StringBuffer url = request.getRequestURL();
        String queryString = request.getQueryString();
        if (queryString != null) {
            url.append("?").append(queryString);
        }
        return url.toString();
    }

    public static void handleException(HttpServletResponse response,
            Exception e, String realm) throws IOException, ServletException {
        handleException(response, e, realm, true);
    }

    public static void handleException(HttpServletResponse response,
            Exception e, String realm, boolean sendBody) throws IOException,
            ServletException {
        if (e instanceof OAuthProblemException) {
            OAuthProblemException problem = (OAuthProblemException) e;
            Object httpCode = problem.getParameters().get(HttpMessage.STATUS_CODE);
            if (httpCode == null) {
                httpCode = PROBLEM_TO_HTTP_CODE.get(problem.getProblem());
            }
            if (httpCode == null) {
                httpCode = SC_FORBIDDEN;
            }
            response.reset();
            response.setStatus(Integer.parseInt(httpCode.toString()));
            OAuthMessage message = new OAuthMessage(null, null, problem
                    .getParameters().entrySet());
            response.addHeader("WWW-Authenticate", message
                    .getAuthorizationHeader(realm));
            if (sendBody) {
                sendForm(response, message.getParameters());
            }
        } else if (e instanceof IOException) {
            throw (IOException) e;
        } else if (e instanceof ServletException) {
            throw (ServletException) e;
        } else if (e instanceof RuntimeException) {
            throw (RuntimeException) e;
        } else {
            throw new ServletException(e);
        }
    }

    private static final Integer SC_FORBIDDEN = new Integer(
            HttpServletResponse.SC_FORBIDDEN);

    private static final Map<String, Integer> PROBLEM_TO_HTTP_CODE = OAuth.Problems.TO_HTTP_CODE;

    /** Send the given parameters as a form-encoded response body. */
    public static void sendForm(HttpServletResponse response,
            Iterable<? extends Map.Entry> parameters) throws IOException {
        response.resetBuffer();
        response.setContentType(OAuth.FORM_ENCODED + ";charset="
                + OAuth.ENCODING);
        OAuth.formEncode(parameters, response.getOutputStream());
    }

    /**
     * Return the HTML representation of the given plain text. Characters that
     * would have special significance in HTML are replaced by <a
     * href="http://www.w3.org/TR/html401/sgml/entities.html">character entity
     * references</a>. Whitespace is not converted.
     */
    public static String htmlEncode(String s) {
        if (s == null) {
            return null;
        }
        StringBuilder html = new StringBuilder(s.length());
        for (char c : s.toCharArray()) {
            switch (c) {
            case '<':
                html.append("&lt;");
                break;
            case '>':
                html.append("&gt;");
                break;
            case '&':
                html.append("&amp;");
                // This also takes care of numeric character references;
                // for example &#169 becomes &amp;#169.
                break;
            case '"':
                html.append("&quot;");
                break;
            default:
                html.append(c);
                break;
            }
        }
        return html.toString();
    }

}

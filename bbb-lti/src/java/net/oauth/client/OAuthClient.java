/*
 * Copyright 2007, 2008 Netflix, Inc.
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
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.oauth.OAuth;
import net.oauth.OAuthAccessor;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthException;
import net.oauth.OAuthMessage;
import net.oauth.OAuthProblemException;
import net.oauth.http.HttpClient;
import net.oauth.http.HttpMessage;
import net.oauth.http.HttpMessageDecoder;
import net.oauth.http.HttpResponseMessage;

/**
 * Methods for an OAuth consumer to request tokens from a service provider.
 * <p>
 * This class can also be used to request access to protected resources, in some
 * cases. But not in all cases. For example, this class can't handle arbitrary
 * HTTP headers.
 * <p>
 * Methods of this class return a response as an OAuthMessage, from which you
 * can get a body or parameters but not both. Calling a getParameter method will
 * read and close the body (like readBodyAsString), so you can't read it later.
 * If you read or close the body first, then getParameter can't read it. The
 * response headers should tell you whether the response contains encoded
 * parameters, that is whether you should call getParameter or not.
 * <p>
 * Methods of this class don't follow redirects. When they receive a redirect
 * response, they throw an OAuthProblemException, with properties
 * HttpResponseMessage.STATUS_CODE = the redirect code
 * HttpResponseMessage.LOCATION = the redirect URL. Such a redirect can't be
 * handled at the HTTP level, if the second request must carry another OAuth
 * signature (with different parameters). For example, Google's Service Provider
 * routinely redirects requests for access to protected resources, and requires
 * the redirected request to be signed.
 * 
 * @author John Kristian
 */
public class OAuthClient {

    public OAuthClient(HttpClient http)
    {
        this.http = http;
        httpParameters.put(HttpClient.FOLLOW_REDIRECTS, Boolean.FALSE);
    }

    private HttpClient http;
    protected final Map<String, Object> httpParameters = new HashMap<String, Object>();

    public void setHttpClient(HttpClient http) {
        this.http = http;
    }

    public HttpClient getHttpClient() {
        return http;
    }

    /**
     * HTTP client parameters, as a map from parameter name to value.
     * 
     * @see HttpClient for parameter names.
     */
    public Map<String, Object> getHttpParameters() {
        return httpParameters;
    }

    /**
     * Get a fresh request token from the service provider.
     * 
     * @param accessor
     *            should contain a consumer that contains a non-null consumerKey
     *            and consumerSecret. Also,
     *            accessor.consumer.serviceProvider.requestTokenURL should be
     *            the URL (determined by the service provider) for getting a
     *            request token.
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public void getRequestToken(OAuthAccessor accessor) throws IOException,
            OAuthException, URISyntaxException {
        getRequestToken(accessor, null);
    }

    /**
     * Get a fresh request token from the service provider.
     * 
     * @param accessor
     *            should contain a consumer that contains a non-null consumerKey
     *            and consumerSecret. Also,
     *            accessor.consumer.serviceProvider.requestTokenURL should be
     *            the URL (determined by the service provider) for getting a
     *            request token.
     * @param httpMethod
     *            typically OAuthMessage.POST or OAuthMessage.GET, or null to
     *            use the default method.
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public void getRequestToken(OAuthAccessor accessor, String httpMethod)
            throws IOException, OAuthException, URISyntaxException {
        getRequestToken(accessor, httpMethod, null);
    }

    /** Get a fresh request token from the service provider.
     * 
     * @param accessor
     *            should contain a consumer that contains a non-null consumerKey
     *            and consumerSecret. Also,
     *            accessor.consumer.serviceProvider.requestTokenURL should be
     *            the URL (determined by the service provider) for getting a
     *            request token.
     * @param httpMethod
     *            typically OAuthMessage.POST or OAuthMessage.GET, or null to
     *            use the default method.
     * @param parameters
     *            additional parameters for this request, or null to indicate
     *            that there are no additional parameters.
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public void getRequestToken(OAuthAccessor accessor, String httpMethod,
            Collection<? extends Map.Entry> parameters) throws IOException,
            OAuthException, URISyntaxException {
        accessor.accessToken = null;
        accessor.tokenSecret = null;
        {
            // This code supports the 'Variable Accessor Secret' extension
            // described in http://oauth.pbwiki.com/AccessorSecret
            Object accessorSecret = accessor
                    .getProperty(OAuthConsumer.ACCESSOR_SECRET);
            if (accessorSecret != null) {
                List<Map.Entry> p = (parameters == null) ? new ArrayList<Map.Entry>(
                        1)
                        : new ArrayList<Map.Entry>(parameters);
                p.add(new OAuth.Parameter("oauth_accessor_secret",
                        accessorSecret.toString()));
                parameters = p;
                // But don't modify the caller's parameters.
            }
        }
        OAuthMessage response = invoke(accessor, httpMethod,
                accessor.consumer.serviceProvider.requestTokenURL, parameters);
        accessor.requestToken = response.getParameter(OAuth.OAUTH_TOKEN);
        accessor.tokenSecret = response.getParameter(OAuth.OAUTH_TOKEN_SECRET);
        response.requireParameters(OAuth.OAUTH_TOKEN, OAuth.OAUTH_TOKEN_SECRET);
    }

    /**
     * Get an access token from the service provider, in exchange for an
     * authorized request token.
     * 
     * @param accessor
     *            should contain a non-null requestToken and tokenSecret, and a
     *            consumer that contains a consumerKey and consumerSecret. Also,
     *            accessor.consumer.serviceProvider.accessTokenURL should be the
     *            URL (determined by the service provider) for getting an access
     *            token.
     * @param httpMethod
     *            typically OAuthMessage.POST or OAuthMessage.GET, or null to
     *            use the default method.
     * @param parameters
     *            additional parameters for this request, or null to indicate
     *            that there are no additional parameters.
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public OAuthMessage getAccessToken(OAuthAccessor accessor, String httpMethod,
            Collection<? extends Map.Entry> parameters) throws IOException, OAuthException, URISyntaxException {
        if (accessor.requestToken != null) {
            if (parameters == null) {
                parameters = OAuth.newList(OAuth.OAUTH_TOKEN, accessor.requestToken);
            } else if (!OAuth.newMap(parameters).containsKey(OAuth.OAUTH_TOKEN)) {
                List<Map.Entry> p = new ArrayList<Map.Entry>(parameters);
                p.add(new OAuth.Parameter(OAuth.OAUTH_TOKEN, accessor.requestToken));
                parameters = p;
            }
        }
        OAuthMessage response = invoke(accessor, httpMethod,
                accessor.consumer.serviceProvider.accessTokenURL, parameters);
        response.requireParameters(OAuth.OAUTH_TOKEN, OAuth.OAUTH_TOKEN_SECRET);
        accessor.accessToken = response.getParameter(OAuth.OAUTH_TOKEN);
        accessor.tokenSecret = response.getParameter(OAuth.OAUTH_TOKEN_SECRET);
        return response;
    }

    /**
     * Construct a request message, send it to the service provider and get the
     * response.
     * 
     * @param httpMethod
     *            the HTTP request method, or null to use the default method
     * @return the response
     * @throws URISyntaxException
     *             the given url isn't valid syntactically
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public OAuthMessage invoke(OAuthAccessor accessor, String httpMethod,
            String url, Collection<? extends Map.Entry> parameters)
    throws IOException, OAuthException, URISyntaxException {
        OAuthMessage request = accessor.newRequestMessage(httpMethod, url, parameters);
        Object accepted = accessor.consumer.getProperty(OAuthConsumer.ACCEPT_ENCODING);
        if (accepted != null) {
            request.getHeaders().add(new OAuth.Parameter(HttpMessage.ACCEPT_ENCODING, accepted.toString()));
        }
        Object ps = accessor.consumer.getProperty(PARAMETER_STYLE);
        net.oauth.ParameterStyle style = (ps == null) ? net.oauth.ParameterStyle.BODY
                : Enum.valueOf(net.oauth.ParameterStyle.class, ps.toString());
        return invoke(request, style);
    }

    /**
     * The name of the OAuthConsumer property whose value is the ParameterStyle
     * to be used by invoke.
     */
    public static final String PARAMETER_STYLE = "parameterStyle";

    /**
     * The name of the OAuthConsumer property whose value is the Accept-Encoding
     * header in HTTP requests.
     * @deprecated use {@link OAuthConsumer#ACCEPT_ENCODING} instead
     */
    @Deprecated
    public static final String ACCEPT_ENCODING = OAuthConsumer.ACCEPT_ENCODING;

    /**
     * Construct a request message, send it to the service provider and get the
     * response.
     * 
     * @return the response
     * @throws URISyntaxException
     *                 the given url isn't valid syntactically
     * @throws OAuthProblemException
     *                 the HTTP response status code was not 200 (OK)
     */
    public OAuthMessage invoke(OAuthAccessor accessor, String url,
            Collection<? extends Map.Entry> parameters) throws IOException,
            OAuthException, URISyntaxException {
        return invoke(accessor, null, url, parameters);
    }

    /**
     * Send a request message to the service provider and get the response.
     * 
     * @return the response
     * @throws IOException
     *                 failed to communicate with the service provider
     * @throws OAuthProblemException
     *             the HTTP response status code was not 200 (OK)
     */
    public OAuthMessage invoke(OAuthMessage request,  net.oauth.ParameterStyle style)
            throws IOException, OAuthException {
        OAuthResponseMessage response = access(request, style);
        if ((response.getHttpResponse().getStatusCode() / 100) != 2) {
            throw response.toOAuthProblemException();
        }
        return response;
    }

    /**
     * Send a request and return the response. Don't try to decide whether the
     * response indicates success; merely return it.
     */
    public OAuthResponseMessage access(OAuthMessage request,  net.oauth.ParameterStyle style) throws IOException {
        HttpMessage httpRequest = HttpMessage.newRequest(request, style);
        HttpResponseMessage httpResponse = http.execute(httpRequest, httpParameters);
        httpResponse = HttpMessageDecoder.decode(httpResponse);
        return new OAuthResponseMessage(httpResponse);
    }

    /**
     * Where to place parameters in an HTTP message.
     * 
     * @deprecated use net.oauth.ParameterStyle.
     */
    public static enum ParameterStyle {
        AUTHORIZATION_HEADER(net.oauth.ParameterStyle.AUTHORIZATION_HEADER),
        BODY                (net.oauth.ParameterStyle.BODY),
        QUERY_STRING        (net.oauth.ParameterStyle.QUERY_STRING);

        public net.oauth.ParameterStyle getReplacement() {
            return replacement;
        }

        private ParameterStyle(net.oauth.ParameterStyle replacement) {
            this.replacement = replacement;
        }

        private final net.oauth.ParameterStyle replacement;
    }

    /** @deprecated */
    public OAuthMessage invoke(OAuthMessage request, ParameterStyle style)
    throws IOException, OAuthException {
        return invoke(request, style.getReplacement());
    }

    /** @deprecated */
    public OAuthResponseMessage access(OAuthMessage request, ParameterStyle style)
    throws IOException {
        return access(request, style.getReplacement());
    }

    protected static final String PUT = OAuthMessage.PUT;
    protected static final String POST = OAuthMessage.POST;
    protected static final String DELETE = OAuthMessage.DELETE;
    protected static final String CONTENT_LENGTH = HttpMessage.CONTENT_LENGTH;

}

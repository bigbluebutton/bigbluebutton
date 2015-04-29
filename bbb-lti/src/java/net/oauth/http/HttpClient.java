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

import java.io.IOException;
import java.util.Map;
import net.oauth.OAuthMessage;

// TODO: move this class into oauth-core-consumer, together with HttpMessage.
// The sticky part is deleting the method OAuthMessage.toHttpRequest.
public interface HttpClient {

    /**
     * Send an HTTP request and return the response.
     * 
     * @param httpParameters
     *            HTTP client parameters, as a map from parameter name to value.
     *            Parameter names are defined as constants below.
     */
    HttpResponseMessage execute(HttpMessage request, Map<String, Object> httpParameters) throws IOException;

    /**
     * The name of the parameter that is the maximum time to wait to connect to
     * the server. (Integer msec)
     */
    static final String CONNECT_TIMEOUT = "connectTimeout";

    /**
     * The name of the parameter that is the maximum time to wait for response
     * data. (Integer msec)
     */
    static final String READ_TIMEOUT = "readTimeout";

    /** The name of the parameter to automatically follow redirects. (Boolean) */
    static final String FOLLOW_REDIRECTS = "followRedirects";

    static final String GET = OAuthMessage.GET;
    static final String POST = OAuthMessage.POST;
    static final String PUT = OAuthMessage.PUT;
    static final String DELETE = OAuthMessage.DELETE;

}

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

package net.oauth;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import net.oauth.http.HttpMessage;

/**
 * Properties of an OAuth Consumer. Properties may be added freely, e.g. to
 * support extensions.
 * 
 * @author John Kristian
 */
public class OAuthConsumer implements Serializable {

    private static final long serialVersionUID = -2258581186977818580L;

    public final String callbackURL;
    public final String consumerKey;
    public final String consumerSecret;
    public final OAuthServiceProvider serviceProvider;

    public OAuthConsumer(String callbackURL, String consumerKey,
            String consumerSecret, OAuthServiceProvider serviceProvider) {
        this.callbackURL = callbackURL;
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.serviceProvider = serviceProvider;
    }

    private final Map<String, Object> properties = new HashMap<String, Object>();

    public Object getProperty(String name) {
        return properties.get(name);
    }

    public void setProperty(String name, Object value) {
        properties.put(name, value);
    }

    /**
     * The name of the property whose value is the Accept-Encoding header in
     * HTTP requests.
     */
    public static final String ACCEPT_ENCODING = "HTTP.header." + HttpMessage.ACCEPT_ENCODING;

    /**
     * The name of the property whose value is the <a
     * href="http://oauth.pbwiki.com/AccessorSecret">Accessor Secret</a>.
     */
    public static final String ACCESSOR_SECRET = "oauth_accessor_secret";

}

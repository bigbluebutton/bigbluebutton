/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.manager.internal;

import java.util.*;

import org.asteriskjava.manager.response.*;


/**
 * Default implementation of the ResponseBuilder interface.
 * 
 * @see org.asteriskjava.manager.response.ManagerResponse
 * @author srt
 * @version $Id: ResponseBuilderImpl.java 1154 2008-08-24 02:05:26Z srt $
 */
class ResponseBuilderImpl extends AbstractBuilder implements ResponseBuilder
{
    private static final Set<String> ignoredAttributes = new HashSet<String>(Arrays.asList(
            "attributes", "proxyresponse", ManagerReader.COMMAND_RESULT_RESPONSE_KEY));

    private static final String RESPONSE_KEY = "response";
    private static final String PROXY_RESPONSE_KEY = "proxyresponse";
    private static final String RESPONSE_TYPE_ERROR = "error";

    public ManagerResponse buildResponse(Class<? extends ManagerResponse> responseClass, Map<String, Object> attributes)
    {
        final ManagerResponse response;
        final String responseType = (String) attributes.get(RESPONSE_KEY);

        if (RESPONSE_TYPE_ERROR.equalsIgnoreCase(responseType))
        {
            response = new ManagerError();
        }
        else if (responseClass == null)
        {
            response = new ManagerResponse();
        }
        else
        {
            try
            {
                response = responseClass.newInstance();
            }
            catch (Exception ex)
            {
                logger.error("Unable to create new instance of " + responseClass.getName(), ex);
                return null;
            }
        }

        setAttributes(response, attributes, ignoredAttributes);

        if (response instanceof CommandResponse)
        {
            final CommandResponse commandResponse = (CommandResponse) response;
            final List<String> result = new ArrayList<String>();
            for (String resultLine : ((String) attributes.get(ManagerReader.COMMAND_RESULT_RESPONSE_KEY)).split("\n"))
            {
                // on error there is a leading space
                if (!resultLine.equals("--END COMMAND--") && !resultLine.equals(" --END COMMAND--"))
                {
                    result.add(resultLine);
                }
            }
            commandResponse.setResult(result);
        }

        if (response.getResponse() != null && attributes.get(PROXY_RESPONSE_KEY) != null)
        {
            response.setResponse((String) attributes.get(PROXY_RESPONSE_KEY));
        }

        // make the map of all attributes available to the response
        // but clone it as it is reused by the ManagerReader
        response.setAttributes(new HashMap<String, Object>(attributes));

        return response;
    }
}

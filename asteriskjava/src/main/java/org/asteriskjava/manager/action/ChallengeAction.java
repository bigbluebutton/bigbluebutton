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
package org.asteriskjava.manager.action;

import org.asteriskjava.manager.ExpectedResponse;
import org.asteriskjava.manager.response.ChallengeResponse;

/**
 * The ChallengeAction requests a challenge from the server to use when logging
 * in using challenge/response. Sending this action to the asterisk server
 * results in a ChallengeResponse being received from the server.
 *
 * @author srt
 * @version $Id: ChallengeAction.java 1124 2008-08-18 03:25:01Z srt $
 * @see org.asteriskjava.manager.action.LoginAction
 * @see org.asteriskjava.manager.response.ChallengeResponse
 */
@ExpectedResponse(ChallengeResponse.class)
public class ChallengeAction extends AbstractManagerAction
{
    static final long serialVersionUID = 7240516124871953971L;
    private String authType;

    /**
     * Creates a new empty ChallengeAction.
     */
    public ChallengeAction()
    {

    }

    /**
     * Creates a new ChallengeAction that requests a new login challenge for use
     * with the given digest algorithm.
     *
     * @param authType the digest alogrithm to use.
     * @since 0.2
     */
    public ChallengeAction(String authType)
    {
        this.authType = authType;
    }

    /**
     * Returns Returns the name of this action, i.e. "Challenge".
     */
    @Override
    public String getAction()
    {
        return "Challenge";
    }

    /**
     * Returns the digest alogrithm to use.
     */
    public String getAuthType()
    {
        return authType;
    }

    /**
     * Sets the digest alogrithm to use. Currently asterisk only supports "MD5".
     */
    public void setAuthType(String authType)
    {
        this.authType = authType;
    }
}

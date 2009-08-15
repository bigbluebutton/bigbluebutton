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
package org.asteriskjava.manager.response;

/**
 * Corresponds to a ChallengeAction and contains the challenge needed to log in using
 * challenge/response.
 *
 * @author srt
 * @version $Id: ChallengeResponse.java 1127 2008-08-18 10:30:04Z srt $
 * @see org.asteriskjava.manager.action.ChallengeAction
 * @see org.asteriskjava.manager.action.LoginAction
 */
public class ChallengeResponse extends ManagerResponse
{
    private static final long serialVersionUID = -7253724086340850957L;

    private String challenge;

    /**
     * Returns the challenge to use when creating the key for log in.
     *
     * @return the challenge to use when creating the key for log in.
     * @see org.asteriskjava.manager.action.LoginAction#setKey(String)
     */
    public String getChallenge()
    {
        return challenge;
    }

    public void setChallenge(String challenge)
    {
        this.challenge = challenge;
    }
}

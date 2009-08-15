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
package org.asteriskjava.manager;

/**
 * An AuthenticationFailedException is thrown when a login fails due to an incorrect username and/or
 * password.
 * 
 * @author srt
 * @version $Id: AuthenticationFailedException.java 938 2007-12-31 03:23:38Z srt $
 */
public class AuthenticationFailedException extends Exception
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 7674248607624140309L;

    /**
     * Creates a new AuthenticationFailedException with the given message.
     * 
     * @param message message describing the authentication failure
     */
    public AuthenticationFailedException(final String message)
    {
        super(message);
    }

    /**
     * Creates a new AuthenticationFailedException with the given message and cause.
     * 
     * @param message message describing the authentication failure
     * @param cause exception that caused the authentication failure
     */
    public AuthenticationFailedException(final String message, final Throwable cause)
    {
        super(message, cause);
    }
}

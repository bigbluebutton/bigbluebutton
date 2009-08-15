/*
 *  Copyright 2005-2006 Stefan Reuter
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
package org.asteriskjava.live;

/**
 * Indicates that the penalty could not be assigned to the queue member.
 *
 * @author srt
 * @version $Id: InvalidPenaltyException.java 965 2008-02-03 06:47:03Z srt $
 */
public class InvalidPenaltyException extends LiveException
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 0L;

    /**
     * Creates a new instance with the given message.
     *
     * @param message the message
     */
    public InvalidPenaltyException(String message)
    {
        super(message);
    }
}
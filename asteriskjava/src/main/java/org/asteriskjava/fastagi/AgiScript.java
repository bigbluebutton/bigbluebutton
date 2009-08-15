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
package org.asteriskjava.fastagi;

/**
 * AgiScripts are used by the AsteriskServer to handle AgiRequests received from
 * the Asterisk server.<p>
 * To implement functionality using this framework you have to implement this
 * interface.<p>
 * Note: The implementation of AgiScript must be threadsafe as only one instance
 * is used by AsteriskServer to handle all requests to a resource.
 * 
 * @author srt
 * @version $Id: AgiScript.java 938 2007-12-31 03:23:38Z srt $
 */
public interface AgiScript
{
    /**
     * The service method is called by the AsteriskServer whenever this
     * AgiScript should handle an incoming AgiRequest.
     * 
     * @param request the initial data received from Asterisk when requesting
     *            this script.
     * @param channel a handle to communicate with Asterisk such as sending
     *            commands to the channel sending the request.
     * 
     * @throws AgiException any exception thrown by your script will be logged.
     */
    void service(final AgiRequest request, final AgiChannel channel) throws AgiException;
}

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
package org.asteriskjava.fastagi.internal;

import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.command.AgiCommand;

/**
 * The AgiWriter sends commands to Asterisk.
 * 
 * @author srt
 * @version $Id: AgiWriter.java 938 2007-12-31 03:23:38Z srt $
 */
interface AgiWriter
{
    /**
     * Sends the given command to the Asterisk server.
     * 
     * @param command the command to send.
     * @throws AgiException if the command can't be sent.
     */
    void sendCommand(AgiCommand command) throws AgiException;
}

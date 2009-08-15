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
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.reply.AgiReply;

/**
 * The AgiReader reads the replies from the network and parses them using a
 * ReplyBuilder.
 * 
 * @author srt
 * @version $Id: AgiReader.java 938 2007-12-31 03:23:38Z srt $
 */
interface AgiReader
{
    /**
     * Reads the initial request data from Asterisk.
     * 
     * @return the request read.
     * @throws AgiException if the request can't be read.
     */
    AgiRequest readRequest() throws AgiException;

    /**
     * Reads one reply to an AgiCommand from Asterisk.
     * 
     * @return the reply read.
     * @throws AgiException if the reply can't be read.
     */
    AgiReply readReply() throws AgiException;
}

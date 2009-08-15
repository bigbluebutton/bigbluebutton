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
 * The AgiHangupException is thrown if the channel is hung up while
 * processing the {@link org.asteriskjava.fastagi.AgiRequest}.<p>
 * Up to Asterisk 1.4 hanging up the channel also closes the TCP connection,
 * since Asterisk 1.6 the connection is kept alive but commands that
 * require an active channel return status code 
 * {@link org.asteriskjava.fastagi.reply.AgiReply#SC_DEAD_CHANNEL}. Both events
 * are translated to an AgiHangupException.
 * 
 * @author srt
 * @version $Id: AgiHangupException.java 1261 2009-03-14 03:17:17Z srt $
 */
public class AgiHangupException extends AgiException
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256444698691252274L;
    
    /**
     * Creates a new AgiHangupException.
     */
    public AgiHangupException()
    {
        super("Channel was hung up.");
    }
}

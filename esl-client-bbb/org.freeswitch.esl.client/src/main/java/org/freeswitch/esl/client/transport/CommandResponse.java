/*
 * Copyright 2010 david varnes.
 *
 * Licensed under the Apache License, version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.freeswitch.esl.client.transport;

import org.freeswitch.esl.client.transport.message.EslMessage;
import org.freeswitch.esl.client.transport.message.EslHeaders.Name;

/**
 * Result object to carry the results of a command sent to the FreeSWITCH Event Socket.
 * 
 * @author  david varnes
 */
public class CommandResponse
{
    private final String command;
    private final String replyText;
    private final EslMessage response;
    private final boolean success;
    
    public CommandResponse( String command, EslMessage response )
    {
        this.command = command;
        this.response = response;
        this.replyText = response.getHeaderValue( Name.REPLY_TEXT );
        this.success = replyText.startsWith( "+OK" );
    }
    
    /**
     * @return the original command sent to the server
     */
    public String getCommand()
    {
        return command;
    }
    
    /**
     * @return true if and only if the response Reply-Text line starts with "+OK"
     */
    public boolean isOk()
    {
        return success;
    }
    
    /**
     * @return the full response Reply-Text line.
     */
    public String getReplyText()
    {
        return replyText;
    }
    
    /**
     * @return {@link EslMessage} the full response from the server 
     */
    public EslMessage getResponse()
    {
        return response;
    }
}

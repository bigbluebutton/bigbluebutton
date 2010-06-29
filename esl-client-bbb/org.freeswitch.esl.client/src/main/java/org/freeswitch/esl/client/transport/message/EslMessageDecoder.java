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
package org.freeswitch.esl.client.transport.message;

import org.freeswitch.esl.client.internal.HeaderParser;
import org.freeswitch.esl.client.transport.message.EslHeaders.Name;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipelineCoverage;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.channel.UpstreamMessageEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Decoder used by the IO processing pipeline. Client consumers should never need to use
 * this class.
 * 
 * @author  david varnes
 * @version $Id$
 */
@ChannelPipelineCoverage( "one" )
public class EslMessageDecoder extends SimpleChannelUpstreamHandler
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );
    
    private EslMessage currentMessage;
    private boolean treatUnknownHeadersAsBody = false;
    
    public EslMessageDecoder()
    {
        
    }
    
    public EslMessageDecoder( boolean treatUnknownHeadersAsBody )
    {
        this.treatUnknownHeadersAsBody = treatUnknownHeadersAsBody;
    }
    
    private enum State
    {
        NEW_MESSAGE,
        READ_HEADER_LINE,
        READ_BODY_LINE,
    }
    
    private State state = State.NEW_MESSAGE;
    
    @Override
    public void messageReceived( ChannelHandlerContext ctx, MessageEvent e ) throws Exception
    {
        // Assume this is a decoded string
        String messageLine = e.getMessage().toString();
        
        log.debug( "Received string: [{}]", e.getMessage() );
        log.trace( "State [{}]", state );
        
        switch ( state )
        {
        case NEW_MESSAGE:
            if ( messageLine.isEmpty() )
            {
                break;
            }
            currentMessage = new EslMessage();
            state = State.READ_HEADER_LINE;
            // fall-through  
        case READ_HEADER_LINE:
            if ( messageLine.isEmpty() )
            {
                if ( currentMessage.hasContentLength() )
                {
                    //  end of headers - body to come
                    state = State.READ_BODY_LINE;
                }
                else
                {
                    // end of message
                    state = State.NEW_MESSAGE;
                    // send upstream
                    UpstreamMessageEvent upstreamEvent = new UpstreamMessageEvent( e.getChannel(), 
                        currentMessage, e.getRemoteAddress() );
                    currentMessage = null;
                    
                    ctx.sendUpstream( upstreamEvent );
                }
            }
            else
            {
                // split the line
                String[] headerParts = HeaderParser.splitHeader( messageLine );
                Name headerName = Name.fromLiteral( headerParts[0] );
                if ( headerName == null )
                {
                    if ( treatUnknownHeadersAsBody )
                    {
                        // treat this as a body line - note that this will screw up genuine body 
                        // content-length calculations
                        currentMessage.addBodyLine( messageLine );
                    }
                    else
                    {
                        throw new IllegalStateException( "Unhandled ESL header [" + headerParts[0] + ']' );
                    }
                }
                currentMessage.addHeader( headerName, headerParts[1] );
            }
            break;
        case READ_BODY_LINE:
            // monitor received content compared to expected content-length
            currentMessage.addBodyLine( messageLine );
            if ( ! currentMessage.waitingForContent() )
            {
                // end of message
                state = State.NEW_MESSAGE;
                // send upstream
                UpstreamMessageEvent upstreamEvent = new UpstreamMessageEvent( e.getChannel(), 
                    currentMessage, e.getRemoteAddress() );
                currentMessage = null;
                
                ctx.sendUpstream( upstreamEvent );
            }
            break;
        default:
            break;
        }
        
    }
}

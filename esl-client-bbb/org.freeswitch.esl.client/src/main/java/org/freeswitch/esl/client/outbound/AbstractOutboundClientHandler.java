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
package org.freeswitch.esl.client.outbound;

import org.freeswitch.esl.client.internal.AbstractEslClientHandler;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.handler.execution.ExecutionHandler;

/**
 * Specialised {@link AbstractEslClientHandler} that implements the base connecction logic for an 
 * 'Outbound' FreeSWITCH Event Socket connection.  The responsibilities for this class are:
 * <ul><li>
 * To send a 'connect' command when the FreeSWITCH server first establishes a new connection with
 * the socket client in Outbound mode.  This will result in an incoming {@link EslMessage} that is
 * transformed into an {@link EslEvent} that sub classes can handle.
 * </ul>
 * Note: implementation requirement is that an {@link ExecutionHandler} is placed in the processing 
 * pipeline prior to this handler. This will ensure that each incoming message is processed in its
 * own thread (although still guaranteed to be processed in the order of receipt).
 * 
 * @author  david varnes
 */
public abstract class AbstractOutboundClientHandler extends AbstractEslClientHandler
{

    @Override
    public void channelConnected( ChannelHandlerContext ctx, ChannelStateEvent e ) throws Exception
    {
        // Have received a connection from FreeSWITCH server, send connect response
        log.debug( "Received new connection from server, sending connect message" );
        
        EslMessage response = sendSyncSingleLineCommand( ctx.getChannel(), "connect" );
        // The message decoder for outbound, treats most of this incoming message as an 'event' in 
        // message body, so it parse now
        EslEvent channelDataEvent = new EslEvent( response, true );
        // Let implementing sub classes choose what to do next
        handleConnectResponse( ctx, channelDataEvent );
    }

    protected abstract void handleConnectResponse( ChannelHandlerContext ctx, EslEvent event );

    @Override
    protected void handleAuthRequest( ChannelHandlerContext ctx )
    {
        // This should not happen in outbound mode
        log.warn( "Auth request received in outbound mode, ignoring" ); 
    }

    @Override
    protected void handleDisconnectionNotice()
    {
        log.debug( "Received disconnection notice" );
    }    
}

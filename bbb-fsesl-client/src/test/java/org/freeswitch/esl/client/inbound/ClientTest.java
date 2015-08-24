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
package org.freeswitch.esl.client.inbound;

import java.util.Map.Entry;

import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.freeswitch.esl.client.transport.message.EslHeaders.Name;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ClientTest
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );

    private String host = "freeswitch-test";
    private int port = 8021;
    private String password = "ClueCon"; 
        
    @Test
    public void do_connect() throws InterruptedException
    {
        Client client = new Client();
     
        client.addEventListener( new IEslEventListener()
        {
            public void eventReceived( EslEvent event )
            {
                log.info( "Event received [{}]", event );
            }
            public void backgroundJobResultReceived( EslEvent event )
            {
                log.info( "Background job result received [{}]", event );
            }

            public void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventTransfer(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventThreadRun(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }

            public void conferenceEventPlayFile(String uniqueId, String confName, int confSize, EslEvent event) {
                log.info( "Event received [{}]", event );
            }
            
            public void exceptionCaught(ExceptionEvent e) {
                log.info( "exception received [{}]", e );
            }

            
        } );
        
        log.info( "Client connecting .." );
        try
        {
            client.connect( host, port, password, 2 );
        }
        catch ( InboundConnectionFailure e )
        {
            log.error( "Connect failed", e );
            return;
        }
        log.info( "Client connected .." );
        
//      client.setEventSubscriptions( "plain", "heartbeat CHANNEL_CREATE CHANNEL_DESTROY BACKGROUND_JOB" );
        client.setEventSubscriptions( "plain", "all" );
        client.addEventFilter( "Event-Name", "heartbeat" );
        client.cancelEventSubscriptions();
        client.setEventSubscriptions( "plain", "all" );
        client.addEventFilter( "Event-Name", "heartbeat" );
        client.addEventFilter( "Event-Name", "channel_create" );
        client.addEventFilter( "Event-Name", "background_job" );
        client.sendSyncApiCommand( "echo", "Foo foo bar" );

//        client.sendSyncCommand( "originate", "sofia/internal/101@192.168.100.201! sofia/internal/102@192.168.100.201!" );
        
//        client.sendSyncApiCommand( "sofia status", "" );
        String jobId = client.sendAsyncApiCommand( "status", "" );
        log.info( "Job id [{}] for [status]", jobId );
        client.sendSyncApiCommand( "version", "" );
//        client.sendAsyncApiCommand( "status", "" );
//        client.sendSyncApiCommand( "sofia status", "" );
//        client.sendAsyncApiCommand( "status", "" );
        EslMessage response = client.sendSyncApiCommand( "sofia status", "" );
        log.info( "sofia status = [{}]", response.getBodyLines().get( 3 ) );
        
        // wait to see the heartbeat events arrive
        Thread.sleep( 25000 );
        client.close();
    }

    @Test
    public void do_multi_connects() throws InterruptedException
    {
        Client client = new Client();
        
        log.info( "Client connecting .." );
        try
        {
            client.connect( host, port, password, 2 );
        }
        catch ( InboundConnectionFailure e )
        {
            log.error( "Connect failed", e );
            return;
        }
        log.info( "Client connected .." );
        
        log.info( "Client connecting .." );
        try
        {
            client.connect( host, port, password, 2 );
        }
        catch ( InboundConnectionFailure e )
        {
            log.error( "Connect failed", e );
            return;
        }
        log.info( "Client connected .." );
        
        client.close();
    }
    
    @Test
    public void sofia_contact()
    {
        Client client = new Client();
        try
        {
            client.connect( host, port, password, 2 );
        }
        catch ( InboundConnectionFailure e )
        {
            log.error( "Connect failed", e );
            return;
        }
        
        EslMessage response = client.sendSyncApiCommand( "sofia_contact", "internal/102@192.168.100.201" );

        log.info( "Response to 'sofia_contact': [{}]", response );
        for ( Entry<Name, String> header : response.getHeaders().entrySet() )
        {
            log.info( " * header [{}]", header );
        }
        for ( String bodyLine : response.getBodyLines() )
        {
            log.info( " * body [{}]", bodyLine );
        }
        client.close();
    }
}

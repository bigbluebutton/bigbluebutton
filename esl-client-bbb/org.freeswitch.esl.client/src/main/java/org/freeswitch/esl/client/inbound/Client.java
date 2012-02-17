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

import java.net.InetSocketAddress;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.internal.IEslProtocolListener;
import org.freeswitch.esl.client.transport.CommandResponse;
import org.freeswitch.esl.client.transport.SendMsg;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.jboss.netty.bootstrap.ClientBootstrap;
import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.socket.nio.NioClientSocketChannelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Entry point to connect to a running FreeSWITCH Event Socket Library module, as a client.
 * <p>
 * This class provides what the FreeSWITCH documentation refers to as an 'Inbound' connection
 * to the Event Socket module. That is, with reference to the socket listening on the FreeSWITCH
 * server, this client occurs as an inbound connection to the server.
 * <p>
 * See <a href="http://wiki.freeswitch.org/wiki/Mod_event_socket">http://wiki.freeswitch.org/wiki/Mod_event_socket</a>
 * 
 * @author  david varnes
 */
public class Client
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );
    
    private final List<IEslEventListener> eventListeners = new CopyOnWriteArrayList<IEslEventListener>();
    private final Executor eventListenerExecutor = Executors.newSingleThreadExecutor( 
        new ThreadFactory()
        {
            AtomicInteger threadNumber = new AtomicInteger( 1 );
            public Thread newThread( Runnable r )
            {
                return new Thread( r, "EslEventNotifier-" + threadNumber.getAndIncrement() );
            }
        });
    private final Executor backgroundJobListenerExecutor = Executors.newSingleThreadExecutor( 
        new ThreadFactory()
        {
            AtomicInteger threadNumber = new AtomicInteger( 1 );
            public Thread newThread( Runnable r )
            {
                return new Thread( r, "EslBackgroundJobNotifier-" + threadNumber.getAndIncrement() );
            }
        });
    
    private AtomicBoolean authenticatorResponded = new AtomicBoolean( false );
    private boolean authenticated;
    private CommandResponse authenticationResponse;
    private Channel channel;
    
    public boolean canSend()
    {
        return channel != null && channel.isConnected() && authenticated; 
    }
    
    public void addEventListener( IEslEventListener listener )
    {
        if ( listener != null )
        {
            eventListeners.add( listener );
        }
    }

    /**
     * Attempt to establish an authenticated connection to the nominated FreeSWITCH ESL server socket.
     * This call will block, waiting for an authentication handshake to occur, or timeout after the
     * supplied number of seconds.  
     *  
     * @param host can be either ip address or hostname
     * @param port tcp port that server socket is listening on (set in event_socket_conf.xml)
     * @param password server event socket is expecting (set in event_socket_conf.xml) 
     * @param timeoutSeconds number of seconds to wait for the server socket before aborting
     */
    public void connect( String host, int port, String password, int timeoutSeconds ) throws InboundConnectionFailure
    {
        // If already connected, disconnect first
        if ( canSend() )
        {
            close();
        }
        
        // Configure this client
        ClientBootstrap bootstrap = new ClientBootstrap(
            new NioClientSocketChannelFactory( 
                Executors.newCachedThreadPool(), 
                Executors.newCachedThreadPool() ) ); 
        
        // Add ESL handler and factory
        InboundClientHandler handler = new InboundClientHandler( password, protocolListener );
        bootstrap.setPipelineFactory( new InboundPipelineFactory( handler ) );
        
        // Attempt connection
        ChannelFuture future = bootstrap.connect( new InetSocketAddress( host, port ) );
        
        // Wait till attempt succeeds, fails or timeouts
        if ( ! future.awaitUninterruptibly( timeoutSeconds, TimeUnit.SECONDS ) )
        {
            throw new InboundConnectionFailure( "Timeout connecting to " + host + ":" + port );
        }
        // Did not timeout 
        channel = future.getChannel();
        // But may have failed anyway
        if ( !future.isSuccess() )
        {
            log.warn( "Failed to connect to [{}:{}]", host, port );
            log.warn( "  * reason: {}", future.getCause() );
            
            channel = null;
            bootstrap.releaseExternalResources();
            
            throw new InboundConnectionFailure( "Could not connect to " + host + ":" + port, future.getCause() );
        }
        
        //  Wait for the authentication handshake to call back
        while ( ! authenticatorResponded.get() )
        {
            try
            {
                Thread.sleep( 250 );
            } 
            catch ( InterruptedException e )
            {
                // ignore
            }
        }
        
        if ( ! authenticated )
        {
            throw new InboundConnectionFailure( "Authentication failed: " + authenticationResponse.getReplyText() );
        }
    }
    
    /**
     * Sends a FreeSWITCH API command to the server and blocks, waiting for an immediate response from the 
     * server.
     * <p/>
     * The outcome of the command from the server is retured in an {@link EslMessage} object.
     * 
     * @param command API command to send
     * @param arg command arguments
     * @return an {@link EslMessage} containing command results
     */
    public EslMessage sendSyncApiCommand( String command, String arg )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( command != null && !command.isEmpty() )
        {
            sb.append( "api " );
            sb.append( command );
        }
        if ( arg != null && !arg.isEmpty() )
        {
            sb.append( ' ' );
            sb.append( arg );
        }

        return handler.sendSyncSingleLineCommand( channel, sb.toString() );
    }
    
    /**
     * Submit a FreeSWITCH API command to the server to be executed in background mode. A synchronous 
     * response from the server provides a UUID to identify the job execution results. When the server
     * has completed the job execution it fires a BACKGROUND_JOB Event with the execution results.<p/>
     * Note that this Client must be subscribed in the normal way to BACKGOUND_JOB Events, in order to 
     * receive this event.
     *     
     * @param command API command to send
     * @param arg command arguments
     * @return String Job-UUID that the server will tag result event with.
     */
    public String sendAsyncApiCommand( String command, String arg )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( command != null && !command.isEmpty() )
        {
            sb.append( "bgapi " );
            sb.append( command );
        }
        if ( arg != null && !arg.isEmpty() )
        {
            sb.append( ' ' );
            sb.append( arg );
        }
        
        return handler.sendAsyncCommand( channel, sb.toString() );
    }
    
    /**
     * Set the current event subscription for this connection to the server.  Examples of the events 
     * argument are:
     * <pre>
     *   ALL
     *   CHANNEL_CREATE CHANNEL_DESTROY HEARTBEAT
     *   CUSTOM conference::maintenance
     *   CHANNEL_CREATE CHANNEL_DESTROY CUSTOM conference::maintenance sofia::register sofia::expire
     * </pre> 
     * Subsequent calls to this method replaces any previous subscriptions that were set.
     * </p>
     * Note: current implementation can only process 'plain' events.
     * 
     * @param format can be { plain | xml }
     * @param events { all | space separated list of events } 
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse setEventSubscriptions( String format, String events )
    {
        // temporary hack
        if ( ! format.equals( "plain" ) )
        {
            throw new IllegalStateException( "Only 'plain' event format is supported at present" );
        }
        
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( format != null && !format.isEmpty() )
        {
            sb.append( "event " );
            sb.append( format );
        }
        if ( events != null && !events.isEmpty() )
        {
            sb.append( ' ' );
            sb.append( events );
        }
        EslMessage response = handler.sendSyncSingleLineCommand( channel, sb.toString() );

        return new CommandResponse( sb.toString(), response );
    }
    
    /**
     * Cancel any existing event subscription.
     * 
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse cancelEventSubscriptions()
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        EslMessage response = handler.sendSyncSingleLineCommand( channel, "noevents" );

        return new CommandResponse( "noevents", response );
    }

    /**
     * Add an event filter to the current set of event filters on this connection. Any of the event headers
     * can be used as a filter.
     * </p>
     * Note that event filters follow 'filter-in' semantics. That is, when a filter is applied
     * only the filtered values will be received. Multiple filters can be added to the current
     * connection.
     * </p>
     * Example filters:
     * <pre>
     *    eventHeader        valueToFilter
     *    ----------------------------------
     *    Event-Name         CHANNEL_EXECUTE
     *    Channel-State      CS_NEW
     * </pre>
     * 
     * @param eventHeader to filter on
     * @param valueToFilter the value to match
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse addEventFilter( String eventHeader, String valueToFilter )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( eventHeader != null && !eventHeader.isEmpty() )
        {
            sb.append( "filter " );
            sb.append( eventHeader );
        }
        if ( valueToFilter != null && !valueToFilter.isEmpty() )
        {
            sb.append( ' ' );
            sb.append( valueToFilter );
        }
        EslMessage response = handler.sendSyncSingleLineCommand( channel, sb.toString() );
        
        return new CommandResponse( sb.toString(), response );
    }
    
    /**
     * Delete an event filter from the current set of event filters on this connection.  See  
     * {@link Client.addEventFilter}   
     * 
     * @param eventHeader   to remove
     * @param valueToFilter to remove
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse deleteEventFilter( String eventHeader, String valueToFilter )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( eventHeader != null && !eventHeader.isEmpty() )
        {
            sb.append( "filter delete " );
            sb.append( eventHeader );
        }
        if ( valueToFilter != null && !valueToFilter.isEmpty() )
        {
            sb.append( ' ' );
            sb.append( valueToFilter );
        }
        EslMessage response = handler.sendSyncSingleLineCommand( channel, sb.toString() );

        return new CommandResponse( sb.toString(), response );
    }

    /**
     * Send a {@link SendMsg} command to FreeSWITCH.  This client requires that the {@link SendMsg}
     * has a call UUID parameter.
     *  
     * @param sendMsg a {@link SendMsg} with call UUID
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse sendMessage( SendMsg sendMsg )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        EslMessage response = handler.sendSyncMultiLineCommand( channel, sendMsg.getMsgLines() );
        
        return new CommandResponse( sendMsg.toString(), response );
    }
    
    /**
     * Enable log output.
     * 
     * @param level using the same values as in console.conf
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse setLoggingLevel( String level )
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        StringBuilder sb = new StringBuilder();
        if ( level != null && !level.isEmpty() )
        {
            sb.append( "log " );
            sb.append( level );
        }
        EslMessage response = handler.sendSyncSingleLineCommand( channel, sb.toString() );

        return new CommandResponse( sb.toString(), response );
    }

    /**
     * Disable any logging previously enabled with setLogLevel().
     * 
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse cancelLogging()
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        EslMessage response = handler.sendSyncSingleLineCommand( channel, "nolog" );

        return new CommandResponse( "nolog", response );
    }

    /**
     * Close the socket connection
     * 
     * @return a {@link CommandResponse} with the server's response.
     */
    public CommandResponse close()
    {
        checkConnected();
        InboundClientHandler handler = (InboundClientHandler)channel.getPipeline().getLast();
        EslMessage response = handler.sendSyncSingleLineCommand( channel, "exit" );

        return new CommandResponse( "exit", response );
    }
    
    /*
     *  Internal observer of the ESL protocol 
     */
    private final IEslProtocolListener protocolListener = new IEslProtocolListener()
    {
        public void authResponseReceived( CommandResponse response )
        {
            authenticatorResponded.set( true );
            authenticated = response.isOk();
            authenticationResponse = response;
            log.debug( "Auth response success={}, message=[{}]", authenticated, response.getReplyText() );
        }
        
        public void eventReceived( final EslEvent event )
        {
            log.debug( "Event received [{}]", event );
            /*
             *  Notify listeners in a different thread in order to:
             *    - not to block the IO threads with potentially long-running listeners
             *    - generally be defensive running other people's code
             *  Use a different worker thread pool for async job results than for event driven
             *  events to keep the latency as low as possible.
             */
            if ( event.getEventName().equals( "BACKGROUND_JOB" ) )
            {
                for ( final IEslEventListener listener : eventListeners )
                {
                    backgroundJobListenerExecutor.execute( new Runnable()
                    {
                        public void run()
                        {
                            try
                            {
                                listener.backgroundJobResultReceived( event );
                            }
                            catch ( Throwable t )
                            {
                                log.error( "Error caught notifying listener of job result [" + event + ']', t );
                            }
                        }
                    } );
                }
            }
            else
            {
                for ( final IEslEventListener listener : eventListeners )
                {
                    eventListenerExecutor.execute( new Runnable()
                    {
                        public void run()
                        {
                            try
                            {
                                /**
                                 * Custom extra parsing to get conference Events for BigBlueButton / FreeSwitch intergration
                                 */
                                //FIXME: make the conference headers constants
                                if(event.getEventSubclass().equals("conference::maintenance")){
                                    Map<String, String> eventHeaders = event.getEventHeaders();
                                    String eventFunc = eventHeaders.get("Event-Calling-Function");
                                    String uniqueId = eventHeaders.get("Caller-Unique-ID");
                                    String confName = eventHeaders.get("Conference-Name");
                                    int confSize = Integer.parseInt(eventHeaders.get("Conference-Size"));

                                    //FIXME: all by Action eventHeader really.... maybe?
                                    // But this way we filter whole sections of Action events
                                    if(eventFunc == null) {
                                        //Noop...
                                    }else if(eventFunc.equals("conference_thread_run")) {
                                    	System.out.println("##### Client conference_thread_run");
                                        listener.conferenceEventThreadRun(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("member_add_file_data")) {
                                    	System.out.println("##### Client member_add_file_data");
                                        listener.conferenceEventPlayFile(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conf_api_sub_transfer")) {
                                        //Member transfered to another conf...
                                        listener.conferenceEventTransfer(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conference_add_member")) {
                                    	System.out.println("##### Client conference_add_member");
                                        listener.conferenceEventJoin(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conference_del_member")) {
                                    	System.out.println("##### Client conference_del_member");
                                        listener.conferenceEventLeave(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conf_api_sub_mute")) {
                                        listener.conferenceEventMute(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conf_api_sub_unmute")) {
                                        listener.conferenceEventUnMute(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conference_record_thread_run")) {
                                    	System.out.println("##### Client conference_record_thread_run");
                                        listener.conferenceEventRecord(uniqueId, confName, confSize, event);
                                        return;
                                    }else if(eventFunc.equals("conference_loop_input")) {
                                        listener.conferenceEventAction(uniqueId, confName, confSize, eventHeaders.get("Action"), event);
                                        return;
                                    }else{
                        /*              StringBuilder sb = new StringBuilder("");
                                        sb.append("\n");
                                        for (Iterator it=eventHeaders.entrySet().iterator(); it.hasNext(); ) {
                                            Map.Entry entry = (Map.Entry)it.next();
                                            sb.append(entry.getKey());
                                            sb.append(" => '");
                                            sb.append(entry.getValue());
                                            sb.append("'\n");
                                        }
                                        log.info ("Unknown Conference Event [{}] [{}]", confName, sb.toString());
                         */
                                    }
                                }


                                listener.eventReceived( event );
                            }
                            catch ( Throwable t )
                            {
                                log.error( "Error caught notifying listener of event [" + event + ']', t );
                            }
                        }
                    } );
                }
            }
        }

        public void disconnected()
        {
            log.info( "Disconnected .." );
        }

        public void exceptionCaught(final ExceptionEvent e) {
            log.debug( "exceptionCaught [{}]", e );

            for ( final IEslEventListener listener : eventListeners )
                {
                    eventListenerExecutor.execute( new Runnable()
                    {
                        public void run()
                        {
                            try
                            {
                                listener.exceptionCaught( e );
                            }
                            catch ( Throwable t )
                            {
                                log.error( "Error caught notifying listener of exception [" + e + ']', t );
                            }
                        }
                    } );
                }

        }
    };
    
    private void checkConnected()
    {
        if ( ! canSend() )
        {
            throw new IllegalStateException( "Not connected to FreeSWITCH Event Socket" );
        }
    }
}

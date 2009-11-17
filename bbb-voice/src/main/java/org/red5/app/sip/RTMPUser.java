package org.red5.app.sip;

import java.io.*;

import org.apache.mina.core.buffer.IoBuffer;
import org.red5.io.utils.ObjectMap;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.event.IEventDispatcher;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.net.rtmp.Channel;
import org.red5.server.net.rtmp.RTMPClient;
import org.red5.server.net.rtmp.INetStreamEventHandler;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.ClientExceptionHandler;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.red5.server.net.rtmp.event.SerializeUtils;
import org.red5.server.stream.AbstractClientStream;
import org.red5.server.stream.IStreamData;
import org.red5.server.stream.message.RTMPMessage;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;


public class RTMPUser extends RTMPClient implements INetStreamEventHandler, ClientExceptionHandler, IPendingServiceCallback {

    private static final Logger logger = Red5LoggerFactory.getLogger( RTMPUser.class, "sip" );
    public boolean createdPlayStream = false;
    public boolean startPublish = false;
    public Integer playStreamId;
    public Integer publishStreamId;
    public RTPStreamSender rtpStreamSender;
    private String publishName;
    private String playName;
    private RTMPConnection conn;
    private int videoTs = 0;
    private int audioTs = 0;
    private int kt = 0;
    private int kt2 = 0;
    private IoBuffer buffer;

    private RtpSender rtpSender;
    
    @Override
    public void connectionOpened( RTMPConnection conn, RTMP state ) {
        logger.debug( "connection opened" );
        super.connectionOpened( conn, state );
        this.conn = conn;
    }


    @Override
    public void connectionClosed( RTMPConnection conn, RTMP state ) {

        logger.debug( "connection closed" );
        super.connectionClosed( conn, state );
    }


    @Override
    protected void onInvoke( RTMPConnection conn, Channel channel, Header header, Notify notify, RTMP rtmp ) {
        super.onInvoke( conn, channel, header, notify, rtmp );

        try {
            ObjectMap< String, String > map = (ObjectMap) notify.getCall().getArguments()[ 0 ];
            String code = map.get( "code" );

            if ( StatusCodes.NS_PLAY_STOP.equals( code ) ) {
                logger.debug( "onInvoke, code == NetStream.Play.Stop, disconnecting" );
                disconnect();
            }
        }
        catch ( Exception e ) {

        }

    }

    public void setRtpSender(RtpSender rtpSender) {
    	this.rtpSender = rtpSender;
    }

    // ------------------------------------------------------------------------
    //
    // Public
    //
    // ------------------------------------------------------------------------

    public void startStream( String host, String app, int port, String publishName, String playName ) {
    	logger.debug( "RTMPUser startStream" );

        this.publishName = publishName;
        this.playName = playName;

        createdPlayStream = false;
        startPublish = false;

        videoTs = 0;
        audioTs = 0;
        kt = 0;
        kt2 = 0;

        try {
            connect( host, port, app, this );
        }
        catch ( Exception e ) {
            logger.error( "RTMPUser startStream exception " + e );
        }

    }


    public void stopStream() {
    	logger.debug( "RTMPUser stopStream" );

        try {
        	unpublish(publishStreamId);
            disconnect();
        }
        catch ( Exception e ) {
            logger.error( "RTMPUser stopStream exception " + e );
        }

    }

	public void handleException(Throwable throwable)
	{
			logger.error("{}",new Object[]{throwable.getCause()});
			System.out.println( throwable.getCause() );
	}


    public void onStreamEvent( Notify notify ) {

        logger.debug( "onStreamEvent " + notify );

        ObjectMap map = (ObjectMap) notify.getCall().getArguments()[ 0 ];
        String code = (String) map.get( "code" );

        if ( StatusCodes.NS_PUBLISH_START.equals( code ) ) {
            logger.debug( "onStreamEvent Publish start" );
            startPublish = true;
        }
    }


    public void resultReceived( IPendingServiceCall call ) {

        logger.debug( "service call result: " + call );

        if ( "connect".equals( call.getServiceMethodName() ) ) {
            createPlayStream( this );

        }
        else if ( "createStream".equals( call.getServiceMethodName() ) ) {

            if ( createdPlayStream ) {
                publishStreamId = (Integer) call.getResult();
                logger.debug( "createPublishStream result stream id: " + publishStreamId );
                logger.debug( "publishing video by name: " + publishName );
                publish( publishStreamId, publishName, "live", this );

            }
            else {
                playStreamId = (Integer) call.getResult();
                logger.debug( "createPlayStream result stream id: " + playStreamId );
                logger.debug( "playing video by name: " + playName );
                play( playStreamId, playName, -2000, -1000 );

                createdPlayStream = true;
                createStream( this );
            }
        }
    }

    public void pushAudio( int len, byte[] audio, long ts, int codec ) throws IOException {
        if ( buffer == null ) {
            buffer = IoBuffer.allocate( 1024 );
            buffer.setAutoExpand( true );
        }

        buffer.clear();

        buffer.put( (byte) codec ); // first byte 2 mono 5500; 6 mono 11025; 22
        // mono 11025 adpcm 82 nellymoser 8000 178
        // speex 8000
        byte [] copy = new byte[audio.length];
	    System.arraycopy( audio, 0, copy, 0, audio.length );
        
        buffer.put( copy );
        
        buffer.flip();

        AudioData audioData = new AudioData( buffer );
        audioData.setTimestamp( (int) ts );

        kt++;
        if ( kt < 10 ) {
            logger.debug( "+++ " + audioData );
            System.out.println( "+++ " + audioData  );
        }

        RTMPMessage rtmpMsg = new RTMPMessage();
        rtmpMsg.setBody( audioData );
        publishStreamData( publishStreamId, rtmpMsg );
    }


    // ------------------------------------------------------------------------
    //
    // Privates
    //
    // ------------------------------------------------------------------------

    private void createPlayStream( IPendingServiceCallback callback ) {

        logger.debug( "create play stream" );
        IPendingServiceCallback wrapper = new CreatePlayStreamCallBack( callback );
        invoke( "createStream", null, wrapper );
    }

    private class CreatePlayStreamCallBack implements IPendingServiceCallback {

        private IPendingServiceCallback wrapped;


        public CreatePlayStreamCallBack( IPendingServiceCallback wrapped ) {

            this.wrapped = wrapped;
        }


        public void resultReceived( IPendingServiceCall call ) {

            Integer streamIdInt = (Integer) call.getResult();

            if ( conn != null && streamIdInt != null ) {
                PlayNetStream stream = new PlayNetStream();
                stream.setConnection( conn );
                stream.setStreamId( streamIdInt.intValue() );
                conn.addClientStream( stream );
            }
            wrapped.resultReceived( call );
        }

    }

    private class PlayNetStream extends AbstractClientStream implements IEventDispatcher {

        public void close() {

        }


        public void start() {

        }


        public void stop() {

        }


        public void dispatchEvent( IEvent event ) {

            if ( !( event instanceof IRTMPEvent ) ) {
                logger.debug( "skipping non rtmp event: " + event );
                return;
            }

            IRTMPEvent rtmpEvent = (IRTMPEvent) event;

            if ( logger.isDebugEnabled() ) {
                // logger.debug("rtmp event: " + rtmpEvent.getHeader() + ", " +
                // rtmpEvent.getClass().getSimpleName());
            }

            if ( !( rtmpEvent instanceof IStreamData ) ) {
                logger.debug( "skipping non stream data" );
                return;
            }

            if ( rtmpEvent.getHeader().getSize() == 0 ) {
                logger.debug( "skipping event where size == 0" );
                return;
            }

            if ( rtmpEvent instanceof VideoData ) {
                // videoTs += rtmpEvent.getTimestamp();
                // tag.setTimestamp(videoTs);

            }
            else if ( rtmpEvent instanceof AudioData ) {
                audioTs += rtmpEvent.getTimestamp();

                IoBuffer audioData = ( (IStreamData) rtmpEvent ).getData().asReadOnlyBuffer();
                byte[] data = SerializeUtils.ByteBufferToByteArray( audioData );

                //System.out.println( "RTMPUser.dispatchEvent() - AudioData -> length = " + data.length + ".");

                kt2++;

                if ( kt2 < 10 ) {
                    logger.debug( "*** " + data.length );
                    System.out.println( "*** " + data.length );
                }

                try {
                	/*
                    if ( rtpStreamSender != null ) {
                        rtpStreamSender.send( data, 1, data.length - 1 );
                    }
                    */
                	
                    if (rtpSender != null ) {
                        rtpSender.send( data, 1, data.length - 1 );
                    }
                }
                catch ( Exception e ) {
                    System.out.println( "PlayNetStream dispatchEvent exception " + e );
                }

            }
        }
    }
}

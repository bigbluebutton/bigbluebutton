/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.app.videoproxy;

import java.util.HashMap;
import java.util.Map;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.scope.IBasicScope;
import org.red5.server.api.scope.IBroadcastScope;
import org.red5.server.api.scope.ScopeType;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;
import com.flazr.rtmp.message.Video;

import org.red5.server.net.rtmp.event.VideoData;

import org.red5.server.api.stream.IStreamPacket;

import org.apache.mina.core.buffer.IoBuffer;


import com.flazr.rtmp.RtmpReader;

public class VideoApplication extends MultiThreadedApplicationAdapter implements IStreamListener {
    private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");
    
    private IScope appScope;
    private IServerStream serverStream;
    VideoRtmpReader rtmpReader;
    private boolean recordVideoStream = false;
    private EventRecordingService recordingService;
    private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();
    
    @Override
    public boolean appStart(IScope app) {
        super.appStart(app);
        log.info("oflaDemo appStart");
        System.out.println("oflaDemo appStart");        
        appScope = app;
        rtmpReader = new VideoRtmpReader("320x240-teste", 320, 240);
        return true;
    }

    @Override
    public boolean appConnect(IConnection conn, Object[] params) {
        log.info("oflaDemo appConnect"); 
        
        return super.appConnect(conn, params);
    }

    @Override
    public void appDisconnect(IConnection conn) {
        log.info("oflaDemo appDisconnect");
        if (appScope == conn.getScope() && serverStream != null) {
            serverStream.close();
        }
        super.appDisconnect(conn);
    }
    
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
        super.streamPublishStart(stream);
    }
    

    public IBroadcastScope getBroadcastScope(IScope scope, String name) {
    IBasicScope basicScope = scope.getBasicScope(ScopeType.BROADCAST, name);
    if (!(basicScope instanceof IBroadcastScope)) {
        return null;
    } else {
        return (IBroadcastScope) basicScope;
    }
}


    @Override
    public void streamBroadcastStart(IBroadcastStream stream) {
        IConnection conn = Red5.getConnectionLocal();  
        super.streamBroadcastStart(stream);
        log.info("streamBroadcastStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());


      
        System.out.println(conn.getScope().getName() + "-" + stream.getPublishedName());
        //VideoProxyReceiver(String host, String appPath, String conference, String streamName)
        /*if (recordVideoStream) {
            recordStream(stream);
            VideoStreamListener listener = new VideoStreamListener(); 
            listener.setEventRecordingService(recordingService);
            stream.addStreamListener(listener); 
            streamListeners.put(conn.getScope().getName() + "-" + stream.getPublishedName(), listener);
        }
*/

         //VideoProxyReceiver v = new VideoProxyReceiver("143.54.10.63", "videoproxy", "conferencia", stream.getPublishedName(), rtmpReader);
         //v.start();
         stream.addStreamListener(this);

         //String videoFilename = "/home/mconf/bbbot/bot/etc/video-sample.flv";
         //FlvPreLoader loader = new FlvPreLoader(videoFilename);
         //RtmpReader reader = new GlobalFlvReader(loader);

         VideoProxyPublisher proxy_publisher = new VideoProxyPublisher("143.54.10.63", "video", "", rtmpReader, "320x240-teste");
         proxy_publisher.start();
         //proxy_publisher.fireFirstFrame();
    }

    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
        IConnection conn = Red5.getConnectionLocal();  
        super.streamBroadcastClose(stream);
        
        if (recordVideoStream) {
            IStreamListener listener = streamListeners.remove(conn.getScope().getName() + "-" + stream.getPublishedName());
            if (listener != null) {
                stream.removeStreamListener(listener);
            }
            
            long publishDuration = (System.currentTimeMillis() - stream.getCreationTime()) / 1000;
            log.info("streamBroadcastClose " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
            Map<String, String> event = new HashMap<String, String>();
            event.put("module", "WEBCAM");
            event.put("timestamp", new Long(System.currentTimeMillis()).toString());
            event.put("meetingId", conn.getScope().getName());
            event.put("stream", stream.getPublishedName());
            event.put("duration", new Long(publishDuration).toString());
            event.put("eventName", "StopWebcamShareEvent");
            
            recordingService.record(conn.getScope().getName(), event);          
        }
    }
    
    /**
     * A hook to record a stream. A file is written in webapps/video/streams/
     * @param stream
     */
    private void recordStream(IBroadcastStream stream) {
        IConnection conn = Red5.getConnectionLocal();   
        long now = System.currentTimeMillis();
        String recordingStreamName = stream.getPublishedName(); // + "-" + now; /** Comment out for now...forgot why I added this - ralam */
     
        try {           
            log.info("Recording stream " + recordingStreamName );
            ClientBroadcastStream cstream = (ClientBroadcastStream) this.getBroadcastStream(conn.getScope(), stream.getPublishedName());
            cstream.saveAs(recordingStreamName, false);
        } catch(Exception e) {
            log.error("ERROR while recording stream " + e.getMessage());
            e.printStackTrace();
        }       
    }

    public void setRecordVideoStream(boolean recordVideoStream) {
        this.recordVideoStream = recordVideoStream;
    }
    
    public void setEventRecordingService(EventRecordingService s) {
        recordingService = s;
    }





    public void packetReceived(IBroadcastStream stream, IStreamPacket packet) {
        if (packet instanceof VideoData) {
                VideoData aux = (VideoData) packet;
                final int ts = aux.getTimestamp();
                IoBuffer data = aux.getData();
                //if(data != null) Need to check
                int lenght = data.limit();
                final byte[] array = new byte[lenght];
                data.mark();
                data.get(array);
                data.reset();
                rtmpReader.addFrame(new Video(ts, array, lenght));
        }
    }
}

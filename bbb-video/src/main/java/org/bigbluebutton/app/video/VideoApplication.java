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
package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Timer;
import java.util.TimerTask;

import org.bigbluebutton.app.video.h263.H263Converter;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.scope.IBasicScope;
import org.red5.server.api.scope.IBroadcastScope;
import org.red5.server.api.scope.ScopeType;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;
import org.apache.commons.lang3.StringUtils;
import com.google.gson.Gson;

public class VideoApplication extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");
	
	private IScope appScope;
	private IServerStream serverStream;
	
	private boolean recordVideoStream = false;
	private EventRecordingService recordingService;
	private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();

    private Map<String, CustomStreamRelay> remoteStreams = new ConcurrentHashMap<String, CustomStreamRelay>();
    private Map<String, Integer> listenersOnRemoteStream = new ConcurrentHashMap<String, Integer>();

	// Proxy disconnection timer
	private Timer timer;
	// Proxy disconnection timeout
	private long relayTimeout;

	private final Map<String, H263Converter> h263Converters = new HashMap<String, H263Converter>();

    @Override
	public boolean appStart(IScope app) {
	    super.appStart(app);
		log.info("BBB Video appStart");
		System.out.println("BBB Video appStart");    	
		appScope = app;
		timer = new Timer();
		return true;
	}

    @Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.info("BBB Video appConnect"); 		
		return super.appConnect(conn, params);
	}

  @Override
	public boolean roomConnect(IConnection conn, Object[] params) {
		log.info("BBB Video roomConnect"); 

		if(params.length == 0) {
			params = new Object[2];
			params[0] = "UNKNOWN-MEETING-ID";
			params[1] = "UNKNOWN-USER-ID";
		}

  	String meetingId = ((String) params[0]).toString();
  	String userId = ((String) params[1]).toString();
  	
  	Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
  	Red5.getConnectionLocal().setAttribute("USERID", userId);
  	
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();
		
		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", meetingId);
		logData.put("userId", userId);
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("event", "user_joining_bbb_video");
		logData.put("description", "User joining BBB Video.");
		
		Gson gson = new Gson();
    String logStr =  gson.toJson(logData);
		
		log.info("User joining bbb-video: data={}", logStr);
		
		return super.roomConnect(conn, params);
	}
    
  private String getConnectionType(String connType) {
  	if ("persistent".equals(connType.toLowerCase())) {
  		return "RTMP";
  	} else if("polling".equals(connType.toLowerCase())) {
  		return "RTMPT";
  	} else {
  		return connType.toUpperCase();
  	}
  }

	private String getUserId() {
		String userid = (String) Red5.getConnectionLocal().getAttribute("USERID");
		if ((userid == null) || ("".equals(userid))) userid = "unknown-userid";
		return userid;
	}
	
	private String getMeetingId() {
		String meetingId = (String) Red5.getConnectionLocal().getAttribute("MEETING_ID");
		if ((meetingId == null) || ("".equals(meetingId))) meetingId = "unknown-meetingid";
		return meetingId;
	}
	
  @Override
	public void appDisconnect(IConnection conn) {
		log.info("BBB Video appDisconnect");
		if (appScope == conn.getScope() && serverStream != null) {
			serverStream.close();
		}
		
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();
		
		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", getMeetingId());
		logData.put("userId", getUserId());
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("event", "user_leaving_bbb_video");
		logData.put("description", "User leaving BBB Video.");
		
		Gson gson = new Gson();
    String logStr =  gson.toJson(logData);
		
		log.info("User leaving bbb-video: data={}", logStr);
		
		super.appDisconnect(conn);
	}

  @Override
	public void roomDisconnect(IConnection conn) {
		log.info("BBB Video roomDisconnect");
		
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();
		
		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", getMeetingId());
		logData.put("userId", getUserId());
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("event", "user_leaving_bbb_video");
		logData.put("description", "User leaving BBB Video.");
		
		Gson gson = new Gson();
    String logStr =  gson.toJson(logData);
		
		log.info("User leaving bbb-video: data={}", logStr);
		
		super.roomDisconnect(conn);
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

        if (recordVideoStream && !stream.getPublishedName().contains("/")) {
	    	recordStream(stream);
	    	VideoStreamListener listener = new VideoStreamListener(); 
	        listener.setEventRecordingService(recordingService);
	        stream.addStreamListener(listener); 
	        streamListeners.put(conn.getScope().getName() + "-" + stream.getPublishedName(), listener);
        }
    }

    private Long genTimestamp() {
    	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
    }

	private boolean isH263Stream(ISubscriberStream stream) {
		String streamName = stream.getBroadcastStreamPublishName();
		if(streamName.startsWith(H263Converter.H263PREFIX)) {
			return true;
		}
		return false;
	}

    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
      super.streamBroadcastClose(stream);   	
      if (recordVideoStream) {
        IConnection conn = Red5.getConnectionLocal();
        String scopeName;
        if (conn != null) {
  	       scopeName = conn.getScope().getName();
        } else {
  	       log.info("Connection local was null, using scope name from the stream: {}", stream);
  	       scopeName = stream.getScope().getName();
        }
        IStreamListener listener = streamListeners.remove(scopeName + "-" + stream.getPublishedName());
        if (listener != null) {
          stream.removeStreamListener(listener);
        }
        
        long publishDuration = (System.currentTimeMillis() - stream.getCreationTime()) / 1000;
        log.info("streamBroadcastClose " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + scopeName);
        Map<String, String> event = new HashMap<String, String>();
        event.put("module", "WEBCAM");
        event.put("timestamp", genTimestamp().toString());
        event.put("meetingId", scopeName);
        event.put("stream", stream.getPublishedName());
        event.put("duration", new Long(publishDuration).toString());
        event.put("eventName", "StopWebcamShareEvent");
        recordingService.record(scopeName, event);    		
      }

		if(h263Converters.containsKey(stream.getName())) {
			// Stop converter
			h263Converters.remove(stream.getName()).stopConverter();
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

	public void setRelayTimeout(long timeout) {
		this.relayTimeout = timeout;
	}
    @Override
    public void streamPlayItemPlay(ISubscriberStream stream, IPlayItem item, boolean isLive) {
        // log w3c connect event
        String streamName = item.getName();
        streamName = streamName.replaceAll(H263Converter.H263PREFIX, "");

		if(isH263Stream(stream)) {
			log.trace("Detected H263 stream request [{}]", streamName);

			synchronized (h263Converters) {
				// Check if a new stream converter is necessary
				if(!h263Converters.containsKey(streamName)) {
					H263Converter converter = new H263Converter(streamName);
					h263Converters.put(streamName, converter);
				}
				else {
					H263Converter converter = h263Converters.get(streamName);
					converter.addListener();
				}
			}
		}
        if(streamName.contains("/")) {
			synchronized(remoteStreams) {
				if(remoteStreams.containsKey(streamName) == false) {
					String[] parts = streamName.split("/");
					String sourceServer = parts[0];
					String sourceStreamName = StringUtils.join(parts, '/', 1, parts.length);
					String destinationServer = Red5.getConnectionLocal().getHost();
					String destinationStreamName = streamName;
					String app = "video/"+Red5.getConnectionLocal().getScope().getName();
					log.trace("streamPlayItemPlay:: streamName [" + streamName + "]");
					log.trace("streamPlayItemPlay:: sourceServer [" + sourceServer + "]");
					log.trace("streamPlayItemPlay:: sourceStreamName [" + sourceStreamName + "]");
					log.trace("streamPlayItemPlay:: destinationServer [" + destinationServer + "]");
					log.trace("streamPlayItemPlay:: destinationStreamName [" + destinationStreamName + "]");
					log.trace("streamPlayItemPlay:: app [" + app + "]");

					CustomStreamRelay remoteRelay = new CustomStreamRelay();
					remoteRelay.initRelay(new String[]{sourceServer, app, sourceStreamName, destinationServer, app, destinationStreamName, "live"});
					remoteRelay.startRelay();
					remoteStreams.put(destinationStreamName, remoteRelay);
					listenersOnRemoteStream.put(streamName, 1);
				}
				else {
					Integer numberOfListeners = listenersOnRemoteStream.get(streamName) + 1;
					listenersOnRemoteStream.put(streamName,numberOfListeners);
				}
			}
		}
		log.info("W3C x-category:stream x-event:play c-ip:{} x-sname:{} x-name:{}", new Object[] { Red5.getConnectionLocal().getRemoteAddress(), stream.getName(), item.getName() });
	}

    @Override
    public void streamSubscriberClose(ISubscriberStream stream) {

		String streamName = stream.getBroadcastStreamPublishName();
		streamName = streamName.replaceAll(H263Converter.H263PREFIX, "");

		if(isH263Stream(stream)) {
			synchronized (h263Converters) {
				// Remove prefix
				if(h263Converters.containsKey(streamName)) {
					H263Converter converter = h263Converters.get(streamName);
					converter.removeListener();
				}
				else {
					log.warn("Converter not found for H263 stream [{}]", streamName);
				}
			}
		}
		synchronized(remoteStreams) {
			super.streamSubscriberClose(stream);
			log.trace("Subscriber close for stream [{}]", streamName);
			if(streamName.contains("/")) {
				if(remoteStreams.containsKey(streamName)) {
					Integer numberOfListeners = listenersOnRemoteStream.get(streamName);
					if(numberOfListeners != null) {
						numberOfListeners = numberOfListeners - 1;
						listenersOnRemoteStream.put(streamName, numberOfListeners);
						log.trace("Stream [{}] has {} subscribers left", streamName, numberOfListeners);
						if(numberOfListeners < 1) {
							log.info("Starting timeout to close proxy for stream: {}", streamName);
							timer.schedule(new DisconnectProxyTask(streamName), relayTimeout);
						}
					}
				}
			}
		}
    }

	private final class DisconnectProxyTask extends TimerTask {
		// Stream name that should be disconnected
		private String streamName;

		public DisconnectProxyTask(String streamName) {
			this.streamName = streamName;
		}

		@Override
		public void run() {
			// Cancel this task
			this.cancel();
			// Check if someone reconnected
			synchronized(remoteStreams) {
				Integer numberOfListeners = listenersOnRemoteStream.get(streamName);
				log.trace("Stream [{}] has {} subscribers", streamName, numberOfListeners);
				if(numberOfListeners != null) {
					if(numberOfListeners < 1) {
						// No one else is connected to this stream, close relay
						log.info("Stopping relay for stream [{}]", streamName);
						listenersOnRemoteStream.remove(streamName);
						CustomStreamRelay remoteRelay = remoteStreams.remove(streamName);
						remoteRelay.stopRelay();
					}
				}
			}
		}
	}
}

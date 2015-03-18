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

import org.bigbluebutton.app.video.h263.H263Converter;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class VideoApplication extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");
	
	private IScope appScope;
	private IServerStream serverStream;
	
	private boolean recordVideoStream = false;
	private EventRecordingService recordingService;
	private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();

	private final Map<String, H263Converter> h263Converters = new HashMap<String, H263Converter>();

    @Override
	public boolean appStart(IScope app) {
	    super.appStart(app);
		log.info("BBB Video appStart");
		System.out.println("BBB Video appStart");    	
		appScope = app;
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
    
    @Override
    public void streamBroadcastStart(IBroadcastStream stream) {
    	IConnection conn = Red5.getConnectionLocal();  
    	super.streamBroadcastStart(stream);
    	log.info("streamBroadcastStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());

        if (recordVideoStream && stream.getPublishedName().contains("/") == false) {
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
	public void streamPlayItemPlay(ISubscriberStream stream, IPlayItem item, boolean isLive) {
		String streamName = item.getName();

		if(isH263Stream(stream)) {
			String origin = streamName.replaceAll(H263Converter.H263PREFIX, "");
			log.trace("Detected H263 stream request [{}]", streamName);

			synchronized (h263Converters) {
				// Check if a new stream converter is necessary
				if(!h263Converters.containsKey(origin)) {
					H263Converter converter = new H263Converter(origin);
					h263Converters.put(origin, converter);
				}
				else {
					H263Converter converter = h263Converters.get(origin);
					converter.addListener();
				}
			}
		}
	}

	@Override
	public void streamSubscriberClose(ISubscriberStream stream) {
		if(isH263Stream(stream)) {
			synchronized (h263Converters) {
				String streamName = stream.getBroadcastStreamPublishName();
				// Remove prefix
				String origin = streamName.replaceAll(H263Converter.H263PREFIX, "");
				if(h263Converters.containsKey(origin)) {
					H263Converter converter = h263Converters.get(origin);
					converter.removeListener();
				}
				else {
					log.warn("Converter not found for H263 stream [{}]", streamName);
				}
			}
		}
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
	
}

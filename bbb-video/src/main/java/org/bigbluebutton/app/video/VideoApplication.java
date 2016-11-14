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
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IServerStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;

import com.google.gson.Gson;

public class VideoApplication extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");

	private MessagePublisher publisher;
	private boolean recordVideoStream = false;
	private EventRecordingService recordingService;
	private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();
	
	private int packetTimeout = 10000;
	
    @Override
	public boolean appStart(IScope app) {
	    super.appStart(app);
		log.info("BBB Video appStart");
		return true;
	}

    @Override
	public boolean appConnect(IConnection conn, Object[] params) {
		return super.appConnect(conn, params);
	}

  @Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.info("BBB Video roomConnect");
		String meetingId = ((String) params[0]).toString();
		String userId = ((String) params[1]).toString();

		Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
		Red5.getConnectionLocal().setAttribute("USERID", userId);

		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String sessionId = Red5.getConnectionLocal().getSessionId();
		/**
		* Find if there are any other connections owned by this user. If we find one,
		* that means that the connection is old and the user reconnected. Clear the
		* userId attribute so that messages would not be sent in the defunct connection.
		*/
		Set<IConnection> conns = Red5.getConnectionLocal().getScope().getClientConnections();
		for (IConnection conn : conns) {
			String connUserId = (String) conn.getAttribute("USERID");
			String connSessionId = conn.getSessionId();
			String clientId = conn.getClient().getId();
			String remoteHost = conn.getRemoteAddress();
			int remotePort = conn.getRemotePort();
			if (connUserId != null && connUserId.equals(userId) && !connSessionId.equals(sessionId)) {
				conn.removeAttribute("USERID");
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", meetingId);
				logData.put("userId", userId);
				logData.put("oldConnId", connSessionId);
				logData.put("newConnId", sessionId);
				logData.put("clientId", clientId);
				logData.put("remoteAddress", remoteHost + ":" + remotePort);
				logData.put("event", "removing_defunct_connection");
				logData.put("description", "Removing defunct connection BBB Video.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);

				log.info("Removing defunct connection: data={}", logStr);
			  }
		  }

	  String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
	  int remotePort = Red5.getConnectionLocal().getRemotePort();
	  String clientId = Red5.getConnectionLocal().getClient().getId();

		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", meetingId);
		logData.put("userId", userId);
		logData.put("connType", connType);
		logData.put("connId", sessionId);
	  logData.put("clientId", clientId);
	  logData.put("remoteAddress", remoteHost + ":" + remotePort);
		logData.put("event", "user_joining_bbb_video");
		logData.put("description", "User joining BBB Video.");

		Gson gson = new Gson();
		String logStr =  gson.toJson(logData);

		log.info("User joining bbb-video: data={}", logStr);

		return super.roomConnect(connection, params);
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
    	IConnection conn = Red5.getConnectionLocal();  
    	log.info("streamPublishStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
    }
    
    @Override
    public void streamBroadcastStart(IBroadcastStream stream) {
    	IConnection conn = Red5.getConnectionLocal();  
    	super.streamBroadcastStart(stream);
    	log.info("streamBroadcastStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());

    	String userId = getUserId();
    	String meetingId = conn.getScope().getName();
    	String streamId = stream.getPublishedName();

    	VideoStreamListener listener = new VideoStreamListener(conn.getScope(), stream, recordVideoStream, userId, packetTimeout);
        listener.setEventRecordingService(recordingService);
        stream.addStreamListener(listener); 
        streamListeners.put(conn.getScope().getName() + "-" + stream.getPublishedName(), listener);
        
        if (recordVideoStream) {
	    	recordStream(stream);
        }
    }

    private Long genTimestamp() {
    	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
      super.streamBroadcastClose(stream);   	
      IConnection conn = Red5.getConnectionLocal();
      String scopeName;
      if (conn != null) {
	       scopeName = conn.getScope().getName();
      } else {
	       log.info("Connection local was null, using scope name from the stream: {}", stream);
	       scopeName = stream.getScope().getName();
      }
      
      log.info("Stream broadcast closed for stream=[{}] meeting=[{}]", stream.getPublishedName(), scopeName);
      
  		String userId = getUserId();
  		String meetingId = conn.getScope().getName();
  		String streamId = stream.getPublishedName();

        IStreamListener listener = streamListeners.remove(scopeName + "-" + stream.getPublishedName());
        if (listener != null) {
        	((VideoStreamListener) listener).streamStopped();
        	stream.removeStreamListener(listener);
        }
        
      if (recordVideoStream) {        
        long publishDuration = (System.currentTimeMillis() - stream.getCreationTime()) / 1000;
        log.info("Stop recording event for stream=[{}] meeting=[{}]", stream.getPublishedName(), scopeName);
        Map<String, String> event = new HashMap<String, String>();
        event.put("module", "WEBCAM");
        event.put("timestamp", genTimestamp().toString());
        event.put("meetingId", scopeName);
        event.put("stream", stream.getPublishedName());
        event.put("duration", new Long(publishDuration).toString());
        event.put("eventName", "StopWebcamShareEvent");
        recordingService.record(scopeName, event);    		
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
	
	public void setPacketTimeout(int timeout) {
		this.packetTimeout = timeout;
	}
	
	public void setEventRecordingService(EventRecordingService s) {
		recordingService = s;
	}
	
	public void setMessagePublisher(MessagePublisher publisher) {
		this.publisher = publisher;
	}

}

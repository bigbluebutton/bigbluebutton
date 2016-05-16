/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.app.videobroadcast;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

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
	private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video-broadcast");

	private IScope appScope;
	private IServerStream serverStream;
	private boolean recordVideoStream = false;
	private EventRecordingService recordingService;
	private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();

	private int packetTimeout = 10000;

	@Override
	public boolean appStart(IScope app) {
		super.appStart(app);
		log.info("BBB Video-broadcast appStart");
		System.out.println("BBB Video-broadcast appStart");
		appScope = app;
		return true;
	}

	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.info("BBB Video-broadcast appConnect");
		return super.appConnect(conn, params);
	}

	@Override
	public boolean roomConnect(IConnection conn, Object[] params) {
		log.info("BBB Video-broadcast roomConnect"); 

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
		if ((userid == null) || ("".equals(userid)))
			userid = "unknown-userid";
		return userid;
	}

	private String getMeetingId() {
		String meetingId = (String) Red5.getConnectionLocal().getAttribute("MEETING_ID");
		if ((meetingId == null) || ("".equals(meetingId)))
			meetingId = "unknown-meetingid";
		return meetingId;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.info("BBB Video-broadcast appDisconnect");
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
		logData.put("event", "user_leaving_bbb_video_broadcast");
		logData.put("description", "User leaving BBB video-broadcast.");
		
		Gson gson = new Gson();
		String logStr =  gson.toJson(logData);
		
		log.info("User leaving bbb-video-broadcast: data={}", logStr);
		
		super.appDisconnect(conn);
	}

	@Override
	public void roomDisconnect(IConnection conn) {
		log.info("BBB video-broadcast roomDisconnect");

		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();

		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", getMeetingId());
		logData.put("userId", getUserId());
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("event", "user_leaving_bbb_video_broadcast");
		logData.put("description", "User leaving BBB video-broadcast.");

		Gson gson = new Gson();
		String logStr =  gson.toJson(logData);

		log.info("User leaving bbb-video-broadcast: data={}", logStr);

		super.roomDisconnect(conn);
	}

	@Override
	public void streamPublishStart(IBroadcastStream stream) {
		super.streamPublishStart(stream);
		IConnection conn = Red5.getConnectionLocal();
		log.info("streamPublishStart " + stream.getPublishedName() + " " + System.currentTimeMillis()
		 + " " + conn.getScope().getName());
	}

	@Override
	public void streamBroadcastStart(IBroadcastStream stream) {
		IConnection conn = Red5.getConnectionLocal();
		super.streamBroadcastStart(stream);
		log.info("streamBroadcastStart " + stream.getPublishedName() + " " + System.currentTimeMillis()
		 + " " + conn.getScope().getName());

		// TODO Anton publish a message to a redis channel so that all [Flash client] users are
		// notified that there is an rtmp stream being broadcasted.

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

		// TODO Anton publish a message to a redis channel so that all [Flash client] users are
		// notified that there is no longer rtmp stream being broadcasted.

		String userId = getUserId();
		String meetingId = conn.getScope().getName();
		String streamId = stream.getPublishedName();

		if (recordVideoStream) {
			long publishDuration = (System.currentTimeMillis() - stream.getCreationTime()) / 1000;
			log.info("Stop recording event for stream=[{}] meeting=[{}]", stream.getPublishedName(), scopeName);
			Map<String, String> event = new HashMap<String, String>();
			event.put("module", "WEBRTC-DESKSHARE");
			event.put("timestamp", genTimestamp().toString());
			event.put("meetingId", scopeName);
			event.put("stream", stream.getPublishedName());
			event.put("duration", new Long(publishDuration).toString());
			event.put("eventName", "StopWebRTCDesktopShareEvent");
			recordingService.record(scopeName, event);
		}
	}

	/**
	 * A hook to record a stream. A file is written in webapps/video-broadcast/streams/
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

	/**
	 * Start transmission notification from Flash Player 11.1+. This command asks the server to transmit more data because the buffer is running low.
	 * 
	 * http://help.adobe.com/en_US/flashmediaserver/devguide/WSd391de4d9c7bd609-569139412a3743e78e-8000.html
	 * 
	 * @param bool boolean
	 * @param num number
	 */
	public void startTransmit(Boolean bool, int num) {
	}

	/**
	 * Stop transmission notification from Flash Player 11.1+. This command asks the server to suspend transmission until the client sends a 
	 * startTransmit event because there is enough data in the buffer.
	 */
	public void stopTransmit() {
	}

	/**
	 * Stop transmission notification from Flash Player 11.1+. This command asks the server to suspend transmission until the client sends a 
	 * startTransmit event because there is enough data in the buffer.
	 * 
	 * @param bool boolean
	 * @param num number
	 */
	public void stopTransmit(Boolean bool, int num) {
	}

	/**
	 * Notification method that is sent by FME just before publishing starts.
	 * 
	 * @param streamName Name of stream that is about to be published.
	 */
	@Override
	public void FCPublish(String streamName) {
		IConnection conn = Red5.getConnectionLocal();  
		log.info("FCPublish " + streamName + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
	}

	/**
	 * Notification method that is sent by FME when publishing of a stream ends.
	 */
	@Override
	public void FCUnpublish() {
	}

	/**
	 * Notification method that is sent by FME when publishing of a stream ends.
	 * 
	 * @param streamName Name of stream that is about to be un-published.
	 */
	@Override
	public void FCUnpublish(String streamName) {
		IConnection conn = Red5.getConnectionLocal();  
		log.info("FCUnpublish " + streamName + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
	}

	/**
	 * Notification method that is sent by some clients just before playback starts.
	 * 
	 * @param streamName Name of stream that is about to be played.
	 */
	@Override
	public void FCSubscribe(String streamName) {
		IConnection conn = Red5.getConnectionLocal();  
		log.info("FCSubscribe " + streamName + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
	}
}

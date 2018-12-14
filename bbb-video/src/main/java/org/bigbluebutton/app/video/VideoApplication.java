/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */
package org.bigbluebutton.app.video;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import org.bigbluebutton.app.video.converter.H263Converter;
import org.bigbluebutton.app.video.converter.VideoRotator;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.server.scheduling.QuartzSchedulingService;
import org.red5.server.stream.ClientBroadcastStream;
import org.slf4j.Logger;
import com.google.gson.Gson;
import org.springframework.util.StringUtils;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;


public class VideoApplication extends MultiThreadedApplicationAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");

    // Scheduler
    private QuartzSchedulingService scheduler;

    private MessagePublisher publisher;
    private EventRecordingService recordingService;
    private final Map<String, IStreamListener> streamListeners = new HashMap<String, IStreamListener>();

    private int packetTimeout = 10000;

    private final Pattern RECORD_STREAM_ID_PATTERN = Pattern.compile("(.*)(-recorded)$");

    private final Map<String, H263Converter> h263Converters = new HashMap<String, H263Converter>();
    private final Map<String, String> h263Users = new HashMap<String, String>(); //viewers
    private final Map<String, String> h263PublishedStreams = new HashMap<String, String>(); //publishers

    private final Map<String, VideoRotator> videoRotators = new HashMap<String, VideoRotator>();

    private MeetingManager meetingManager;
    private ConnectionInvokerService connInvokerService;
    private final UserConnectionMapper userConnections = new UserConnectionMapper();

    @Override
    public boolean appStart(IScope app) {
        super.appStart(app);
        log.info("BBB Video appStart");
        connInvokerService.setAppScope(app);

        // get the scheduler
        scheduler = (QuartzSchedulingService) getContext().getBean(QuartzSchedulingService.BEAN_NAME);

        portTestConnAudit();

        return true;
    }

    private void portTestConnAudit() {
        Runnable portConnAuditTask = () -> portTestConnAuditHelper();

        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        executor.scheduleAtFixedRate(portConnAuditTask, 0, 5, TimeUnit.SECONDS);
    }

    private IConnection getConnectionWithConnId(IScope scope, String connId) {
        for (IConnection conn : scope.getClientConnections()) {
            String connID = (String) conn.getSessionId();
            if (connID != null && connID.equals(connId)) {
                return conn;
            }
        }

        log.warn("Failed to get connection for connId = " + connId);
        return null;
    }

    private void portTestConnAuditHelper() {

        Collection<UserConnectionMapper.UserConnection> usersConns = userConnections.getConnections();
        for (UserConnectionMapper.UserConnection uconn : usersConns) {
            log.debug("Checking port test connection {}", uconn.connId);
            if (System.currentTimeMillis() - uconn.connectedOn > 10000) {
                log.debug("Closing port test connection {}", uconn.connId);
                uconn.connection.close();
            }
        }
    }

    @Override
    public boolean appConnect(IConnection conn, Object[] params) {
        return super.appConnect(conn, params);
    }

		@Override
		public boolean roomConnect(IConnection connection, Object[] params) {
			log.info("BBB Video roomConnect");

			final int REQUIRED_PARAMS = 4;

			if(params.length != REQUIRED_PARAMS) {
				log.error("Invalid number of parameters. Provided parameters={}. Required parameters={}", params.length, REQUIRED_PARAMS);
				return false;
			}

			String meetingId = ((String) params[0]).toString();
			String userId = ((String) params[1]).toString();
			String authToken = ((String) params[2]).toString();
			String clientConnId = ((String) params[3]).toString();

			if (StringUtils.isEmpty(meetingId)) {
				log.error("Invalid meetingId parameter.");
				return false;
			}

			if (StringUtils.isEmpty(userId)) {
				log.error("Invalid userId parameter.");
				return false;
			}

			if (StringUtils.isEmpty(authToken)) {
				log.error("Invalid authToken parameter.");
				return false;
			}

			Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
			Red5.getConnectionLocal().setAttribute("USERID", userId);
			Red5.getConnectionLocal().setAttribute("AUTH_TOKEN", authToken);
			Red5.getConnectionLocal().setAttribute("CLIENT_CONN_ID", clientConnId);

			String connType = getConnectionType(Red5.getConnectionLocal().getType());
			String curConnId = Red5.getConnectionLocal().getSessionId();

			if (userId.startsWith("portTestDummyUserId")) {
				userConnections.addUserConnection(curConnId, connection);

				String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
				int remotePort = Red5.getConnectionLocal().getRemotePort();
				String clientId = Red5.getConnectionLocal().getClient().getId();

				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", meetingId);
				logData.put("userId", userId);
				logData.put("connType", connType);
				logData.put("connId", curConnId);
				logData.put("clientId", clientId);
				logData.put("remoteAddress", remoteHost + ":" + remotePort);
				logData.put("event", "port_test_connection_bbb_video");
				logData.put("description", "Keeping track of port test connection.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);

				log.info(logStr);
			} else {
				log.info("BBB Video validateConnAuthToken");
				publisher.validateConnAuthToken(meetingId, userId, authToken, curConnId);

				/**
				 * Find if there are any other connections owned by this user. If we find one,
				 * that means that the connection is old and the user reconnected. Clear the
				 * userId attribute so that messages would not be sent in the defunct connection.
				 */
				Set<IConnection> conns = Red5.getConnectionLocal().getScope().getClientConnections();
				for (IConnection conn : conns) {
					String connUserId = (String) conn.getAttribute("USERID");
					String oldClientConnId = (String) conn.getAttribute("CLIENT_CONN_ID");
					String oldConnId = conn.getSessionId();
					String clientId = conn.getClient().getId();
					String remoteHost = conn.getRemoteAddress();
					int remotePort = conn.getRemotePort();
					if (oldClientConnId != null && connUserId != null && connUserId.equals(userId) && !oldConnId.equals(curConnId)) {
						conn.removeAttribute("USERID");
						conn.removeAttribute("CLIENT_CONN_ID");
						Map<String, Object> logData = new HashMap<String, Object>();
						logData.put("meetingId", meetingId);
						logData.put("userId", userId);
						logData.put("oldConnId", oldConnId);
						logData.put("newConnId", curConnId);
						logData.put("clientId", clientId);
						logData.put("oldClientConnId", oldClientConnId);
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
				logData.put("connId", curConnId);
				logData.put("clientId", clientId);
				logData.put("remoteAddress", remoteHost + ":" + remotePort);
				logData.put("event", "user_joining_bbb_video");
				logData.put("description", "User joining BBB Video.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);

				log.info("User joining bbb-video: data={}", logStr);
			}

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

	private String getClientConnId() {
		String clientConnId = (String) Red5.getConnectionLocal().getAttribute("CLIENT_CONN_ID");
		if ((clientConnId == null) || ("".equals(clientConnId))) clientConnId = "unknown-clientConnId";
		return clientConnId;
	}
	
  @Override
	public void appDisconnect(IConnection conn) {
		clearH263UserVideo(getUserId());
		super.appDisconnect(conn);
	}

  @Override
	public void roomDisconnect(IConnection conn) {
		log.info("BBB Video roomDisconnect");
		
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();
		String clientConnId = getClientConnId();

		UserConnectionMapper.UserConnection uconn = userConnections.userDisconnected(connId);
		if (uconn != null) {
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", getMeetingId());
			logData.put("userId", getUserId());
			logData.put("connType", connType);
			logData.put("connId", connId);
			logData.put("clientConnId", clientConnId);
			logData.put("event", "removing_port_test_conn_bbb_video");
			logData.put("description", "Removing port test connection BBB Video.");

			Gson gson = new Gson();
			String logStr =  gson.toJson(logData);

			log.info(logStr);
		} else {
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", getMeetingId());
			logData.put("userId", getUserId());
			logData.put("connType", connType);
			logData.put("connId", connId);
			logData.put("clientConnId", clientConnId);
			logData.put("event", "user_leaving_bbb_video");
			logData.put("description", "User leaving BBB Video.");

			Gson gson = new Gson();
			String logStr =  gson.toJson(logData);

			log.info("User leaving bbb-video: data={}", logStr);
		}

		
		super.roomDisconnect(conn);
	}

	@Override
	public void streamPublishStart(IBroadcastStream stream) {
		super.streamPublishStart(stream);
		IConnection conn = Red5.getConnectionLocal();
		log.info("streamPublishStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());
	}

	private String getStreamName(String streamName) {
		String parts[] = streamName.split("/");
		if (parts.length > 1)
			return parts[parts.length - 1];
		return "";
	}

	private void requestRotateVideoTranscoder(IBroadcastStream stream) {
		IConnection conn = Red5.getConnectionLocal();
		String userId = getUserId();
		String meetingId = conn.getScope().getName();
		String streamId = stream.getPublishedName();
		String streamName = getStreamName(streamId);
		String ipAddress = conn.getHost();

		switch (VideoRotator.getDirection(streamId)) {
			case VideoRotator.ROTATE_RIGHT:
				publisher.startRotateRightTranscoderRequest(meetingId, userId, streamName, ipAddress);
				break;
			case VideoRotator.ROTATE_LEFT:
				publisher.startRotateLeftTranscoderRequest(meetingId, userId, streamName, ipAddress);
				break;
			case VideoRotator.ROTATE_UPSIDE_DOWN:
				publisher.startRotateUpsideDownTranscoderRequest(meetingId, userId, streamName, ipAddress);
				break;
			default:
				break;
		}
	}

		@Override
		public void streamBroadcastStart(IBroadcastStream stream) {
			IConnection conn = Red5.getConnectionLocal();
			String contextName = stream.getScope().getName();
			String connType = getConnectionType(Red5.getConnectionLocal().getType());
			String connId = Red5.getConnectionLocal().getSessionId();

			if ("video".equals(contextName)) {
				/**
					* Prevent publishing into the /video context as all our webcams are published
					* into /video/<meetingId> context. (ralam jan 22, 2018)
				 **/
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", getMeetingId());
				logData.put("userId", getUserId());
				logData.put("connType", connType);
				logData.put("connId", connId);
				logData.put("stream", stream.getPublishedName());
				logData.put("context", contextName);
				logData.put("event", "unauth_publish_stream_bbb_video");
				logData.put("description", "Publishing stream in app context.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);
				log.error(logStr);
				conn.close();
				return;
			}

			super.streamBroadcastStart(stream);
			log.info("streamBroadcastStart " + stream.getPublishedName() + " " + System.currentTimeMillis() + " " + conn.getScope().getName());

			String userId = getUserId();
			String meetingId = conn.getScope().getName();
			String streamId = stream.getPublishedName();

			publisher.sendVideoStreamStartedMsg(meetingId, userId, streamId);

			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", getMeetingId());
			logData.put("userId", getUserId());
			logData.put("connType", connType);
			logData.put("connId", connId);
			logData.put("stream", stream.getPublishedName());
			logData.put("context", contextName);
			logData.put("event", "stream_broadcast_start");
			logData.put("description", "Stream broadcast start.");

			Gson gson = new Gson();
			String logStr =  gson.toJson(logData);
			log.info(logStr);

			Matcher matcher = RECORD_STREAM_ID_PATTERN.matcher(stream.getPublishedName());
			addH263PublishedStream(streamId);
			if (streamId.contains("/")) {
				if (VideoRotator.getDirection(streamId) != null) {
					//VideoRotator rotator = new VideoRotator(streamId);
					videoRotators.put(streamId, null);
					requestRotateVideoTranscoder(stream);
				}
			} else if (matcher.matches()) {
				Map<String, Object> logData2 = new HashMap<String, Object>();
				logData2.put("meetingId", getMeetingId());
				logData2.put("userId", getUserId());
				logData2.put("connType", connType);
				logData2.put("connId", connId);
				logData2.put("stream", stream.getPublishedName());
				logData2.put("context", contextName);
				logData2.put("event", "stream_broadcast_record_start");
				logData2.put("description", "Stream broadcast record start.");

				Gson gson2 = new Gson();
				String logStr2 =  gson2.toJson(logData2);
				log.info(logStr2);

					Boolean recordVideoStream = true;
					VideoStreamListener listener = new VideoStreamListener(meetingId, streamId,
									recordVideoStream, userId, packetTimeout, scheduler, recordingService);
					ClientBroadcastStream cstream = (ClientBroadcastStream) this.getBroadcastStream(conn.getScope(), stream.getPublishedName());
					stream.addStreamListener(listener);
					VideoStream vstream = new VideoStream(stream, listener, cstream);
					vstream.startRecording();
					meetingManager.addStream(meetingId, vstream);
			}
		}

	private Long genTimestamp() {
		return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
	}

	private boolean isH263Stream(ISubscriberStream stream) {
		String streamName = stream.getBroadcastStreamPublishName();
		return streamName.startsWith(H263Converter.H263PREFIX);
	}

	@Override
	public void streamBroadcastClose(IBroadcastStream stream) {
		super.streamBroadcastClose(stream);
		IConnection conn = Red5.getConnectionLocal();
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String connId = Red5.getConnectionLocal().getSessionId();

		String scopeName;
		if (conn != null) {
			scopeName = conn.getScope().getName();
		} else {
			log.info("Connection local was null, using scope name from the stream: {}", stream);
			scopeName = stream.getScope().getName();
		}

		String userId = getUserId();
		String meetingId = conn.getScope().getName();
		String streamId = stream.getPublishedName();

		try {
				// Need to extract usrId from streamId (medium-w_npxfdr8lssbq-1526051556133) as
				// when connection is closed, userId info is gone. We are interested in the
				// second portion of the streamId (ralam may 11, 2018)
				String[] splitArray = streamId.split("-");
				userId = splitArray[1];
				publisher.sendVideoStreamStoppedMsg(meetingId, userId, streamId);
			} catch (PatternSyntaxException ex) {
				log.warn("Cannot split streamId " + streamId);
			}

			Map<String, Object> logData2 = new HashMap<String, Object>();
			logData2.put("meetingId", getMeetingId());
			logData2.put("userId", getUserId());
			logData2.put("connType", connType);
			logData2.put("connId", connId);
			logData2.put("stream", stream.getPublishedName());
			logData2.put("context", scopeName);
			logData2.put("event", "stream_broadcast_close");
			logData2.put("description", "Stream broadcast close.");

			Gson gson2 = new Gson();
			String logStr2 =  gson2.toJson(logData2);
			log.info(logStr2);

		removeH263ConverterIfNeeded(streamId);

		if (videoRotators.containsKey(streamId)) {
			// Stop rotator
			videoRotators.remove(streamId);
			publisher.stopTranscoderRequest(meetingId, userId);
		}

		removeH263PublishedStream(streamId);

		Matcher matcher = RECORD_STREAM_ID_PATTERN.matcher(stream.getPublishedName());
		if (matcher.matches()) {
			meetingManager.streamBroadcastClose(meetingId, streamId);
			meetingManager.removeStream(meetingId, streamId);

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

	public void setPacketTimeout(int timeout) {
		this.packetTimeout = timeout;
	}

	public void setEventRecordingService(EventRecordingService s) {
		recordingService = s;
	}

	public void setMessagePublisher(MessagePublisher publisher) {
		this.publisher = publisher;
	}

	public void setMeetingManager(MeetingManager meetingManager) {
		this.meetingManager = meetingManager;
	}

	@Override
	public void streamPlayItemPlay(ISubscriberStream stream, IPlayItem item, boolean isLive) {
		// log w3c connect event
		String streamName = item.getName();
		streamName = streamName.replaceAll(H263Converter.H263PREFIX, "");

		if (isH263Stream(stream)) {
			log.debug("Detected H263 stream request [{}]", streamName);

			synchronized (h263Converters) {
				// Check if a new stream converter is necessary
				H263Converter converter;
				if (!h263Converters.containsKey(streamName) && !isStreamPublished(streamName)) {
					converter = new H263Converter(streamName, publisher);
					h263Converters.put(streamName, converter);
				} else {
					converter = h263Converters.get(streamName);
				}

				if (!isH263UserListening(getUserId())) {
					converter.addListener();
					addH263User(getUserId(), streamName);
				}
			}
		}
	}

	@Override
	public void streamSubscriberClose(ISubscriberStream stream) {
		String streamName = stream.getBroadcastStreamPublishName();
		streamName = streamName.replaceAll(H263Converter.H263PREFIX, "");
		String userId = getUserId();

		if (isH263Stream(stream)) {
			log.debug("Detected H263 stream close [{}]", streamName);

			synchronized (h263Converters) {
				// Remove prefix
				if (h263Converters.containsKey(streamName)) {
					H263Converter converter = h263Converters.get(streamName);
					if (isH263UserListening(userId)) {
						converter.removeListener();
						removeH263User(userId);
					}
				} else {
					log.warn("Converter not found for H263 stream [{}]. This may has been closed already", streamName);
				}
			}
		}
	}

	private void removeH263User(String userId) {
		if (h263Users.containsKey(userId)) {
			log.debug("REMOVE |Removing h263 user from h263User's list [uid={}]", userId);
			h263Users.remove(userId);
		}
	}

	private void addH263User(String userId, String streamName) {
		log.debug("ADD |Add h263 user to h263User's list [uid={} streamName={}]", userId, streamName);
		h263Users.put(userId, streamName);
	}

	private void clearH263UserVideo(String userId) {
		/**
		* If this is an h263User, clear it's video.
		**/
		synchronized (h263Converters) {
			if (isH263UserListening(userId)) {
				String streamName = h263Users.get(userId);
				H263Converter converter = h263Converters.get(streamName);
				if (converter == null) {
					log.debug("er... something went wrong. User was listening to the stream, but there's no more converter for this stream [stream={}] [uid={}]", userId, streamName);
				}

				converter.removeListener();
				removeH263User(userId);
				log.debug("h263's user data cleared.");
			}
		}
	}

	private void clearH263Users(String streamName) {
		/*
			* Remove all the users associated with the streamName
		**/
		log.debug("Clearing h263Users's list for the stream {}", streamName);
		if (h263Users != null)
			while (h263Users.values().remove(streamName)) ;
		log.debug("h263Users cleared.");
	}

	private boolean isH263UserListening(String userId) {
		return (h263Users.containsKey(userId));
	}

	private void addH263PublishedStream(String streamName) {
		if (streamName.contains(H263Converter.H263PREFIX)) {
			log.debug("Publishing an h263 stream. StreamName={}.", streamName);
			h263PublishedStreams.put(streamName, getUserId());
		}
	}

	private void removeH263PublishedStream(String streamName) {
		if (isH263Stream(streamName) && h263PublishedStreams.containsKey(streamName))
			h263PublishedStreams.remove(streamName);
	}

	private boolean isStreamPublished(String streamName) {
		return h263PublishedStreams.containsKey(streamName);
	}

	private boolean isH263Stream(String streamName) {
		return streamName.startsWith(H263Converter.H263PREFIX);
	}

	private void removeH263ConverterIfNeeded(String streamName) {
		String h263StreamName = streamName.replaceAll(H263Converter.H263PREFIX, "");
		synchronized (h263Converters) {
			if (isH263Stream(streamName) && h263Converters.containsKey(h263StreamName)) {
				// Stop converter
				log.debug("h263 stream is being closed {}", streamName);
				h263Converters.remove(h263StreamName).stopConverter();
				clearH263Users(h263StreamName);
			}
		}
	}

	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
}

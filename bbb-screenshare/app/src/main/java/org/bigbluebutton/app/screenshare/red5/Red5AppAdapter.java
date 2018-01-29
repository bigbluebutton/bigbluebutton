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
package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.red5.server.scheduling.QuartzSchedulingService;
import com.google.gson.Gson;
import org.bigbluebutton.app.screenshare.MeetingManager;
import org.bigbluebutton.app.screenshare.VideoStreamListener;
import org.bigbluebutton.app.screenshare.VideoStream;
import org.bigbluebutton.app.screenshare.EventRecordingService;
import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.ScreenshareStreamListener;

public class Red5AppAdapter extends MultiThreadedApplicationAdapter {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppAdapter.class, "screenshare");

  // Scheduler
  private QuartzSchedulingService scheduler;

  private EventRecordingService recordingService;
  private IScreenShareApplication app;
  private String streamBaseUrl;
  private ConnectionInvokerService sender;
  private String recordingDirectory;

  private final Pattern STREAM_ID_PATTERN = Pattern.compile("(.*)-(.*)-(.*)$");

  private MeetingManager meetingManager;
  private int packetTimeout = 10000;

  @Override
  public boolean appStart(IScope app) {
    super.appStart(app);
    log.info("BBB Screenshare appStart");
    sender.setAppScope(app);
    // get the scheduler
    scheduler = (QuartzSchedulingService) getContext().getBean(QuartzSchedulingService.BEAN_NAME);
    return true;
  }

  @Override
  public boolean appConnect(IConnection conn, Object[] params) {
    log.info("BBB Screenshare appConnect"); 		
    return super.appConnect(conn, params);
  }

  @Override
  public boolean roomConnect(IConnection conn, Object[] params) {
    log.info("BBB Screenshare roomConnect"); 
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
    super.appDisconnect(conn);
  }

  @Override
  public void roomDisconnect(IConnection conn) {
    log.info("BBB Screenshare roomDisconnect");

    String connType = getConnectionType(Red5.getConnectionLocal().getType());
    String connId = Red5.getConnectionLocal().getSessionId();

    String meetingId = conn.getScope().getName();
    String userId = getUserId();

    app.userDisconnected(meetingId, userId);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", getMeetingId());
    logData.put("userId", userId);
    logData.put("connType", connType);
    logData.put("connId", connId);
    logData.put("event", "user_leaving_bbb_screenshare");
    logData.put("description", "User leaving BBB Screenshare.");

    Gson gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("User leaving bbb-screenshare: data={}", logStr);

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

    log.info("streamBroadcastStart " + stream.getPublishedName() + "]");

    String connId = conn.getSessionId();
    String scopeName = stream.getScope().getName();

    String streamId = stream.getPublishedName();
    Matcher matcher = STREAM_ID_PATTERN.matcher(stream.getPublishedName());
    if (matcher.matches()) {
        String meetingId = matcher.group(1).trim();
        String url = streamBaseUrl + "/" + meetingId + "/" + streamId;
        app.streamStarted(meetingId, streamId, url);

      app.authorizeBroadcastStream(meetingId, streamId, connId, scopeName);

	    boolean recordVideoStream = app.recordStream(meetingId, streamId);
          VideoStreamListener listener = new VideoStreamListener(meetingId, streamId,
                  recordVideoStream, recordingDirectory, packetTimeout, scheduler, recordingService);
          ClientBroadcastStream cstream = (ClientBroadcastStream) this.getBroadcastStream(conn.getScope(), stream.getPublishedName());
          stream.addStreamListener(listener);
          VideoStream vstream = new VideoStream(stream, listener, cstream);
          vstream.startRecording();

          meetingManager.addStream(meetingId, vstream);

      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", meetingId);
      logData.put("streamId", streamId);
      logData.put("url", url);
      logData.put("recorded", recordVideoStream);

      Gson gson = new Gson();
      String logStr =  gson.toJson(logData);

      log.info("ScreenShare broadcast started: data={}", logStr);
    } else {
    	log.error("Invalid streamid format [{}]", streamId);
    	conn.close();
    }
  }

  private Long genTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }

  @Override
  public void streamBroadcastClose(IBroadcastStream stream) {
    super.streamBroadcastClose(stream);

    log.info("streamBroadcastStop " + stream.getPublishedName() + "]");
    String streamId = stream.getPublishedName();
    Matcher matcher = STREAM_ID_PATTERN.matcher(stream.getPublishedName());
    if (matcher.matches()) {
      String meetingId = matcher.group(1).trim();
      app.streamStopped(meetingId, streamId);

      boolean recordVideoStream = app.recordStream(meetingId, streamId);
      meetingManager.streamBroadcastClose(meetingId, streamId);


      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", meetingId);
      logData.put("streamId", streamId);
      logData.put("recorded", recordVideoStream);

      Gson gson = new Gson();
      String logStr =  gson.toJson(logData);

      log.info("ScreenShare broadcast stopped: data={}", logStr);
    } else {
    	log.error("Invalid streamid format [{}]", streamId);
    }
  }

  public void setMeetingManager(MeetingManager meetingManager) {
    this.meetingManager = meetingManager;
  }

  public void setEventRecordingService(EventRecordingService s) {
    recordingService = s;
  }

  public void setStreamBaseUrl(String baseUrl) {
    streamBaseUrl = baseUrl;
  }

  public void setRecordingDirectory(String dir) {
    recordingDirectory = dir;
  }

  public void setApplication(IScreenShareApplication app) {
    this.app = app;
  }

  public void setMessageSender(ConnectionInvokerService sender) {
    this.sender = sender;
  }
}

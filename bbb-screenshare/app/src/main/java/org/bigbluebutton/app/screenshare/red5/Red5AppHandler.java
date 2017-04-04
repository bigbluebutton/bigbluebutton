package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.events.IsScreenSharingResponse;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class Red5AppHandler {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppHandler.class, "screenshare");
  
  private IScreenShareApplication app;
  private ConnectionInvokerService sender;
  
  private final Pattern STREAM_ID_PATTERN = Pattern.compile("(.*)-(.*)-(.*)$");

  public void meetingHasEnded(String meetingId) {
    app.meetingHasEnded(meetingId);
  }

  public void meetingCreated(String meetingId, Boolean record) {
    app.meetingCreated(meetingId, record);
  }

  public void userConnected(String meetingId, String userId) {
    app.userConnected(meetingId, userId);
  }

  public void isScreenSharing(String meetingId, String userId) {
    app.isScreenSharing(meetingId, userId);
  }
  
  public void requestShareToken(String meetingId, String userId, Boolean record, Boolean tunnel) {
    app.requestShareToken(meetingId, userId, record, tunnel);
  }

  public void startShareRequest(String meetingId, String userId, String session) {
    app.startShareRequest(meetingId, userId, session);
  }

  public void restartShareRequest(String meetingId, String userId) {

    app.restartShareRequest(meetingId, userId);

  }

  public void pauseShareRequest(String meetingId, String userId, String streamId) {
    Matcher matcher = STREAM_ID_PATTERN.matcher(streamId);
    if (matcher.matches()) {
      app.pauseShareRequest(meetingId, userId, streamId);
    }
  }

  public void stopShareRequest(String meetingId, String streamId) {
    Matcher matcher = STREAM_ID_PATTERN.matcher(streamId);
    if (matcher.matches()) {            
        app.stopShareRequest(meetingId, streamId);
    }
  }

  public void screenShareClientPongMessage(String meetingId, String userId, String streamId, Long timestamp) {
    app.screenShareClientPongMessage(meetingId, userId, streamId, timestamp);
  }
    
  public void setApplication(IScreenShareApplication app) {
    this.app = app;
  }
  
  public void setMessageSender(ConnectionInvokerService sender) {
    this.sender = sender;
  }


}

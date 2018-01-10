package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.app.screenshare.messaging.redis.MessageSender;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class Red5AppService {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppService.class, "screenshare");
  
  private Red5AppHandler handler;
  private MessageSender red5RedisSender;

  /**
   * Called from the client to pass us the userId.
   * 
   * We need to do this as we can't have params on the connect call
   * as FFMpeg won't be able to connect.
   * @param userId
   */
  public void setUserId(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String userId = (String) msg.get("userId");

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
      if (connUserId != null && connUserId.equals(userId) && !connSessionId.equals(sessionId)) {
        conn.removeAttribute("USERID");
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", meetingId);
        logData.put("userId", userId);
        logData.put("oldConnId", connSessionId);
        logData.put("newConnId", sessionId);
        logData.put("event", "removing_defunct_connection");
        logData.put("description", "Removing defunct connection BBB Screenshare.");

        Gson gson = new Gson();
        String logStr =  gson.toJson(logData);

        log.info("Removing defunct connection: data={}", logStr);

      }
    }

    Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
    Red5.getConnectionLocal().setAttribute("USERID", userId);

    handler.userConnected(meetingId, userId);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", meetingId);
    logData.put("userId", userId);
    logData.put("connType", connType);
    logData.put("connId", sessionId);
    logData.put("event", "user_joining_bbb_screenshare");
    logData.put("description", "User joining BBB Screenshare.");

    Gson gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("User joining bbb-screenshare: data={}", logStr);
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

  public void isScreenSharing(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    //if (log.isDebugEnabled()) {
      log.debug("Received check if publishing for meetingId=" + meetingId + " from user=" + userId);
    //}

    handler.isScreenSharing(meetingId, userId);
  }

  public void pauseShareRequest(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    log.debug("Received pauseShareRequest for meeting=[{}]", meetingId);
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");
    String streamId = (String) msg.get("streamId");
    handler.pauseShareRequest(meetingId, userId, streamId);
  }

  public void restartShareRequest(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    //if (log.isDebugEnabled()) {
      log.debug("Received restartShareRequest for meetingId=" + meetingId + " from user=" + userId);
    //}

    handler.restartShareRequest(meetingId, userId);
  }

  public void startShareRequest(Map<String, Object> msg) {
    String session = (String) msg.get("session");
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    //if (log.isDebugEnabled()) {
      log.debug("Received startShareRequest for meetingId=" + meetingId + " from user=" + userId);
    //}

    handler.startShareRequest(meetingId, userId, session);
  }

  public void requestShareToken(Map<String, Object> msg) {
    Boolean record = (Boolean) msg.get("record");
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");
    Boolean tunnel = (Boolean) msg.get("tunnel");

    //if (log.isDebugEnabled()) {
      log.debug("Received startShareRequest for meetingId=" + meetingId + " from user=" + userId);
    //}

    handler.requestShareToken(meetingId, userId, record, tunnel);
  }

  public void stopShareRequest(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String streamId = (String) msg.get("streamId");
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    //if (log.isDebugEnabled()) {
      log.debug("Received stopShareRequest for meetingId=" + meetingId + " from user=" + userId);
    //}

    handler.stopShareRequest(meetingId, streamId);
  }

  public void screenShareClientPongMessage(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String streamId = (String) msg.get("streamId");
    Double timestamp;
    if (msg.get("timestamp") instanceof Integer) {
      Integer tempTimestamp = (Integer) msg.get("timestamp");
      timestamp = tempTimestamp.doubleValue();
    } else {
      timestamp = (Double) msg.get("timestamp");
    }

    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    log.debug("Received screenShareClientPongMessage for meeting=[{}]", meetingId);

    handler.screenShareClientPongMessage(meetingId, userId, streamId, timestamp.longValue());
  }

  private Long genTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }

  public void setAppHandler(Red5AppHandler handler) {
    this.handler = handler;
  }

  public void setRed5RedisSender(MessageSender red5RedisSender) {
      this.red5RedisSender = red5RedisSender;
  }
}

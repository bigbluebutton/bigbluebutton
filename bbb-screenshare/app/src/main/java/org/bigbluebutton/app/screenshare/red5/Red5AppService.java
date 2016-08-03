package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

import com.google.gson.Gson;


public class Red5AppService {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppService.class, "screenshare");
  
  private Red5AppHandler handler; 

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
      if (connUserId != null && connUserId.equals(userId) && conn.getSessionId().equals(sessionId)) {
        conn.removeAttribute("USERID");
      }
    }

    Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
    Red5.getConnectionLocal().setAttribute("USERID", userId);

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
    log.debug("Received check if publishing for meeting=[{}]", meetingId);
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    handler.isScreenSharing(meetingId, userId);
  }

  public void startShareRequest(Map<String, Object> msg) {
	Boolean record = (Boolean) msg.get("record");
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    log.debug("Received startShareRequest for meeting=[{}]", meetingId);
    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");

    handler.startShareRequest(meetingId, userId, record);
  }

  public void stopShareRequest(Map<String, Object> msg) {
    String meetingId = Red5.getConnectionLocal().getScope().getName();
    String streamId = (String) msg.get("streamId");
    log.debug("Received stopShareRequest for meeting=[{}]", meetingId);

    handler.stopShareRequest(meetingId, streamId);
  }


  public void setAppHandler(Red5AppHandler handler) {
    this.handler = handler;
  }
}

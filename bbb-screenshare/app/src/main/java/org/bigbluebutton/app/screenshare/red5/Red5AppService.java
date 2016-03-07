package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

import com.google.gson.Gson;


public class Red5AppService {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppService.class, "screenshare");
  
  private Red5AppHandler handler; 

  /**
   * Called from the client to pass us the userId.
   * 
   * We need to to this as we can't have params on the connect call
   * as FFMeeg won't be able to connect. 
   * @param userId
   */
  public void setUserId(Map<String, Object> msg) {
//    String meetingId = Red5.getConnectionLocal().getScope().getName();
//    String userId = (String) msg.get("userId");
//    Red5.getConnectionLocal().setAttribute("MEETING_ID", meetingId);
//    Red5.getConnectionLocal().setAttribute("USERID", userId);
//
//    String connType = getConnectionType(Red5.getConnectionLocal().getType());
//    String connId = Red5.getConnectionLocal().getSessionId();
//
//    Map<String, Object> logData = new HashMap<String, Object>();
//    logData.put("meetingId", meetingId);
//    logData.put("userId", userId);
//    logData.put("connType", connType);
//    logData.put("connId", connId);
//    logData.put("event", "user_joining_bbb_screenshare");
//    logData.put("description", "User joining BBB Screenshare.");
//
//    Gson gson = new Gson();
//    String logStr =  gson.toJson(logData);
//
//    log.info("User joining bbb-screenshare: data={}", logStr);
  }
//
//  private String getConnectionType(String connType) {
//    if ("persistent".equals(connType.toLowerCase())) {
//      return "RTMP";
//    } else if("polling".equals(connType.toLowerCase())) {
//      return "RTMPT";
//    } else {
//      return connType.toUpperCase();
//    }
//  }
//
//  public void isScreenSharing(Map<String, Object> msg) {
//    String meetingId = Red5.getConnectionLocal().getScope().getName();
//    log.debug("Received check if publishing for meeting=[{}]", meetingId);
//    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");
//
//    handler.isScreenSharing(meetingId, userId);
//  }
//
//  public void startShareRequest(Map<String, Object> msg) {
//	Boolean record = (Boolean) msg.get("record");
//    String meetingId = Red5.getConnectionLocal().getScope().getName();
//    log.debug("Received startShareRequest for meeting=[{}]", meetingId);
//    String userId = (String) Red5.getConnectionLocal().getAttribute("USERID");
//
//    handler.startShareRequest(meetingId, userId, record);
//  }
//
//  public void stopShareRequest(Map<String, Object> msg) {
//    String meetingId = Red5.getConnectionLocal().getScope().getName();
//    String streamId = (String) msg.get("streamId");
//    log.debug("Received stopShareRequest for meeting=[{}]", meetingId);
//
//    handler.stopShareRequest(meetingId, streamId);
//  }
//
//
  public void setAppHandler(Red5AppHandler handler) {
    this.handler = handler;
  }
}

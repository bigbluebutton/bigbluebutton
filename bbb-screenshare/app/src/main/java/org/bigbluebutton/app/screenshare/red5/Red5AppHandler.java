package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bigbluebutton.app.screenshare.IScreenShareApplication;
import org.bigbluebutton.app.screenshare.IsScreenSharingResponse;
import org.bigbluebutton.app.screenshare.StartShareRequestResponse;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class Red5AppHandler {
  private static Logger log = Red5LoggerFactory.getLogger(Red5AppHandler.class, "screenshare");
  
  private IScreenShareApplication app;
  private ConnectionInvokerService sender;
  
  private final Pattern STREAM_ID_PATTERN = Pattern.compile("(.*)-(.*)$");
  
  public void isScreenSharing(String meetingId, String userId) {
    IsScreenSharingResponse resp = app.isScreenSharing(meetingId);
    
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("sharing", resp.info.sharing);
    
    if (resp.info.sharing) {
      data.put("streamId", resp.info.streamId);
      data.put("width", resp.info.width);
      data.put("height", resp.info.height);     
      data.put("url", resp.info.url);
    }
    
    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));

    log.info("Sending isSharingScreenRequestResponse to client, meetingId=" + meetingId + " userid=" + userId);
    DirectClientMessage msg = new DirectClientMessage(meetingId, userId, "isSharingScreenRequestResponse", message);
    sender.sendMessage(msg);    
  }
  
  public void startShareRequest(String meetingId, String userId, Boolean record) {
    StartShareRequestResponse resp = app.startShareRequest(meetingId, userId, record);
    
    Map<String, Object> data = new HashMap<String, Object>();
    
    if (resp.error != null) {
      data.put("error", resp.error.reason);
    } else {
      data.put("authToken", resp.token);
      data.put("jnlp", resp.jnlp);
    }
    
    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    log.info("Sending startShareRequestResponse to client, meetingId=" + meetingId + " userid=" + userId);
    DirectClientMessage msg = new DirectClientMessage(meetingId, userId, "startShareRequestResponse", message);
    sender.sendMessage(msg);    
  }
  
  public void stopShareRequest(String meetingId, String streamId) {
    Matcher matcher = STREAM_ID_PATTERN.matcher(streamId);
    if (matcher.matches()) {            
        app.stopShareRequest(meetingId, streamId);
    }   
    
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("meetingId", meetingId);
    data.put("streamId", streamId);
    
    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    log.info("Sending stopShareRequest to client, meetingId=" + meetingId + " streamId=" + streamId);
    BroadcastClientMessage msg = new BroadcastClientMessage(meetingId, "stopViewingStream", message);
    sender.sendMessage(msg);   
  }
    
  public void setApplication(IScreenShareApplication app) {
    this.app = app;
  }
  
  public void setMessageSender(ConnectionInvokerService sender) {
    this.sender = sender;
  }


}

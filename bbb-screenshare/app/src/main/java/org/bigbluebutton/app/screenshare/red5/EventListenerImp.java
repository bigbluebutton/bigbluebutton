package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.app.screenshare.events.*;
import com.google.gson.Gson;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class EventListenerImp implements IEventListener {
  private static Logger log = Red5LoggerFactory.getLogger(EventListenerImp.class, "screenshare");
  private ConnectionInvokerService sender;
  
  @Override
  public void handleMessage(IEvent event) {
    if (event instanceof ShareStartedEvent) {
      sendShareStartedEvent((ShareStartedEvent) event);
    } else if (event instanceof ShareStoppedEvent) {
      sendShareStoppedEvent((ShareStoppedEvent) event);
    } else if (event instanceof StreamStartedEvent) {
      sendStreamStartedEvent((StreamStartedEvent) event);
    } else if (event instanceof StreamStoppedEvent) {
      sendStreamStoppedEvent((StreamStoppedEvent) event);
    } else if (event instanceof StartShareRequestResponse) {
      sendStartShareRequestResponse((StartShareRequestResponse) event);
    } else if (event instanceof StartShareRequestFailedResponse) {
      sendStartShareRequestFailedResponse((StartShareRequestFailedResponse) event);
    }  else if (event instanceof IsScreenSharingResponse) {
        sendIsScreenSharingResponse((IsScreenSharingResponse) event);
    }
  }

  private void sendIsScreenSharingResponse(IsScreenSharingResponse event) {
      Map<String, Object> data = new HashMap<String, Object>();
      data.put("sharing", event.info.sharing);

      if (event.info.sharing) {
          data.put("streamId", event.info.streamId);
          data.put("width", event.info.width);
          data.put("height", event.info.height);
          data.put("url", event.info.url);
      }

      Map<String, Object> message = new HashMap<String, Object>();
      Gson gson = new Gson();
      message.put("msg", gson.toJson(data));

      log.info("Sending isSharingScreenRequestResponse to client, meetingId=" + event.meetingId + " userid=" + event.userId);
      DirectClientMessage msg = new DirectClientMessage(event.meetingId, event.userId, "isSharingScreenRequestResponse", message);
      sender.sendMessage(msg);
  }

  private void  sendStartShareRequestFailedResponse(StartShareRequestFailedResponse event) {
    Map<String, Object> data = new HashMap<String, Object>();

    data.put("reason", event.reason);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));

    DirectClientMessage msg = new DirectClientMessage(event.meetingId, event.userId, "startShareRequestRejectedResponse", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("userId", event.userId);
    logData.put("reason", event.reason);

    Gson gson2 = new Gson();
    String logStr =  gson2.toJson(logData);

    log.info("Start ScreenShare request rejected response: data={}", logStr);
  }

  private void  sendStartShareRequestResponse(StartShareRequestResponse event) {
    Map<String, Object> data = new HashMap<String, Object>();

    data.put("authToken", event.token);
    data.put("jnlp", event.jnlp);
    data.put("streamId", event.streamId);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));

    DirectClientMessage msg = new DirectClientMessage(event.meetingId, event.userId, "startShareRequestResponse", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("userId", event.userId);

    logData.put("authToken", event.token);
    logData.put("jnlp", event.jnlp);


    Gson gson2 = new Gson();
    String logStr =  gson2.toJson(logData);

    log.info("Start ScreenShare request response: data={}", logStr);
  }

  private void sendShareStartedEvent(ShareStartedEvent event) {
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("meetingId", event.meetingId);
    data.put("streamId", event.streamId);
    
    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    BroadcastClientMessage msg = new BroadcastClientMessage(event.meetingId, "screenShareStartedMessage", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("streamId", event.streamId);

    gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("Screenshare started message: data={}", logStr);
  }
  
  private void sendShareStoppedEvent(ShareStoppedEvent event) {
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("meetingId", event.meetingId);
    data.put("streamId", event.streamId);

    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    BroadcastClientMessage msg = new BroadcastClientMessage(event.meetingId, "screenShareStoppedMessage", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("streamId", event.streamId);

    gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("Screenshare stopped message: data={}", logStr);

  }
  
  private void sendStreamStartedEvent(StreamStartedEvent event) {
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("meetingId", event.meetingId);
    data.put("streamId", event.streamId);
    data.put("width", event.width);
    data.put("height", event.height);
    data.put("url", event.url);
    
    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    BroadcastClientMessage msg = new BroadcastClientMessage(event.meetingId, "screenStreamStartedMessage", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("streamId", event.streamId);
    logData.put("width", event.width);
    logData.put("height", event.height);
    logData.put("url", event.url);

    gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("Screenshare stream started message: data={}", logStr);
  }
  
  private void sendStreamStoppedEvent(StreamStoppedEvent event) {
    Map<String, Object> data = new HashMap<String, Object>();
    data.put("meetingId", event.meetingId);
    data.put("streamId", event.streamId);

    Map<String, Object> message = new HashMap<String, Object>(); 
    Gson gson = new Gson();
    message.put("msg", gson.toJson(data));
    
    BroadcastClientMessage msg = new BroadcastClientMessage(event.meetingId, "screenStreamStoppedMessage", message);
    sender.sendMessage(msg);

    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("meetingId", event.meetingId);
    logData.put("streamId", event.streamId);

    gson = new Gson();
    String logStr =  gson.toJson(logData);

    log.info("Screenshare stream stopped message: data={}", logStr);
  }
  
  public void setMessageSender(ConnectionInvokerService sender) {
    this.sender = sender;
  }




}

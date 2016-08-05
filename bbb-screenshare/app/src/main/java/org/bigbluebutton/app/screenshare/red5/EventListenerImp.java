package org.bigbluebutton.app.screenshare.red5;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.app.screenshare.events.IEvent;
import org.bigbluebutton.app.screenshare.events.IEventListener;
import org.bigbluebutton.app.screenshare.events.ShareStartedEvent;
import org.bigbluebutton.app.screenshare.events.ShareStoppedEvent;
import org.bigbluebutton.app.screenshare.events.StreamStartedEvent;
import org.bigbluebutton.app.screenshare.events.StreamStoppedEvent;

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
    }
    
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

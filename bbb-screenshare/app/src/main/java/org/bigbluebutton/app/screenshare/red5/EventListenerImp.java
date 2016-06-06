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

public class EventListenerImp implements IEventListener {
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
  }
  
  public void setMessageSender(ConnectionInvokerService sender) {
    this.sender = sender;
  }

}

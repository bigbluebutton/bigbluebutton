package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.GetRecordingStatusReplyMessage;
import org.bigbluebutton.common.messages.RecordingStatusChangedMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import org.slf4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserClientMessageSender {

  private IConnectionInvokerService service;

  public UserClientMessageSender(IConnectionInvokerService service) {
    this.service = service;
  }

  public void handleUsersMessage(String message) {
    JsonParser parser = new JsonParser();
    JsonObject obj = (JsonObject) parser.parse(message);

    if (obj.has("header") && obj.has("payload")) {
      JsonObject header = (JsonObject) obj.get("header");

      if (header.has("name")) {
    	// Used for JSON unmarshalling
    	  
        String messageName = header.get("name").getAsString();
        switch (messageName) {
          case RecordingStatusChangedMessage.RECORDING_STATUS_CHANGED:
            RecordingStatusChangedMessage rscm = RecordingStatusChangedMessage.fromJson(message);
            if (rscm != null) {
              processRecordingStatusChangedMessage(rscm);
            }
            break;
          case GetRecordingStatusReplyMessage.Get_RECORDING_STATUS_REPLY:
            GetRecordingStatusReplyMessage grsrm = GetRecordingStatusReplyMessage.fromJson(message);
            if (grsrm != null) {
              processGetRecordingStatusReplyMessage(grsrm);
            }
            break;
        }
      }
    }
  }

  private void processRecordingStatusChangedMessage(RecordingStatusChangedMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("recording", msg.recording);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "recordingStatusChanged", message);
    service.sendMessage(m);		
  }

  private void processGetRecordingStatusReplyMessage(GetRecordingStatusReplyMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("recording", msg.recording);
  
    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "getRecordingStatusReply", message);
    service.sendMessage(m);		
  }
}

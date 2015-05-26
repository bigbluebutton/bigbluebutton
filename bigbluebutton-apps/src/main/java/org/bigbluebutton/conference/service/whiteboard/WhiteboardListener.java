
package org.bigbluebutton.conference.service.whiteboard;


import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.red5.pub.messages.MessagingConstants;
import org.bigbluebutton.core.api.Red5BBBInGw;
import org.bigbluebutton.red5.pubsub.messages.ClearWhiteboardRequestMessage;
import org.bigbluebutton.red5.pubsub.messages.EnableWhiteboardRequestMessage;
import org.bigbluebutton.red5.pubsub.messages.IsWhiteboardEnabledRequestMessage;
import org.bigbluebutton.red5.pubsub.messages.RequestWhiteboardAnnotationHistoryRequestMessage;
import org.bigbluebutton.red5.pubsub.messages.SendWhiteboardAnnotationRequestMessage;
import org.bigbluebutton.red5.pubsub.messages.UndoWhiteboardRequest;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class WhiteboardListener implements MessageHandler{
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_WHITEBOARD_CHANNEL)) {

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (UndoWhiteboardRequest.UNDO_WHITEBOARD_REQUEST.equals(messageName)) {
						System.out.println("inListener:UNDO_WHITEBOARD_REQUEST");
						UndoWhiteboardRequest msg = UndoWhiteboardRequest.fromJson(message);
						bbbInGW.undoWhiteboard(msg.meetingId, msg.requesterId, msg.whiteboardId);
					} else if (ClearWhiteboardRequestMessage.CLEAR_WHITEBOARD_REQUEST.equals(messageName)) {
						System.out.println("inListener:CLEAR_WHITEBOARD_REQUEST");
						ClearWhiteboardRequestMessage msg = ClearWhiteboardRequestMessage.fromJson(message);
						bbbInGW.clearWhiteboard(msg.meetingId, msg.requesterId, msg.whiteboardId);
					} else if (RequestWhiteboardAnnotationHistoryRequestMessage.REQUEST_WHITEBOARD_ANNOTATION_HISTORY_REQUEST.equals(messageName)) {
						System.out.println("inListener:REQUEST_WHITEBOARD_ANNOTATION_HISTORY_REQUEST");
						RequestWhiteboardAnnotationHistoryRequestMessage msg = RequestWhiteboardAnnotationHistoryRequestMessage.fromJson(message);
						bbbInGW.requestWhiteboardAnnotationHistory(msg.meetingId, msg.requesterId, msg.whiteboardId, msg.replyTo);
					} else if (IsWhiteboardEnabledRequestMessage.IS_WHITEBOARD_ENABLED_REQUEST.equals(messageName)) {
						System.out.println("inListener: IS_WHITEBOARD_ENABLED_REQUEST");
						IsWhiteboardEnabledRequestMessage msg = IsWhiteboardEnabledRequestMessage.fromJson(message);
						bbbInGW.isWhiteboardEnabled(msg.meetingId, msg.requesterId, msg.replyTo);
					} else if (EnableWhiteboardRequestMessage.ENABLE_WHITEBOARD_REQUEST.equals(messageName)) {
						System.out.println("inListener: ENABLE_WHITEBOARD_REQUEST");
						EnableWhiteboardRequestMessage msg = EnableWhiteboardRequestMessage.fromJson(message);
						bbbInGW.enableWhiteboard(msg.meetingId, msg.requesterId, msg.enable);
					} else if (SendWhiteboardAnnotationRequestMessage.SEND_WHITEBOARD_ANNOTATION_REQUEST.equals(messageName)) {
						System.out.println("inListener: SEND_WHITEBOARD_ANNOTATION_REQUEST");
						SendWhiteboardAnnotationRequestMessage msg = SendWhiteboardAnnotationRequestMessage.fromJson(message);
						bbbInGW.sendWhiteboardAnnotation(msg.meetingId, msg.requesterId, msg.annotation);
					}
				}
			}


//			JsonObject headerObject = (JsonObject) obj.get("header");
//			JsonObject payloadObject = (JsonObject) obj.get("payload");
//
//			String eventName =  headerObject.get("name").toString().replace("\"", "");
//
//			if(eventName.equalsIgnoreCase("get_whiteboard_shapes_request")){
//			//more cases to follow
//
//				String roomName = payloadObject.get("meeting_id").toString().replace("\"", "");
//
//				if(eventName.equalsIgnoreCase("get_whiteboard_shapes_request")){
//					String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
//					if(payloadObject.get("whiteboard_id") != null){
//						String whiteboardID = payloadObject.get("whiteboard_id").toString().replace("\"", "");
//						System.out.println("\n FOUND A whiteboardID:" + whiteboardID + "\n");
//						bbbInGW.requestWhiteboardAnnotationHistory(roomName, requesterID, whiteboardID, requesterID);
//					}
//					else {
//						System.out.println("\n DID NOT FIND A whiteboardID \n");
//					}
//					System.out.println("\n user<" + requesterID + "> requested the shapes.\n");
//				}
//			}
		}
	}
}

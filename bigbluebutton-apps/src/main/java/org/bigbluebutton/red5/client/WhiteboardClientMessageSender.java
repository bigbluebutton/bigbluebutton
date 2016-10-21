package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.ClearWhiteboardReplyMessage;
import org.bigbluebutton.common.messages.GetWhiteboardShapesReplyMessage;
import org.bigbluebutton.common.messages.IsWhiteboardEnabledReplyMessage;
import org.bigbluebutton.common.messages.SendWhiteboardAnnotationReplyMessage;
import org.bigbluebutton.common.messages.UndoWhiteboardReplyMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WhiteboardClientMessageSender {
	private ConnectionInvokerService service;
	
	public WhiteboardClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleWhiteboardMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
	
				switch (messageName) {
				  case UndoWhiteboardReplyMessage.UNDO_WHITEBOARD_REPLY:
					  UndoWhiteboardReplyMessage uwrm = UndoWhiteboardReplyMessage.fromJson(message);
					  if (uwrm != null) {
						  processUndoWhiteboardReply(uwrm);
					  }
					  break;
				  case ClearWhiteboardReplyMessage.WHITEBOARD_CLEARED_MESSAGE:
					  ClearWhiteboardReplyMessage wcm = ClearWhiteboardReplyMessage.fromJson(message);
					  if (wcm != null) {
						  processClearWhiteboardReply(wcm);
					  }
					  break;
					  case IsWhiteboardEnabledReplyMessage.IS_WHITEBOARD_ENABLED_REPLY:
						  IsWhiteboardEnabledReplyMessage iwe = IsWhiteboardEnabledReplyMessage.fromJson(message);
						  if (iwe != null) {
							  processIsWhiteboardEnabledReply(iwe);
						  }
						  break;
					  case GetWhiteboardShapesReplyMessage.GET_WHITEBOARD_SHAPES_REPLY:
						  GetWhiteboardShapesReplyMessage gwsrm = GetWhiteboardShapesReplyMessage.fromJson(message);
						  if (gwsrm != null) {
							  processGetWhiteboardShapesReplyMessage(gwsrm);
						  }
						  break;
						  case SendWhiteboardAnnotationReplyMessage.SEND_WHITEBOARD_ANNOTATION_REPLY:
							  SendWhiteboardAnnotationReplyMessage swarm = SendWhiteboardAnnotationReplyMessage.fromJson(message);
							  if (swarm != null) {
								  processSendWhiteboardAnnotationReplyMessage(swarm);
							  }
							  break;
				}
			}
		}
	}

	private void processSendWhiteboardAnnotationReplyMessage(SendWhiteboardAnnotationReplyMessage msg) {

		Map<String, Object> args = new HashMap<String, Object>();
		args.put("whiteboardId", msg.whiteboardId);
		
		Map<String, Object> shape = new HashMap<String, Object>();

		shape.put("id", msg.shape.get("id"));
		shape.put("type", msg.shape.get("type"));
		shape.put("status", msg.shape.get("status"));
		shape.put("shape", msg.shape.get("shapes"));
		
		args.put("shape", shape);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		//broadcast message
		BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "WhiteboardNewAnnotationCommand", message);
		service.sendMessage(b);
		
	}

	private void processGetWhiteboardShapesReplyMessage(GetWhiteboardShapesReplyMessage msg) {

		Map<String, Object> args = new HashMap<String, Object>();
		args.put("whiteboardId", msg.whiteboardId);
		args.put("count", msg.shapes.size());

		args.put("annotations",msg.shapes);
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "WhiteboardRequestAnnotationHistoryReply", message);
		service.sendMessage(m);
	}

	private void processIsWhiteboardEnabledReply(IsWhiteboardEnabledReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("enabled", msg.enabled);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "WhiteboardIsWhiteboardEnabledReply", message);
		service.sendMessage(m);

		// broadcast message
		BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "WhiteboardIsWhiteboardEnabledReply", message);
		service.sendMessage(b);
	}

	private void processClearWhiteboardReply(ClearWhiteboardReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("whiteboardId", msg.whiteboardId);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardClearCommand", message);
		service.sendMessage(m);
	}

	private void processUndoWhiteboardReply(UndoWhiteboardReplyMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("shapeId", msg.shapeId);
		args.put("whiteboardId", msg.whiteboardId);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardUndoCommand", message);
		service.sendMessage(m);
		
	}
}

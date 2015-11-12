package org.bigbluebutton.common.messages;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class GoToSlideReplyMessage {
	public static final String GO_TO_SLIDE_REPLY = "presentation_page_changed_message";
	public final String VERSION = "0.0.1";

	public final String meetingId;
	public final Map<String,Object> page;

	public GoToSlideReplyMessage(String meetingId, Map<String, Object> page) {
		this.meetingId = meetingId;
		this.page = page;
	}

	public String toJson() {
		HashMap<String, Object> payload = new HashMap<String, Object>();
		payload.put(Constants.MEETING_ID, meetingId);
		payload.put(Constants.PAGE, page);

		java.util.HashMap<String, Object> header = MessageBuilder.buildHeader(GO_TO_SLIDE_REPLY, VERSION, null);

		return MessageBuilder.buildJson(header, payload);
	}

	public static GoToSlideReplyMessage fromJson(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");
			JsonObject payload = (JsonObject) obj.get("payload");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				if (GO_TO_SLIDE_REPLY.equals(messageName)) {
					if (payload.has(Constants.MEETING_ID)
						&& payload.has(Constants.PAGE)) {
						String meetingId = payload.get(Constants.MEETING_ID).getAsString();

						JsonObject pageObj = (JsonObject) payload.get(Constants.PAGE).getAsJsonObject();
						Map<String, Object> page = new HashMap<String, Object>();
						
						if(pageObj.has(Constants.WIDTH_RATIO)
								&& pageObj.has(Constants.HEIGHT_RATIO)
								&& pageObj.has("svg_uri")
								&& pageObj.has("txt_uri")
								&& pageObj.has("num")
								&& pageObj.has(Constants.Y_OFFSET)
								&& pageObj.has("swf_uri")
								&& pageObj.has("thumb_uri")
								&& pageObj.has(Constants.X_OFFSET)
								&& pageObj.has(Constants.CURRENT)
								&& pageObj.has(Constants.ID)
								) {
							int wRatio = pageObj.get(Constants.WIDTH_RATIO).getAsInt();
							int hRatio = pageObj.get(Constants.HEIGHT_RATIO).getAsInt();
							String svgUri = pageObj.get("svg_uri").getAsString();
							String txtUri = pageObj.get("txt_uri").getAsString();
							int num = pageObj.get("num").getAsInt();
							int xOffset = pageObj.get(Constants.X_OFFSET).getAsInt();
							int yOffset = pageObj.get(Constants.Y_OFFSET).getAsInt();
							String swfUri = pageObj.get("swf_uri").getAsString();
							String thumbUri = pageObj.get("thumb_uri").getAsString();
							boolean current = pageObj.get(Constants.CURRENT).getAsBoolean();
							String id = pageObj.get(Constants.ID).getAsString();

							page.put(Constants.WIDTH_RATIO, wRatio);
							page.put(Constants.HEIGHT_RATIO, hRatio);
							page.put("svg_uri", svgUri);
							page.put("txt_uri", txtUri);
							page.put("num", num);
							page.put(Constants.X_OFFSET, xOffset);
							page.put(Constants.Y_OFFSET, yOffset);
							page.put("thumb_uri", thumbUri);
							page.put("swf_uri", swfUri);
							page.put(Constants.CURRENT, current);
							page.put(Constants.ID, id);

						}
						return new GoToSlideReplyMessage(meetingId, page);
					}
				}
			}
		}
		return null;
	}
}

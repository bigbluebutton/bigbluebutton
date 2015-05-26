package org.bigbluebutton.red5.pubsub.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.bigbluebutton.conference.service.chat.ChatKeyUtil;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class Util {
	public Map<String, Boolean> extractPermission(JsonObject vu) {
		if (vu.has(Constants.PERM_DISABLE_CAM) && vu.has(Constants.PERM_DISABLE_MIC)
				&& vu.has(Constants.PERM_DISABLE_PRIVCHAT) && vu.has(Constants.PERM_DISABLE_PUBCHAT)
				&& vu.has(Constants.PERM_LOCKED_LAYOUT) && vu.has(Constants.PERM_LOCK_ON_JOIN)
				&& vu.has(Constants.PERM_LOCK_ON_JOIN_CONFIG)){
				
			Map<String, Boolean> vuMap = new HashMap<String, Boolean>();
			Boolean disableCam = vu.get(Constants.PERM_DISABLE_CAM).getAsBoolean();
			Boolean disableMic = vu.get(Constants.PERM_DISABLE_MIC).getAsBoolean();
			Boolean disablePrivChat = vu.get(Constants.PERM_DISABLE_PRIVCHAT).getAsBoolean();
			Boolean disablePubChat = vu.get(Constants.PERM_DISABLE_PUBCHAT).getAsBoolean();
			Boolean lockedLayout = vu.get(Constants.PERM_LOCKED_LAYOUT).getAsBoolean();
			Boolean lockOnJoin = vu.get(Constants.PERM_LOCK_ON_JOIN).getAsBoolean();
			Boolean lockOnJoinConfig = vu.get(Constants.PERM_LOCK_ON_JOIN_CONFIG).getAsBoolean();
			
			vuMap.put(Constants.PERM_DISABLE_CAM, disableCam);
			vuMap.put(Constants.PERM_DISABLE_MIC, disableMic);
			vuMap.put(Constants.PERM_DISABLE_PRIVCHAT, disablePrivChat);
			vuMap.put(Constants.PERM_DISABLE_PUBCHAT, disablePubChat);
			vuMap.put(Constants.PERM_LOCKED_LAYOUT, lockedLayout);
			vuMap.put(Constants.PERM_LOCK_ON_JOIN, lockOnJoin);
			vuMap.put(Constants.PERM_LOCK_ON_JOIN_CONFIG, lockOnJoinConfig);
			
			return vuMap;
		}
		return null;
	}
	
	public Map<String, Object> extractVoiceUser(JsonObject vu) {
		if (vu.has(Constants.TALKING) && vu.has(Constants.LOCKED)
				&& vu.has(Constants.MUTED) && vu.has(Constants.JOINED)
				&& vu.has(Constants.CALLERNAME) && vu.has(Constants.CALLERNUM)
				&& vu.has(Constants.WEB_USERID) && vu.has(Constants.USER_ID)){
				
			Map<String, Object> vuMap = new HashMap<String, Object>();
			Boolean talking = vu.get(Constants.TALKING).getAsBoolean();
			Boolean voiceLocked = vu.get(Constants.LOCKED).getAsBoolean();
			Boolean muted = vu.get(Constants.MUTED).getAsBoolean();
			Boolean joined = vu.get(Constants.JOINED).getAsBoolean();
			String callername = vu.get(Constants.CALLERNAME).getAsString();
			String callernum = vu.get(Constants.CALLERNUM).getAsString();
			String webUserId = vu.get(Constants.WEB_USERID).getAsString();
			String voiceUserId = vu.get(Constants.USER_ID).getAsString();

			vuMap.put("talking", talking);
			vuMap.put("locked", voiceLocked);
			vuMap.put("muted", muted);
			vuMap.put("joined", joined);
			vuMap.put("callerName", callername);
			vuMap.put("callerNum", callernum);
			vuMap.put("webUserId", webUserId);
			vuMap.put("userId", voiceUserId);
			
			return vuMap;
		}
		return null;
	}
	
	public Map<String, Object> extractUser(JsonObject user) {
		if (user.has(Constants.USER_ID) && user.has(Constants.NAME)
				&& user.has(Constants.HAS_STREAM) && user.has(Constants.LISTENONLY)
				&& user.has(Constants.RAISE_HAND) && user.has(Constants.PHONE_USER)
				&& user.has(Constants.PRESENTER) && user.has(Constants.LOCKED)
				&& user.has(Constants.EXTERN_USERID) && user.has(Constants.ROLE)
				&& user.has(Constants.VOICEUSER)){
				
			Map<String, Object> userMap = new HashMap<String, Object>();					

			String userid = user.get(Constants.USER_ID).getAsString();
			String username = user.get(Constants.NAME).getAsString();
			Boolean hasStream = user.get(Constants.HAS_STREAM).getAsBoolean();
			Boolean listenOnly = user.get(Constants.LISTENONLY).getAsBoolean();
			Boolean raiseHand = user.get(Constants.RAISE_HAND).getAsBoolean();
			Boolean phoneUser = user.get(Constants.PHONE_USER).getAsBoolean();
			Boolean presenter = user.get(Constants.PRESENTER).getAsBoolean();
			Boolean locked = user.get(Constants.LOCKED).getAsBoolean();
			String extUserId = user.get(Constants.EXTERN_USERID).getAsString();
			String role = user.get(Constants.ROLE).getAsString();
						  
			userMap.put("userId", userid);
			userMap.put("name", username);
			userMap.put("listenOnly", listenOnly);
			userMap.put("hasStream", hasStream);
			userMap.put("raiseHand", raiseHand);
			userMap.put("externUserID", extUserId);
			userMap.put("phoneUser", phoneUser);
			userMap.put("locked", locked);
			userMap.put("role", role);
			userMap.put("presenter", presenter);
			
			JsonObject vu = (JsonObject) user.get(Constants.VOICEUSER);
			
			Map<String, Object> vuMap = extractVoiceUser(vu);
			if (vuMap != null) {
				userMap.put("voiceUser", vuMap);
				return userMap;
			}
		}
		
		return null;
			
	}

	public ArrayList<Map<String, Object>> extractChatHistory(JsonArray history) {
		ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();
		Iterator<JsonElement> historyIter = history.iterator();
		while (historyIter.hasNext()){
			JsonElement chat = historyIter.next();
			Map<String, Object> chatMap = extractChat((JsonObject)chat);
			if (chatMap != null) {
				collection.add(chatMap);
			}
		}
		System.out.println("extractChatHistory-----------------------");
		return collection;
	}

	private Map<String, Object> extractChat(JsonObject chat) {

		if (chat.has(Constants.FROM_COLOR)
				&& chat.has(Constants.MESSAGE)
				&& chat.has(Constants.TO_USERNAME)
				&& chat.has(Constants.FROM_TZ_OFFSET)
				&& chat.has(Constants.FROM_COLOR)
				&& chat.has(Constants.TO_USERID)
				&& chat.has(Constants.FROM_USERID)
				&& chat.has(Constants.FROM_TIME)
				&& chat.has(Constants.FROM_USERNAME)){

			Map<String, Object> chatMap = new HashMap<String, Object>();

			chatMap.put(ChatKeyUtil.CHAT_TYPE, chat.get(Constants.CHAT_TYPE).getAsString());
			chatMap.put(ChatKeyUtil.MESSAGE, chat.get(Constants.MESSAGE).getAsString());
			chatMap.put(ChatKeyUtil.TO_USERNAME, chat.get(Constants.TO_USERNAME).getAsString());
			chatMap.put(ChatKeyUtil.FROM_TZ_OFFSET, chat.get(Constants.FROM_TZ_OFFSET).getAsString());
			chatMap.put(ChatKeyUtil.FROM_COLOR, chat.get(Constants.FROM_COLOR).getAsString());
			chatMap.put(ChatKeyUtil.TO_USERID, chat.get(Constants.TO_USERID).getAsString());
			chatMap.put(ChatKeyUtil.FROM_USERID, chat.get(Constants.FROM_USERID).getAsString());
			chatMap.put(ChatKeyUtil.FROM_TIME, chat.get(Constants.FROM_TIME).getAsString());
			chatMap.put(ChatKeyUtil.FROM_USERNAME, chat.get(Constants.FROM_USERNAME).getAsString());

			return chatMap;
		}
		return null;
	}

	public ArrayList<Map<String, Object>> extractUsers(JsonArray users) {
		ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();
	
	    Iterator<JsonElement> usersIter = users.iterator();
	    while (usersIter.hasNext()){
			JsonElement user = usersIter.next();
			Map<String, Object> userMap = extractUser((JsonObject)user);
			if (userMap != null) {
				collection.add(userMap);
			}
	    }
		
		return collection;
			
	}

	public Map<String, Object> extractAnnotation(JsonObject annotationElement) {
		if (annotationElement.has(Constants.ID)
				&& annotationElement.has("transparency")
				&& annotationElement.has("color")
				&& annotationElement.has("status")
				&& annotationElement.has("whiteboardId")
				&& annotationElement.has("thickness")
				&& annotationElement.has("points")){

			Map<String, Object> finalAnnotation = new HashMap<String, Object>();

			boolean transparency = annotationElement.get("transparency").getAsBoolean();
			String id = annotationElement.get(Constants.ID).getAsString();
			int color = annotationElement.get("color").getAsInt();
			String status = annotationElement.get(Constants.STATUS).getAsString();
			String whiteboardId = annotationElement.get("whiteboardId").getAsString();
			int thickness = annotationElement.get("thickness").getAsInt();
			String type = annotationElement.get("type").getAsString();

			JsonArray pointsJsonArray = annotationElement.get("points").getAsJsonArray();

			ArrayList<Float> pointsArray = new ArrayList<Float>();
			Iterator<JsonElement> pointIter = pointsJsonArray.iterator();
			while (pointIter.hasNext()){
				JsonElement p = pointIter.next();
				Float pf = p.getAsFloat();
				if (pf != null) {
					pointsArray.add(pf);
				}
			}

			finalAnnotation.put("transparency", transparency);
			finalAnnotation.put(Constants.ID, id);
			finalAnnotation.put("color", color);
			finalAnnotation.put("status", status);
			finalAnnotation.put("whiteboardId", whiteboardId);
			finalAnnotation.put("thickness", thickness);
			finalAnnotation.put("points", pointsArray);
			finalAnnotation.put("type", type);

			return finalAnnotation;
		}
		return null;
	}
}

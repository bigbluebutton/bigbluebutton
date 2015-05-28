package org.bigbluebutton.common.messages;

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
	
	public ArrayList<String> extractUserids(JsonArray users) {
		ArrayList<String> collection = new ArrayList<String>();
	
	    Iterator<JsonElement> usersIter = users.iterator();
	    while (usersIter.hasNext()){
			JsonElement user = usersIter.next();
			collection.add(user.getAsString());
	    }
		
		return collection;
			
	}	

	public Map<String, Object> extractAnnotation(JsonObject annotationElement) {
		//NON-TEXT SHAPE
		if (annotationElement.has(Constants.ID)
				&& annotationElement.has("transparency")
				&& annotationElement.has("color")
				&& annotationElement.has("status")
				&& annotationElement.has("whiteboardId")
				&& annotationElement.has("type")
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

		// TEXT SHAPE
		else if (annotationElement.has(Constants.ID)
				&& annotationElement.has("text")
				&& annotationElement.has("fontColor")
				&& annotationElement.has("status")
				&& annotationElement.has("textBoxWidth")
				&& annotationElement.has("fontSize")
				&& annotationElement.has("type")
				&& annotationElement.has("calcedFontSize")
				&& annotationElement.has("textBoxHeight")
				&& annotationElement.has("calcedFontSize")
				&& annotationElement.has("whiteboardId")
				&& annotationElement.has("dataPoints")
				&& annotationElement.has("x")
				&& annotationElement.has("y")){

			Map<String, Object> finalAnnotation = new HashMap<String, Object>();

			String text = annotationElement.get("text").getAsString();
			int fontColor = annotationElement.get("fontColor").getAsInt();
			String status = annotationElement.get(Constants.STATUS).getAsString();
			Float textBoxWidth = annotationElement.get("textBoxWidth").getAsFloat();
			int fontSize = annotationElement.get("fontSize").getAsInt();
			String type = annotationElement.get("type").getAsString();
			Float calcedFontSize = annotationElement.get("calcedFontSize").getAsFloat();
			Float textBoxHeight = annotationElement.get("textBoxHeight").getAsFloat();
			String id = annotationElement.get(Constants.ID).getAsString();
			String whiteboardId = annotationElement.get("whiteboardId").getAsString();
			Float x = annotationElement.get("x").getAsFloat();
			Float y = annotationElement.get("y").getAsFloat();
			String dataPoints = annotationElement.get("dataPoints").getAsString();

			finalAnnotation.put("text", text);
			finalAnnotation.put("fontColor", fontColor);
			finalAnnotation.put(Constants.STATUS, status);
			finalAnnotation.put("textBoxWidth", textBoxWidth);
			finalAnnotation.put("fontSize", fontSize);
			finalAnnotation.put("type", type);
			finalAnnotation.put("calcedFontSize", calcedFontSize);
			finalAnnotation.put("textBoxHeight", textBoxHeight);
			finalAnnotation.put(Constants.ID, id);
			finalAnnotation.put("whiteboardId", whiteboardId);
			finalAnnotation.put("x", x);
			finalAnnotation.put("y", y);
			finalAnnotation.put("dataPoints", dataPoints);

			return finalAnnotation;
		}
		return null;
	}
	
	public Map<String, Object> extractCurrentPresenter(JsonObject vu) {
		if (vu.has(Constants.USER_ID) && vu.has(Constants.NAME)
				&& vu.has(Constants.ASSIGNED_BY)){
				
			Map<String, Object> vuMap = new HashMap<String, Object>();
			String presenterUserId = vu.get(Constants.USER_ID).getAsString();
			String presenterName = vu.get(Constants.NAME).getAsString();
			String assignedBy = vu.get(Constants.ASSIGNED_BY).getAsString();

			vuMap.put("userId", presenterUserId);
			vuMap.put("name", presenterName);
			vuMap.put("assignedBy", assignedBy);
			
			return vuMap;
		}
		return null;
	}
	
	
	public ArrayList<Map<String, Object>> extractPresentationPages(JsonArray pagesArray) {
		ArrayList<Map<String, Object>> pages = new ArrayList<Map<String, Object>>();
		
	    Iterator<JsonElement> pagesIter = pagesArray.iterator();
	    while (pagesIter.hasNext()){
			JsonObject pageObj = (JsonObject)pagesIter.next();
			if (pageObj.has("id") && pageObj.has("num") 
					&& pageObj.has("thumb_uri") && pageObj.has("swf_uri")
					&& pageObj.has("txt_uri") && pageObj.has("png_uri")
					&& pageObj.has("current") && pageObj.has("x_offset")
					&& pageObj.has("y_offset") && pageObj.has("width_ratio")
					&& pageObj.has("height_ratio")) {
				
				Map<String, Object> page = new HashMap<String, Object>();
				
				String pageId = pageObj.get("id").getAsString();
				Integer pageNum = pageObj.get("num").getAsInt();
				String pageThumbUri = pageObj.get("thumb_uri").getAsString();
				String pageSwfUri = pageObj.get("swf_uri").getAsString();
				String pageTxtUri = pageObj.get("txt_uri").getAsString();
				String pagePngUri = pageObj.get("png_uri").getAsString();
				
				Boolean currentPage = pageObj.get("current").getAsBoolean();
				Double xOffset = pageObj.get("x_offset").getAsDouble();
				Double yOffset = pageObj.get("y_offset").getAsDouble();
				Double widthRatio = pageObj.get("width_ratio").getAsDouble();
				Double heightRatio = pageObj.get("height_ratio").getAsDouble();
				
				page.put("id", pageId);
				page.put("num", pageNum);
				page.put("thumbUri", pageThumbUri);
				page.put("swfUri", pageSwfUri);
				page.put("txtUri", pageTxtUri);
				page.put("pngUri", pagePngUri);
				page.put("current", currentPage);
				page.put("xOffset", xOffset);
				page.put("yOffset", yOffset);
				page.put("widthRatio", widthRatio);
				page.put("heightRatio", heightRatio);
		
				pages.add(page);
		    }
	    }	
	    
		return pages;
	}
	
	public ArrayList<Map<String, Object>> extractPresentations(JsonArray presArray) {
		ArrayList<Map<String, Object>> presentations = new ArrayList<Map<String, Object>>();
		
	    Iterator<JsonElement> presentationsIter = presArray.iterator();
	    while (presentationsIter.hasNext()){
			JsonObject presObj = (JsonObject)presentationsIter.next();
			if (presObj.has(Constants.ID) && presObj.has(Constants.NAME) 
					&& presObj.has(Constants.CURRENT) && presObj.has(Constants.PAGES)) {
				Map<String, Object> pres = new HashMap<String, Object>();
				
				String presId = presObj.get(Constants.ID).getAsString();
				String presName = presObj.get(Constants.NAME).getAsString();
				Boolean currentPres = presObj.get(Constants.CURRENT).getAsBoolean();
				
				pres.put("id", presId);
				pres.put("name", presName);
				pres.put("current", currentPres);
				
				JsonArray pagesJsonArray = presObj.get(Constants.PAGES).getAsJsonArray();
				
				ArrayList<Map<String, Object>> pages = extractPresentationPages(pagesJsonArray);
				// store the pages in the presentation 
				pres.put(Constants.PAGES, pages);
			    
				// add this presentation into our presentations list
			    presentations.add(pres);
		    }
	    }
	    return presentations;
	}

	public ArrayList<Map<String, Object>> extractShapes(JsonArray shapes) {
		ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();

		Iterator<JsonElement> shapesIter = shapes.iterator();
		while (shapesIter.hasNext()){
			JsonElement shape = shapesIter.next();

			Map<String, Object> shapeMap = extractOuterAnnotation((JsonObject)shape);

			if (shapeMap != null) {
				collection.add(shapeMap);
			}
		}
		return collection;
	}

	public Map<String, Object> extractOuterAnnotation(JsonObject annotationElement) {

		if (annotationElement.has(Constants.ID)
				&& annotationElement.has("shape")
				&& annotationElement.has("status")
				&& annotationElement.has("shape_type")){

			Map<String, Object> finalAnnotation = new HashMap<String, Object>();

			String id = annotationElement.get(Constants.ID).getAsString();
			String status = annotationElement.get("status").getAsString();
			String type = annotationElement.get("shape_type").getAsString();

			finalAnnotation.put(Constants.ID, id);
			finalAnnotation.put("type", type);
			finalAnnotation.put("status", status);
			finalAnnotation.put("status", status);

			JsonElement shape = annotationElement.get("shape");
			Map<String, Object> shapesMap = extractAnnotation((JsonObject)shape);

			if (shapesMap != null) {
				finalAnnotation.put("shapes", shapesMap);
			}

			return finalAnnotation;
		}

		return null;
	}
}

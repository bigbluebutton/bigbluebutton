package org.bigbluebutton.common.messages;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

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
				&& user.has(Constants.EMOJI_STATUS) && user.has(Constants.PHONE_USER)
				&& user.has(Constants.PRESENTER) && user.has(Constants.LOCKED)
				&& user.has(Constants.EXTERN_USERID) && user.has(Constants.ROLE)
				&& user.has(Constants.VOICEUSER) && user.has(Constants.WEBCAM_STREAM)
				&& user.has(Constants.GUEST) && user.has(Constants.WAITING_FOR_ACCEPTANCE)){
				
			Map<String, Object> userMap = new HashMap<String, Object>();					

			String userid = user.get(Constants.USER_ID).getAsString();
			String username = user.get(Constants.NAME).getAsString();
			Boolean hasStream = user.get(Constants.HAS_STREAM).getAsBoolean();
			Boolean listenOnly = user.get(Constants.LISTENONLY).getAsBoolean();
			String emojiStatus = user.get(Constants.EMOJI_STATUS).getAsString();
			Boolean phoneUser = user.get(Constants.PHONE_USER).getAsBoolean();
			Boolean presenter = user.get(Constants.PRESENTER).getAsBoolean();
			Boolean locked = user.get(Constants.LOCKED).getAsBoolean();
			String extUserId = user.get(Constants.EXTERN_USERID).getAsString();
			String role = user.get(Constants.ROLE).getAsString();
			String avatarURL = user.get(Constants.AVATAR_URL).getAsString();
			Boolean guest = user.get(Constants.GUEST).getAsBoolean();
			Boolean waitingForAcceptance = user.get(Constants.WAITING_FOR_ACCEPTANCE).getAsBoolean();
			
			JsonArray webcamStreamJArray = user.get(Constants.WEBCAM_STREAM).getAsJsonArray();
			ArrayList<String> webcamStreams = extractWebcamStreams(webcamStreamJArray);
			
			userMap.put("userId", userid);
			userMap.put("name", username);
			userMap.put("listenOnly", listenOnly);
			userMap.put("hasStream", hasStream);
			userMap.put("webcamStream", webcamStreams);
			userMap.put("emojiStatus", emojiStatus);
			userMap.put("externUserID", extUserId);
			userMap.put("phoneUser", phoneUser);
			userMap.put("locked", locked);
			userMap.put("role", role);
			userMap.put("guest", guest);
			userMap.put("waitingForAcceptance", waitingForAcceptance);
			userMap.put("presenter", presenter);
			userMap.put("avatarURL", avatarURL);
			
			JsonObject vu = (JsonObject) user.get(Constants.VOICEUSER);
			
			Map<String, Object> vuMap = extractVoiceUser(vu);
			if (vuMap != null) {
				userMap.put("voiceUser", vuMap);
				return userMap;
			}
		}
		
		return null;
			
	}


	public ArrayList<String> extractStuns(JsonArray stunsArray) {
		ArrayList<String> collection = new ArrayList<String>();
		Iterator<JsonElement> stunIter = stunsArray.iterator();
		while (stunIter.hasNext()) {
			JsonElement aStun = stunIter.next();
			if (aStun != null) {
				collection.add(aStun.getAsString());
			}
		}

		return collection;
	}


	public ArrayList<Map<String, Object>> extractTurns(JsonArray turnsArray) {
		ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();
		Iterator<JsonElement> turnIter = turnsArray.iterator();
		while (turnIter.hasNext()){
			JsonElement aTurn = turnIter.next();
			Map<String, Object> turnMap = extractATurn((JsonObject)aTurn);
			if (turnMap != null) {
				collection.add(turnMap);
			}
		}
		return collection;
	}

	private Map<String,Object> extractATurn(JsonObject aTurn) {
		if (aTurn.has(Constants.USERNAME)
				&& aTurn.has(Constants.TTL)
				&& aTurn.has(Constants.URL)
				&& aTurn.has(Constants.PASSWORD)) {

			Map<String, Object> turnMap = new HashMap<String, Object>();

			turnMap.put(Constants.USERNAME, aTurn.get(Constants.USERNAME).getAsString());
			turnMap.put(Constants.URL, aTurn.get(Constants.URL).getAsString());
			turnMap.put(Constants.PASSWORD, aTurn.get(Constants.PASSWORD).getAsString());
			turnMap.put(Constants.TTL, aTurn.get(Constants.TTL).getAsInt());

			return turnMap;
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

	public ArrayList<String> extractWebcamStreams(JsonArray webcamStreams) {
		ArrayList<String> collection = new ArrayList<String>();

	    Iterator<JsonElement> webcamStreamsIter = webcamStreams.iterator();
	    while (webcamStreamsIter.hasNext()){
			JsonElement stream = webcamStreamsIter.next();
			collection.add(stream.getAsString());
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
			Float thickness = annotationElement.get("thickness").getAsFloat();
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
      
			//the final pencil annotation has a commands property
			if (annotationElement.has("commands")) {
				JsonArray commandsJsonArray = annotationElement.get("commands").getAsJsonArray();
				ArrayList<Integer> commandsArray = new ArrayList<Integer>();
				Iterator<JsonElement> commandIter = commandsJsonArray.iterator();
				while (commandIter.hasNext()){
					JsonElement p = commandIter.next();
					Integer ci = p.getAsInt();
					if (ci != null) {
						commandsArray.add(ci);
					}
				}
				finalAnnotation.put("commands", commandsArray);
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
				&& annotationElement.has("shape_type")
				&& annotationElement.has("user_id")){

			Map<String, Object> finalAnnotation = new HashMap<String, Object>();

			String id = annotationElement.get(Constants.ID).getAsString();
			String status = annotationElement.get("status").getAsString();
			String type = annotationElement.get("shape_type").getAsString();
			String userId = annotationElement.get("user_id").getAsString();

			finalAnnotation.put(Constants.ID, id);
			finalAnnotation.put("type", type);
			finalAnnotation.put("status", status);
			finalAnnotation.put("userId", userId);

			JsonElement shape = annotationElement.get("shape");
			Map<String, Object> shapesMap;

			shapesMap = extractAnnotation((JsonObject)shape);

			if (shapesMap != null) {
				finalAnnotation.put("shapes", shapesMap);
			}

			return finalAnnotation;
		}

		return null;
	}
	
	public Map<String, String[]> extractCaptionHistory(JsonObject history) {
		Map<String, String[]> collection = new HashMap<String, String[]>();
		
		for (Map.Entry<String,JsonElement> entry : history.entrySet()) {
			String locale = entry.getKey();
			JsonArray values = entry.getValue().getAsJsonArray();
			String[] localeValueArray = new String[3];
			
            int i = 0;
			Iterator<JsonElement> valuesIter = values.iterator();
			while (valuesIter.hasNext()){
				String element = valuesIter.next().getAsString();
                
                localeValueArray[i++] = element;
			}
            
			collection.put(locale, localeValueArray);
		}
		
		return collection;
	}
	
	class Note {
		String name = "";
		String document = "";
		Integer patchCounter = 0;
		Boolean undo = false;
		Boolean redo = false;

		public Note(String name, String document, Integer patchCounter, Boolean undo, Boolean redo) {
			this.name = name;
			this.document = document;
			this.patchCounter = patchCounter;
			this.undo = undo;
			this.redo = redo;
		}
	}

	public Object extractNote(JsonObject noteObject) {
		String name = noteObject.get("name").getAsString();
		String document = noteObject.get("document").getAsString();
		Integer patchCounter = noteObject.get("patchCounter").getAsInt();
		Boolean undo = noteObject.get("undo").getAsBoolean();
		Boolean redo = noteObject.get("redo").getAsBoolean();

		Note note = new Note(name, document, patchCounter, undo, redo);

		return (Object) note;
	}

	public Map<String, Object> extractNotes(JsonObject notes) {
		Map<String, Object> notesMap = new HashMap<String, Object>();

		for (Map.Entry<String, JsonElement> entry : notes.entrySet()) {
			JsonObject obj = entry.getValue().getAsJsonObject();
			Object note = extractNote(obj);
			notesMap.put(entry.getKey(), note);
		}

		return notesMap;
	}

	public Map<String, String> extractMetadata(JsonObject metadata) {
		Map<String, String> metadataMap = new HashMap<String, String>();

		for (Map.Entry<String, JsonElement> entry : metadata.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue().getAsString();
			metadataMap.put(key, value);
		}

		return metadataMap;
	}
}

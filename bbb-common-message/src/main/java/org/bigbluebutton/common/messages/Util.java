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
				&& user.has(Constants.VOICEUSER) && user.has(Constants.WEBCAM_STREAM)){
				
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
					&& pageObj.has("txt_uri") && pageObj.has("svg_uri")
					&& pageObj.has("current") && pageObj.has("x_offset")
					&& pageObj.has("y_offset") && pageObj.has("width_ratio")
					&& pageObj.has("height_ratio")) {

				Map<String, Object> page = new HashMap<String, Object>();

				String pageId = pageObj.get("id").getAsString();
				Integer pageNum = pageObj.get("num").getAsInt();
				String pageThumbUri = pageObj.get("thumb_uri").getAsString();
				String pageSwfUri = pageObj.get("swf_uri").getAsString();
				String pageTxtUri = pageObj.get("txt_uri").getAsString();
				String pageSvgUri = pageObj.get("svg_uri").getAsString();

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
				page.put("svgUri", pageSvgUri);
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
			presentations.add(extractPresentation(presObj));
		}
		return presentations;
	}

	public Map<String, Object> extractPresentation(JsonObject presObj) {
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
			return pres;
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

	public Map<String, Object> extractPollResultAnnotation(JsonObject annotationElement) {
		if (annotationElement.has("result") && annotationElement.has("whiteboardId")
				&& annotationElement.has("points")) {
			Map<String, Object> finalAnnotation = new HashMap<String, Object>();

			String whiteboardId = annotationElement.get("whiteboardId").getAsString();
			Integer numRespondents = annotationElement.get(NUM_RESPONDENTS).getAsInt();
			Integer numResponders = annotationElement.get(NUM_RESPONDERS).getAsInt();

			String resultJson = annotationElement.get("result").getAsString();
			JsonParser parser = new JsonParser();
		    JsonArray resultJsonArray = parser.parse(resultJson).getAsJsonArray();

			ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();
			Iterator<JsonElement> resultIter = resultJsonArray.iterator();

			while (resultIter.hasNext()){
				JsonObject p = (JsonObject)resultIter.next();
				Map<String, Object> vote = new HashMap<String, Object>();
				Integer vid = p.get("id").getAsInt();
				Integer vvotes = p.get("num_votes").getAsInt();
				String vkey = p.get("key").getAsString();
				vote.put("id", vid);
				vote.put("num_votes", vvotes);
				vote.put("key", vkey);

				collection.add(vote);
			}

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

			finalAnnotation.put("whiteboardId", whiteboardId);
			finalAnnotation.put(NUM_RESPONDENTS, numRespondents);
			finalAnnotation.put(NUM_RESPONDERS, numResponders);
			finalAnnotation.put("result", collection);
			finalAnnotation.put("points", pointsArray);

			return finalAnnotation;
		}
		return null;
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

			JsonElement shape = annotationElement.get("shape");
			Map<String, Object> shapesMap;

			if (type.equals("poll_result")) {
				shapesMap = extractPollResultAnnotation((JsonObject)shape);
			} else {
				shapesMap = extractAnnotation((JsonObject)shape);
			}

			if (shapesMap != null) {
				finalAnnotation.put("shapes", shapesMap);
			}

			return finalAnnotation;
		}

		return null;
	}

	public ArrayList<Map<String, Object>> extractPages(JsonArray pages) {
		ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();

		Iterator<JsonElement> pagesIter = pages.iterator();
		while (pagesIter.hasNext()){
			JsonElement page = pagesIter.next();

			Map<String, Object> pageMap = extractPage((JsonObject)page);
			if (pageMap != null) {
				collection.add(pageMap);
			}
		}
		return collection;
	}

	public Map<String, Object> extractPage(JsonObject page) {

		final String WIDTH_RATIO = "width_ratio";
		final String Y_OFFSET = "y_offset";
		final String NUM = "num";
		final String HEIGHT_RATIO = "height_ratio";
		final String X_OFFSET = "x_offset";
		final String SVG_URI = "svg_uri";
		final String THUMB_URI = "thumb_uri";
		final String TXT_URI = "txt_uri";
		final String CURRENT = "current";
		final String SWF_URI = "swf_uri";

		if (page.has(Constants.ID)
				&& page.has(WIDTH_RATIO)
				&& page.has(Y_OFFSET)
				&& page.has(NUM)
				&& page.has(HEIGHT_RATIO)
				&& page.has(X_OFFSET)
				&& page.has(SVG_URI)
				&& page.has(THUMB_URI)
				&& page.has(CURRENT)
				&& page.has(TXT_URI)
				&& page.has(SWF_URI)){

			Map<String, Object> finalPage = new HashMap<String, Object>();

			String id = page.get(Constants.ID).getAsString();
			double widthRatio = page.get(WIDTH_RATIO).getAsDouble();
			double yOffset = page.get(Y_OFFSET).getAsDouble();
			double num = page.get(NUM).getAsDouble();
			double heightRatio = page.get(HEIGHT_RATIO).getAsDouble();
			double xOffset = page.get(X_OFFSET).getAsDouble();
			String svgUri = page.get(SVG_URI).getAsString();
			String thumbUri = page.get(THUMB_URI).getAsString();
			boolean current = page.get(CURRENT).getAsBoolean();
			String txtUri = page.get(TXT_URI).getAsString();
			String swfUri = page.get(SWF_URI).getAsString();

			finalPage.put(Constants.ID, id);
			finalPage.put(WIDTH_RATIO, widthRatio);
			finalPage.put(Y_OFFSET, yOffset);
			finalPage.put(NUM, num);
			finalPage.put(HEIGHT_RATIO, heightRatio);
			finalPage.put(X_OFFSET, xOffset);
			finalPage.put(SVG_URI, svgUri);
			finalPage.put(THUMB_URI, thumbUri);
			finalPage.put(CURRENT, current);
			finalPage.put(TXT_URI, txtUri);
			finalPage.put(SWF_URI, swfUri);

			return finalPage;
		}

		return null;
	}

	public Map<String, Object> decodeSimplePollAnswer(JsonObject answer) {
		Map<String, Object> answerMap = new HashMap<String, Object>();
		if (answer.has(Constants.ID) && answer.has(KEY)) {
			String id = answer.get(Constants.ID).getAsString();
			String key = answer.get(KEY).getAsString();

			answerMap.put(Constants.ID, id);
			answerMap.put(KEY, key);
		}


		return answerMap;
	}

	public static final String ANSWERS = "answers";
	public static final String KEY = "key";
	public static final String NUM_VOTES = "num_votes";
	public static final String NUM_RESPONDERS = "num_responders";
	public static final String NUM_RESPONDENTS = "num_respondents";

	public Map<String, Object> decodeSimplePoll(JsonObject poll) {
		Map<String, Object> pollMap = new HashMap<String, Object>();

		if (poll.has(Constants.ID) && poll.has(ANSWERS)) {
			String id = poll.get(Constants.ID).getAsString();
			JsonArray answers = poll.get(ANSWERS).getAsJsonArray();

			ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();

			Iterator<JsonElement> answersIter = answers.iterator();
			while (answersIter.hasNext()){
				JsonElement qElem = answersIter.next();

				Map<String, Object> answerMap = decodeSimplePollAnswer((JsonObject)qElem);

				if (answerMap != null) {
					collection.add(answerMap);
				}
			}

			pollMap.put(Constants.ID, id);
			pollMap.put(ANSWERS, collection);
		}


		return pollMap;
	}

	public Map<String, Object> decodeSimplePollAnswerVote(JsonObject answer) {
		Map<String, Object> answerMap = new HashMap<String, Object>();
		if (answer.has(Constants.ID) && answer.has(KEY)) {
			String id = answer.get(Constants.ID).getAsString();
			String key = answer.get(KEY).getAsString();
			Integer numVotes = answer.get(NUM_VOTES).getAsInt();

			answerMap.put(Constants.ID, id);
			answerMap.put(KEY, key);
			answerMap.put(NUM_VOTES, numVotes);
		}

		return answerMap;
	}
	public Map<String, Object> decodeSimplePollResult(JsonObject poll) {
		Map<String, Object> pollMap = new HashMap<String, Object>();

		if (poll.has(Constants.ID) && poll.has(ANSWERS)) {
			String id = poll.get(Constants.ID).getAsString();
			Integer numRespondents = poll.get(NUM_RESPONDENTS).getAsInt();
			Integer numResponders = poll.get(NUM_RESPONDERS).getAsInt();

			JsonArray answers = poll.get(ANSWERS).getAsJsonArray();

			ArrayList<Map<String, Object>> collection = new ArrayList<Map<String, Object>>();

			Iterator<JsonElement> answersIter = answers.iterator();
			while (answersIter.hasNext()){
				JsonElement qElem = answersIter.next();

				Map<String, Object> answerMap = decodeSimplePollAnswerVote((JsonObject)qElem);

				if (answerMap != null) {
					collection.add(answerMap);
				}
			}

			pollMap.put(Constants.ID, id);
			pollMap.put(NUM_RESPONDENTS, numRespondents);
			pollMap.put(NUM_RESPONDERS, numResponders);
			pollMap.put(ANSWERS, collection);
		}


		return pollMap;
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
	
}

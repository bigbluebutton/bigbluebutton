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

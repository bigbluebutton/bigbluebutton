package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import redis.clients.jedis.Jedis;

import com.google.gson.Gson;

public class WhiteboardBridge {
	private MessagingService messagingService;
	
	private static final String RECTANGLE_TYPE = "rectangle";
	private static final String PENCIL_TYPE = "pencil";
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardBridge.class, "bigbluebutton");
	
	public WhiteboardBridge(){
		
	}
	
	public void sendAnnotation(String meetingID, Annotation an) {
		
		if(an.getType().equalsIgnoreCase(WhiteboardBridge.PENCIL_TYPE)){
			Map map = an.getAnnotation();
			ArrayList<Object> updates = new ArrayList<Object>();
			
			updates.add(meetingID);
			updates.add("shapePoints");
			updates.add("line");
			updates.add(map.get("color"));
			updates.add(map.get("thickness"));
			updates.add(map.get("points"));
			
			Gson gson = new Gson();
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}
		
		
	}
	
	public void storeAnnotation(String meetingID, Annotation an){
		
		if(an.getType().equalsIgnoreCase(WhiteboardBridge.PENCIL_TYPE)){
			String shapeType = "path";
			String shapeID = Long.toString(System.currentTimeMillis());
			ArrayList<Object> data = new ArrayList<Object>();
			
			Map map = an.getAnnotation();
			ArrayList points = (ArrayList) map.get("points");
			String strPoints = "";
			for(int i=0;i<points.size();i+=2){
				String letter = "";
				Double pA = (Double) points.get(i);
				Double pB = (Double) points.get(i+1);
				
				if(i==0)
					letter = "M";
				else
					letter = "L";
				
				strPoints += letter + (pA/100) + "," + (pB/100);
			}
			
			Jedis jedis = messagingService.createRedisClient();
			
			HashMap<String,String> mapAnn = new HashMap<String, String>();
			
			mapAnn.put("shape", shapeType);
			data.add(strPoints);
			data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
			data.add(map.get("thickness"));
			Gson gson = new Gson();
			mapAnn.put("data", gson.toJson(data));
			jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
			jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
			
			messagingService.dropRedisClient(jedis);
		}
	}
	
	public void setMessagingService(MessagingService ms){
		this.messagingService = ms;
	}

}

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
	private static final String ELLIPSE_TYPE = "ellipse";
	private static final String TRIANGLE_TYPE = "triangle";
	private static final String LINE_TYPE = "line";
	private static final String TEXT_TYPE = "text";
	
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardBridge.class, "bigbluebutton");
	
	public WhiteboardBridge(){
		
	}
	
	// send "undo" event to html5-client
	
	public void undo(String meetingID){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("undo");
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	// send "clrPaper" event to html5-client
	
	public void clear(String meetingID){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("clrPaper");
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
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
		}else if(an.getType().equalsIgnoreCase(WhiteboardBridge.RECTANGLE_TYPE)){
			Map map = an.getAnnotation();
			ArrayList<Object> updates = new ArrayList<Object>();
			updates.add(meetingID);
			
			ArrayList points = (ArrayList) map.get("points");
			
			ArrayList<Object> data = new ArrayList<Object>();
			
			Double pX = Double.parseDouble(points.get(0).toString());
			Double pY = Double.parseDouble(points.get(1).toString());
			data.add(pX/100);
			data.add(pY/100);
			if(an.getStatus().equalsIgnoreCase("DRAW_START")){
				updates.add("makeShape");
				data.add(map.get("color"));
				data.add(map.get("thickness"));
				data.add(map.get("square"));
				
			}else{
				updates.add("updShape");
				Double pW = Double.parseDouble(points.get(2).toString());
				Double pH = Double.parseDouble(points.get(3).toString());
				data.add(pW/100);
				data.add(pH/100);
				data.add(map.get("square"));// if "Ctrl" key pressed, it should draw square in html5-client		
			}
			
			updates.add("rect");
			updates.add(data);
			
			Gson gson = new Gson();
			log.debug("sendAnnotation: " + gson.toJson(updates));
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}else if(an.getType().equalsIgnoreCase(WhiteboardBridge.ELLIPSE_TYPE)){
			Map map = an.getAnnotation();
			ArrayList<Object> updates = new ArrayList<Object>();
			updates.add(meetingID);
			
			ArrayList points = (ArrayList) map.get("points");
			
			ArrayList<Object> data = new ArrayList<Object>();
			Double pX = Double.parseDouble(points.get(0).toString());
			Double pY = Double.parseDouble(points.get(1).toString());
			data.add(pX/100);
			data.add(pY/100);
			if(an.getStatus().equalsIgnoreCase("DRAW_START")){
				updates.add("makeShape");
				data.add(map.get("color"));
				data.add(map.get("thickness"));
				
			}else{
				updates.add("updShape");
				Double vR = Double.parseDouble(points.get(2).toString());
				Double hR = Double.parseDouble(points.get(3).toString());
				data.add(vR/100);
				data.add(hR/100);
				data.add(map.get("circle"));// if "Ctrl" key pressed, it should draw a circle in html5-client
			}
			
			updates.add("ellipse");
			updates.add(data);
			
			Gson gson = new Gson();
			log.debug("sendAnnotation: " + gson.toJson(updates));
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}else if(an.getType().equalsIgnoreCase(WhiteboardBridge.TRIANGLE_TYPE)){
			log.debug("start triangle shape");
			Map map = an.getAnnotation();
			log.debug("triangle map: " + map);
			
			ArrayList<Object> updates = new ArrayList<Object>();
			updates.add(meetingID);
			
			ArrayList points = (ArrayList) map.get("points");
			
			ArrayList<Object> data = new ArrayList<Object>();
			Double pX = Double.parseDouble(points.get(0).toString());
			Double pY = Double.parseDouble(points.get(1).toString());
			
			data.add(pX/100);
			data.add(pY/100);
			if(an.getStatus().equalsIgnoreCase("DRAW_START")){
				updates.add("makeShape");
				data.add(map.get("color"));
				data.add(map.get("thickness"));
				
			}else{
				updates.add("updShape");
				Double pBase = Double.parseDouble(points.get(2).toString());
				Double pHeight = Double.parseDouble(points.get(3).toString());
				data.add(pBase/100);
				data.add(pHeight/100);
			}
			
			updates.add("triangle");
			updates.add(data);
			
			Gson gson = new Gson();
			log.debug("sendAnnotation: " + gson.toJson(updates));
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}else if(an.getType().equalsIgnoreCase(WhiteboardBridge.LINE_TYPE)){
			Map map = an.getAnnotation();
			log.debug("line map: " + map);
			
			ArrayList<Object> updates = new ArrayList<Object>();
			updates.add(meetingID);
			
			ArrayList points = (ArrayList) map.get("points");
			
			
			
			ArrayList<Object> data = new ArrayList<Object>();
			Double p1X = Double.parseDouble(points.get(0).toString());
			Double p1Y = Double.parseDouble(points.get(1).toString());
			
			data.add(p1X/100);
			data.add(p1Y/100);
			if(an.getStatus().equalsIgnoreCase("DRAW_START")){
				updates.add("makeShape");
				data.add(map.get("color"));
				data.add(map.get("thickness"));
				
			}else{
				updates.add("updShape");
				Double p2X = Double.parseDouble(points.get(2).toString());
				Double p2Y = Double.parseDouble(points.get(3).toString());
				data.add(p2X/100);
				data.add(p2Y/100);
			}
			
			updates.add("line");
			updates.add(data);
			
			Gson gson = new Gson();
			log.debug("sendAnnotation: " + gson.toJson(updates));
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}else if(an.getType().equalsIgnoreCase(WhiteboardBridge.TEXT_TYPE)){
			Map map = an.getAnnotation();
			log.debug("text map: " + map);
			
			/*
			 *
			 * 2013-04-27 16:20:32,039 [NioProcessor-6] DEBUG o.b.c.s.whiteboard.WhiteboardBridge - text map: {text=, fontColor=0, status=textCreated, textBoxWidth=19.897959183673468, type=text, fontSize=18, 
			 * calcedFontSize=2.4489795918367347, textBoxHeight=10.748299319727892, id=grkuuwyivyq0-2-1367097639287, presentationID=default, pageNumber=1, y=19.86394557823129, x=63.775510204081634, 
			 * dataPoints=63.775510204081634,19.86394557823129}
			 * 
			 * 2013-04-27 16:20:34,084 [NioProcessor-6] DEBUG o.b.c.s.whiteboard.WhiteboardBridge - text map: {text=text, fontColor=0, backgroundColor=16777215, status=textEdited, textBoxWidth=19.897959183673468, 
			 * type=text, fontSize=18, textBoxHeight=10.748299319727892, calcedFontSize=2.4489795918367347, id=grkuuwyivyq0-2-1367097639287, background=true, presentationID=default, pageNumber=1, 
			 * y=19.86394557823129, x=63.775510204081634, dataPoints=63.775510204081634,19.86394557823129}
			 * 
			 * 2013-04-27 16:20:35,070 [NioProcessor-6] DEBUG o.b.c.s.whiteboard.WhiteboardBridge - text map: {text=text, fontColor=0, backgroundColor=16777215, status=textPublished, textBoxWidth=19.897959183673468, 
			 * type=text, fontSize=18, textBoxHeight=10.748299319727892, calcedFontSize=2.4489795918367347, id=grkuuwyivyq0-2-1367097639287, background=true, presentationID=default, pageNumber=1, 
			 * y=19.86394557823129, x=63.775510204081634, dataPoints=63.775510204081634,19.86394557823129}
			 * 
			 * */
			
			
			ArrayList<Object> updates = new ArrayList<Object>();
			updates.add(meetingID);
			
			Double pX = Double.parseDouble(map.get("x").toString());
			Double pY = Double.parseDouble(map.get("y").toString());
			Double tbWidth = Double.parseDouble(map.get("textBoxWidth").toString());
			Double tbHeight = Double.parseDouble(map.get("textBoxHeight").toString());
			
			/*
			 * "makeShape", "text", [x (%), y (%), spacing between letters, color, font, font size]
			 * "updShape",  "text", [x (%), y (%), text, width (%)]
			 * */
			
			ArrayList<Object> data = new ArrayList<Object>();
			data.add(pX/100);
			data.add(pY/100);
			data.add(tbWidth);
			data.add(tbHeight);
			data.add(map.get("fontColor"));
			data.add(map.get("fontSize"));
			data.add(map.get("calcedFontSize"));
			data.add(map.get("text"));
			
			if(an.getStatus().equalsIgnoreCase("textCreated")){
				updates.add("makeShape");	
			}else{
				updates.add("updShape");
			}
			
			updates.add("text");
			updates.add(data);
			
			Gson gson = new Gson();
			log.debug("sendAnnotation: " + gson.toJson(updates));
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		}

		else{
			Map map = an.getAnnotation();
			log.debug("another type of annotation: " + map);
		}	
		
	}
	
	public void storeAnnotation(String meetingID, Annotation an){
		
		if(an.getType().equalsIgnoreCase(WhiteboardBridge.PENCIL_TYPE)){
			String shapeType = "path";
			String shapeID = Long.toString(System.currentTimeMillis());
			ArrayList<Object> data = new ArrayList<Object>();
			
			Map map = an.getAnnotation();
			ArrayList points = (ArrayList) map.get("points");
			
			Jedis jedis = messagingService.createRedisClient();
			
			HashMap<String,String> mapAnn = new HashMap<String, String>();
			
			mapAnn.put("shape", shapeType);
			data.add(points);
			data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
			data.add(map.get("thickness"));
			Gson gson = new Gson();
			mapAnn.put("data", gson.toJson(data));
			jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
			jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
			
			messagingService.dropRedisClient(jedis);
		}
		else if(an.getType().equalsIgnoreCase(WhiteboardBridge.RECTANGLE_TYPE)){
			if(an.getStatus().equalsIgnoreCase("DRAW_END")){
				String shapeType = "rect";
				String shapeID = Long.toString(System.currentTimeMillis());
				ArrayList<Object> data = new ArrayList<Object>();
				
				Map map = an.getAnnotation();
				ArrayList points = (ArrayList) map.get("points");
				Double pX = Double.parseDouble(points.get(0).toString());
				Double pY = Double.parseDouble(points.get(1).toString());
				Double pW = Double.parseDouble(points.get(2).toString());
				Double pH = Double.parseDouble(points.get(3).toString());
				
				
				Jedis jedis = messagingService.createRedisClient();
				
				HashMap<String,String> mapAnn = new HashMap<String, String>();
				
				mapAnn.put("shape", shapeType);
				
				data.add(pX/100);
				data.add(pY/100);
				data.add(pW/100);
				data.add(pH/100);
				data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
				data.add(map.get("thickness"));
				
				Gson gson = new Gson();
				mapAnn.put("data", gson.toJson(data));
				
				jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
				jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
				
				messagingService.dropRedisClient(jedis);
			}
		}
		
		else if(an.getType().equalsIgnoreCase(WhiteboardBridge.ELLIPSE_TYPE)){
			if(an.getStatus().equalsIgnoreCase("DRAW_END")){
				String shapeType = "ellipse";
				String shapeID = Long.toString(System.currentTimeMillis());
				ArrayList<Object> data = new ArrayList<Object>();
				
				Map map = an.getAnnotation();
				ArrayList points = (ArrayList) map.get("points");
				Double pX = Double.parseDouble(points.get(0).toString());
				Double pY = Double.parseDouble(points.get(1).toString());
				Double vR = Double.parseDouble(points.get(2).toString());
				Double hR = Double.parseDouble(points.get(3).toString());
				
				
				Jedis jedis = messagingService.createRedisClient();
				
				HashMap<String,String> mapAnn = new HashMap<String, String>();
				
				mapAnn.put("shape", shapeType);
				
				data.add(pX/100);
				data.add(pY/100);
				data.add(vR/100);
				data.add(hR/100);
				data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
				data.add(map.get("thickness"));
				
				Gson gson = new Gson();
				mapAnn.put("data", gson.toJson(data));
				
				jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
				jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
				
				messagingService.dropRedisClient(jedis);
			}
		}
		
		else if(an.getType().equalsIgnoreCase(WhiteboardBridge.TRIANGLE_TYPE)){
			if(an.getStatus().equalsIgnoreCase("DRAW_END")){
				String shapeType = "triangle";
				String shapeID = Long.toString(System.currentTimeMillis());
				ArrayList<Object> data = new ArrayList<Object>();
				
				Map map = an.getAnnotation();
				ArrayList points = (ArrayList) map.get("points");
				Double pX = Double.parseDouble(points.get(0).toString());
				Double pY = Double.parseDouble(points.get(1).toString());
				Double pBase = Double.parseDouble(points.get(2).toString());
				Double pHeight = Double.parseDouble(points.get(3).toString());
				
				
				Jedis jedis = messagingService.createRedisClient();
				
				HashMap<String,String> mapAnn = new HashMap<String, String>();
				
				mapAnn.put("shape", shapeType);
				
				data.add(pX/100);
				data.add(pY/100);
				data.add(pBase/100);
				data.add(pHeight/100);
				data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
				data.add(map.get("thickness"));
				
				Gson gson = new Gson();
				mapAnn.put("data", gson.toJson(data));
				
				jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
				jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
				
				messagingService.dropRedisClient(jedis);
			}
		}
		
		else if(an.getType().equalsIgnoreCase(WhiteboardBridge.LINE_TYPE)){
			if(an.getStatus().equalsIgnoreCase("DRAW_END")){
				String shapeType = "line";
				String shapeID = Long.toString(System.currentTimeMillis());
				ArrayList<Object> data = new ArrayList<Object>();
				
				Map map = an.getAnnotation();
				ArrayList points = (ArrayList) map.get("points");
				Double p1X = Double.parseDouble(points.get(0).toString());
				Double p1Y = Double.parseDouble(points.get(1).toString());
				Double p2X = Double.parseDouble(points.get(2).toString());
				Double p2Y = Double.parseDouble(points.get(3).toString());
				
				
				Jedis jedis = messagingService.createRedisClient();
				
				HashMap<String,String> mapAnn = new HashMap<String, String>();
				
				mapAnn.put("shape", shapeType);
				
				data.add(p1X/100);
				data.add(p1Y/100);
				data.add(p2X/100);
				data.add(p2Y/100);
				data.add( (Integer.parseInt(map.get("color").toString()) == 0) ? "#000000" : map.get("color")  );
				data.add(map.get("thickness"));
				
				Gson gson = new Gson();
				mapAnn.put("data", gson.toJson(data));
				
				jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
				jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
				
				messagingService.dropRedisClient(jedis);
			}
		}
		
		else if(an.getType().equalsIgnoreCase(WhiteboardBridge.TEXT_TYPE)){
			if(an.getStatus().equalsIgnoreCase("textPublished")){
				String shapeType = "text";
				String shapeID = Long.toString(System.currentTimeMillis());
				ArrayList<Object> data = new ArrayList<Object>();
				
				Map map = an.getAnnotation();
				Double pX = Double.parseDouble(map.get("x").toString());
				Double pY = Double.parseDouble(map.get("y").toString());
				Double tbWidth = Double.parseDouble(map.get("textBoxWidth").toString());
				Double tbHeight = Double.parseDouble(map.get("textBoxHeight").toString());
				
				
				Jedis jedis = messagingService.createRedisClient();
				
				HashMap<String,String> mapAnn = new HashMap<String, String>();
				
				mapAnn.put("shape", shapeType);
				
				data.add(pX/100);
				data.add(pY/100);
				data.add(tbWidth);
				data.add(tbHeight);
				data.add( (Integer.parseInt(map.get("fontColor").toString()) == 0) ? "#000000" : map.get("color")  );
				data.add(map.get("fontSize"));
				data.add(map.get("calcedFontSize"));
				data.add(map.get("text"));
				
				Gson gson = new Gson();
				mapAnn.put("data", gson.toJson(data));
				
				jedis.rpush("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-currentshapes", shapeID);
				jedis.hmset("meeting-" + meetingID + "-presentation-" + map.get("presentationID") + "-page-"+map.get("pageNumber")+"-shape-"+shapeID, mapAnn);
				
				messagingService.dropRedisClient(jedis);
			}
		}
		
		else{
			log.debug("checking annotation: " + an.getAnnotation().toString());
		}
	}
	
	public void setMessagingService(MessagingService ms){
		this.messagingService = ms;
	}

}

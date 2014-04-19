package org.bigbluebutton.conference.service.presentation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import com.google.gson.Gson;

import redis.clients.jedis.Jedis;

public class PresentationBridge {
	private MessagingService messagingService;
	private static Logger log = Red5LoggerFactory.getLogger(PresentationBridge.class, "bigbluebutton");
	
	
	public void sendUpdateMessage(Map message) {
		/*//temporary solution for integrate with the html5 client
		Jedis jedis = messagingService.createRedisClient();
		jedis.sadd("meeting-"+meetingID+"-users", Long.toString(internalUserID));
		//"username", username,        "meetingID", meetingID, "refreshing", false, "dupSess", false, "sockets", 0, 'pubID', publicID
		HashMap<String,String> temp_user = new HashMap<String, String>();
		temp_user.put("username", username);
		temp_user.put("meetingID", meetingID);
		temp_user.put("refreshing", "false");
		temp_user.put("dupSess", "false");
		temp_user.put("sockets", "0");
		temp_user.put("pubID", Long.toString(internalUserID));
		
		jedis.hmset("meeting-"+meetingID+"-user-"+internalUserID, temp_user);
		
		HashMap<String,String> status = new HashMap<String, String>();
		status.put("raiseHand", "false");
		status.put("presenter", "false");
		status.put("hasStream", "false");
		
		jedis.hmset("meeting-"+meetingID+"-user-"+internalUserID +"-status", status);
		
		messagingService.dropRedisClient(jedis);*/
	}
	
	public void setMessagingService(MessagingService ms){
		this.messagingService = ms;
	}

	public void sendCursorUpdate(String meetingID, Double xPercent, Double yPercent) {
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("mvCur");
		updates.add(xPercent);
		updates.add(yPercent);
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public void changeSlide(String meetingID, String presentationName, int slideNum){
		Gson gson = new Gson();
		
		//TODO: Find a better way to share the presentation... Should we send a url or just the slide number?
		//TODO: SlideNum start from 0 while in the conversion process and store in disk is from 1?
		slideNum = slideNum + 1;
		String url = "bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationName + "/png/" + "slide" + slideNum + ".png";
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("changeslide");
		updates.add(url);
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
		

		/*ArrayList<Object> clr = new ArrayList<Object>();
		clr.add(meetingID);
		clr.add("clrPaper");
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(clr));*/
		
		Jedis jedis = messagingService.createRedisClient();
		
		List<String> shapeids = jedis.lrange("meeting-" + meetingID + "-presentation-" + presentationName + "-page-"+slideNum+"-currentshapes",0,-1);
		ArrayList shapes = new ArrayList();
		for(int i=0;i<shapeids.size();i++){
			String shapeid = shapeids.get(i);
			Map<String,String> mapAnn = jedis.hgetAll("meeting-" + meetingID + "-presentation-" + presentationName + "-page-"+ slideNum +"-shape-"+shapeid);
			shapes.add(mapAnn);
		}
		messagingService.dropRedisClient(jedis);
		
		ArrayList<Object> all_shapes = new ArrayList<Object>();
		all_shapes.add(meetingID);
		all_shapes.add("all_shapes");
		all_shapes.add(shapes);
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(all_shapes));
		
		
		/*
		
		pub.publish(receivers, JSON.stringify(['all_shapes', shapes]));
		 * */
	}

	public void resizeAndMoveSlide(String meetingID, Double xOffset,Double yOffset,Double widthRatio,Double heightRatio) {
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("move_and_zoom");
		updates.add(xOffset);
		updates.add(yOffset);
		updates.add(widthRatio);
		updates.add(heightRatio);
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
}

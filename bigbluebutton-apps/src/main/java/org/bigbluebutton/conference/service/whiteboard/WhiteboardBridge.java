package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.Map;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

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
			ArrayList<Object> updates = new ArrayList<Object>();
			
			updates.add(meetingID);
			updates.add("makeShape");
			updates.add("line");
			//log.debug("checking ecpencil:"+an.getAnnotation());
			//cx2, cy2, current_colour, current_thickness
			/*ArrayList<Object> data = new ArrayList<Object>();
			data.add(e)
			updates.add(yPercent);
			Gson gson = new Gson();
			messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));*/
		}
		
		
	}
	
	public void setMessagingService(MessagingService ms){
		this.messagingService = ms;
	}

}

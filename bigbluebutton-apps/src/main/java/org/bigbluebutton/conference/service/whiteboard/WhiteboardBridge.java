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
			Map map = an.getAnnotation();
			ArrayList points = (ArrayList) map.get("points");
			for(int i=0;i<points.size();i++){
				Double pA = (Double) points.get(i*2);
				Double pB = (Double) points.get(i*2+1);
				
				ArrayList<Object> updates = new ArrayList<Object>();
				updates.add(meetingID);
				
				//log.debug("checking ecpencil:"+an.getAnnotation());
				ArrayList<Object> data = new ArrayList<Object>();
				//TODO: temporary solution for correct the display of the points
				pB = pB+2;
				data.add(pA/100);
				data.add(pB/100);
				if(i == 0 ){
					updates.add("makeShape");
					data.add(map.get("color"));
					data.add(map.get("thickness"));	
				}else{
					updates.add("updShape");
					data.add(true);
				}
				updates.add("line");
				
				updates.add(data);
				Gson gson = new Gson();
				messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
			}
			
		}
		
		
	}
	
	public void setMessagingService(MessagingService ms){
		this.messagingService = ms;
	}

}

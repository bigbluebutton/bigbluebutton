package org.bigbluebutton.conference.service.recorder.whiteboard;

import java.util.HashMap;
import java.util.Hashtable;

import org.bigbluebutton.conference.BigBlueButtonUtils;
import org.bigbluebutton.conference.service.recorder.IEventRecorder;
import org.bigbluebutton.conference.service.recorder.IRecordDispatcher;
import org.bigbluebutton.conference.service.recorder.chat.ChatEventRecorder;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.whiteboard.IWhiteboardRoomListener;
import org.bigbluebutton.conference.service.whiteboard.Presentation;
import org.bigbluebutton.conference.service.whiteboard.Shape;

public class WhiteboardEventRecorder implements IEventRecorder, IWhiteboardRoomListener{

	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardEventRecorder.class, "bigbluebutton" );

	IRecordDispatcher recorder;

	String name = "RECORDER:WHITEBOARD";

	public WhiteboardEventRecorder(){
	}

	@Override
	public void acceptRecorder(IRecordDispatcher recorder) {
		this.recorder = recorder;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void recordEvent(HashMap<String,String> message) {
		recorder.record(message);
	}

	@Override
	public void addShape(Shape shape, Presentation presentation) {
		HashMap<String,String> map=new HashMap<String, String>();
		
		map.put("module", "whiteboard");
		map.put("event", "addShape");
		map.put("presetation", presentation.getName());
		map.put("pageNum", Integer.toString(presentation.getActivePage().getPageIndex()));
		map.put("dataPoints", shape.getShape());
		map.put("type", shape.getType());
		map.put("color", Integer.toString(shape.getColor()));
		map.put("thickness", Integer.toString(shape.getThickness()));

		recordEvent(map);	
	}

	@Override
	public void clearPage(Presentation presentation) {
		HashMap<String,String> map=new HashMap<String, String>();
		
		map.put("module", "whiteboard");
		map.put("event", "clearPage");
		map.put("presetation", presentation.getName());
		map.put("pageNum", Integer.toString(presentation.getActivePage().getPageIndex()));
		
		recordEvent(map);		
	}

	@Override
	public void undoShape(Presentation presentation) {
		HashMap<String,String> map=new HashMap<String, String>();
		
		map.put("module", "whiteboard");
		map.put("event", "undoShape");
		map.put("presetation", presentation.getName());
		map.put("pageNum", Integer.toString(presentation.getActivePage().getPageIndex()));
		
		recordEvent(map);
	}

}

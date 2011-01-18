package org.bigbluebutton.conference.service.recorder.whiteboard;

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
	public void recordEvent(String message) {
		recorder.record(message);
	}

	@Override
	public void addShape(Shape shape, Presentation presentation) {
		Hashtable keyvalues=new Hashtable();
		keyvalues.put("event", "addShape");
		keyvalues.put("presentation", presentation.getName());
		keyvalues.put("pageNum", presentation.getActivePage().getPageIndex());
		keyvalues.put("dataPoints", shape.getShape());
		keyvalues.put("type", shape.getType());
		keyvalues.put("color", shape.getColor());
		keyvalues.put("thickness", shape.getThickness());

		String xmlstr=BigBlueButtonUtils.parseEventsToXML("whiteboard", keyvalues);
		recordEvent(xmlstr);	
		
	}

	@Override
	public void clearPage(Presentation presentation) {
		Hashtable keyvalues=new Hashtable();
		keyvalues.put("event", "clearPage");
		keyvalues.put("presentation", presentation.getName());
		keyvalues.put("pageNum", presentation.getActivePage().getPageIndex());

		String xmlstr=BigBlueButtonUtils.parseEventsToXML("whiteboard", keyvalues);
		recordEvent(xmlstr);		
	}

	@Override
	public void undoShape(Presentation presentation) {
		Hashtable keyvalues=new Hashtable();
		keyvalues.put("event", "undoShape");
		keyvalues.put("presentation", presentation.getName());
		keyvalues.put("pageNum", presentation.getActivePage().getPageIndex());

		String xmlstr=BigBlueButtonUtils.parseEventsToXML("whiteboard", keyvalues);
		recordEvent(xmlstr);
	}

}

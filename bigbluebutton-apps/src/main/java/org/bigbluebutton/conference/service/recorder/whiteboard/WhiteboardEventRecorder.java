package org.bigbluebutton.conference.service.recorder.whiteboard;

import java.util.HashMap;
import org.bigbluebutton.conference.service.recorder.Recorder;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.bigbluebutton.conference.service.whiteboard.IWhiteboardRoomListener;
import org.bigbluebutton.conference.service.whiteboard.Presentation;
import org.bigbluebutton.conference.service.whiteboard.Shape;

public class WhiteboardEventRecorder implements IWhiteboardRoomListener{
	private static Logger log = Red5LoggerFactory.getLogger( WhiteboardEventRecorder.class, "bigbluebutton" );
	private final RecorderApplication recorder;;
	private final String session;
	String name = "RECORDER:WHITEBOARD";

	public WhiteboardEventRecorder(String session, RecorderApplication recorder){
		this.recorder = recorder;
		this.session = session;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void addShape(Shape shape, Presentation presentation) {
		AddShapeWhiteboardRecordEvent event = new AddShapeWhiteboardRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentation(presentation.getName());
		event.setPageNumber(presentation.getActivePage().getPageIndex());
		event.setDataPoints(shape.getShape());
		event.setType(shape.getType());
		event.setColor(shape.getColor());
		event.setThickness(shape.getThickness());
		
		recorder.record(session, event);	
	}

	@Override
	public void clearPage(Presentation presentation) {
		ClearPageWhiteboardRecordEvent event = new ClearPageWhiteboardRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(presentation.getName());
		event.setPageNumber(presentation.getActivePage().getPageIndex());
		
		recorder.record(session, event);		
	}

	@Override
	public void undoShape(Presentation presentation) {
		UndoShapeWhiteboardRecordEvent event = new UndoShapeWhiteboardRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(presentation.getName());
		event.setPageNumber(presentation.getActivePage().getPageIndex());
		
		recorder.record(session, event);			
	}

}

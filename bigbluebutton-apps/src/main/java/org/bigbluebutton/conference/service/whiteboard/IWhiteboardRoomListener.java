package org.bigbluebutton.conference.service.whiteboard;

import java.util.Map;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addAnnotation(Map<String, Object> annotation, Presentation presentation);
	public void undoShape(Presentation presentation);
	public void clearPage(Presentation presentation);
}

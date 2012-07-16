package org.bigbluebutton.conference.service.whiteboard;

import java.util.Map;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addAnnotation(Map<String, Object> annotation, Presentation presentation);
	public void undoShape(Presentation presentation);
	public void addShape(ShapeGraphic shape, Presentation presentation);
	public void addText(TextGraphic shape, Presentation presentation);
	public void modifyText(TextGraphic shape, Presentation presentation);
	public void undoWBGraphic(Presentation presentation);
	public void toggleGrid(boolean value, Presentation presentation);
	public void clearPage(Presentation presentation);
}

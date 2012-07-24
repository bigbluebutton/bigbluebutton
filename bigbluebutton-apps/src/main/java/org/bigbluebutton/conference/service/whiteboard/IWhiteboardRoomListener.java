package org.bigbluebutton.conference.service.whiteboard;

import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addAnnotation(Annotation annotation, Presentation presentation);
	public void undoShape(Presentation presentation);
//	public void addShape(Annotation shape, Presentation presentation);
	public void addText(Annotation shape, Presentation presentation);
	public void modifyText(Annotation shape, Presentation presentation);
	public void undoWBGraphic(Presentation presentation);
	public void toggleGrid(boolean value, Presentation presentation);
	public void clearPage(Presentation presentation);
}

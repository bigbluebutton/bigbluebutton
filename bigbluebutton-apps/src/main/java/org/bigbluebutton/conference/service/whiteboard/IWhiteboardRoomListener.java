package org.bigbluebutton.conference.service.whiteboard;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addShape(Shape shape, Presentation presentation);
	public void undoShape(Presentation presentation);
	public void clearPage(Presentation presentation);
}

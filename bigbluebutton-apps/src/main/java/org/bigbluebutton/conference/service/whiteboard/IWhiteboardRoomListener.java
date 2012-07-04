package org.bigbluebutton.conference.service.whiteboard;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addShape(ShapeGraphic shape, Presentation presentation);
	public void addText(TextGraphic shape, Presentation presentation);
	public void undoWBGraphic(Presentation presentation);
	public void clearPage(Presentation presentation);
}

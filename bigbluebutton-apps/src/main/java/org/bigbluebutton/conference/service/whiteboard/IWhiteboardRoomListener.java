package org.bigbluebutton.conference.service.whiteboard;

public interface IWhiteboardRoomListener {
	public String getName();

	public void addShape(ShapeGraphic shape, Presentation presentation);
	public void addText(TextGraphic shape, Presentation presentation);
	public void modifyText(TextGraphic shape, Presentation presentation);
	public void undoWBGraphic(Presentation presentation);
	public void toggleGrid(boolean value, Presentation presentation);
	public void clearPage(Presentation presentation);
}

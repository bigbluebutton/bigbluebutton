/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
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

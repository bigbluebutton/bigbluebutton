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


import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.whiteboard.redis.*;
import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;

public class WhiteboardRecordingService {
	private RecorderApplication recorder;;
	
	public void setRecorderApplication(RecorderApplication recorder) {
		this.recorder = recorder;
	}

	public void addAnnotation(String meetingID, Annotation annotation, String presentationID, int page) {
		AddShapeWhiteboardRecordEvent event = new AddShapeWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		event.addAnnotation(annotation.getAnnotation());
		recorder.record(meetingID, event);	
	}
	
	public void addText(String meetingID, Annotation text, String presentationID, int page) {
		AddTextWhiteboardRecordEvent event = new AddTextWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		event.addAnnotation(text.getAnnotation());
		recorder.record(meetingID, event);	
	}
	
	public void clearPage(String meetingID, String presentationID, int page) {
		ClearPageWhiteboardRecordEvent event = new ClearPageWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		
		recorder.record(meetingID, event);		
	}

	public void undoWBGraphic(String meetingID, String presentationID, int page) {
		UndoShapeWhiteboardRecordEvent event = new UndoShapeWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		
		recorder.record(meetingID, event);			
	}

	public void toggleGrid(String meetingID, boolean enabled, String presentationID, int page) {
		ToggleGridWhiteboardRecordEvent event = new ToggleGridWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		event.setGridEnabled(enabled);
		
		recorder.record(meetingID, event);	
		
	}

	public void modifyText(String meetingID, Annotation text, String presentationID, int page) {
		ModifyTextWhiteboardRecordEvent event = new ModifyTextWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		event.addAnnotation(text.getAnnotation());
		recorder.record(meetingID, event);	
	}

	public void undoShape(String meetingID, String presentationID, int page) {
		UndoShapeWhiteboardRecordEvent event = new UndoShapeWhiteboardRecordEvent();
		event.setMeetingId(meetingID);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentation(presentationID);
		event.setPageNumber(page);
		recorder.record(meetingID, event);
	}
}

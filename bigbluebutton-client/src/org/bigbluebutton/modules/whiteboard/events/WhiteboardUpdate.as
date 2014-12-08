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
package org.bigbluebutton.modules.whiteboard.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.whiteboard.models.Annotation;
	
	public class WhiteboardUpdate extends Event
	{
		public static const BOARD_UPDATED:String = "boardUpdated";
		public static const BOARD_CLEARED:String = "boardClear";
		public static const BOARD_ENABLED:String = "boardEnabled";
		public static const GRAPHIC_UNDONE:String = "graphicUndone";
        
        
    // Event to notify display of presenter's request.
    public static const UNDO_ANNOTATION:String = "WhiteboardUndoAnnotationEvent";
    public static const CLEAR_ANNOTATIONS:String = "WhiteboardClearAnnotationEvent";
		public static const RECEIVED_ANNOTATION_HISTORY:String = "WhiteboardReceivedAnnotationHistoryEvent";
    public static const CHANGE_PAGE:String = "WhiteboardChangePageEvent";
        
		public var annotation:Annotation;
		public var boardEnabled:Boolean;
		public var annotationID:String;
		
		public function WhiteboardUpdate(type:String)
		{
			super(type, true, false);
		}

	}
}
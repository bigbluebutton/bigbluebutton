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
package org.bigbluebutton.modules.whiteboard.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.modules.whiteboard.events.RequestNewCanvasEvent;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;
	
	public class WhiteboardManager
	{
	private static const LOGGER:ILogger = getClassLogger(WhiteboardManager);      
    
		public function handleStartModuleEvent():void {
            
			var dispatcher:Dispatcher = new Dispatcher();		}
		
		public function handleRequestNewCanvas(e:RequestNewCanvasEvent):void {
			var whiteboardCanvas:WhiteboardCanvas = new WhiteboardCanvas(LiveMeeting.inst().whiteboardModel);
			whiteboardCanvas.attachToReceivingObject(e.receivingObject);
		}

    public function removeAnnotationsHistory():void {
      // it will dispatch the cleanAnnotations in the displayModel later
      LiveMeeting.inst().whiteboardModel.clearAll();
    }
	}
}

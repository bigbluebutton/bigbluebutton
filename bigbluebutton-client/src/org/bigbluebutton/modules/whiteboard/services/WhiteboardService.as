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
package org.bigbluebutton.modules.whiteboard.services
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.modules.whiteboard.commands.GetWhiteboardShapesCommand;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardAccessEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardCursorEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;

  public class WhiteboardService
  {
	private static const LOGGER:ILogger = getClassLogger(WhiteboardService);      
    
    public var sender:MessageSender;
    public var receiver:MessageReceiver;

    public function getAnnotationHistory(cmd:GetWhiteboardShapesCommand):void
    {
      sender.requestAnnotationHistory(cmd.whiteboardId);
    }
    
    public function modifyAccess(e:WhiteboardAccessEvent):void {
      sender.modifyAccess(e);
    }

    public function undoGraphic(e:WhiteboardDrawEvent):void {
      if (e.wbId != null) {
        sender.undoGraphic(e.wbId)
      }      
    }

    public function clearBoard(e:WhiteboardDrawEvent):void {
      if (e.wbId != null) {
        sender.clearBoard(e.wbId);
      }
    }

    public function sendShape(e:WhiteboardDrawEvent):void {
      sender.sendShape(e);
    }

    public function sendCursorPosition(e:WhiteboardCursorEvent):void {
      sender.sendCursorPosition(e.whiteboardId, e.xPercent, e.yPercent);
    }
    
    public function handlePerformRttTraceEvent():void {
      sender.sendClientToServerLatencyTracerMsg();
    }
  }
}
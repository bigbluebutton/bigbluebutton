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
package org.bigbluebutton.modules.layout.services
{
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.modules.layout.events.LockLayoutEvent;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	
  public class LayoutService
  {
    private static const LOG:String = "Layout::LayoutService - ";
    
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    		
    public function getCurrentLayout():void {
      sender.getCurrentLayout();
    }
		
    public function broadcastLayout(layout:LayoutDefinition):void {
      trace(LOG + " - broadcast layout");
      sender.broadcastLayout(layout);
    }
		
    private function handleLockLayoutEvent(e: LockLayoutEvent):void {
      
    }
    
    private function lockLayout(lock:Boolean, viewersOnly:Boolean, layout:LayoutDefinition=null):void {
      trace(LOG + " - lock layout");
      sender.lockLayout(lock, viewersOnly, layout);
    }
  }
}

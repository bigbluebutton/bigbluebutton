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
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	
  public class LayoutService
  {
	private static const LOGGER:ILogger = getClassLogger(LayoutService);      
    
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    		
    public function getCurrentLayout():void {
      sender.getCurrentLayout();
    }
		
    public function broadcastLayout(layout:LayoutDefinition):void {
      LOGGER.debug("broadcast layout");
      sender.broadcastLayout(layout);
    }
  }
}

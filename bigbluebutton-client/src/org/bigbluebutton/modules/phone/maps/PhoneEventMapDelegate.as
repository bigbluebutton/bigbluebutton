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


package org.bigbluebutton.modules.phone.maps
{
	import com.asfusion.mate.events.Dispatcher;	
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.modules.phone.PhoneOptions;
	import org.bigbluebutton.modules.phone.views.components.ToolbarButton;
	
	public class PhoneEventMapDelegate {
		private var phoneOptions:PhoneOptions;
		private var phoneButton:ToolbarButton;
		private var buttonOpen:Boolean = false;
		private var globalDispatcher:Dispatcher;
				
		public function PhoneEventMapDelegate() {
			phoneButton = new ToolbarButton();
			globalDispatcher = new Dispatcher();
			phoneOptions = new PhoneOptions();
		}

		public function addToolbarButton():void {
		   	phoneButton.toggle = true;
		   	
		   	if (phoneOptions.showButton) {
			   	// Use the GLobal Dispatcher so that this message will be heard by the
			   	// main application.		   	
				  var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
				  event.button = phoneButton;
				  globalDispatcher.dispatchEvent(event);		   	
			   	buttonOpen = true;		   		
		   	}
		}
		
		public function removeToolbarButton():void {
			if (buttonOpen) {
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.REMOVE);
				event.button = phoneButton;
				globalDispatcher.dispatchEvent(event);			   	
			  buttonOpen = false;				
			}
		}
		
		public function disableToolbarButton(listenOnlyCall:Boolean):void {
			if (!listenOnlyCall) {
				phoneButton.selected = true;
				phoneButton.enabled = true;
			}
		}
		
		public function enableToolbarButton():void {
			phoneButton.selected = false;
			phoneButton.enabled = true;
		}
	}
}
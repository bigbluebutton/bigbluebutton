/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.voiceconference.view
{
	import flexlib.mdi.containers.MDIWindow;
	
	import mx.controls.TileList;
	
	import org.bigbluebutton.modules.voiceconference.VoiceFacade;
	import org.bigbluebutton.modules.voiceconference.model.VoiceConferenceRoom;

	/**
	 * This is a convinience class extended by the Listeners Window. It holds some variables
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class ListenersClass extends MDIWindow
	{
		private var model:VoiceFacade = VoiceFacade.getInstance();
		
		[Bindable]
		public var meetMeRoom:VoiceConferenceRoom = model.meetMeRoom;;
		
		[Bindable] 
		public var participantsList:TileList; 
		
		[Bindable]
		public var userRole : uint;

	}  	
}
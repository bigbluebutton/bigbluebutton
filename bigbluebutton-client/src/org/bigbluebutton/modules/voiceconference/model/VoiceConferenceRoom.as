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
package org.bigbluebutton.modules.voiceconference.model
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.voiceconference.VoiceConferenceFacade;
	import org.bigbluebutton.modules.voiceconference.model.business.NetConnectionDelegate;
 	
	/**
	 * This class represents a room in the Asterisk server. The information about the participants is held
	 * in the public variable dpParticipants:ArrayCollection
	 * @author dev_team@bigbluebutton.org
	 * 
	 */ 	
	public class VoiceConferenceRoom
	{
					
		[Bindable]
		public var isConnected : Boolean;
		
		[Bindable]
		public var dpParticipants : ArrayCollection;
		
		private var room : String;
		private var uri : String;
		
		[Bindable]
		public var userRole : String;
		
		public function VoiceConferenceRoom(uri:String):void{
			this.uri = uri;
		}
		
		/**
		 *  
		 * @param uri - the uri of this room
		 * 
		 */		
		public function setUri(uri : String) : void
		{
			this.uri = uri;
		}
		
		/**
		 * 
		 * @return - the uri of this room
		 * 
		 */		
		public function getUri() : String
		{
			return uri;
		}
	}
}
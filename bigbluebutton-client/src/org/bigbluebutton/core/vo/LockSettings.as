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
package org.bigbluebutton.core.vo
{
	public class LockSettings
	{
		private var allowModeratorLocking:Boolean;
		private var disableCam:Boolean;
		private var disableMic:Boolean;
		private var disablePrivateChat:Boolean;
		private var disablePublicChat:Boolean;

		public function LockSettings(pAllowModeratorLocking:Boolean, pDisableCam:Boolean, pDisableMic:Boolean, pDisablePrivateChat:Boolean, pDisablePublicChat:Boolean)
		{
			this.allowModeratorLocking = pAllowModeratorLocking;
			this.disableCam = pDisableCam;
			this.disableMic = pDisableMic;
			this.disablePrivateChat = pDisablePrivateChat;
			this.disablePublicChat = pDisablePublicChat;
		}
		
		public function toMap():Object {
			var map:Object = {
				allowModeratorLocking: this.allowModeratorLocking,
				disableCam: this.disableCam,
				disableMic: this.disableMic,
				disablePrivateChat: this.disablePrivateChat,
				disablePublicChat: this.disablePublicChat
			};
			
			return map;
		}
		
		public function getAllowModeratorLocking():Boolean {
			return allowModeratorLocking;
		}
		
		public function getDisableCam():Boolean {
			return disableCam;
		}
		
		public function getDisableMic():Boolean {
			return disableMic;
		}
		
		public function getDisablePrivateChat():Boolean {
			return disablePrivateChat;
		}
		
		public function getDisablePublicChat():Boolean {
			return disablePublicChat;
		}
	}
}
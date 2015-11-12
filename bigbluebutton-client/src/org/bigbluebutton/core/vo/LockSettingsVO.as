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
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.model.users.BBBUser;

	public class LockSettingsVO
	{
		private var lockOnJoinConfigurable:Boolean;
		private var disableCam:Boolean;
		private var disableMic:Boolean;
		private var disablePrivateChat:Boolean;
		private var disablePublicChat:Boolean;
		private var lockedLayout:Boolean;
		private var lockOnJoin:Boolean;

		public function LockSettingsVO(pDisableCam:Boolean, 
									   pDisableMic:Boolean, 
									   pDisablePrivateChat:Boolean, 
									   pDisablePublicChat:Boolean, 
									   pLockLayout: Boolean, 
									   pLockOnJoin:Boolean, 
									   pLockOnJoinConfigurable:Boolean)
		{
			this.disableCam = pDisableCam;
			this.disableMic = pDisableMic;
			this.disablePrivateChat = pDisablePrivateChat;
			this.disablePublicChat = pDisablePublicChat;
			this.lockedLayout = pLockLayout;
			this.lockOnJoin = pLockOnJoin;
			this.lockOnJoinConfigurable = pLockOnJoinConfigurable;
		}
		
		public function toMap():Object {
			var map:Object = {
				disableCam: this.disableCam,
				disableMic: this.disableMic,
				disablePrivateChat: this.disablePrivateChat,
				disablePublicChat: this.disablePublicChat,
				lockedLayout: this.lockedLayout,
				lockOnJoin: this.lockOnJoin,
				lockOnJoinConfigurable:  this.lockOnJoinConfigurable
			};
			
			return map;
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
		
		public function getLockedLayout():Boolean {
			return lockedLayout;
		}
		
		public function getLockOnJoin():Boolean {
			return lockOnJoin;
		}
		
		public function getLockOnJoinConfigurable():Boolean {
			return lockOnJoinConfigurable;
		}
		
		public function isAnythingLocked():Boolean {
			return ( lockedLayout || disableCam || disableMic || disablePrivateChat || disablePublicChat );
		}
	}
}
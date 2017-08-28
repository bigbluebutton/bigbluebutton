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
package org.bigbluebutton.modules.phone.models {
	/**
	 * Keeps track of whether WebRTC audio has been flagged as unusable
	 * 
	 */	
	public class WebRTCAudioStatus {
		private static var instance:WebRTCAudioStatus = null;
		private var didWebRTCAudioFail:Boolean = false;
		
		/**
		 * This class is a singleton. Please initialize it using the getInstance() method.
		 * 
		 */		
		public function WebRTCAudioStatus(enforcer:SingletonEnforcer) {
			if (enforcer == null) {
				throw new Error("There can only be 1 WebRTCAudioStatus instance");
			}
			initialize();
		}
		
		/*
		 * Initializes members. Keeping structure in place incase we add more complex data
		 */
		private function initialize():void {
			didWebRTCAudioFail = false;
		}
		
		/**
		 * Return the single instance of the WebRTCAudioStatus class
		 */
		public static function getInstance():WebRTCAudioStatus {
			if (instance == null){
				instance = new WebRTCAudioStatus(new SingletonEnforcer());
			}
			return instance;
		}
							
		public function setAudioFailState(newAudioState:Boolean):void {
			this.didWebRTCAudioFail = newAudioState;
		}

		public function getDidWebRTCAudioFail():Boolean {
			return this.didWebRTCAudioFail;
		}
	}
}

class SingletonEnforcer{}

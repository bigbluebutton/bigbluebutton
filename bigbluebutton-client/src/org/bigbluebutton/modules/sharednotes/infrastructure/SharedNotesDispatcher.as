/*
	This file is part of BBB-Notes.
	
	Copyright (c) Islam El-Ashi. All rights reserved.
	
	BBB-Notes is free software: you can redistribute it and/or modify
	it under the terms of the Lesser GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or 
	any later version.
	
	BBB-Notes is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	Lesser GNU General Public License for more details.
	
	You should have received a copy of the Lesser GNU General Public License
	along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.
	
	Author: Felipe Cecagno <fcecagno@gmail.com>, <http://code.google.com/p/mconf>
*/
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	import org.bigbluebutton.common.LogUtil;

	public class SharedNotesDispatcher extends EventDispatcher
	{
		public static const INIT_EVENT : String = "SN_INIT_EVENT";
		public static const UPDATE_EVENT : String = "SN_UPDATE_EVENT";
		public static const SEND_PATCH_EVENT : String = "SN_SEND_PATCH_EVENT";
		public static const HANDLE_PATCH_EVENT : String = "SN_HANDLE_PATCH_EVENT";
		public static const PATCHED_EVENT : String = "SN_PATCHED_EVENT";
		
		public static const STATE_NONE:String = "STATE_NONE";
		public static const STATE_INIT:String = "STATE_INIT";
		public static const STATE_WAITING_PATCH_APPROVAL:String = "STATE_WAITING_PATCH_APPROVAL";
		public static const STATE_UPDATING_REMOTE_USERS:String = "STATE_UPDATING_REMOTE_USERS";
		public static const STATE_WAITING_REMOTE_PATCH:String = "STATE_WAITING_REMOTE_PATCH";

		private static var _nextState:Dictionary = null;
		private var _delayedEvents:Array = new Array;
		private var _currentState:String = STATE_NONE;
		
		private static function initDictionary():void {
			_nextState = new Dictionary;
			_nextState[STATE_NONE + INIT_EVENT] = STATE_INIT;
			_nextState[STATE_INIT + SEND_PATCH_EVENT] = STATE_WAITING_PATCH_APPROVAL;
			_nextState[STATE_INIT + UPDATE_EVENT] = STATE_WAITING_REMOTE_PATCH;
			_nextState[STATE_UPDATING_REMOTE_USERS + UPDATE_EVENT] = STATE_INIT;
			_nextState[STATE_WAITING_PATCH_APPROVAL + HANDLE_PATCH_EVENT] = STATE_UPDATING_REMOTE_USERS;
			_nextState[STATE_WAITING_REMOTE_PATCH + HANDLE_PATCH_EVENT] = STATE_INIT;
		}
		
		public static function nextState(currentState:String, event:Event):String {
			if (_nextState == null)
				initDictionary();
			const key:String = currentState + event.type;
			if (_nextState.hasOwnProperty(key))
				return _nextState[key];
			else
				return null;
		}
		
		private function isFeasible(event:Event):Boolean {
			return (nextState(_currentState, event) != null);
		}
		
		public function dispatchDelayedEvent(event:Event):Boolean {
			LogUtil.debug("Dispatching " + event.type);
			
			if (isFeasible(event)) {
				LogUtil.debug("It's feasible, so it will be the first on the delayed events");
				_delayedEvents.unshift(event);
			} else {
				LogUtil.debug("It's not feasible (current state " + _currentState + " ), so it will be the last on the delayed events");
				_delayedEvents.push(event);
			}
			
			LogUtil.debug("Current delayed events:");
			for (var i:int = 0; i < _delayedEvents.length; ++i) {
				LogUtil.debug("-- " + _delayedEvents[i].type);
			}
			
			LogUtil.debug("Beginning of the delayed events dispatch");
			while (_delayedEvents.length > 0 && isFeasible(_delayedEvents[0])) {
				event = _delayedEvents.shift();
				LogUtil.debug("Dispatching " + event.type + ", current state " + _currentState);
				_currentState = nextState(_currentState, event);
				dispatchEvent(event);
				LogUtil.debug("Dispatched " + event.type + ", current state " + _currentState);
			}
			LogUtil.debug("Ending of the delayed events dispatch");
			return true;
		}
	}
}
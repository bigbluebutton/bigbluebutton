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
package org.bigbluebutton.main.model
{
	
	import flash.events.EventDispatcher;
	
	public class NetworkStatsData extends EventDispatcher
	{
		private static var _instance:NetworkStatsData = null;
		private var _currentConsumedDownBW:Number = 0; // Kb
		private var _currentConsumedUpBW:Number = 0; // Kb
		private var _totalConsumedDownBW:Number = 0; // MB
		private var _totalConsumedUpBW:Number = 0; // MB
		private var _measuredDownBW:int = 0; // Mb
		private var _measuredDownLatency:int = 0; // ms
		private var _measuredUpBW:int = 0; // Mb
		private var _measuredUpLatency:int = 0; // ms
		
		/**
		 * This class is a singleton. Please initialize it using the getInstance() method.
		 */		
		public function NetworkStatsData(enforcer:SingletonEnforcer) {
			if (enforcer == null) {
				throw new Error("There can only be one instance of this class");
			}
			initialize();
		}
		
		private function initialize():void {
		}
		
		/**
		 * Return the single instance of this class
		 */
		public static function getInstance():NetworkStatsData {
			if (_instance == null){
				_instance = new NetworkStatsData(new SingletonEnforcer());
			}
			return _instance;
		}
		
		// all the numbers are in bytes
		public function updateConsumedBW(down:Number, up:Number, downTotal:Number, upTotal:Number):void {
			_currentConsumedDownBW = (down * 8)/1024;
			_currentConsumedUpBW = (up * 8)/1024;
			_totalConsumedDownBW = downTotal / 1048576;
			_totalConsumedUpBW = upTotal / 1048576;
		}
		
		/*
			12/8/2012 17:24:38.293 [DEBUG] (Array)#0
			  [deltaDown] 2455.704
			  [deltaTime] 170
			  [kbitDown] 14445
			  [latency] 10
		*/
		public function setDownloadMeasuredBW(info:Object):void {
			_measuredDownBW = info["kbitDown"] / 1000;
			_measuredDownLatency = info["latency"];
  		}
		
		/*
			12/8/2012 17:24:39.556 [DEBUG] (Object)#0
			  deltaTime = 1
			  deltaUp = 10516
			  kbitUp = 10516
			  KBytes = 1283
			  latency = 11
		*/
		public function setUploadMeasuredBW(info:Object):void {
			_measuredUpBW = info.kbitUp / 1000;
			_measuredUpLatency = info.latency;
		}
		
		public function get currentConsumedDownBW():Number {
			return _currentConsumedDownBW;
		}

		public function get currentConsumedUpBW():Number {
			return _currentConsumedUpBW;
		}

		public function get totalConsumedDownBW():Number {
			return _totalConsumedDownBW;
		}

		public function get totalConsumedUpBW():Number {
			return _totalConsumedUpBW;
		}

		public function get measuredDownBW():int {
			return _measuredDownBW;
		}

		public function get measuredDownLatency():int {
			return _measuredDownLatency;
		}

		public function get measuredUpBW():int {
			return _measuredUpBW;
		}

		public function get measuredUpLatency():int {
			return _measuredUpLatency;
		}
	}
}

class SingletonEnforcer{}
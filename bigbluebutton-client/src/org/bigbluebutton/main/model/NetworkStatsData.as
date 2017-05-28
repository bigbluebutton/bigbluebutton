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
	
	import mx.formatters.NumberFormatter;
	
	public class NetworkStatsData extends EventDispatcher
	{
		private static var _instance:NetworkStatsData = null;
		private var _currentConsumedDownBW:Number = 0; // Kb
		private var _currentConsumedUpBW:Number = 0; // Kb
		private var _totalConsumedDownBW:Number = 0; // KB
		private var _totalConsumedUpBW:Number = 0; // KB
		private var _measuredDownBWCheck:Boolean = false;
		private var _measuredDownBW:Number = 0; // Kb
		private var _measuredDownLatency:int = 0; // ms
		private var _measuredUpBWCheck:Boolean = false;
		private var _measuredUpBW:Number = 0; // Kb
		private var _measuredUpLatency:int = 0; // ms
		private var _numberFormatter:NumberFormatter = new NumberFormatter();
		
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
			_numberFormatter.precision = 1;
			_numberFormatter.useThousandsSeparator = true;
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
			_currentConsumedDownBW = (down * 8) / 1024;
			_currentConsumedUpBW = (up * 8) / 1024;
			_totalConsumedDownBW = downTotal / 1024;
			_totalConsumedUpBW = upTotal / 1024;
		}
		
		/*
			12/8/2012 17:24:38.293 [DEBUG] (Array)#0
			  [deltaDown] 2455.704
			  [deltaTime] 170
			  [kbitDown] 14445
			  [latency] 10
		*/
		public function setDownloadMeasuredBW(info:Object):void {
			_measuredDownBWCheck = true;
			_measuredDownBW = info["kbitDown"];
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
			_measuredUpBWCheck = true;
			_measuredUpBW = info.kbitUp;
			_measuredUpLatency = info.latency;
		}
		
		private function format_KB(n:Number):String {
			var unit:String = "KB";
			if (n >= 1073741824) {
				unit = "TB";
				n /= 1073741824;
			} else if (n >= 1048576) {
				unit = "GB";
				n /= 1048576;
			} else if (n >= 1024) {
				unit = "MB";
				n /= 1024;
			}
			return _numberFormatter.format(n) + " " + unit;
		}

		private function format_Kbps(n:Number):String {
			var unit:String = "Kbps";
			if (n >= 1000000000) {
				unit = "Tbps";
				n /= 1000000000;
			} else if (n >= 1000000) {
				unit = "Gbps";
				n /= 1000000;
			} else if (n >= 1000) {
				unit = "Mbps";
				n /= 1000;
			}
			return _numberFormatter.format(n) + " " + unit;
		}

		public function get formattedCurrentConsumedDownBW():String {
			return format_Kbps(_currentConsumedDownBW);
		}

		public function get formattedCurrentConsumedUpBW():String {
			return format_Kbps(_currentConsumedUpBW);
		}

		public function get formattedTotalConsumedDownBW():String {
			return format_KB(_totalConsumedDownBW);
		}

		public function get formattedTotalConsumedUpBW():String {
			return format_KB(_totalConsumedUpBW);
		}

		public function get formattedMeasuredDownBW():String {
			if (_measuredDownBWCheck)
				return format_Kbps(_measuredDownBW);
			else
				return "-";
		}

		public function get formattedMeasuredDownLatency():String {
			if (_measuredDownBWCheck)
				return _measuredDownLatency + " ms";
			else
				return "-";
		}

		public function get formattedMeasuredUpBW():String {
			if (_measuredUpBWCheck)
				return format_Kbps(_measuredUpBW);
			else
				return "-";
		}

		public function get formattedMeasuredUpLatency():String {
			if (_measuredUpBWCheck)
				return _measuredUpLatency + " ms";
			else
				return "-";
		}
	}
}

class SingletonEnforcer{}
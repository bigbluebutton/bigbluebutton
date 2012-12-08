package org.bigbluebutton.main.model
{
	
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.NetworkStatsEvent;
	
	import flash.events.EventDispatcher;
	
	public class NetworkStatsData extends EventDispatcher
	{
		private static var _instance:NetworkStatsData = null;
		private var _currentConsumedDownBW:Number = 0; // Kb
		private var _currentConsumedUpBW:Number = 0; // Kb
		private var _totalConsumedDownBW:Number = 0; // MB
		private var _totalConsumedUpBW:Number = 0; // MB
		
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

	}
}

class SingletonEnforcer{}
/**
 * Orginal source found in the following StackOverflow comment,
 * http://stackoverflow.com/a/13061430. I have rewritten the orientation
 * calculations and reworked the base to use Timers instead of Intervals.
 */
package org.bigbluebutton.air.main.utils {
	
	import flash.display.DisplayObject;
	import flash.display.StageOrientation;
	import flash.events.AccelerometerEvent;
	import flash.events.TimerEvent;
	import flash.sensors.Accelerometer;
	import flash.utils.Timer;
	
	public class OrientationCalculator {
		private static var _checkFrequency:int = 500;
		
		private static var _minAngle:int = 10;
		
		public var currentOrientation:String = StageOrientation.DEFAULT;
		
		private var _tempOrientation:String = StageOrientation.DEFAULT;
		
		private var _root:DisplayObject;
		
		private var _accl:Accelerometer;
		
		private var _checkTimer:Timer;
		
		private var _confirmTimer:Timer;
		
		private var _recentOrientation:String;
		
		private var _callback:Function;
		
		public function OrientationCalculator(root:DisplayObject, callback:Function) {
			_callback = callback;
			if (Accelerometer.isSupported) {
				_accl = new Accelerometer();
				_accl.setRequestedUpdateInterval(100);
			} else {
				trace("Accelerometer not supported!!");
			}
			_root = root;
			_root.stage.autoOrients = false;
			_checkTimer = new Timer(_checkFrequency, 0);
			_checkTimer.addEventListener(TimerEvent.TIMER, checkOrientation);
			_confirmTimer = new Timer(_checkFrequency / 3, 1);
			_confirmTimer.addEventListener(TimerEvent.TIMER, confirmOrientation);
		}
		
		public function set active(val:Boolean):void {
			if (_accl != null) {
				if (val == true) {
					if (!_accl.hasEventListener(AccelerometerEvent.UPDATE)) {
						_accl.addEventListener(AccelerometerEvent.UPDATE, getAcceleromOrientation);
					}
					_checkTimer.start();
					currentOrientation = _recentOrientation;
				} else {
					if (_accl.hasEventListener(AccelerometerEvent.UPDATE)) {
						_accl.removeEventListener(AccelerometerEvent.UPDATE, getAcceleromOrientation);
					}
					_checkTimer.stop();
				}
			}
		}
		
		private function checkOrientation(e:TimerEvent):void {
			_tempOrientation = _recentOrientation;
			if (currentOrientation != _tempOrientation) {
				_confirmTimer.start()
			}
		}
		
		private function confirmOrientation(e:TimerEvent):void {
			if (_tempOrientation == _recentOrientation) {
				currentOrientation = _tempOrientation;
				if (_callback != null)
					_callback();
			}
		}
		
		private function getAcceleromOrientation(e:AccelerometerEvent):void {
			var roll:Number = Math.atan2(e.accelerationY, e.accelerationZ) * 180 / Math.PI;
			var pitch:Number = Math.atan2(e.accelerationX, Math.sqrt(e.accelerationY * e.accelerationY + e.accelerationZ * e.accelerationZ)) * 180 / Math.PI;
			//trace("pitch: " + pitch + ", roll: " + roll);
			var absRoll:Number = Math.abs(roll);
			var absPitch:Number = Math.abs(pitch);
			if (absRoll > _minAngle || absPitch > _minAngle) {
				if (absPitch > absRoll) {
					if (pitch > 0) {
						_recentOrientation = StageOrientation.ROTATED_RIGHT;
						return;
					} else {
						_recentOrientation = StageOrientation.ROTATED_LEFT;
						return;
					}
				} else {
					if (roll > 0) {
						_recentOrientation = StageOrientation.DEFAULT;
						return;
					} else {
						_recentOrientation = StageOrientation.UPSIDE_DOWN;
						return;
					}
				}
			}
		}
	}
}

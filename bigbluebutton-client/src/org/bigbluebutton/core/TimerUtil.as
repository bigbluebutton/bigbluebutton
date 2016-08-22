/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2016 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core {

	import flash.events.TimerEvent;
	import flash.utils.Dictionary;
	import flash.utils.Timer;
	
	import mx.controls.Label;
	
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public final class TimerUtil {
		public static var timers:Dictionary = new Dictionary(true);

		public static function setCountDownTimer(label:Label, seconds:int):void {
			var timer:Timer = getTimer(label.id, seconds);
			if (!timer.hasEventListener(TimerEvent.TIMER)) {
				timer.addEventListener(TimerEvent.TIMER, function():void {
					var remainingSeconds:int = timer.repeatCount - timer.currentCount;
					var formattedTime:String = (Math.floor(remainingSeconds / 60)) + ":" + (remainingSeconds % 60 >= 10 ? "" : "0") + (remainingSeconds % 60);
					label.htmlText = ResourceUtil.getInstance().getString(
						UserManager.getInstance().getConference().isBreakout ? 'bbb.users.breakout.remainingTimeBreakout' : 'bbb.users.breakout.remainingTimeParent',
						[UserManager.getInstance().getConference().meetingName, formattedTime]
					);
				});
				timer.addEventListener(TimerEvent.TIMER_COMPLETE, function():void {
					label.text = ResourceUtil.getInstance().getString('bbb.users.breakout.remainingTimeEnded');
				});
			} else {
				timer.stop();
				timer.reset();
			}
			timer.start();
		}

		public static function getTimer(name:String, defaultRepeatCount:Number):Timer {
			if (timers[name] == undefined) {
				timers[name] = new Timer(1000, defaultRepeatCount);
			}
			Timer(timers[name]).repeatCount = defaultRepeatCount;
			return timers[name];
		}

		public static function stopTimer(name:String):void {
			if (timers[name] != undefined) {
				timers[name].stop();
			}
		}
	}
}

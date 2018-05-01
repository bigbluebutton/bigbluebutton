package org.bigbluebutton.modules.screenshare.view.components {
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.controls.Label;
	
	public class AnimatedDots extends Label {
		private var timer:Timer;
		
		public function AnimatedDots() {
			timer = new Timer(200, 0);
			timer.addEventListener(TimerEvent.TIMER, onTimer);
			
			width = 150;
		}
		
		override public function set text(value:String):void {
			trace("Not allowed to set text directly");
		}
		
		public function startAnimation():void {
			timer.start();
			visible = includeInLayout = true;
		}
		
		public function endAnimation():void {
			timer.stop();
			visible = includeInLayout = false;
		}
		
		public function onTimer(e:TimerEvent):void {
			// animate dots
			if (super.text.length > 4) {
				super.text = "";
			} else {
				super.text = text + ".";
			}
		}
	}
}
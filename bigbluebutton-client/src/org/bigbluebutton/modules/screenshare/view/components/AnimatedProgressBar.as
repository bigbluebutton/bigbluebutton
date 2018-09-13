package org.bigbluebutton.modules.screenshare.view.components {
	import flash.events.TimerEvent;
	import flash.text.TextLineMetrics;
	import flash.utils.Timer;
	
	import mx.controls.ProgressBar;
	import mx.controls.ProgressBarLabelPlacement;
	import mx.controls.ProgressBarMode;
	import mx.core.UITextField;
	import mx.core.mx_internal;
	
	use namespace mx_internal;
	
	public class AnimatedProgressBar extends ProgressBar {
		private const TOTAL_LENGTH:uint = 15;
		private const UPDATES_PER_SECOND:uint = 4;
		
		private var timer:Timer;
		
		private var totalProgress:Number;
		private var currentProgress:Number;
		
		public function AnimatedProgressBar() {
			super();
			
			timer = new Timer(1000/UPDATES_PER_SECOND, 0);
			timer.addEventListener(TimerEvent.TIMER, onTimer);
			
			totalProgress = TOTAL_LENGTH * UPDATES_PER_SECOND;
			
			mode = ProgressBarMode.MANUAL;
			minimum = 0;
			maximum = totalProgress;
			labelPlacement = ProgressBarLabelPlacement.TOP;
		}
		
		public function startAnimation():void {
			timer.start();
			visible = includeInLayout = true;
			currentProgress = 0;
		}
		
		public function endAnimation():void {
			timer.stop();
			visible = includeInLayout = false;
		}
		
		private function onTimer(e:TimerEvent):void {
			setProgress(++currentProgress, totalProgress);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			// There's no TOP_CENTER label placement so we need to create one

			var labelWidth:Number = getStyle("labelWidth");
			var top:Number = getStyle("paddingTop");
			
			var lineMetrics:TextLineMetrics = measureText(label);
			
			var textWidth:Number = isNaN(labelWidth) ?
				lineMetrics.width + UITextField.TEXT_WIDTH_PADDING :
				labelWidth;
			
			_labelField.move((unscaledWidth - textWidth) / 2, top);
		}
	}
}
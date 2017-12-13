package org.bigbluebutton.modules.whiteboard.views {
	import flash.events.TimerEvent;
	import flash.geom.Point;
	import flash.utils.Timer;

	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.modules.whiteboard.business.shapes.ShapeFactory;

	public class CursorPositionListener {
		
		private var _wbCanvas:WhiteboardCanvas;
		private var _shapeFactory:ShapeFactory;
		
		private var _timer:Timer;
		private var _lastXPosition:Number;
		private var _lastYPosition:Number;
		
		
		public function CursorPositionListener(wbCanvas:WhiteboardCanvas, shapeFactory:ShapeFactory) {
			_wbCanvas = wbCanvas;
			_shapeFactory = shapeFactory;
			
			_lastXPosition = -1;
			_lastYPosition = 1;
			
			_timer = new Timer(50);
			_timer.addEventListener(TimerEvent.TIMER, onTimerInterval);
		}
		
		public function presenterChange(amIPresenter:Boolean):void {
			verifyTimerState(amIPresenter);
		}
		
		public function multiUserChange(multiUser:Boolean):void {
			verifyTimerState();
		}
		
		private function verifyTimerState(amIPresenter:Boolean=false):void {
			if (amIPresenter || _wbCanvas.getMultiUserState()) {
				startTimer();
			} else {
				stopTimer();
			}
		}
		
		private function startTimer():void {
			if (!_timer.running) {
				_timer.start();
			}
		}
		
		private function stopTimer():void {
			if (_timer.running) {
				_timer.stop();
				checkMousePosition(-1, -1)
			}
		}
		
		private function onTimerInterval(e:TimerEvent):void {
			checkMousePosition(_wbCanvas.mouseX, _wbCanvas.mouseY);
		}
		
		private function checkMousePosition(x:Number, y:Number):void {
			// check if mouse position is within bounds
			if (isXYOutsideCanvas(x, y)){
				x = -1;
				y = -1;
			}
			
			if (x != _lastXPosition || y != _lastYPosition) {
				_lastXPosition = x;
				_lastYPosition = y;
				
				// Need to avoid divide by zero complications (definitely can happen, don't remove check unless you really know what you're doing)
				if (_shapeFactory.parentHeight != 0 || _shapeFactory.parentWidth != 0) {
					var np:Point = _shapeFactory.normalizePoint(x, y);
				
					_wbCanvas.sendCursorPositionToServer(np.x, np.y);
				}
			}
		}
		
		private function isXYOutsideCanvas(x:Number, y:Number):Boolean {
			return (x < 0 || y < 0 || x > _wbCanvas.width || y > _wbCanvas.height);
		}
	}
}
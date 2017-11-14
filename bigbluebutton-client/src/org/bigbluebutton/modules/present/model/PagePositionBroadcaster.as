package org.bigbluebutton.modules.present.model {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.bigbluebutton.modules.present.events.PresenterCommands;

	public class PagePositionBroadcaster {
		
		private var updateTimer:Timer;
		
		private var lastSentPosition:PagePosition;
		
		private var recentPosition:PagePosition;
		
		public function PagePositionBroadcaster() {
			updateTimer = new Timer(50, 1);
			updateTimer.addEventListener(TimerEvent.TIMER_COMPLETE, onTimer);
			
			recentPosition = new PagePosition(PresentationPodManager.DEFAULT_POD_ID);
			lastSentPosition = new PagePosition(PresentationPodManager.DEFAULT_POD_ID);
		}
		
		public function broadcastPosition(x:Number, y:Number, 
                                      width:Number, height:Number,
    podId: String):void {
			recentPosition = new PagePosition(podId, x, y, width, height);
			
			if (!updateTimer.running) {
				updateTimer.start();
			}
		}
		
		public function reset():void {
			if (updateTimer.running) {
				updateTimer.stop();
			}
			
			recentPosition = new PagePosition(PresentationPodManager.DEFAULT_POD_ID);
			lastSentPosition = new PagePosition(PresentationPodManager.DEFAULT_POD_ID);
		}
		
		private function onTimer(e:TimerEvent):void {
			if (!lastSentPosition.equals(recentPosition)) {
				var globalDispatcher:Dispatcher = new Dispatcher();
				
				var moveEvent:PresenterCommands = 
          new PresenterCommands(PresenterCommands.ZOOM, recentPosition.podId);
				moveEvent.xOffset = recentPosition.x;
				moveEvent.yOffset = recentPosition.y;
				moveEvent.slideToCanvasWidthRatio = recentPosition.width;
				moveEvent.slideToCanvasHeightRatio = recentPosition.height;
				globalDispatcher.dispatchEvent(moveEvent);
				
				lastSentPosition = recentPosition;
			}
		}
	}
}

class PagePosition {
	public var x:Number;
	public var y:Number;
	public var width:Number;
	public var height:Number;
  public var podId: String;
	
	public function PagePosition(podId: String, x:Number = 0, y:Number = 0, 
                               width:Number = 0, height:Number = 0) {
		this.podId = podId;
    this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	public function equals(other:PagePosition):Boolean {
		return x == other.x && y == other.y && width == other.width && height == other.height;
	}
}
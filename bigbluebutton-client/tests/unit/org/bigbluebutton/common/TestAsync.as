package org.bigbluebutton.common
{
	import net.digitalprimates.fluint.tests.TestCase;
	import flash.utils.Timer;
	import flash.events.TimerEvent;
	
	public class TestAsync extends TestCase
	{
		private var timer:Timer;
		
		override protected function setUp():void {
			timer = new Timer( 100, 1 ); 
		}
		
		override protected function tearDown():void {
			timer.stop();
			timer = null;        
		}
		
		public function testTimerLongWay():void {
			var asyncHandler:Function = asyncHandler( handleTimerComplete, 500, null, handleTimeout );
			timer.addEventListener(TimerEvent.TIMER_COMPLETE, asyncHandler, false, 0, true );
			timer.start();
		}

		protected function handleTimerComplete( event:TimerEvent, passThroughData:Object ):void {
		}        
		
		protected function handleTimeout( passThroughData:Object ):void {
			fail( "Timeout reached before event");
		}
		
		public function testTimerCount() : void {
			var o:Object = new Object();
			o.repeatCount = 3;
			timer.repeatCount = o.repeatCount;
			timer.addEventListener(TimerEvent.TIMER_COMPLETE, asyncHandler( handleTimerCheckCount, 500, o, handleTimeout ), false, 0, true );
			timer.start();  
		}
		
		protected function handleTimerCheckCount( event:TimerEvent, passThroughData:Object ):void {
			assertEquals( ( event.target as Timer ).currentCount, passThroughData.repeatCount );
		}
	}
}
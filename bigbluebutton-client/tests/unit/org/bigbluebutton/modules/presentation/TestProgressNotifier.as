package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.controller.notifiers.ProgressNotifier;
	
	public class TestProgressNotifier extends TestCase
	{
		private var test:ProgressNotifier;
		
		public function TestProgressNotifier(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new TestProgressNotifier("testProgressNotifier"));
			ts.addTest(new TestProgressNotifier("testTotalSlides"));
			ts.addTest(new TestProgressNotifier("testCompletedSlides"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new ProgressNotifier(7, 3);
		}
		
		public function testProgressNotifier():void{
			assertTrue(test != null);
		}
		
		public function testTotalSlides():void{
			assertTrue(test.totalSlides == 7);
			assertFalse(test.totalSlides == 3);
		}
		
		public function testCompletedSlides():void{
			assertTrue(test.completedSlides == 3);
			assertFalse(test.completedSlides == 7);
		}

	}
}
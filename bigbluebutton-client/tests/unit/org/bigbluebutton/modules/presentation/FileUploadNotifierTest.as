package org.bigbluebutton.modules.presentation
{
	import flash.net.FileReference;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.controller.notifiers.FileUploadNotifier;
	
	public class FileUploadNotifierTest extends TestCase
	{
		private var test:FileUploadNotifier;
		
		public function FileUploadNotifierTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new FileUploadNotifierTest("testUploadNotifier"));
			ts.addTest(new FileUploadNotifierTest("testURI"));
			ts.addTest(new FileUploadNotifierTest("testRoom"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new FileUploadNotifier("someURI", "some room", new FileReference());
		}
		
		public function testUploadNotifier():void{
			assertTrue(test != null);
		}
		
		public function testURI():void{
			assertTrue(test.uri == "someURI");
			assertFalse(test.uri == "AAAAA!!!");
		}
		
		public function testRoom():void{
			assertTrue(test.room == "some room");
			assertFalse(test.room == "OVER 9000!");
		}

	}
}
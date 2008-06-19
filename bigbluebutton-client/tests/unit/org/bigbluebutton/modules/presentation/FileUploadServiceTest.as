package org.bigbluebutton.modules.presentation
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.services.FileUploadService;
	
	public class FileUploadServiceTest extends TestCase
	{
		private var test:FileUploadService;
		private var file:MockFileReference;
		private var listener:PresentationNotificationListener;
		private var facade:PresentationFacade;
		
		public function FileUploadServiceTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new FileUploadServiceTest("testConstructor"));
			ts.addTest(new FileUploadServiceTest("testOnUploadProgress"));
			ts.addTest(new FileUploadServiceTest("testOnUploadComplete"));
			ts.addTest(new FileUploadServiceTest("testOnUploadIOError"));
			ts.addTest(new FileUploadServiceTest("testOnUploadSecurityError"));
			
			return ts;
		}
		
		override public function setUp():void{
			test = new FileUploadService("host", "room");
			file = new MockFileReference();
			listener = new PresentationNotificationListener();
			facade = PresentationFacade.getInstance();
			facade.registerMediator(listener);
			facade.registerProxy(test);
		}
		
		override public function tearDown():void{
			
		}
		
		public function testConstructor():void{
			assertTrue(test != null);
		}
		
		public function testOnUploadProgress():void{
			test.upload(file);
			file.dispatchEvent(new ProgressEvent(ProgressEvent.PROGRESS));
			assertTrue(listener.receivedUploadProgress);
		}
		
		public function testOnUploadComplete():void{
			test.upload(file);
			file.dispatchEvent(new Event(Event.COMPLETE));
			assertTrue(listener.receivedUploadComplete);
		}
		
		public function testOnUploadIOError():void{
			test.upload(file);
			file.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR));
			assertTrue(listener.receivedIOError);
		}
		
		public function testOnUploadSecurityError():void{
			test.upload(file);
			file.dispatchEvent(new SecurityErrorEvent(SecurityErrorEvent.SECURITY_ERROR));
			assertTrue(listener.receivedSecurityError);
		}

	}
}
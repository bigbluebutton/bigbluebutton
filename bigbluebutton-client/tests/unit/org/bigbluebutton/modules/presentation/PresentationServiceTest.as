package org.bigbluebutton.modules.presentation
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.presentation.model.services.PresentationService;
	
	public class PresentationServiceTest extends TestCase
	{
		private var test:PresentationService;
		private var responder:MockResponder;
		
		public function PresentationServiceTest(methodName:String)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite{
			var ts:TestSuite = new TestSuite();
			
			ts.addTest(new PresentationServiceTest("testPresentationService"));
			//ts.addTest(new PresentationServiceTest("testLoadMethod"));
			
			return ts;
		}
		
		override public function setUp():void{
			responder = new MockResponder();
			test = new PresentationService("host", responder);
		}
		
		public function testPresentationService():void{
			assertTrue(test != null);
		}
		
		// Couldn't test this properly. Some problems with creating a mock HHTP connection
		//public function testLoadMethod():void{
		//	test.load("host");
		//	assertTrue(responder.receivedResult);
		//	assertTrue(responder.receivedFault);
		//}

	}
}
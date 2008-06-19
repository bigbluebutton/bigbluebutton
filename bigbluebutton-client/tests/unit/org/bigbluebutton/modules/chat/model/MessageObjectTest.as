package org.bigbluebutton.modules.chat.model
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.chat.model.vo.MessageObject;

	public class MessageObjectTest extends TestCase
	{
		public var messageObject:MessageObject = new MessageObject("Hello",0x000);
		public function MessageObjectTest(methodName:String=null)
		{
			super(methodName);
		}
		
		public static function suite():TestSuite {
               var ts:TestSuite = new TestSuite();
               ts.addTest(new MessageObjectTest("testGetMessage"));
               ts.addTest(new MessageObjectTest("testGetColor"));
               return ts;
           }
		public function testGetMessage():void {
			
			assertTrue("Expecting a string type", messageObject.message == "Hello");
		}
		public function testGetColor():void {
			assertTrue("Expecting a uint type", messageObject.color , 0x000);
		}
	}
}
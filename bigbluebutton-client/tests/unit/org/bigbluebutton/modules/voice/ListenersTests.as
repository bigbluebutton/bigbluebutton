package org.bigbluebutton.modules.voice
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.modules.voiceconference.model.vo.IListeners;
	import org.bigbluebutton.modules.voiceconference.model.vo.Listeners;
	
	public class ListenersTests extends TestCase
	{
		private var l:IListeners;
		
		public function ListenersTests(methodName:String=null)
		{
			super(methodName);
		}

		override public function setUp():void { 
			l = new Listeners();
		}  
		
		override public function tearDown():void {  } 

 		public static function suite():TestSuite 
 		{
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new ListenersTests( "testParseModuleXml" ) );
   			return ts;
   		}
   		   		
   		public function testParseModuleXml():void {   			

   		}

	}
}
package org.bigbluebutton.main
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.main.model.BbbModuleManager;
	import org.bigbluebutton.main.model.ModuleDescriptor;

	public class BbbModuleManagerTests extends TestCase
	{
		private var manager:BbbModuleManager;
		private var xmlString:String = 
			'<modules>' + 
			'<module name="ChatModule" url="ChatModule.swf" />' +
			'<module name="PresentationModule" url="PresentationModule.swf" />' +
			'<module name="VideoModule" url="VideoModule.swf" />' +
			'<module name="VoiceModule" url="VoiceModule.swf" />' +
			'</modules> '
		
		private var xml:XML = new XML(xmlString);
		
		public function BbbModuleManagerTests(methodName:String=null)
		{
			super(methodName);
		}

		override public function setUp():void { 
			manager = new BbbModuleManager(null, null); 
		}  
		
		override public function tearDown():void {  } 

 		public static function suite():TestSuite 
 		{
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new BbbModuleManagerTests( "testParseModuleXml" ) );
   			return ts;
   		}
   		   		
   		public function testParseModuleXml():void {   			
   				manager.parse(new XML(xmlString));
   				assertTrue( "Number of modules is 4", manager.numberOfModules == 4);
				assertTrue( "There should be a ChatModule", manager.hasModule('ChatModule'));
   		}

	}
}
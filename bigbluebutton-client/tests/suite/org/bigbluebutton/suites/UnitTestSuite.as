package org.bigbluebutton.suites
{
	import net.digitalprimates.fluint.tests.TestSuite;
	
	import org.bigbluebutton.common.TestAsync;
	import org.bigbluebutton.core.config.ConfigManagerTest;
	
	public class UnitTestSuite extends TestSuite
	{
		public function UnitTestSuite() {
			addTestCase( new ConfigManagerTest()); 
//			addTestCase( new TestAsync() );       
		}
	}
}
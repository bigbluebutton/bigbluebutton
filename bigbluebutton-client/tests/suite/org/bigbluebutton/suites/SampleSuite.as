package org.bigbluebutton.suites
{
	import org.bigbluebutton.common.TestCase1;
	import net.digitalprimates.fluint.tests.TestSuite;
	import org.bigbluebutton.common.TestAsync;
	
	public class SampleSuite extends TestSuite
	{
		public function SampleSuite() {
			addTestCase( new TestCase1() ); 
			addTestCase( new TestAsync() );       
		}
	}
}
package org.bigbluebutton.common
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.common.messaging.InputPipe;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;

	public class InputPipeTest extends TestCase
	{
		public function InputPipeTest(methodName:String=null)
		{
			super(methodName);
		}

 		public static function suite():TestSuite 
 		{
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new InputPipeTest( "testSendToInputPipe" ) );
   			return ts;
   		}
   		
   		public function testSendToInputPipe():void
   		{
			// create a message
   			var messageToSend:IPipeMessage = new Message( Message.NORMAL, 
   													      { SRC:'MAIN_APP' },
   														  new XML(<testMessage testAtt='Hello'/>),
   													      Message.PRIORITY_HIGH );
   													      
   			var listener:PipeListener = new PipeListener( this,callBackMethod );
   			var inPipe : InputPipe = new InputPipe("PIPENAME");
   			
   			// connect the listener to the pipe and write the message
   			var connected:Boolean = inPipe.connect(listener);
   			var written:Boolean = inPipe.write( messageToSend );
   			assertTrue( "Connected to inputPipe", connected == true);
   			assertTrue( "PipeName is PIPENAME", inPipe.name == "PIPENAME");
			assertTrue( "Expecting messageReceived.getHeader().SRC == 'MAIN_APP'", 
							messageReceived.getHeader().SRC == 'MAIN_APP');
   			assertTrue( "Expecting messageReceived.getBody().@testAtt == 'Hello'",  
   							messageReceived.getBody().@testAtt == 'Hello');
   			assertTrue( "Expecting messageReceived.getPriority() == Message.PRIORITY_HIGH",  
   							messageReceived.getPriority() == Message.PRIORITY_HIGH);   			   			   			
   		}		

		/**
		 * Recipient of message.
		 * <P>
		 * Used by <code>callBackMedhod</code> as a place to store
		 * the recieved message.</P>
		 */     		
   		private var messageReceived:IPipeMessage;
   		
   		/**
   		 * Callback given to <code>PipeListener</code> for incoming message.
   		 * <P>
   		 * Used by <code>testReceiveMessageViaPipeListener</code> 
   		 * to get the output of pipe back into this  test to see 
   		 * that a message passes through the pipe.</P>
   		 */
   		private function callBackMethod(message:IPipeMessage):void
   		{
   			this.messageReceived = message;
   		}
		
	}
}
package org.bigbluebutton.common
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.common.messaging.OutputPipe;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeFitting;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.Pipe;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;

	public class OutputPipeTest extends TestCase
	{
		
		public function OutputPipeTest(methodName:String=null)
		{
			super(methodName);
		}

 		public static function suite():TestSuite 
 		{
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new OutputPipeTest( "testReceivingFromOutputPipe" ) );
   			return ts;
   		}
   		
   		public function testReceivingFromOutputPipe():void
   		{
			// create a message
   			var messageToSend:IPipeMessage = new Message( Message.NORMAL, 
   													      { SRC:'MAIN_APP' },
   														  new XML(<testMessage testAtt='Hello'/>),
   													      Message.PRIORITY_HIGH );
   													      
  			// create pipe and listener
   			var pipe:IPipeFitting = new Pipe();
   			var listener:PipeListener = new PipeListener( this,callBackMethod );
   			var outPipe : OutputPipe = new OutputPipe("PIPENAME");
   			
   			// connect the listener to the pipe and write the message
   			var connected:Boolean = pipe.connect(listener);
   			
   			var connectedToOutput:Boolean = outPipe.connect(pipe);
   			var written:Boolean = outPipe.write( messageToSend );
   			assertTrue( "Connected to OutputPipe", connectedToOutput == true);
   			assertTrue( "PipeName is PIPENAME", outPipe.name == "PIPENAME");
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
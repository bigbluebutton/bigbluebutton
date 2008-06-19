package org.bigbluebutton.common
{
	import flexunit.framework.TestCase;
	import flexunit.framework.TestSuite;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;

	public class RouterTest extends TestCase
	{
		public function RouterTest(methodName:String=null)
		{
			super(methodName);
		}

  		public override function setUp():void
  		{
  		}
  		
  		public static function suite():TestSuite {
   			var ts:TestSuite = new TestSuite();
   			
   			ts.addTest( new RouterTest( "testSendSuccess" ) );

   			return ts;
   		}		
   		
   		public function testSendSuccess():void
   		{
   			var router : Router = new Router();
   			var input : InputPipe = new InputPipe("LOGGERINPUT");
   			var output : OutputPipe = new OutputPipe("MAINOUTPUT");
   			router.registerInputPipe(input.name, input);
   			router.registerOutputPipe(output.name, output);
   			var listener:PipeListener = new PipeListener( this,callBackMethod );
   			var connected : Boolean = input.connect(listener);

			// create a message
   			var messageToSend:IPipeMessage = new Message( Message.NORMAL, 
   													      { SRC:'MAININPUT', TO: 'LOGGERINPUT' },
   														  new XML(<testMessage testAtt='Hello'/>),
   													      Message.PRIORITY_HIGH );
   			
   			var written:Boolean = output.write( messageToSend );
   			assertTrue( "Connected to input", connected == true);
   			assertTrue( "InputPipe PipeName is LOGGERINPUT", input.name == "LOGGERINPUT");
			assertTrue( "Expecting messageReceived.getHeader().SRC == 'MAININPUT'", 
							messageReceived.getHeader().SRC == 'MAININPUT');
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
package org.bigbluebutton.modules.polling.managers
{

	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.IEventDispatcher;	
	import org.bigbluebutton.modules.polling.events.CreatePollEvent;
	import org.bigbluebutton.modules.polling.events.GetPollsEvent;
	import org.bigbluebutton.modules.polling.model.PollingModel;
	import org.bigbluebutton.modules.polling.model.Question;
	import org.bigbluebutton.modules.polling.model.Response;
	import org.bigbluebutton.modules.polling.vo.CreatePollVO;
	import org.bigbluebutton.modules.polling.vo.CreateQuestionVO;
			
	public class PollManager
	{	
		
		public static const LOG:String = "[PollManager] - ";	
		
    // Injected by Mate
    public var model:PollingModel;
    public var dispatcher:IEventDispatcher;
    
		public function PollManager()
		{

		}
		
    public function handleStartModuleEvent(module:PollingModule):void {
      trace(LOGNAME + " Started ";
    }
    
    public function handleInitPollModuleEvent():void {

    //  createSamplePolls();
    }
    
    private function createSamplePolls():void {
      addSample1();
      addSample2();
      addSample3();
    }
    
    private function addSample1():void {      
      var createPollVO:CreatePollVO = new CreatePollVO("Preferred Credit Cards");
      var questionType:String = "MULTI_CHOICE";
      var question:CreateQuestionVO = new CreateQuestionVO(questionType, "What type of credit card do you prefer?");
      question.addResponse("Visa");
      question.addResponse("MasterCard");
      question.addResponse("American Express");
      question.addResponse("Diners Club");
      
      createPollVO.addQuestion(question);
      
      dispatcher.dispatchEvent(new CreatePollEvent(createPollVO));
    }
    
    private function addSample2():void {
      var createPollVO:CreatePollVO = new CreatePollVO("Most Miles Credit Cards");
      var questionType:String = "MULTI_RESPONSE";
      var question:CreateQuestionVO = new CreateQuestionVO(questionType, "Which credit cards do you own?");
      question.addResponse("Visa");
      question.addResponse("MasterCard");
      question.addResponse("American Express");
      question.addResponse("Diners Club");
      
      createPollVO.addQuestion(question);
      
      dispatcher.dispatchEvent(new CreatePollEvent(createPollVO));
    }
    
    private function addSample3():void {
      var createPollVO:CreatePollVO = new CreatePollVO("Owned Credit Cards");
      var questionType:String = "MULTI_RESPONSE";
      var question:CreateQuestionVO = new CreateQuestionVO(questionType, "Choose the credit card that gives you the most miles");
      question.addResponse("Visa");
      question.addResponse("MasterCard");
      question.addResponse("American Express");
      question.addResponse("Diners Club");
      
      createPollVO.addQuestion(question);
      
      dispatcher.dispatchEvent(new CreatePollEvent(createPollVO));
    }
    
   }
}

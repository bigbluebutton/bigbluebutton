package org.bigbluebutton.modules.polling.vo
{
  public class CreateQuestionVO
  {
    private var _questionType:String;
    private var _question:String;
    private var _responses:Array;
    
    public function CreateQuestionVO(questionType:String, question: String, responses: Array)
    {
      _questionType = questionType;
      _question = question;
      _responses = responses;
    }
  }
}
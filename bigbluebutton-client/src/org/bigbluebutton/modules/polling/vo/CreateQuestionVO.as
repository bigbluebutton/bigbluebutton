package org.bigbluebutton.modules.polling.vo
{
  public class CreateQuestionVO
  {
    private var _questionType:String;
    private var _question:String;
    private var _responses:Array = new Array();
    
    public function CreateQuestionVO(questionType:String, question: String)
    {
      _questionType = questionType;
      _question = question;
    }
    
    public function get questionType():String {
      return _questionType;
    }
    
    public function get question():String {
      return _question;
    }
    
    public function addResponse(response:String):void {
      _responses.push(response);
    }
    
    public function get responses():Array {
      return _responses;
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.question = _question;
      map.questionType = _questionType;
      map.responses = _responses;
      
      return map;
    }
  }
}
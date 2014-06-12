package org.bigbluebutton.modules.polling.vo
{
  public class UpdateQuestionVO
  {
    private var _questionType:String;
    private var _question:String;
    private var _responses:Array = new Array();
    private var _qid:String;
    
    public function UpdateQuestionVO(qid:String, questionType:String, question:String)
    {
      _qid = qid;
      _questionType = questionType;
      _question = question;
    }
    
    public function get questionType():String {
      return _questionType;
    }
    
    public function get question():String {
      return _question;
    }
    
    public function addResponse(response:UpdateResponseVO):void {
      _responses.push(response);
    }
    
    public function get responses():Array {
      return _responses;
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.id = _qid;
      map.question = _question;
      map.questionType = _questionType;
      map.responses = _responses;
      
      return map;
    }
  }
}
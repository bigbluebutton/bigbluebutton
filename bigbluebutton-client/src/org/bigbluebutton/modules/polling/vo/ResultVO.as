package org.bigbluebutton.modules.polling.vo
{
  import org.bigbluebutton.modules.polling.model.Responder;

  public class ResultVO
  {
    private var _questionID:String;
    private var _responseID:String;
    private var _responder:Responder;
    
    public function ResultVO(questionID:String, responseID:String, responder:Responder)
    {
      _questionID = questionID;
      _responseID = responseID;
      _responder = responder;
    }
    
    public function get questionID():String {
      return _questionID;
    }
    
    public function get responseID():String {
      return _responseID;
    }
    
    public function get responder():Responder {
      return _responder;
    }
  }
}
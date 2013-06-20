package org.bigbluebutton.modules.polling.vo
{
  public class ResultVO
  {
    private var _questionID:String;
    private var _responseID:String;
    private var _responseCount:int;
    
    public function ResultVO(questionID:String, responseID:String, responseCount:int)
    {
      _questionID = questionID;
      _responseID = responseID;
      _responseCount = responseCount;
    }
    
    public function get questionID():String {
      return _questionID;
    }
    
    public function get responseID():String {
      return _responseID;
    }
    
    public function get responseCount():int {
      return _responseCount;
    }
  }
}
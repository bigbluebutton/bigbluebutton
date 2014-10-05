package org.bigbluebutton.modules.polling.views
{
  public class Responses
  {
    private var _questionID:String;
    private var _resps:Array;
    
    public function Responses(questionID:String, resps:Array)
    {
      _questionID = questionID;
      _resps = resps;
    }
    
    public function get questionID():String {
      return _questionID;
    }
    
    public function get responseIDs():Array {
      return _resps;
    }
  }
}
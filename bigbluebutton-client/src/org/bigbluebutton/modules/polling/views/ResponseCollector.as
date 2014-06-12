package org.bigbluebutton.modules.polling.views
{
  public class ResponseCollector
  {
    
    private var _pollID:String;
    private var _responses:Array = new Array();
    
    public function ResponseCollector(pollID:String)
    {
      _pollID = pollID;
    }
    
    public function addResponse(response:Responses):void {
      for (var i:int = 0; i < _responses.length; i++) {
        var r:Responses = _responses[i];
        if (r.questionID == response.questionID) {
          // Overwrite the previous response
          _responses[i] = response;
          return;
        }
      }
      
      _responses.push(response);
    }
    
    public function get responses():Array {
      return _responses;
    }
  }
}
package org.bigbluebutton.modules.polling.vo
{
  import org.bigbluebutton.modules.polling.views.Responses;

  public class PollResponseVO
  {
    private var _id:String;
    private var _questions:Array = new Array();
    
    public function PollResponseVO(pollID:String)
    {
      _id = pollID;
    }
    
    public function get pollID():String {
      return _id;
    }
    
    public function addResponse(resp:Responses):void {
      _questions.push(resp);
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.pollID = _id;
      map.questions = _questions;
      
      return map;
    }
  }
}
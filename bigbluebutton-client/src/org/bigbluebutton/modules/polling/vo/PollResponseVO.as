package org.bigbluebutton.modules.polling.vo
{
  public class PollResponseVO
  {
    private var _id:String;
    private var _questions:Array = new Array();
    
    public function PollResponseVO(id:String)
    {
      _id = id;
    }
    
    public function addResponse(resp:QuestionResponseVO):void {
      _questions.push(resp);
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.id = _id;
      map.questions = _questions;
      
      return map;
    }
  }
}
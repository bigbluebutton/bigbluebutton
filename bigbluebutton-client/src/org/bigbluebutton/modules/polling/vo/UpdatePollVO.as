package org.bigbluebutton.modules.polling.vo
{
  public class UpdatePollVO
  {
    private var _id:String;
    private var _title:String;
    private var _questions:Array = new Array();
    
    public function UpdatePollVO(id:String, title:String)
    {
      _id = id;
      _title = title;
    }
    
    public function get title():String {
      return _title;
    }
    
    public function addQuestion(question:UpdateQuestionVO):void {
      _questions.push(question);
    }
    
    public function get questions():Array {
      return _questions;
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.title = _title;
      map.id = _id;
      
      var qs:Array = new Array();
      for (var i:int = 0; i < _questions.length; i++) {
        var q:UpdateQuestionVO = _questions[i] as UpdateQuestionVO;
        qs.push(q.toMap());
      }
      
      map.questions = qs;
      
      return map;
    }
  }
}
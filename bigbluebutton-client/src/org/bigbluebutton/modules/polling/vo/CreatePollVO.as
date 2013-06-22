package org.bigbluebutton.modules.polling.vo
{
  public class CreatePollVO
  {
    private var _title:String;
    private var _questions:Array = new Array();

    public function CreatePollVO(title:String)
    {
      this._title = title;
    }
    
    public function get title():String {
      return _title;
    }
    
    public function addQuestion(question:CreateQuestionVO):void {
      _questions.push(question);
    }
    
    public function get questions():Array {
      return _questions;
    }
    
    public function toMap():Object {
      var map:Object = new Object();
      map.title = _title;
      
      var qs:Array = new Array();
      for (var i:int = 0; i < _questions.length; i++) {
        var q:CreateQuestionVO = _questions[i] as CreateQuestionVO;
        qs.push(q.toMap());
      }
      
      map.questions = qs;
      
      return map;
    }
  }
}
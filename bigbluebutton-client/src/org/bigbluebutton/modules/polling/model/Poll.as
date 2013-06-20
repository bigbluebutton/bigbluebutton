package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.ResultVO;
  import org.bigbluebutton.modules.polling.vo.ResultsVO;

  public class Poll
  {
    private var _id:String;
    private var _title:String;
    private var _questions: Array;
    private var _preCreated:Boolean = false;
    
    public var started:Boolean = false;
    public var stopped:Boolean = false;
    
    public function Poll(id:String, title:String, questions:Array)
    {
      _id = id;
      _title = title;
      _questions = questions;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get title():String {
      return _title;
    }
    
    public function updateResults(results:ResultsVO):void {
      for (var i:int = 0; i < results.results.length; i++) {
        var r:ResultVO = results.results[i] as ResultVO;
        var q:Question = getQuestion(r.questionID);
        if (q != null) {
          q.updateResult(r.responseID, r.responseCount);
        }
      }
    }
    
    private function getQuestion(questionID:String):void {
      for (var i:int = 0; i < _questions.length; i++) {
        var q:Question = _questions[i] as Question;
        if (q.id == questionID) return q;
      }
      
      return null;
    }
  }
}
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
    
    private var _started:Boolean = false;
    private var _stopped:Boolean = false;
    
    private var _startedOn:Date;
    private var _stoppedOn:Date;
    private var _durationInMinutes:int = 5;
    
    private var _hasResponded:Boolean = false;
    
    public function Poll(id:String, title:String, questions:Array, started:Boolean, stopped:Boolean)
    {
      _id = id;
      _title = title;
      _questions = questions;
      _started = started;
      _stopped = stopped;
    }
    
    public function start():void {
      _started = true;
      _startedOn = new Date();
    }
    
    public function started():Boolean {
      return _started;
    }
    
    public function stop():void {
      _stopped = true;
      _stoppedOn = new Date();
    }
    
    public function stopped():Boolean {
      return _stopped;
    }
    
    public function get duration():int {
      return _durationInMinutes;
    }
    
    public function timeRemaining():int {
      var now:Date = new Date();
      var elapsedTimeInSeconds:Number =  (now.time - _startedOn.time)/1000;
      
      var timeRemainingInSeconds:Number = (_durationInMinutes * 60) - elapsedTimeInSeconds;
      
      if (timeRemainingInSeconds <= 0) return 0;
      
      return timeRemainingInSeconds;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get title():String {
      return _title;
    }
    
    public function questions():Array {
      return _questions;
    }
    
    public function updateResults(questionID:String, responseID:String, responder:Responder):void {
      var q:Question = getQuestion(questionID);
      if (q != null) {
        q.updateResult(responseID, responder);
      }
    }
    
    private function getQuestion(questionID:String):Question {
      for (var i:int = 0; i < _questions.length; i++) {
        var q:Question = _questions[i] as Question;
        if (q.id == questionID) return q;
      }
      
      return null;
    }
    
    public function userResponded():void {
      _hasResponded = true;
    }
    
    public function hasResponded():Boolean {
      return _hasResponded;
    }
  }
}
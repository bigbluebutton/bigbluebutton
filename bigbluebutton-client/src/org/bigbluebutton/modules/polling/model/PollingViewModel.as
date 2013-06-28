package org.bigbluebutton.modules.polling.model
{

  /***
  * Class that provides read-only view of the models.
  * Views should use this class to get access to the data
  * in PollingModel.
  */
  public class PollingViewModel
  {
    private var _model:PollingModel;
    
    public function PollingViewModel(model: PollingModel)
    {
      _model = model;
    }
    
    public function getPoll(pollID:String):PollVO {
      var poll:Poll = _model.getPoll(pollID);
      if (poll != null) {
        return new PollVO(poll);
      }
      
      return null;
    }
    
    public function get polls():Array {
      var pollVOs:Array = new Array();
      
      var polls:Array = _model.getPolls();
      
      for (var i:int = 0; i < polls.length; i++) {
        pollVOs.push(new PollVO(polls[i]));
      }
      
      return pollVOs;
    }
    
    public function getSamplePoll():PollVO {

      var _poll:Poll = _model.getPoll("pollID");
      
      var _pollVO:PollVO = new PollVO(_poll);
      
      return _pollVO;
    }
    
    public function addSamplePolls():void {
      addSample1();
      addSample2();
    }
    
    private function addSample1():void {
      var _questions:Array = new Array();
      
      var _resps1:Array = new Array();
      _resps1.push(new Response("1", "Answer 1"));
      _resps1.push(new Response("2", "Answer 2"));
      _resps1.push(new Response("3", "Answer 3"));
      
      var _q1:Question = new Question("qID", true, "What is my name?", _resps1);
      
      _questions.push(_q1);
      
      var _poll:Poll = new Poll("pollID", "Sample Poll", _questions);    
      
      _model.createPoll(_poll);
    }
    
    private function addSample2():void {
      var _questions:Array = new Array();
      
      var _resps1:Array = new Array();
      _resps1.push(new Response("1", "Chicken"));
      _resps1.push(new Response("2", "Egg"));
      
      var _q1:Question = new Question("qID", false, "Which came first?", _resps1);
      
      _questions.push(_q1);
      
      var _poll:Poll = new Poll("chicken-poll", "Chicken and Egg", _questions);    
      
      _model.createPoll(_poll);
    }
  }
}
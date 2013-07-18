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
      trace("************** Initing PollingViewModel ***************************");
      _model = model;
    }
    
    public function hasUserResponded(pollID:String):Boolean {
      return _model.hasUserResponded(pollID);  
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
      addSample3();
      trace("*** PollingViewModel num polls = [" + _model.getPolls().length + "] **** \n");
    }
    
    private function addSample1():void {
      var _questions:Array = new Array();
      
      var _resps1:Array = new Array();
      _resps1.push(new Response("1", "Answer 1", new Array()));
      _resps1.push(new Response("2", "Answer 2", new Array()));
      _resps1.push(new Response("3", "Answer 3", new Array()));
      
      var _q1:Question = new Question("qID", true, "What is my name?", _resps1);
      
      _questions.push(_q1);
      
      var _poll:Poll = new Poll("pollID", "Sample Poll", _questions, false, false);    
      
      _model.createPoll(_poll);
    }
    
    private function addSample2():void {
      var _questions:Array = new Array();
      
      var _resps1:Array = new Array();
      _resps1.push(new Response("1", "Chicken", new Array()));
      _resps1.push(new Response("2", "Egg", new Array()));
      
      var _q1:Question = new Question("qID", false, "Which came first?", _resps1);
      
      _questions.push(_q1);
      
      var _poll:Poll = new Poll("chicken-poll", "Chicken and Egg", _questions, false, false);    
      
      _model.createPoll(_poll);
    }
    
    private function addSample3():void {
      var _questions:Array = new Array();
      
      var _resps1:Array = new Array();
      _resps1.push(new Response("1", "Dumaguete", new Array()));
      _resps1.push(new Response("2", "Cebu", new Array()));
      _resps1.push(new Response("3", "Zamboanga", new Array()));
      _resps1.push(new Response("4", "None of the above", new Array()));
      
      var _q1:Question = new Question("qID", false, "What is the capital of the Philippines?", _resps1);
      
      _q1.updateResult("1", new Responder("user1", "Asyong"));
      _q1.updateResult("2", new Responder("user2", "Pedro"));
      _q1.updateResult("3", new Responder("user3", "Bardagol"));
      _q1.updateResult("4", new Responder("user4", "Juan"));
      
      _questions.push(_q1);
      
      var _poll:Poll = new Poll("philcap", "Philippine Capital", _questions, false, false);    
      
      _model.createPoll(_poll);
    }
  }
}
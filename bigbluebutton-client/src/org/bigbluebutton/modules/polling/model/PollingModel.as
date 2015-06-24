package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;
  import org.bigbluebutton.modules.polling.vo.ResultsVO;

  public class PollingModel
  {
    
    private var _currentPoll:SimplePoll;
    
    private var _polls:ArrayCollection
    
    private var _initialized:Boolean = false;
    
    public function PollingModel()
    {
      _polls = new ArrayCollection();
    }
    
    public function initialized():Boolean {
      return _initialized;
    }
    
    public function setCurrentPoll(poll:SimplePoll):void {
      _currentPoll = poll;
    }
    
    public function getCurrentPoll():SimplePoll {
      return _currentPoll;
    }
    
    public function getPolls():Array {
      return _polls.toArray();
    }
    
    public function updateResults(pollID:String, questionID:String, responseID:String, responder:Responder):void {
      if (hasPoll(pollID)) {
        var poll:Poll = getPoll(pollID);
        poll.updateResults(questionID, responseID, responder);
      }      
    }
    
    public function startPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        var poll:Poll = getPoll(pollID);
        poll.start();
      }
    }

    public function stopPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        var poll:Poll = getPoll(pollID);
        poll.stop();
      }
    }
    
    public function createPoll(poll:Poll):void {
      if (! hasPoll(poll.id)) {
        _polls.addItem(poll);
      }
    }

    public function destroyPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        _polls.removeItemAt(getPollIndex(pollID));
      }
    }
    
    public function hasPoll(pollID:String):Boolean {
      for (var i:int = 0; i < _polls.length; i++) {
        var p:Poll = _polls.getItemAt(i) as Poll;
        if (p.id == pollID) return true;
      }   
      
      return false;
    }
    
    private function getPollIndex(pollID:String):int {
      for (var i:int = 0; i < _polls.length; i++) {
        var p:Poll = _polls.getItemAt(i) as Poll;
        if (p.id == pollID) return i;
      }        
      return -1;
    }
    
    public function updatePoll(poll:Poll):void {
      if (hasPoll(poll.id)) {
        _polls.removeItemAt(getPollIndex(poll.id));
        _polls.addItem(poll);
      }
    }
    
    public function getPoll(pollID:String):Poll {
      if (hasPoll(pollID)) {
        return _polls.getItemAt(getPollIndex(pollID)) as Poll;
      }
       
      return null;
    }
    
    public function userHasResponded(pollID:String):void {
      for (var i:int = 0; i < _polls.length; i++) {
        var p:Poll = _polls.getItemAt(i) as Poll;
        if (p.id == pollID) p.userResponded();
      }       
    }

    public function hasUserResponded(pollID:String):Boolean {
      for (var i:int = 0; i < _polls.length; i++) {
        var p:Poll = _polls.getItemAt(i) as Poll;
        if (p.id == pollID) return p.hasResponded();
      }
      return false;       
    }    

  }
}
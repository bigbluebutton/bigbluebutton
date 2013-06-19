package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.CreatePollVO;

  public class PollingModel
  {
    private var polls:ArrayCollection
    
    public function PollingModel()
    {
      
    }
    
    public function startPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        var poll:Poll = getPoll(pollID);
        poll.started = true;
      }
    }

    public function stopPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        var poll:Poll = getPoll(pollID);
        poll.stopped = true;
      }
    }
    
    public function createPoll(poll:Poll):void {
      if (! hasPoll(poll.id) {
        polls.addItem(poll);
      }
    }

    public function destroyPoll(poll:Poll):void {
      if (! hasPoll(poll.id) {
        polls.removeItemAt(getPollIndex(poll.id));
      }
    }
    
    public function hasPoll(pollID:String):Boolean {
      for (var i:int = 0; i < polls.length; i++) {
        var p:Poll = polls.getItemAt(i) as Poll;
        if (p.id == pollID) return true;
      }      
    }
    
    private function getPollIndex(pollID:String):int {
      for (var i:int = 0; i < polls.length; i++) {
        var p:Poll = polls.getItemAt(i) as Poll;
        if (p.id == pollID) return i;
      }        
      return -1;
    }
    
    public function updatePoll(poll:Poll):void {
      if (hasPoll(poll.id)) {
        polls.removeItemAt(getPollIndex(poll.id));
        polls.addItem(poll);
      }
    }
    
    private function getPoll(pollID:String):void {
      if (hasPoll(pollID)) {
        return polls.getItemAt(getPollIndex(pollID));
      }
       
      return null;
    }
  }
}
package org.bigbluebutton.modules.polling.model
{
  /***
  * Wrapper class that provide read-only access to a poll.
  */
  public class PollVO
  {
    private var _poll:Poll;
    
    public function PollVO(poll:Poll)
    {
      _poll = poll;
    }
    
    public function get id():String {
      return _poll.id;
    }
    
    public function get title():String {
      return _poll.title;
    }
    
    public function get questions():Array {
      return _poll.questions();
    }
    
    public function get started():Boolean {
      return _poll.started();
    }
    
    public function get stopped():Boolean {
      return _poll.stopped();
    }
    
    public function get timeRemaining():int {
      return _poll.timeRemaining();
    }
    
    public function get pollDuration():int {
      return _poll.duration;
    }
  }
}
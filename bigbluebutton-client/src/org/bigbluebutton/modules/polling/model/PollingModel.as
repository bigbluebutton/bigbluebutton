package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;

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
    
  }
}
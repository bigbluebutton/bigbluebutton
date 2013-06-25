package org.bigbluebutton.modules.polling.service
{

  import flash.events.IEventDispatcher; 
  import org.bigbluebutton.modules.polling.events.PollEvent;
  import org.bigbluebutton.modules.polling.model.Poll;
  import org.bigbluebutton.modules.polling.model.PollingModel;

  public class PollDataProcessor
  {
    private static const LOG:String = "Poll::PollDataProcessor - ";
    
    /* Injected by Mate */
    public var model:PollingModel;
    public var dispatcher:IEventDispatcher;
        
    public function handleGetPollsReply(msg:Object):void {
      trace("*** Poll getPollsReply " + msg.msg + " **** \n");
    }
    
    public function handlePollResultUpdatedMesage(msg:Object):void {
      var pollResult:Object = JSON.parse(msg.mesage);
      
      if (! model.hasPoll(pollResult.id)) {
        
        model.updateResults(pollResult.id, msg.results);
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_RESULTS_UPDATED, msg.id));
      }
    }
    
    public function handlePollCreatedMesage(msg:Object):void {
      trace("*** Poll Created " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);
      
      if (! model.hasPoll(map.id)) {        
        var id:String = map.id;
        var title:String = map.title;
        var questions:Array = map.questions as Array;
        var poll:Poll = new Poll(id, title, questions);
        model.createPoll(poll);
        
        trace("*** Poll Created id=[" + map.id + "] title=[" + map.title + "] questions = [" + questions.length + "] **** \n");
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_CREATED, poll.id));        
      }
    }
    
    public function handlePollUpdatedMesage(msg:Object):void {
      trace("*** Poll updated " + msg.msg + " **** \n");
      /*      
      if (model.hasPoll(msg.id)) {
      var id:String = msg.id;
      var title:String = msg.title;
      var poll:Poll = new Poll(msg.id, msg.title, msg.questions);
      model.updatePoll(poll);
      
      dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_UPDATED, poll.id));        
      }
      */
    }    
    
    public function handlePollDestroyedMesage(msg:Object):void {
      trace("*** Poll destroyed " + msg.msg + " **** \n");
      /*      
      if (model.hasPoll(msg.id)) {
      model.destroyPoll(msg.id);
      
      dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_DESTROYED, msg.id));        
      }
      */
    } 
    
    public function handlePollStartedMesage(msg:Object):void {
      trace("*** Poll started " + msg.msg + " **** \n");
      /*      
      if (model.hasPoll(msg.id)) {
      model.startPoll(msg.id);
      
      dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STARTED, msg.id));        
      }
      */
    }
    
    public function handlePollStoppedMesage(msg:Object):void {
      trace("*** Poll stopped " + msg.msg + " **** \n");
      /*      
      if (model.hasPoll(msg.id)) {
      model.stopPoll(msg.id);
      
      dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STOPPED, msg.id));        
      }
      */
    }
  }
}
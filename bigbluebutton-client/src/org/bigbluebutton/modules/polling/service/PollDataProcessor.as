package org.bigbluebutton.modules.polling.service
{

  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.polling.events.PollEvent;
  import org.bigbluebutton.modules.polling.model.Poll;
  import org.bigbluebutton.modules.polling.model.PollingModel;
  import org.bigbluebutton.modules.polling.model.Question;
  import org.bigbluebutton.modules.polling.model.Responder;
  import org.bigbluebutton.modules.polling.model.Response;

  public class PollDataProcessor
  {
    private static const LOG:String = "Poll::PollDataProcessor - ";
    
    /* Injected by Mate */
    public var model:PollingModel;
    public var dispatcher:IEventDispatcher;
        
    public function handleGetPollsReply(msg:Object):void {
      trace(LOG + "*** getPollsReply " + msg.msg + " **** \n");
      var polls:Array = JSON.parse(msg.msg) as Array;
      
      trace(LOG + "*** getPollsReply " + polls.length + " **** \n");
      
      for (var i:int = 0; i < polls.length; i++) {
        var map:Object = polls[i];
        var id:String = map.id;
        var title:String = map.title;
        var started:Boolean = map.started;
        var stopped:Boolean = map.stopped;
        
        var questions:Array = map.questions as Array;
        
        var qs:Array = new Array();
        
        for (var j:int = 0; j < questions.length; j++) {
          qs.push(buildQuestion(questions[j]));
        }
        
        var poll:Poll = new Poll(id, title, qs, started, stopped);
        
        model.createPoll(poll);        
      }
      
      trace(LOG + "*** getPollsReply num polls = [" + model.getPolls().length + "] **** \n")
    }
    
    
    
    private function buildQuestion(question:Object):Question {
      var resps:Array = question.responses as Array;

      var _resps1:Array = buildResponses(resps);
      
      trace(LOG + "*** buildQuestion [" + question.id + "," + question.multiResponse + "," + question.question + "] **** \n")
      
      var _q1:Question = new Question(question.id, question.multiResponse, question.question, _resps1);
                 
      return _q1;
    }
    
    private function buildResponses(resps:Array):Array {
      
      var _resps1:Array = new Array();
      
      for (var i:int = 0; i < resps.length; i++) {
        var r:Object = resps[i];
        
        var responders:Array = buildResponders(r);
        
        _resps1.push(new Response(r.id, r.text, responders));
      }
      
      return _resps1;
    }
    
    private function buildResponders(response:Object):Array {
      var responders:Array = new Array();
      
      var users:Array = response.responders as Array;
      for (var k:int = 0; k < users.length; k++) {
        responders.push(new Responder(users[k].userID, users[k].name));
      }
      
      return responders;
    }
    
    public function handlePollResultUpdatedMesage(msg:Object):void {
      /*** Incoming message
       * {"response":{"pollID":"pollID-103","responses":[{"questionID":"q1","responseIDs":["0","1"]}]},"responder":{"userID":"enfjadjc5xnn","name":"RED"}}
       */
      
      trace(LOG + "*** Poll Result Update " + msg + " **** \n");

      if (msg.foo == undefined) {
        trace(LOG + "handlePollResultUpdatedMesage - No [foo] parameter.");
      }
      
      if (msg.msg == undefined) {
        trace(LOG + "handlePollResultUpdatedMesage - No [msg] parameter.");
        return;
      }
      
      trace(LOG + "*** Poll Result Update " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      
      if (map.response == undefined) {
        trace(LOG + "handlePollResultUpdatedMesage - No [response] parameter.");
        return;
      }
      
      var response:Object = map.response;
      
      if (response.pollID == undefined) {
        trace(LOG + "handlePollResultUpdatedMesage - No [response.pollID] parameter.");
        return;
      }
      
      if (map.responder == undefined || map.responder.userID == undefined || map.responder.name == undefined) {
        trace(LOG + "handlePollResultUpdatedMesage - No [responder] parameter.");
        return;
      }
      
      var responder:Responder = new Responder(map.responder.userID, map.responder.name);
      
      if (model.hasPoll(response.pollID)) {        
        if (response.responses == undefined) {
          trace(LOG + "handlePollResultUpdatedMesage - No [response.responses] parameter.");
          return;          
        }
        var responses:Array = response.responses as Array;
                    
        for (var j:int = 0; j < responses.length; j++) {
          var resp:Object = responses[j];
          if (resp.questionID == undefined || resp.responseIDs == undefined) {
            trace(LOG + "handlePollResultUpdatedMesage - No [response.questionID or response.responseIDs] parameter.");
            return;              
          }
          var questionID:String = resp.questionID;
          
          var responseIDs:Array = resp.responseIDs as Array;
          for (var i:int = 0; i < responseIDs.length; i++) {
            var respID:String = responseIDs[i] as String
            model.updateResults(response.pollID, questionID, respID, responder);
          }
        }
        
        if (UsersUtil.isMe(responder.userID)) {
          model.userHasResponded(response.pollID);
          dispatcher.dispatchEvent(new PollEvent(PollEvent.USER_RESPONDED, response.pollID));
        }
        
        trace(LOG + "*** handlePollResultUpdatedMesage pollID = [" + response.pollID + "] **** \n")
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_RESULTS_UPDATED, response.pollID));
      }      
    }
    
    public function handlePollCreatedMesage(msg:Object):void {
      trace(LOG + "*** Poll Created " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);
      
      if (! model.hasPoll(map.id)) {        
        var id:String = map.id;
        var title:String = map.title;
        var questions:Array = map.questions as Array;
        
        var qs:Array = new Array();
        
        for (var j:int = 0; j < questions.length; j++) {
          qs.push(buildQuestion(questions[j]));
        }
        
        var poll:Poll = new Poll(id, title, qs, false, false);
        
        model.createPoll(poll);
        
        trace(LOG + "*** Poll Created id=[" + map.id + "] title=[" + map.title + "] questions = [" + questions.length + "] **** \n");
        trace(LOG + "*** handlePollCreatedMesage num polls = [" + model.getPolls().length + "] **** \n")
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_CREATED, poll.id));        
      }
    }
    
    public function handlePollUpdatedMesage(msg:Object):void {
      trace(LOG + "*** Poll updated " + msg.msg + " **** \n");

      var map:Object = JSON.parse(msg.msg);
      
      if (model.hasPoll(map.id)) {        
        var id:String = map.id;
        var title:String = map.title;
        var questions:Array = map.questions as Array;
        
        var qs:Array = new Array();
        
        for (var j:int = 0; j < questions.length; j++) {
          qs.push(buildQuestion(questions[j]));
        }
        
        var poll:Poll = new Poll(id, title, qs, false, false);
        
        model.updatePoll(poll);
        
        trace(LOG + "*** Poll updated id=[" + map.id + "] title=[" + map.title + "] questions = [" + questions.length + "] **** \n");

        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_UPDATED, poll.id));        
      }
    }    
    
    public function handlePollDestroyedMesage(msg:Object):void {
      trace(LOG + "*** Poll destroyed " + msg.msg + " **** \n");
   
      var map:Object = JSON.parse(msg.msg);
      var pollID:String = map.pollID;
      
      trace(LOG + "*** Destroying " + pollID + " **** \n");
      if (model.hasPoll(pollID)) {
        model.destroyPoll(pollID);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_DESTROYED, pollID));        
      }

    } 
    
    public function handlePollStartedMesage(msg:Object):void {
      trace(LOG + "*** Poll started " + msg.msg + " **** \n");
      
      var map:Object = JSON.parse(msg.msg);
      var pollID:String = map.pollID;
      
      if (model.hasPoll(pollID)) {
        model.startPoll(pollID);
      
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STARTED, pollID));        
      }
      
    }
    
    public function handlePollStoppedMesage(msg:Object):void {
      trace(LOG + "*** Poll stopped " + msg.msg + " **** \n");
      var map:Object = JSON.parse(msg.msg);
      var pollID:String = map.pollID;
      
      if (model.hasPoll(pollID)) {
        model.stopPoll(pollID);
      
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STOPPED, pollID));        
      }
    }
  }
}
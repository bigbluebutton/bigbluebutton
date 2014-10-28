package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.ResultVO;

  public class Question
  {
    private var _id: String;
    private var _multiResponse:Boolean;
    private var _question:String;
    private var _responses:Array;

    public function Question(id:String, multiResponse:Boolean, question:String, responses:Array) {
      _id = id;
      _multiResponse = multiResponse;
      _question = question;
      _responses = responses;
    }

    public function get id():String {
      return _id;
    }
    
    public function get multiResponse():Boolean {
        return _multiResponse;
    }
    
    public function get question():String {
      return _question;
    }
    
    public function updateResult(responseID:String, responder:Responder):void {
      for (var i:int = 0; i < _responses.length; i++) {
        var r:Response = _responses[i] as Response;
        if (r.id == responseID) r.addResponder(responder);
      }
    }
    
    public function get responses():Array {
      return _responses;
    }
  }
}
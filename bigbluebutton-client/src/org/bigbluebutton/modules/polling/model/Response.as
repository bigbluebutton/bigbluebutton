package org.bigbluebutton.modules.polling.model
{
  public class Response
  {
    private var _id:String;
    private var _response:String;
    
    private var _responders:Array;
    
    public function Response(id:String, response:String, responders:Array)
    {
      _id = id;
      _response = response;
      _responders = responders;
    }
    
    public function addResponder(r:Responder):void {
      _responders.push(r);
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get response():String {
      return _response;
    }
    
    public function get numResponses():int {
      return _responders.length;
    }
  }
}
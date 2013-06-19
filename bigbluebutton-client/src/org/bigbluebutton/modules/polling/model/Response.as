package org.bigbluebutton.modules.polling.model
{
  public class Response
  {
    private var _id:String;
    private var _response:String;
    
    private var _responseCount:int = 0;
    
    public function Response(id:String, response:String)
    {
      _id = id;
      _response = response;
    }
    
    public function updateResult(count:int):void {
      _responseCount = count;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get response():String {
      return _response;
    }
    
    public function get numResponses():int {
      return _responseCount;
    }
  }
}
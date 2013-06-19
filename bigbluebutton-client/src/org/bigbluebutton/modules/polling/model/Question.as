package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.ResultVO;

  public class Question
  {
    private var _id: String;
    private var _questionType:String;
    private var _question:String;
    private var _responses:Array;
    
    public function Question()
    {
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get type():String {
        return _questionType;
    }
    
    public function get question():String {
      return _question;
    }
    
    public function updateResult(responseID:String, count:int):void {
      for (var i:int = 0; i < _responses.length; i++) {
        var r:Response = _responses[i] as Response;
        if (r.id == responseID) r.updateResult(count);
      }
    }
  }
}
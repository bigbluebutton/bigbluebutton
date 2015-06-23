package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.polling.vo.ResultVO;
  import org.bigbluebutton.modules.polling.vo.ResultsVO;

  public class SimplePoll
  {
    private var _id:String;
    private var _questions: Array;
     
    public function SimplePoll(id:String, questions:Array)
    {
      _id = id;
      _questions = questions;
    }
        
    public function get id():String {
      return _id;
    }
    

    public function questions():Array {
      return _questions;
    }
    
  }
}
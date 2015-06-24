package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
 
  public class SimplePollResult
  {
    private var _id:String;
    private var _answers: Array;
     
    public function SimplePollResult(id:String, answers:Array)
    {
      _id = id;
      _answers = answers;
    }
        
    public function get id():String {
      return _id;
    }
    

    public function get answers():Array {
      return _answers;
    }
    
  }
}
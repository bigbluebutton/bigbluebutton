package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;

  public class SimplePoll
  {
    private var _id:String;
    private var _answers: Array;
     
    public function SimplePoll(id:String, answers:Array)
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
package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;

  public class Poll
  {
    private var _id:String;
    private var _title:String;
    private var _questions: Array;
    
    public var started:Boolean = false;
    public var stopped:Boolean = false;
    
    public function Poll(id:String, title:String, questions:Array)
    {
      _id = id;
      _title = title;
      _questions = questions;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function get title():String {
      return _title;
    }
  }
}
package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;

  public class SimpleAnswer
  {
    private var _id:Number;
    private var _key: String;
     
    public function SimpleAnswer(id:Number, key:String)
    {
      _id = id;
      _key = key;
    }
        
    public function get id():Number {
      return _id;
    }
    

    public function get key():String {
      return _key;
    }
    
  }
}
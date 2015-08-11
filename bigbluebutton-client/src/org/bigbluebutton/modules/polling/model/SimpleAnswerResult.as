package org.bigbluebutton.modules.polling.model
{
  import mx.collections.ArrayCollection;
  
  public class SimpleAnswerResult
  {
    private var _id:Number;
    private var _key: String;
    private var _numVotes:Number;
     
    public function SimpleAnswerResult(id:Number, key:String, numVotes:Number)
    {
      _id = id;
      _key = key;
      _numVotes = numVotes;
    }
        
    public function get id():Number {
      return _id;
    }
    

    public function get key():String {
      return _key;
    }
    
    public function get numVotes():Number {
      return _numVotes;
    }
    
  }
}
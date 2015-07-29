package org.bigbluebutton.modules.polling.model
{

  public class SimplePollResult
  {
    private var _id:String;
    private var _answers: Array;
    private var _numRespondents: int;
	private var _numResponders: int;
	
    public function SimplePollResult(id:String, answers:Array, numRespondents: int, numResponders: int)
    {
      _id = id;
      _answers = answers;
	  _numRespondents = numRespondents;
	  _numResponders = numResponders;
    }
        
    public function get id():String {
      return _id;
    }
    

    public function get answers():Array {
      return _answers;
    }
    
	public function get numRespondents():int {
		return _numRespondents;
	}
	
	public function get numResponders():int {
		return _numResponders;
	}
  }
}
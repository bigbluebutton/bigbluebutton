package org.bigbluebutton.modules.polling.vo
{
  public class CreatePollVO
  {
    private var _title:String;
    private var _questions:Array;
    
    public function CreatePollVO(title:String, questions:Array)
    {
      this._title = title;
      this._questions = questions;
    }
  }
}
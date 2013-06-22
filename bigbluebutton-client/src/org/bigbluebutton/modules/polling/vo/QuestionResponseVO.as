package org.bigbluebutton.modules.polling.vo
{
  public class QuestionResponseVO
  {
    public var id:String;
    public var responses:Array = new Array();
    
    public function QuestionResponseVO(id:String, responses:Array)
    {
      this.id = id;
      this.responses = responses;
    }
  }
}
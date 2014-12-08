package org.bigbluebutton.modules.polling.model
{
  /**
  * Wrapper class that provide read-only access to a poll question.
  */
  public class QuestionVO
  {
    private var _question:Question;
    
    public function QuestionVO(question:Question)
    {
      _question = question;
    }
    
    public function get id():String {
      return _question.id;
    }
    
    public function get question():String {
      return _question.question;
    }
    
    public function get multiResponse():Boolean {
      return _question.multiResponse;
    }
    
    public function get answers():Array {
      return _question.responses;
    }
  }
}
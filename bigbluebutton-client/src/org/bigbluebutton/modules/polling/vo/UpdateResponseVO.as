package org.bigbluebutton.modules.polling.vo
{
  public class UpdateResponseVO
  {
    public var id:String;
    public var response:String;
    
    public function UpdateResponseVO(id:String, response:String) {
      this.id = id;
      this.response = response;
    }
  }
}
package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class IsUserPublishingCamRequest extends Event
  {
    public static const IS_USER_PUBLISHING_CAM_REQ:String = "is user publishing webcam request event";
      
    public var userID:String;
    
    public function IsUserPublishingCamRequest(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(IS_USER_PUBLISHING_CAM_REQ, bubbles, cancelable);
    }
  }
}
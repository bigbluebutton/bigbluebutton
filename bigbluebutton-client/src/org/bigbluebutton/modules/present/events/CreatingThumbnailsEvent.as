package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class CreatingThumbnailsEvent extends Event
  {
    public static const CREATING_THUMBNAILS:String = "presentation creating thumbnails event";
    
    public function CreatingThumbnailsEvent()
    {
      super(CREATING_THUMBNAILS, true, false);
    }
  }
}
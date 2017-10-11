package org.bigbluebutton.core.model.users
{
  import com.adobe.utils.ArrayUtil;
  
  import flash.events.EventDispatcher;
  
  public class User2x extends EventDispatcher {
    public var intId: String;
    public var extId: String;
    public var name: String;
    [Bindable] public var role: String;
    public var guest: Boolean;
    public var authed: Boolean;
    public var waitingForAcceptance: Boolean;
    public var emoji: String;
    public var locked: Boolean;
    public var presenter: Boolean;
    public var avatar: String;
    
    public var breakoutRooms: Array = new Array();
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
        
    public static function copy(source: User2x):User2x {
      var dest: User2x = new User2x();
      dest.intId = source.intId;
      dest.extId = source.extId;
      dest.name = source.name;
      dest.role = source.role;
      dest.guest = source.guest;
      dest.authed = source.authed;
      dest.waitingForAcceptance = source.waitingForAcceptance;
      dest.emoji = source.emoji;
      dest.locked = source.locked;
      dest.presenter = source.presenter;
      dest.avatar = source.avatar;
      dest.breakoutRooms = ArrayUtil.copyArray(source.breakoutRooms); 
      dest.isLeavingFlag = source.isLeavingFlag;
      
      return dest;
    }
  }
}
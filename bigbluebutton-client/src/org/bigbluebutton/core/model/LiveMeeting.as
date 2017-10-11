package org.bigbluebutton.core.model
{
  import org.bigbluebutton.core.model.users.GuestsApp;
  import org.bigbluebutton.core.model.users.Users2x;
  import org.bigbluebutton.core.model.users.VoiceUsers2x;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;
  
  public class LiveMeeting
  {
    private static var instance: LiveMeeting = null;
    
    public var me: Me = new Me();
    public var webcams: Webcams = new Webcams();
    public var voiceUsers: VoiceUsers2x = new VoiceUsers2x();
    public var users: Users2x = new Users2x();
    public var guestsWaiting: GuestsApp = new GuestsApp();
    public var meetingStatus: MeetingStatus = new MeetingStatus();
    public var meeting: Meeting = new Meeting();
    public var config: Config;
    public var sharedNotes: SharedNotes = new SharedNotes();
    
    public var breakoutRooms: BreakoutRooms = new BreakoutRooms();
    public var whiteboardModel: WhiteboardModel = new WhiteboardModel();
    
    public function LiveMeeting(enforcer: LiveMeetingSingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 LiveMeeting instance");
      }
    }
    
    public static function inst():LiveMeeting{
      if (instance == null){
        instance = new LiveMeeting(new LiveMeetingSingletonEnforcer());
      }
      return instance;
    }
  }
}

class LiveMeetingSingletonEnforcer{}
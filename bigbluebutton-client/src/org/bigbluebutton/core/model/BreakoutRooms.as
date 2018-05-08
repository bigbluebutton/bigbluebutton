package org.bigbluebutton.core.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  import mx.collections.Sort;
  import mx.collections.SortField;
  
  import org.bigbluebutton.core.events.BreakoutRoomsListUpdatedEvent;
  import org.bigbluebutton.core.events.BreakoutRoomsReadyEvent;
  import org.bigbluebutton.main.model.users.BreakoutRoom;
  
  public class BreakoutRooms
  {
    private var dispatcher:Dispatcher = new Dispatcher();
    
    private var _breakoutRooms:ArrayCollection = new ArrayCollection();
    
    private var _breakoutRoomsReady:Boolean = false;
    
    public function set breakoutRoomsReady(value: Boolean): void {
      _breakoutRoomsReady = value;
      dispatcher.dispatchEvent(new BreakoutRoomsReadyEvent());
    }
    
    public function get breakoutRoomsReady(): Boolean {
      return _breakoutRoomsReady;
    }
    
    public function get breakoutRooms():ArrayCollection {
      return _breakoutRooms;
    }
    
    public function removeBreakoutRoom(breakoutMeetingId:String):void {
      var room:Object = getBreakoutRoomIndex(breakoutMeetingId);
      if (room != null) {
        _breakoutRooms.removeItemAt(room.index);
        sortBreakoutRooms();
        if (_breakoutRooms.length == 0) {
          breakoutRoomsReady = false;
        }
        dispatcher.dispatchEvent(new BreakoutRoomsListUpdatedEvent());
      }
    }
    
    /* Breakout room feature */
    public function addBreakoutRoom(newRoom:BreakoutRoom):void {
      if (hasBreakoutRoom(newRoom.meetingId)) {
        removeBreakoutRoom(newRoom.meetingId);
      }
      _breakoutRooms.addItem(newRoom);
      sortBreakoutRooms();
      
      dispatcher.dispatchEvent(new BreakoutRoomsListUpdatedEvent());
    }
    
    public function setLastBreakoutRoomInvitation(sequence:int):void {
      var aRoom:BreakoutRoom;
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        aRoom = _breakoutRooms.getItemAt(i) as BreakoutRoom;
        if (aRoom.sequence != sequence) {
          aRoom.invitedRecently = false;
        } else {
          aRoom.invitedRecently = true;
        }
      }
      sortBreakoutRooms();
      dispatcher.dispatchEvent(new BreakoutRoomsListUpdatedEvent());
    }
    
    public function sortBreakoutRooms() : void {
      var sort:Sort = new Sort();
      sort.fields = [new SortField("sequence", true, false, true)];
      _breakoutRooms.sort = sort;
      _breakoutRooms.refresh();
    }
    
    /**
     * Returns a breakout room by its internal meeting ID
     */
    public function getBreakoutRoom(breakoutMeetingId:String):BreakoutRoom {
      var r:Object = getBreakoutRoomIndex(breakoutMeetingId);
      if (r != null) {
        return r.room as BreakoutRoom;
      }
      return null;
    }
    
    public function getBreakoutRoomByExternalId(externalId:String):BreakoutRoom {
      var aRoom:BreakoutRoom;
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        aRoom = _breakoutRooms.getItemAt(i) as BreakoutRoom;
        if (aRoom.externalMeetingId == externalId) {
          return aRoom;
        }
      }
      return null;
    }
    
    
    public function getBreakoutRoomBySequence(sequence:int):BreakoutRoom {
      var aRoom:BreakoutRoom;
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        aRoom = _breakoutRooms.getItemAt(i) as BreakoutRoom;
        if (aRoom.sequence == sequence) {
          return aRoom;
        }
      }
      return null;
    }
    
    /**
     * Finds the index of a breakout room by its internal meeting ID
     */
    public function getBreakoutRoomIndex(breakoutMeetingId:String):Object {
      var aRoom:BreakoutRoom;
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        aRoom = _breakoutRooms.getItemAt(i) as BreakoutRoom;
        if (aRoom.meetingId == breakoutMeetingId) {
          return {index: i, room: aRoom};
        }
      }
      // Breakout room not found.
      return null;
    }
    
    public function hasBreakoutRoom(breakoutMeetingId:String):Boolean {
      var p:Object = getBreakoutRoomIndex(breakoutMeetingId);
      if (p != null) {
        return true;
      }
      return false;
    }
    
    public function updateUsers(breakoutId: String, users: Array): void {
      var breakout: BreakoutRoom = getBreakoutRoom(breakoutId);
      if (breakout != null) {
		breakout.initUsers();
        if (users != null) {
          for (var i: int = 0; i < users.length; i++) {
            var user: Object = users[i] as Object;
            var buser: BreakoutUser = new BreakoutUser(user.id, user.name);
            breakout.addUser(buser);
          }
        }
      }
    }
    
    public function setBreakoutRoomInListen(listen:Boolean, breakoutMeetingId:String):void {
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        var br:BreakoutRoom = BreakoutRoom(_breakoutRooms.getItemAt(i));
        if (listen == false) {
          br.listenStatus = BreakoutRoom.NONE;
        } else if (listen == true && br.meetingId == breakoutMeetingId) {
          br.listenStatus = BreakoutRoom.SELF;
        } else {
          br.listenStatus = BreakoutRoom.OTHER;
        }
      }
      dispatcher.dispatchEvent(new BreakoutRoomsListUpdatedEvent());
    }
    
    public function isListeningToBreakoutRoom(breakoutMeetingId:String):Boolean {
      var room:BreakoutRoom = getBreakoutRoom(breakoutMeetingId);
      return room != null && room.listenStatus == BreakoutRoom.SELF;
    }
    
    public function resetBreakoutRooms():void {
      for (var i:int = 0; i < _breakoutRooms.length; i++) {
        var br:BreakoutRoom = BreakoutRoom(_breakoutRooms.getItemAt(i));
        br.listenStatus = BreakoutRoom.NONE;
      }
      
      dispatcher.dispatchEvent(new BreakoutRoomsListUpdatedEvent());
    }
	
	public function haveFreeJoinRooms():Boolean {
		for (var i:int = 0; i < _breakoutRooms.length; i++) {
			var br:BreakoutRoom = BreakoutRoom(_breakoutRooms.getItemAt(i));
			if (br.freeJoin) {
				return true;
			}
		}
		return false;
	}
  }
}
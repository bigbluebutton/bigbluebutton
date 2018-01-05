package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection; 
  import org.as3commons.lang.ArrayUtils;
  import org.as3commons.lang.StringUtils;
  
  public class Users2x
  {
    
    private var _users:ArrayCollection = new ArrayCollection();
    private var _presenterGroup:ArrayCollection = new ArrayCollection();

    public function getUsers(): ArrayCollection {
      return new ArrayCollection(_users.toArray());
    }
    
    public function add(user: User2x):void {
      _users.addItem(user);
    }
    
    public function remove(userId: String):User2x {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _users.removeItemAt(index) as User2x;
      }
      
      return null;
    }
    
    public function getUserAndIndex(userId: String):Object {
      var user:User2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User2x;
        
        if (user.intId == userId) {
          return {index:i, user:user};
        }
      }
      
      return null;      
    }
    
    public function getUser(userId:String):User2x {
      var user:User2x;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User2x;
        
        if (user.intId == userId) {
          return user;
        }
      }
      
      return null;
    }
    
    public function getUserWithExtId(extId:String):User2x {
      var user:User2x;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User2x;
        
        if (user.extId == extId) {
          return user;
        }
      }
      
      return null;
    }
    
    
    
    public function getIndex(userId: String):int {
      var user:User2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User2x;
        
        if (user.intId == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function getPresenter():User2x {
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        
        if (user.presenter) {
          return user;
        }
      }
      
      return null;
    }
    
    public function getUserIds():Array {
      var temp:Array = new Array();
      
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        temp.push(user.intId);
      }
      
      return temp;
    }
    
    public function getAvatar(userId:String):String {
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        
        if (user.intId == userId) {
          return user.avatar;
        }
      }
      
      return null;
    }
    
    public function getPresenters(): Array {
      var temp: Array = new Array();
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        if (user.presenter) {
          temp.push(user.intId);
        }
      }
      
      return temp;
    }


    public function getPresenterGroup(): ArrayCollection {
			var temp: Array = new Array();
			for (var i:int = 0; i < _users.length; i++) {
				var user:User2x = _users.getItemAt(i) as User2x;
				if (user.presenter) {
					temp.push(user.intId);
				}
			}
			
			return new ArrayCollection(temp);
    }

    public function addToPresenterGroup(userId: String):void {
      _presenterGroup.addItem(userId);
    }

    public function removeFromPresenterGroup(userId: String): void {
      for (var i:int = 0; i < _presenterGroup.length; i++) {
        if (_presenterGroup.getItemAt(i) == userId) {
          _presenterGroup.removeItemAt(i);
          return;
        }
      }
    }

    public function isUserInPresentationGroup(userId: String): Boolean {
      for (var i:int = 0; i < _presenterGroup.length; i++) {
        if (_presenterGroup.getItemAt(i) == userId) {
          return true;
        }
      }

      return false;
    }
    
    public function isAnyUserLocked(): Boolean {
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        if (user.locked) {
          return true;
        }
      } 
      
      return false;
    }
    
    public function setRoleForUser(userId: String, role: String): void {
      for (var i:int = 0; i < _users.length; i++) {
        var user:User2x = _users.getItemAt(i) as User2x;
        if (user.intId == userId) {
          user.role = role;
        }
      } 
	}
	
	public function updateBreakoutRooms(roomSequence:int, users:Array):void {
		var user : User2x;
		var updateUsers:Array = [];
		// Step 1 - Update users breakout rooms
		for (var i : int = 0; i < users.length; i++) {
			var userId:String = StringUtils.substringBeforeLast(users[i].id, "-");
			user = getUser(userId);
			if (user != null && !ArrayUtils.contains(user.breakoutRooms, roomSequence)) {
				user.breakoutRooms.push(roomSequence);
			}
			updateUsers.push(userId);
		}
		// Step 2 - Remove users breakout rooms if the users left the breakout rooms
		for (var j:int = 0; j < _users.length; j++) {
			user = _users.getItemAt(j) as User2x;
			if (updateUsers.indexOf(user.intId) == -1 && ArrayUtils.contains(user.breakoutRooms, roomSequence)) {
				user.breakoutRooms.splice(user.breakoutRooms.indexOf(roomSequence), 1);
			}
		}
	}
	
	public function removeBreakoutRoomFromUsers(roomSequence: int):void {			
		// Remove breakout room number display from users
		for (var i:int; i < _users.length; i++) {
			if (ArrayUtils.contains(User2x(_users[i]).breakoutRooms, roomSequence)) {
				User2x(_users[i]).breakoutRooms.splice(User2x(_users[i]).breakoutRooms.indexOf(roomSequence), 1);
			}
		}
	}
  }
}


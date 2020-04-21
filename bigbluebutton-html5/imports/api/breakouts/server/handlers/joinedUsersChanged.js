import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function joinedUsersChanged({ body }) {
  check(body, Object);

  const {
    parentId,
    breakoutId,
    joinedUsers,
    ejectedUsers
  } = body;

  check(parentId, String);
  check(breakoutId, String);
  check(joinedUsers, Array);
  check(ejectedUsers, Array);


  const selector = {
    parentMeetingId: parentId,
    breakoutId,
  };

  //TODO: change this.
  // let assignedUsers  = ejectedUsers;
  const usersMapped = joinedUsers.map(user => ({ userId: user.id, name: user.name }));

  console.log("joinedUsers.length" + joinedUsers.length);
  console.log("ejectedUsers.length" + ejectedUsers.length);

 // const assignedUsersMapped = assignedUsers.map(user => ({ userId: user.id, name: user.name }));
  //const ejectedUsersMapped = ejectedUsers.map(user => ({userId: user.id}));
 //console.log("ejectedUsersMapped.length" + ejectedUsersMapped.length);

 var modifier = "";
 if(ejectedUsers.length > 0){


  const ejectedUsersMapped = ejectedUsers.map(user => ({ userId: user.id}));

    //  var userSelectionString = "{";
    //  for (let index = 0; index < ejectedUsers.length; index++) {
    //   userSelectionString  = userSelectionString + "userId:" + ejectedUsers[index].id+",";
    //  }

    //  userSelectionString = userSelectionString + "}";
    //  console.log("userSelectionString: " + userSelectionString);
     modifier = {
      $set: {
        joinedUsers: usersMapped
      },
      $pull: {
        // users: { $elemMatch: ejectedUsersMapped}
        users: { userId: ejectedUsers[0].id}
      }
    }
  }else{
    modifier = {
      $set: {
        joinedUsers: usersMapped
      }
    }
  }
 

  const cb = (err) => {
    if (err) {
      return Logger.error(`updating joined users in breakout: ${err}`);
    }

    return Logger.info('Updated joined users '
      + `in breakout id=${breakoutId}`);
  };

  Breakouts.find(selector);
  Breakouts.update(selector, modifier, cb);
}

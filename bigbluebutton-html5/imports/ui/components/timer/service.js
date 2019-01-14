import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import mapUser from '/imports/ui/services/user/mapUser';
import {EMOJI_STATUSES} from '/imports/utils/statuses';
import {makeCall} from '/imports/ui/services/api';

const getCurrentUser = () => {
    const currentUserId = Auth.userID;
    const currentUser = Users.findOne({userId: currentUserId});

    return (currentUser) ? mapUser(currentUser) : null;
};

const increaseTime = (minute, second) => {
    if (minute < 0 || second < 0) {
        throw Error("Minute or second in time can't be negative.");
    }
    if (second === 59) {
        minute++;
        second = 0;
    } else second++;
    return [minute, second];
};

const formatTimeInterval = (time) => time.toString().length === 1 ? "0" + time : time;

export default {
    getCurrentUser,
    increaseTime,
    formatTimeInterval,
};

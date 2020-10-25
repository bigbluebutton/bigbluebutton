import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import Language from "../../components/translations/LanguageField/component";
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings/index.js'

class MeetingService {
    findBreakouts = () => {
        const BreakoutRooms = Breakouts.find({
            parentMeetingId: Auth.meetingID,
        }, {
            sort: {
                sequence: 1,
            },
        }).fetch();

        return BreakoutRooms;
    };

    getCurrentMeeting = () => Meetings.findOne({ meetingId: Auth.meetingID });

    getLanguages () {
        let returningMeetingLanguages = []
        let currentMeeting = this.getCurrentMeeting();
        if('languages' in currentMeeting) {
            returningMeetingLanguages = currentMeeting.languages;
        }

        return returningMeetingLanguages;
    }

    setLanguages( languageDesignations ) {
        makeCall('setLanguages', languageDesignations)
    }
}

const MeetingSingleton = new MeetingService();
export default MeetingSingleton;
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
        const meeting = Meetings.findOne(
            { meetingId: Auth.meetingID },
            { fields: { 'languages': 1 } });
        if('languages' in currentMeeting) {
            returningMeetingLanguages = currentMeeting.languages;
        }

        return returningMeetingLanguages;
    }

    setLanguages( languageDesignations ) {
        makeCall('setLanguages', languageDesignations)
    }

    isBreakout() {
        const meeting = Meetings.findOne(
            { meetingId: Auth.meetingID },
            { fields: { 'meetingProp.isBreakout': 1 } });
        return (meeting && meeting.meetingProp.isBreakout);
    }
}

const MeetingSingleton = new MeetingService();
export default MeetingSingleton;
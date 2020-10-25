import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import Language from "../../components/translations/LanguageField/component";
import { makeCall } from '/imports/ui/services/api';

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

    setLanguages( languageDesignations ) {
        makeCall('setLanguages', languageDesignations)
    }
}

const MeetingSingleton = new MeetingService();
export default MeetingSingleton;
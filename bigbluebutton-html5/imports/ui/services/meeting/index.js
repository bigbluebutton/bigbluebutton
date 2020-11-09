import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import Language from "../../components/translations/LanguageField/component";
import {makeCall} from '/imports/ui/services/api';
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

    getCurrentMeeting = () => Meetings.findOne({meetingId: Auth.meetingID});

    async getLanguages() {
        let meetingId = Auth.meetingID;
        let meeting;
        let meetingLanguages = []
        if (this.isBreakout()) {
            meeting = await makeCall("getParentMeeting")
        } else {
            meeting = Meetings.findOne(
                {meetingId: meetingId},
                {fields: {'languages': 1}});
        }


        if (meeting && 'languages' in meeting) {
            meetingLanguages = meeting.languages;
        }

        return meetingLanguages;
    }

    clearLanguages() {
        this.setLanguages([]);
    }

    setLanguages(languageDesignations) {
        makeCall('setLanguages', languageDesignations)
    }

    changeTranslatorSpeackState(languageExtension, isSpeaking) {
        makeCall('translatorSpeakStateChange', languageExtension, isSpeaking);
    }

    isBreakout() {
        const meeting = Meetings.findOne(
            {meetingId: Auth.meetingID},
            {fields: {'meetingProp.isBreakout': 1}});
        return (meeting && meeting.meetingProp.isBreakout);
    }

    isTranslatorSpeaking(languageExtension) {
        const meeting = Meetings.findOne(
            {meetingId: Auth.meetingID},
            {fields: {'languages': 1}});
        return meeting.languages.find(language => language.extension === languageExtension).translatorIsSpeaking;
    }
}

const MeetingSingleton = new MeetingService();
export default MeetingSingleton;

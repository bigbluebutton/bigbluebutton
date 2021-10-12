import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
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
        return this.getLanguagesSync();
    }

    getLanguagesSync() {
        let meeting = Meetings.findOne(
            { meetingId: Auth.meetingID },
            { fields: { 'languages': 1 } });

        return meeting?.languages ?? [];
    }

    hasLanguages() {
        let hasLanguages = false;
        const languages = this.getLanguagesSync();
        if (Array.isArray(languages)) {
            if (languages.length > 0) {
                hasLanguages = true;
            }
        }

        return hasLanguages;
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
        if (Array.isArray(meeting) && meeting.length > 0) {
                return meeting.languages.find(language => language.extension === languageExtension).translatorIsSpeaking;
        }
        return false;

    }
}

const MeetingSingleton = new MeetingService();
export default MeetingSingleton;

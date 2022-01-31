import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';

export default function translatorSpeakStateChange(languageExtension, isSpeaking) {
    const { meetingId } = extractCredentials(this.userId);
    let query = {
        meetingId: meetingId,
        "languages.extension": languageExtension
    };
    if(isSpeaking === false){
        query["languages.translatorIsSpeaking"] =  true;
    }
    Meetings.update(
        query,
        { $set: {
                "languages.$.translatorIsSpeaking": isSpeaking,
                "languages.$.translatorSpeakingUtcTimestamp": Date.now()}},
        (error) => {
            if(error) {
                Logger.error("Translator for language="+languageExtension+" is speaking="+isSpeaking+".",  error);
            }
        }
    );
}

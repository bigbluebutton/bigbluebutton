import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';

export default function translatorSpeakStateChange(languageExtension, isSpeaking) {
    const { meetingId } = extractCredentials(this.userId);

    Meetings.update(
        { meetingId: meetingId, "languages.extension": languageExtension },
        { $set: {"languages.$.translatorIsSpeaking": isSpeaking}},
        (error) => {
            if(error) {
                Logger.error("Translator for language="+languageExtension+" is speaking="+isSpeaking+".",  error);
            }
        }
    );
}
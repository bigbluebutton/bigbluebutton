import addSystemMsg from '/imports/api/group-chat-msg/server/modifiers/addSystemMsg';
import Presentations from '/imports/api/presentations';

const DEFAULT_FILENAME = 'annotated_slides.pdf';

export default async function sendExportedPresentationChatMsg(meetingId, presentationId, fileURI) {
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const CHAT_EXPORTED_PRESENTATION_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_exported_presentation;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  const pres = await Presentations.findOneAsync({ meetingId, id: presentationId });

  const extra = {
    type: 'presentation',
    fileURI,
    filename: pres?.name || DEFAULT_FILENAME,
  };

  const payload = {
    id: `${SYSTEM_CHAT_TYPE}-${CHAT_EXPORTED_PRESENTATION_MESSAGE}`,
    timestamp: Date.now(),
    correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
    sender: {
      id: PUBLIC_CHAT_SYSTEM_ID,
      name: '',
    },
    message: '',
    extra,
  };
  const result = await addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
  return result;
}

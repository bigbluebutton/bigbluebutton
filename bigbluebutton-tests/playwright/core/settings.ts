import type { Page } from '@playwright/test';

export interface Settings {
  reactionsButton?: boolean;
  sharedNotesEnabled?: boolean;
  directLeaveButton?: boolean;
  // Audio
  autoJoinAudioModal?: boolean;
  listenOnlyMode?: boolean;
  forceListenOnly?: boolean;
  skipEchoTest?: boolean;
  skipEchoTestOnJoin?: boolean;
  skipEchoTestIfPreviousDevice?: boolean;
  speechRecognitionEnabled?: boolean;
  // Chat
  chatEnabled?: boolean;
  publicChatOptionsEnabled?: boolean;
  maxMessageLength?: number;
  emojiPickerEnabled?: boolean;
  autoConvertEmojiEnabled?: boolean;
  // Polling
  pollEnabled?: boolean;
  pollChatMessage?: boolean;
  quickPollConfirmationStep?: boolean;
  // Presentation
  originalPresentationDownloadable?: boolean;
  presentationWithAnnotationsDownloadable?: boolean;
  externalVideoPlayer?: boolean;
  presentationHidden?: boolean;
  // Screensharing
  screensharingEnabled?: boolean;
  // Timeouts
  listenOnlyCallTimeout?: number;
  videoPreviewTimeout?: number;
  // Webcam
  webcamSharingEnabled?: boolean;
  skipVideoPreview?: boolean;
  skipVideoPreviewOnFirstJoin?: boolean;
  skipVideoPreviewIfPreviousDevice?: boolean;
  // Emoji
  emojiRain?: boolean;
  // Whiteboard
  allowInfiniteWhiteboard?: boolean;
}

let settings: Settings | undefined;

export async function generateSettingsData(page: Page): Promise<Settings | undefined> {
  if (settings || !page) return settings;

  try {
    const settingsData = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).meetingClientSettings.public;
    });

    settings = {
      reactionsButton: settingsData.app?.reactionsButton?.enabled,
      sharedNotesEnabled: settingsData.notes?.enabled,
      directLeaveButton: settingsData.app?.defaultSettings?.application?.directLeaveButton,
      // Audio
      autoJoinAudioModal: settingsData.app?.autoJoin,
      listenOnlyMode: settingsData.app?.listenOnlyMode,
      forceListenOnly: settingsData.app?.forceListenOnly,
      skipEchoTest: settingsData.app?.skipCheck,
      skipEchoTestOnJoin: settingsData.app?.skipCheckOnJoin,
      skipEchoTestIfPreviousDevice: settingsData.app?.skipEchoTestIfPreviousDevice,
      speechRecognitionEnabled: settingsData.app?.audioCaptions?.enabled,
      // Chat
      chatEnabled: settingsData.chat?.enabled,
      publicChatOptionsEnabled: settingsData.chat?.enableSaveAndCopyPublicChat,
      maxMessageLength: settingsData.chat?.max_message_length,
      emojiPickerEnabled: settingsData.chat?.emojiPicker?.enable,
      autoConvertEmojiEnabled: settingsData.chat?.autoConvertEmoji,
      // Polling
      pollEnabled: settingsData.poll?.enabled,
      pollChatMessage: settingsData.poll?.chatMessage,
      quickPollConfirmationStep: settingsData.poll?.quickPollConfirmationStep,
      // Presentation
      originalPresentationDownloadable: settingsData.presentation?.allowDownloadOriginal,
      presentationWithAnnotationsDownloadable: settingsData.presentation?.allowDownloadWithAnnotations,
      externalVideoPlayer: settingsData.externalVideoPlayer?.enabled,
      presentationHidden: settingsData.layout?.hidePresentation,
      // Screensharing
      screensharingEnabled: settingsData.kurento?.enableScreensharing,
      // Timeouts
      listenOnlyCallTimeout: parseInt(settingsData.media?.listenOnlyCallTimeout, 10),
      videoPreviewTimeout: parseInt(settingsData.kurento?.gUMTimeout, 10),
      // Webcam
      webcamSharingEnabled: settingsData.kurento?.enableVideo,
      skipVideoPreview: settingsData.kurento?.skipVideoPreview,
      skipVideoPreviewOnFirstJoin: settingsData.kurento?.skipVideoPreviewOnFirstJoin,
      skipVideoPreviewIfPreviousDevice: settingsData.kurento?.skipVideoPreviewIfPreviousDevice,
      // Emoji
      emojiRain: settingsData.app?.emojiRain?.enabled,
      // Whiteboard
      allowInfiniteWhiteboard: settingsData.whiteboard?.allowInfiniteWhiteboard,
    };

    return settings;
  } catch (err) {
    console.log(`Unable to get public settings data: ${err}`);
    return undefined;
  }
}

export function getSettings(): Settings | undefined {
  return settings;
}

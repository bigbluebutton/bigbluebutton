let settings;

async function generateSettingsData(page) {
  if (settings || !page) return settings;

  try {
    const settingsData = await page.evaluate(() => {
      return window.meetingClientSettings.public;
    });

    settings = {
      reactionsButton: settingsData.app.reactionsButton.enabled,
      sharedNotesEnabled: settingsData.notes.enabled,
      directLeaveButton: settingsData.app.defaultSettings.application.directLeaveButton,
      // Audio
      autoJoinAudioModal: settingsData.app.autoJoin,
      listenOnlyMode: settingsData.app.listenOnlyMode,
      forceListenOnly: settingsData.app.forceListenOnly,
      skipEchoTest: settingsData.app.skipCheck,
      skipEchoTestOnJoin: settingsData.app.skipCheckOnJoin,
      skipEchoTestIfPreviousDevice: settingsData.app.skipEchoTestIfPreviousDevice,
      speechRecognitionEnabled: settingsData.app.audioCaptions.enabled,
      // Chat
      chatEnabled: settingsData.chat.enabled,
      publicChatOptionsEnabled: settingsData.chat.enableSaveAndCopyPublicChat,
      maxMessageLength: settingsData.chat.max_message_length,
      emojiPickerEnabled: settingsData.chat.emojiPicker.enable,
      autoConvertEmojiEnabled: settingsData.chat.autoConvertEmoji,
      // Polling
      pollEnabled: settingsData.poll.enabled,
      pollChatMessage: settingsData.poll.chatMessage,
      // Presentation
      originalPresentationDownloadable: settingsData.presentation.allowDownloadOriginal,
      presentationWithAnnotationsDownloadable: settingsData.presentation.allowDownloadWithAnnotations,
      externalVideoPlayer: settingsData.externalVideoPlayer.enabled,
      presentationHidden: settingsData.layout.hidePresentation,
      // Screensharing
      screensharingEnabled: settingsData.kurento.enableScreensharing,
      // Timeouts
      listenOnlyCallTimeout: parseInt(settingsData.media.listenOnlyCallTimeout),
      videoPreviewTimeout: parseInt(settingsData.kurento.gUMTimeout),
      // Webcam
      webcamSharingEnabled: settingsData.kurento.enableVideo,
      skipVideoPreview: settingsData.kurento.skipVideoPreview,
      skipVideoPreviewOnFirstJoin: settingsData.kurento.skipVideoPreviewOnFirstJoin,
      skipVideoPreviewIfPreviousDevice: settingsData.kurento.skipVideoPreviewIfPreviousDevice,
    }

    return settings;
  } catch (err) {
    console.log(`Unable to get public settings data: ${err}`);
  }
}

module.exports = exports = {
  getSettings: () => settings,
  generateSettingsData,
}

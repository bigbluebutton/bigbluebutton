let settings;

async function generateSettingsData(page) {
  if (settings || !page) return settings;

  try {
    const settingsData = await page.evaluate(() => {
      return Meteor.settings.public;
    });

    settings = {
      raiseHandButton: settingsData.app.raiseHandActionButton.enabled,
      sharedNotesEnabled: settingsData.notes.enabled,
      // Audio
      autoJoinAudioModal: settingsData.app.autoJoin,
      listenOnlyMode: settingsData.app.listenOnlyMode,
      forceListenOnly: settingsData.app.forceListenOnly,
      skipEchoTest: settingsData.app.skipCheck,
      skipEchoTestOnJoin: settingsData.app.skipCheckOnJoin,
      // Chat
      chatEnabled: settingsData.chat.enabled,
      publicChatOptionsEnabled: settingsData.chat.enableSaveAndCopyPublicChat,
      maxMessageLength: settingsData.chat.max_message_length,
      // Polling
      pollEnabled: settingsData.poll.enabled,
      pollChatMessage: settingsData.poll.chatMessage,
      // Presentation
      presentationDownloadable: settingsData.presentation.allowDownloadable,
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

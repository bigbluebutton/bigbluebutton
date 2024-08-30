import { MeetingClientSettings } from '../../Types/meetingClientSettings';

export const meetingClientSettingsInitialValues: MeetingClientSettings = {
  public: {
    app: {
      mobileFontSize: '16px',
      desktopFontSize: '14px',
      audioChatNotification: false,
      autoJoin: true,
      listenOnlyMode: true,
      forceListenOnly: false,
      skipCheck: false,
      skipCheckOnJoin: false,
      enableDynamicAudioDeviceSelection: true,
      clientTitle: 'BigBlueButton',
      appName: 'BigBlueButton HTML5 Client',
      bbbServerVersion: 'HTML5_FULL_BBB_VERSION',
      displayBbbServerVersion: true,
      copyright: '©2023 BigBlueButton Inc.',
      html5ClientBuild: 'HTML5_CLIENT_VERSION',
      helpLink: 'https://bigbluebutton.org/html5/',
      delayForUnmountOfSharedNote: 120000,
      bbbTabletApp: {
        enabled: true,
        iosAppStoreUrl: 'https://apps.apple.com/us/app/bigbluebutton-tablet/id1641156756',
        iosAppUrlScheme: 'bigbluebutton-tablet',
      },
      lockOnJoin: true,
      cdn: '',
      basename: '/html5client',
      bbbWebBase: '/bigbluebutton',
      learningDashboardBase: '/learning-analytics-dashboard',
      customStyleUrl: null,
      darkTheme: {
        enabled: true,
      },
      askForFeedbackOnLogout: false,
      askForConfirmationOnLeave: false,
      wakeLock: {
        enabled: true,
      },
      allowDefaultLogoutUrl: true,
      dynamicGuestPolicy: true,
      enableGuestLobbyMessage: true,
      guestPolicyExtraAllowOptions: false,
      alwaysShowWaitingRoomUI: true,
      enableLimitOfViewersInWebcam: false,
      enableMultipleCameras: true,
      enableCameraAsContent: true,
      enableWebcamSelectorButton: true,
      enableTalkingIndicator: true,
      enableCameraBrightness: true,
      mirrorOwnWebcam: false,
      viewersInWebcam: 8,
      ipv4FallbackDomain: '',
      allowLogout: true,
      allowFullscreen: true,
      preloadNextSlides: 2,
      warnAboutUnsavedContentOnMeetingEnd: false,
      audioCaptions: {
        alwaysVisible: false,
        enabled: false,
        mobile: false,
        provider: 'webspeech',
        language: {
          available: [
            'en-US',
            'es-ES',
            'fr-FR',
            'pt-BR',
          ],
          forceLocale: false,
          defaultSelectLocale: true,
          locale: 'disabled',
        },
      },
      mutedAlert: {
        enabled: true,
        interval: 200,
        threshold: -50,
        duration: 4000,
      },
      remainingTimeThreshold: 30,
      remainingTimeAlertThresholdArray: [
        1,
        5,
      ],
      enableDebugWindow: true,
      breakouts: {
        allowUserChooseRoomByDefault: false,
        captureWhiteboardByDefault: false,
        captureSharedNotesByDefault: false,
        sendInvitationToAssignedModeratorsByDefault: false,
        breakoutRoomLimit: 16,
        allowPresentationManagementInBreakouts: true,
      },
      customHeartbeat: false,
      showAllAvailableLocales: true,
      showAudioFilters: true,
      reactionsButton: {
        enabled: true,
      },
      emojiRain: {
        enabled: false,
        intervalEmojis: 2000,
        numberOfEmojis: 5,
        emojiSize: 2,
      },
      enableNetworkStats: true,
      enableCopyNetworkStatsButton: true,
      userSettingsStorage: 'session',
      defaultSettings: {
        application: {
          selectedLayout: 'custom',
          animations: true,
          chatAudioAlerts: false,
          chatPushAlerts: false,
          userJoinAudioAlerts: false,
          userJoinPushAlerts: false,
          userLeaveAudioAlerts: false,
          userLeavePushAlerts: false,
          raiseHandAudioAlerts: true,
          raiseHandPushAlerts: true,
          guestWaitingAudioAlerts: true,
          guestWaitingPushAlerts: true,
          wakeLock: true,
          paginationEnabled: true,
          whiteboardToolbarAutoHide: false,
          pushToTalkEnabled: false,
          autoCloseReactionsBar: true,
          darkTheme: false,
          fallbackLocale: 'en',
          overrideLocale: null,
        },
        audio: {
          inputDeviceId: 'undefined',
          outputDeviceId: 'undefined',
        },
        dataSaving: {
          viewParticipantsWebcams: true,
          viewScreenshare: true,
        },
        transcription: {
          partialUtterances: true,
          minUtteranceLength: 1,
        },
      },
      shortcuts: {
        openOptions: {
          accesskey: 'O',
          descId: 'openOptions',
        },
        toggleUserList: {
          accesskey: 'U',
          descId: 'toggleUserList',
        },
        toggleMute: {
          accesskey: 'M',
          descId: 'toggleMute',
        },
        joinAudio: {
          accesskey: 'J',
          descId: 'joinAudio',
        },
        leaveAudio: {
          accesskey: 'L',
          descId: 'leaveAudio',
        },
        togglePublicChat: {
          accesskey: 'P',
          descId: 'togglePublicChat',
        },
        hidePrivateChat: {
          accesskey: 'H',
          descId: 'hidePrivateChat',
        },
        closePrivateChat: {
          accesskey: 'G',
          descId: 'closePrivateChat',
        },
        raiseHand: {
          accesskey: 'R',
          descId: 'raiseHand',
        },
        openActions: {
          accesskey: 'A',
          descId: 'openActions',
        },
        openDebugWindow: {
          accesskey: 'K',
          descId: 'openDebugWindow',
        },
      },
      branding: {
        displayBrandingArea: true,
      },
      connectionTimeout: 60000,
      showHelpButton: true,
      effectiveConnection: [
        'critical',
        'danger',
        'warning',
      ],
      fallbackOnEmptyLocaleString: true,
      disableWebsocketFallback: true,
      maxMutationPayloadSize: 10485760, // 10MB
    },
    externalVideoPlayer: {
      enabled: true,
    },
    kurento: {
      wsUrl: 'HOST',
      cameraWsOptions: {
        wsConnectionTimeout: 4000,
        maxRetries: 7,
        debug: false,
        heartbeat: {
          interval: 15000,
          delay: 3000,
          reconnectOnFailure: true,
        },
      },
      gUMTimeout: 20000,
      signalCandidates: false,
      traceLogs: false,
      cameraTimeouts: {
        baseTimeout: 30000,
        maxTimeout: 60000,
      },
      screenshare: {
        enableVolumeControl: true,
        subscriberOffering: false,
        bitrate: 1500,
        mediaTimeouts: {
          maxConnectionAttempts: 2,
          baseTimeout: 20000,
          baseReconnectionTimeout: 8000,
          maxTimeout: 25000,
          timeoutIncreaseFactor: 1.5,
        },
        constraints: {
          video: {
            frameRate: {
              ideal: 5,
              max: 10,
            },
            width: {
              max: 2560,
            },
            height: {
              max: 1600,
            },
          },
          audio: true,
        },
      },
      cameraProfiles: [
        {
          id: 'low-u30',
          name: 'low-u30',
          bitrate: 30,
          hidden: true,
        },
        {
          id: 'low-u25',
          name: 'low-u25',
          bitrate: 40,
          hidden: true,
        },
        {
          id: 'low-u20',
          name: 'low-u20',
          bitrate: 50,
          hidden: true,
        },
        {
          id: 'low-u15',
          name: 'low-u15',
          bitrate: 70,
          hidden: true,
        },
        {
          id: 'low-u12',
          name: 'low-u12',
          bitrate: 90,
          hidden: true,
        },
        {
          id: 'low-u8',
          name: 'low-u8',
          bitrate: 100,
          hidden: true,
        },
        {
          id: 'low',
          name: 'Low',
          default: false,
          bitrate: 100,
        },
        {
          id: 'medium',
          name: 'Medium',
          default: true,
          bitrate: 200,
        },
        {
          id: 'high',
          name: 'High',
          default: false,
          bitrate: 500,
          constraints: {
            width: 1280,
            height: 720,
            frameRate: 15,
          },
        },
        {
          id: 'hd',
          name: 'High definition',
          default: false,
          bitrate: 800,
          constraints: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
        {
          id: 'fhd',
          name: 'Camera as content',
          hidden: true,
          default: false,
          bitrate: 1500,
          constraints: {
            width: 1920,
            height: 1080,
          },
        },
      ],
      enableScreensharing: true,
      enableVideo: true,
      enableVideoMenu: true,
      enableVideoPin: true,
      autoShareWebcam: false,
      skipVideoPreview: false,
      skipVideoPreviewOnFirstJoin: false,
      cameraSortingModes: {
        defaultSorting: 'LOCAL_ALPHABETICAL',
        paginationSorting: 'VOICE_ACTIVITY_LOCAL',
      },
      cameraQualityThresholds: {
        enabled: true,
        applyConstraints: false,
        privilegedStreams: true,
        debounceTime: 2500,
        thresholds: [
          {
            threshold: 8,
            profile: 'low-u8',
          },
          {
            threshold: 12,
            profile: 'low-u12',
          },
          {
            threshold: 15,
            profile: 'low-u15',
          },
          {
            threshold: 20,
            profile: 'low-u20',
          },
          {
            threshold: 25,
            profile: 'low-u25',
          },
          {
            threshold: 30,
            profile: 'low-u30',
          },
        ],
      },
      pagination: {
        paginationToggleEnabled: true,
        pageChangeDebounceTime: 2500,
        desktopPageSizes: {
          moderator: 0,
          viewer: 5,
        },
        mobilePageSizes: {
          moderator: 2,
          viewer: 2,
        },
        desktopGridSizes: {
          moderator: 48,
          viewer: 48,
        },
        mobileGridSizes: {
          moderator: 14,
          viewer: 14,
        },
      },
      paginationThresholds: {
        enabled: false,
        thresholds: [
          {
            users: 30,
            desktopPageSizes: {
              moderator: 25,
              viewer: 25,
            },
          },
          {
            users: 40,
            desktopPageSizes: {
              moderator: 20,
              viewer: 20,
            },
          },
          {
            users: 50,
            desktopPageSizes: {
              moderator: 16,
              viewer: 16,
            },
          },
          {
            users: 60,
            desktopPageSizes: {
              moderator: 14,
              viewer: 12,
            },
          },
          {
            users: 70,
            desktopPageSizes: {
              moderator: 12,
              viewer: 10,
            },
          },
          {
            users: 80,
            desktopPageSizes: {
              moderator: 10,
              viewer: 8,
            },
          },
          {
            users: 90,
            desktopPageSizes: {
              moderator: 8,
              viewer: 6,
            },
          },
          {
            users: 100,
            desktopPageSizes: {
              moderator: 6,
              viewer: 4,
            },
          },
        ],
      },
    },
    syncUsersWithConnectionManager: {
      enabled: false,
      syncInterval: 60000,
    },
    poll: {
      enabled: true,
      allowCustomResponseInput: true,
      maxCustom: 5,
      maxTypedAnswerLength: 45,
      chatMessage: true,
    },
    captions: {
      enabled: true,
      id: 'captions',
      dictation: false,
      background: '#000000',
      font: {
        color: '#ffffff',
        family: 'Calibri',
        size: '24px',
      },
      locales: [
        {
          locale: 'en-US',
          name: 'English',
        },
      ],
      lines: 2,
      time: 5000,
      showButton: false,
      defaultPad: 'en',
      captionLimit: 3,
      lineLimit: 60,
    },
    timer: {
      enabled: true,
      alarm: true,
      music: {
        enabled: false,
        volume: 0.4,
        track1: 'RelaxingMusic',
        track2: 'CalmMusic',
        track3: 'aristocratDrums',
      },
      interval: {
        clock: 100,
        offset: 60000,
      },
      time: 5,
      tabIndicator: false,
    },
    chat: {
      enabled: true,
      itemsPerPage: 100,
      timeBetweenFetchs: 1000,
      enableSaveAndCopyPublicChat: true,
      bufferChatInsertsMs: 0,
      startClosed: false,
      min_message_length: 1,
      max_message_length: 5000,
      grouping_messages_window: 10000,
      type_system: 'SYSTEM_MESSAGE',
      type_public: 'PUBLIC_ACCESS',
      type_private: 'PRIVATE_ACCESS',
      system_userid: 'SYSTEM_MESSAGE',
      system_username: 'SYSTEM_MESSAGE',
      public_id: 'public',
      public_group_id: 'MAIN-PUBLIC-GROUP-CHAT',
      public_userid: 'public_chat_userid',
      public_username: 'public_chat_username',
      storage_key: 'UNREAD_CHATS',
      system_messages_keys: {
        chat_clear: 'PUBLIC_CHAT_CLEAR',
        chat_poll_result: 'PUBLIC_CHAT_POLL_RESULT',
        chat_exported_presentation: 'PUBLIC_CHAT_EXPORTED_PRESENTATION',
        chat_status_message: 'PUBLIC_CHAT_STATUS',
      },
      typingIndicator: {
        enabled: true,
        showNames: true,
      },
      moderatorChatEmphasized: true,
      privateMessageReadFeedback: {
        enabled: false,
      },
      autoConvertEmoji: true,
      emojiPicker: {
        enable: false,
      },
      disableEmojis: [],
      allowedElements: [
        'a',
        'code',
        'em',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'li',
        'ol',
        'ul',
        'p',
        'strong',
      ],
    },
    userReaction: {
      enabled: true,
      expire: 60,
      reactions: [
        {
          id: 'smiley',
          native: '😃',
        },
        {
          id: 'neutral_face',
          native: '😐',
        },
        {
          id: 'slightly_frowning_face',
          native: '🙁',
        },
        {
          id: '+1',
          native: '👍',
        },
        {
          id: '-1',
          native: '👎',
        },
        {
          id: 'clap',
          native: '👏',
        },
      ],
    },
    notes: {
      enabled: true,
      id: 'notes',
      pinnable: true,
    },
    layout: {
      hidePresentationOnJoin: false,
      showParticipantsOnLogin: true,
      showPushLayoutButton: true,
      showPushLayoutToggle: true,
    },
    pads: {
      url: 'ETHERPAD_HOST',
      cookie: {
        path: '/',
        sameSite: 'None',
        secure: true,
      },
    },
    media: {
      audio: {
        defaultFullAudioBridge: 'fullaudio',
        defaultListenOnlyBridge: 'fullaudio',
        bridges: [
          {
            name: 'sipjs',
            path: 'bridge/sip',
          },
          {
            name: 'fullaudio',
            path: 'bridge/sfu-audio-bridge',
          },
        ],
        retryThroughRelay: false,
      },
      stunTurnServersFetchAddress: '/bigbluebutton/api/stuns',
      cacheStunTurnServers: true,
      fallbackStunServer: '',
      forceRelay: false,
      forceRelayOnFirefox: true,
      mediaTag: '#remote-media',
      callTransferTimeout: 5000,
      callHangupTimeout: 2000,
      callHangupMaximumRetries: 10,
      echoTestNumber: 'echo',
      listenOnlyCallTimeout: 15000,
      transparentListenOnly: false,
      fullAudioOffering: true,
      listenOnlyOffering: false,
      iceGatheringTimeout: 5000,
      audioConnectionTimeout: 5000,
      audioReconnectionDelay: 5000,
      audioReconnectionAttempts: 3,
      sipjsHackViaWs: false,
      sipjsAllowMdns: false,
      sip_ws_host: '',
      toggleMuteThrottleTime: 300,
      websocketKeepAliveInterval: 30,
      websocketKeepAliveDebounce: 10,
      traceSip: false,
      sdpSemantics: 'unified-plan',
      localEchoTest: {
        enabled: true,
        initialHearingState: true,
        useRtcLoopbackInChromium: true,
        delay: {
          enabled: true,
          delayTime: 0.5,
          maxDelayTime: 2,
        },
      },
      muteAudioOutputWhenAway: false,
      screenshare: {
        showButtonForNonPresenters: false,
      },
    },
    stats: {
      enabled: true,
      interval: 10000,
      timeout: 30000,
      log: true,
      notification: {
        warning: false,
        error: true,
      },
      loss: [
        0.05,
        0.1,
        0.2,
      ],
      rtt: [
        500,
        1000,
        2000,
      ],
      level: [
        'warning',
        'danger',
        'critical',
      ],
      help: 'STATS_HELP_URL',
    },
    presentation: {
      allowDownloadOriginal: true,
      allowDownloadWithAnnotations: true,
      allowSnapshotOfCurrentSlide: true,
      panZoomThrottle: 32,
      restoreOnUpdate: true,
      uploadEndpoint: '/bigbluebutton/presentation/upload',
      fileUploadConstraintsHint: false,
      mirroredFromBBBCore: {
        uploadSizeMax: 30000000,
        uploadPagesMax: 200,
      },
      uploadValidMimeTypes: [
        {
          extension: '.pdf',
          mime: 'application/pdf',
        },
        {
          extension: '.doc',
          mime: 'application/msword',
        },
        {
          extension: '.docx',
          mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          extension: '.xls',
          mime: 'application/vnd.ms-excel',
        },
        {
          extension: '.xlsx',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        {
          extension: '.ppt',
          mime: 'application/vnd.ms-powerpoint',
        },
        {
          extension: '.pptx',
          mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
        {
          extension: '.txt',
          mime: 'text/plain',
        },
        {
          extension: '.rtf',
          mime: 'application/rtf',
        },
        {
          extension: '.odt',
          mime: 'application/vnd.oasis.opendocument.text',
        },
        {
          extension: '.ods',
          mime: 'application/vnd.oasis.opendocument.spreadsheet',
        },
        {
          extension: '.odp',
          mime: 'application/vnd.oasis.opendocument.presentation',
        },
        {
          extension: '.odg',
          mime: 'application/vnd.oasis.opendocument.graphics',
        },
        {
          extension: '.odc',
          mime: 'application/vnd.oasis.opendocument.chart',
        },
        {
          extension: '.odi',
          mime: 'application/vnd.oasis.opendocument.image',
        },
        {
          extension: '.jpg',
          mime: 'image/jpeg',
        },
        {
          extension: '.jpeg',
          mime: 'image/jpeg',
        },
        {
          extension: '.png',
          mime: 'image/png',
        },
        {
          extension: '.webp',
          mime: 'image/webp',
        },
      ],
    },
    user: {
      role_moderator: 'MODERATOR',
      role_viewer: 'VIEWER',
      label: {
        moderator: false,
        mobile: true,
        guest: true,
        sharingWebcam: true,
      },
    },
    whiteboard: {
      annotationsQueueProcessInterval: 60,
      cursorInterval: 150,
      pointerDiameter: 5,
      maxStickyNoteLength: 1000,
      maxNumberOfAnnotations: 300,
      allowInfiniteWhiteboard: false,
      allowInfiniteWhiteboardInBreakouts: false,
      annotations: {
        status: {
          start: 'DRAW_START',
          update: 'DRAW_UPDATE',
          end: 'DRAW_END',
        },
      },
      styles: {
        text: {
          family: 'script',
        },
      },
      toolbar: {
        multiUserPenOnly: false,
        colors: [
          {
            label: 'black',
            value: '#000000',
          },
          {
            label: 'white',
            value: '#ffffff',
          },
          {
            label: 'red',
            value: '#ff0000',
          },
          {
            label: 'orange',
            value: '#ff8800',
          },
          {
            label: 'eletricLime',
            value: '#ccff00',
          },
          {
            label: 'Lime',
            value: '#00ff00',
          },
          {
            label: 'Cyan',
            value: '#00ffff',
          },
          {
            label: 'dodgerBlue',
            value: '#0088ff',
          },
          {
            label: 'blue',
            value: '#0000ff',
          },
          {
            label: 'violet',
            value: '#8800ff',
          },
          {
            label: 'magenta',
            value: '#ff00ff',
          },
          {
            label: 'silver',
            value: '#c0c0c0',
          },
        ],
        thickness: [
          {
            value: 14,
          },
          {
            value: 12,
          },
          {
            value: 10,
          },
          {
            value: 8,
          },
          {
            value: 6,
          },
          {
            value: 4,
          },
          {
            value: 2,
          },
          {
            value: 1,
          },
        ],
        font_sizes: [
          {
            value: 36,
          },
          {
            value: 32,
          },
          {
            value: 28,
          },
          {
            value: 24,
          },
          {
            value: 20,
          },
          {
            value: 16,
          },
        ],
        tools: [
          { icon: 'select_tool', value: 'select' },
          { icon: 'hand_tool', value: 'hand' },
          { icon: 'draw_tool', value: 'draw' },
          { icon: 'eraser_tool', value: 'eraser' },
          { icon: 'arrow_tool', value: 'arrow' },
          { icon: 'text_tool', value: 'text' },
          { icon: 'note_tool', value: 'note' },
          { icon: 'rectangle_tool', value: 'rectangle' },
          { icon: 'more_tool', value: 'more' },
        ],
        presenterTools: [
          'select',
          'hand',
          'draw',
          'eraser',
          'arrow',
          'text',
          'note',
          'rectangle',
          'more',
        ],
        multiUserTools: [
          'select',
          'hand',
          'draw',
          'eraser',
          'arrow',
          'text',
          'note',
          'rectangle',
          'more',
        ],
      },
    },
    clientLog: {
      console: {
        enabled: true,
        level: 'debug',
      },
      external: {
        enabled: false,
        level: 'info',
        url: 'https://LOG_HOST/html5Log',
        method: 'POST',
        throttleInterval: 400,
        flushOnClose: true,
        logTag: '',
      },
    },
    virtualBackgrounds: {
      enabled: true,
      enableVirtualBackgroundUpload: true,
      storedOnBBB: true,
      showThumbnails: true,
      imagesPath: '/resources/images/virtual-backgrounds/',
      thumbnailsPath: '/resources/images/virtual-backgrounds/thumbnails/',
      fileNames: [
        'home.jpg',
        'coffeeshop.jpg',
        'board.jpg',
      ],
    },
  },
  private: {
    analytics: {
      includeChat: true,
    },
    app: {
      host: '127.0.0.1',
      localesUrl: '/locale-list',
      pencilChunkLength: 100,
      loadSlidesFromHttpAlways: false,
    },
    minBrowserVersions: [
      {
        browser: 'chrome',
        version: 72,
      },
      {
        browser: 'chromeMobileIOS',
        version: 94,
      },
      {
        browser: 'firefox',
        version: 68,
      },
      {
        browser: 'firefoxMobile',
        version: 68,
      },
      {
        browser: 'edge',
        version: 79,
      },
      {
        browser: 'ie',
        version: 'Infinity',
      },
      {
        browser: 'safari',
        version: [
          12,
          1,
        ],
      },
      {
        browser: 'mobileSafari',
        version: [
          12,
          1,
        ],
      },
      {
        browser: 'opera',
        version: 50,
      },
      {
        browser: 'electron',
        version: [
          0,
          36,
        ],
      },
      {
        browser: 'SamsungInternet',
        version: 10,
      },
      {
        browser: 'YandexBrowser',
        version: 19,
      },
    ],
    prometheus: {
      enabled: false,
      path: '/metrics',
      collectDefaultMetrics: false,
    },
  },
};

export default meetingClientSettingsInitialValues;

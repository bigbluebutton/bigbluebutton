package org.bigbluebutton.web

class UrlMappings {

  static mappings = {
    "/bigbluebutton/presentation/$authzToken/upload"(controller: "presentation") {
      action = [POST: 'upload']
    }

    "/bigbluebutton/presentation/checkPresentation"(controller: "presentation") {
      action = [GET: 'checkPresentationBeforeUploading']
    }

    "/bigbluebutton/presentation/test-convert"(controller: "presentation") {
      action = [GET: 'testConversion']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/slides"(controller: "presentation") {
      action = [GET: 'numberOfSlides']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/thumbnails"(controller: "presentation") {
      action = [GET: 'numberOfThumbnails']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/thumbnail/$id"(controller: "presentation") {
      action = [GET: 'showThumbnail']
      constraints {
        id matches: /\d+/
      }
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/png/$id"(controller: "presentation") {
      action = [GET: 'showPng']
      constraints {
        id matches: /\d+/
      }
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/svgs"(controller: "presentation") {
      action = [GET: 'numberOfSvgs']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/svg/$id"(controller: "presentation") {
      action = [GET: 'showSvgImage']
      constraints {
        id matches: /\d+/
      }
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/textfiles"(controller: "presentation") {
      action = [GET: 'numberOfTextfiles']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/textfiles/$id"(controller: "presentation") {
      action = [GET: 'showTextfile']
      constraints {
        id matches: /\d+/
      }
    }

    "/bigbluebutton/presentation/download/$meetingId/$presId"(controller: "presentation") {
      action = [GET: 'downloadFile']
    }

    "/bigbluebutton/api/create"(controller: "api") {
      action = [GET: 'create', POST: 'create']
    }

    "/bigbluebutton/api/join"(controller: "api") {
      action = [GET: 'join']
    }

    "/bigbluebutton/api/isMeetingRunning"(controller: "api") {
      action = [GET: 'isMeetingRunning', POST: 'isMeetingRunning']
    }

    "/bigbluebutton/api/end"(controller: "api") {
      action = [GET: 'end', POST: 'end']
    }

    "/bigbluebutton/api/getMeetingInfo"(controller: "api") {
      action = [GET: 'getMeetingInfo', POST: 'getMeetingInfo']
    }

    "/bigbluebutton/api/getMeetings"(controller: "api") {
      action = [GET: 'getMeetingsHandler', POST: 'getMeetingsHandler']
    }

    "/bigbluebutton/api/getSessions"(controller: "api") {
      action = [GET: 'getSessionsHandler', POST: 'getSessionsHandler']
    }

    "/bigbluebutton/api/stuns"(controller: "api") {
      action = [GET: 'stuns', POST: 'stuns']
    }

    "/bigbluebutton/api/signOut"(controller: "api") {
      action = [GET: 'signOut', POST: 'signOut']
    }

    "/bigbluebutton/api/insertDocument"(controller: "api") {
      action = [POST: 'insertDocument']
    }

    "/bigbluebutton/api/getJoinUrl"(controller: "api") {
      action = [GET: 'getJoinUrl', POST: 'getJoinUrl']
    }

    "/bigbluebutton/api/feedback"(controller: "api") {
      action = [POST: 'feedback']
    }

    "/bigbluebutton/api/learningDashboard"(controller: "api") {
      action = [GET: 'learningDashboard', POST: 'learningDashboard']
    }


    "/bigbluebutton/api/sendChatMessage"(controller: "api") {
      action = [GET: 'sendChatMessage']
    }

    "/bigbluebutton/api/getRecordings"(controller: "recording") {
      action = [GET: 'getRecordingsHandler', POST: 'getRecordingsHandler']
    }

    "/bigbluebutton/api/updateRecordings"(controller: "recording") {
      action = [GET: 'updateRecordingsHandler', POST: 'updateRecordingsHandler']
    }

    "/bigbluebutton/api/guestWait"(controller: "api") {
      action = [GET: 'guestWaitHandler']
    }

    "/bigbluebutton/textTrack/validateAuthToken"(controller: "recording") {
      action = [GET: 'checkTextTrackAuthToken']
    }

    "/bigbluebutton/api/getRecordingTextTracks"(controller: "recording") {
      action = [GET: 'getRecordingTextTracksHandler', POST: 'getRecordingTextTracksHandler']
    }

    "/bigbluebutton/api/putRecordingTextTrack"(controller: "recording") {
      action = [POST: 'putRecordingTextTrack']
    }

    "/bigbluebutton/api/publishRecordings"(controller: "recording") {
      action = [GET: 'publishRecordings']
    }

    "/bigbluebutton/api/deleteRecordings"(controller: "recording") {
      action = [GET: 'deleteRecordings']
    }

    "/bigbluebutton/$controller/$action?/$id?(.${format})?" {
      constraints {
        // apply constraints here
      }
    }

    "/bigbluebutton/"(controller: "api") {
      action = [GET: 'index']
    }

    "500"(view: '/error')
  }
}

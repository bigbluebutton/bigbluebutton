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

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/slide/$id"(controller: "presentation") {
      action = [GET: 'showSlide']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/thumbnails"(controller: "presentation") {
      action = [GET: 'numberOfThumbnails']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/thumbnail/$id"(controller: "presentation") {
      action = [GET: 'showThumbnail']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/png/$id"(controller: "presentation") {
      action = [GET: 'showPng']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/svgs"(controller: "presentation") {
      action = [GET: 'numberOfSvgs']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/svg/$id"(controller: "presentation") {
      action = [GET: 'showSvgImage']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/textfiles"(controller: "presentation") {
      action = [GET: 'numberOfTextfiles']
    }

    "/bigbluebutton/presentation/$conference/$room/$presentation_name/textfiles/$id"(controller: "presentation") {
      action = [GET: 'showTextfile']
    }

    "/bigbluebutton/presentation/download/$meetingId/$presId"(controller: "presentation") {
      action = [GET: 'downloadFile']
    }

    "/bigbluebutton/api/setConfigXML"(controller: "api") {
      action = [POST: 'setConfigXML']
    }

    "/bigbluebutton/api/setPollXML"(controller: "api") {
      action = [POST: 'setPollXML']
    }

    "/bigbluebutton/api/getMeetings"(controller: "api") {
      action = [GET: 'getMeetingsHandler', POST: 'getMeetingsHandler']
    }

    "/bigbluebutton/api/getSessions"(controller: "api") {
      action = [GET: 'getSessionsHandler', POST: 'getSessionsHandler']
    }

    "/bigbluebutton/api/getRecordings"(controller: "api") {
      action = [GET: 'getRecordingsHandler', POST: 'getRecordingsHandler']
    }

    "/bigbluebutton/api/updateRecordings"(controller: "api") {
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

    "/connection/checkAuthorization"(controller:"connection") {
      action = [GET:'checkAuthorization']
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

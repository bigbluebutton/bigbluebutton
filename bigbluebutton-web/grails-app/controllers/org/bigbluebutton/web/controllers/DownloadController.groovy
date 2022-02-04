package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.util.ParamsUtil
import org.bigbluebutton.api.Util

class DownloadController {
  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil

  def check = {
    def uri = request.getHeader("x-original-uri")
    def source = request.getHeader("x-source")
    def uploadId = request.getHeader("x-upload-id")

    def sessionToken = ParamsUtil.getSessionToken(uri)
    def userSession = meetingService.getUserSessionWithAuthToken(sessionToken)
    if (userSession != null) {
      def meetingId = userSession.meetingID

      def validRequest = meetingService.isDownloadRequestValid(meetingId, source, uploadId)

      if (validRequest) {
        response.setStatus(200)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'valid-download'
      } else {
        log.debug("Download failed. Invalid.")
        response.setStatus(404)
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'invalid-download'
      }
    } else {
      log.debug("Download failed. Invalid session.")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'invalid-session'
    }
  }

  def download = {
    def uri = request.getHeader("x-original-uri")
    def sessionToken = ParamsUtil.getSessionToken(uri)
    def userSession = meetingService.getUserSessionWithAuthToken(sessionToken)

    def meetingId = userSession.meetingID
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId)
    if (meeting == null) {
      log.debug("Download failed. No meeting running " + meetingId + ".")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting'
    } else {
      def source = request.getHeader("x-source")
      def uploadId = request.getHeader("x-upload-id")
      try {
        def rootDir = paramsProcessorUtil.getUploadDir()
        def uploadedFile = meetingService.getUploadedFile(meetingId, uploadId)
        def downloadPath = Util.getDownloadPath(rootDir, source, meetingId, uploadId)
        def filename = uploadId + "." + uploadedFile.extension
        def file = new File(downloadPath + File.separatorChar + filename)
        def fileSize = file.length()
        if (file.exists()) {
          long startByte = 0
          long endByte = fileSize - 1
          String range = request.getHeader('range')
          if(range) {
            String[] rangeKeyValue = range.split('=')
            String[] rangeEnds = rangeKeyValue[1].split('-')
            if (rangeEnds.length > 0 && rangeEnds[0] != '') {
              startByte = rangeEnds[0].toLong()
            }
            if (rangeEnds.length > 1 && rangeEnds[1] != '') {
              endByte = rangeEnds[1].toLong()
            }
          }
          def contentLength = (endByte - startByte) + 1
/*
          // the below is very memory consuming
          //  -> https://stackoverflow.com/questions/2824486/groovy-grails-how-do-you-stream-or-buffer-a-large-file-in-a-controllers-respon
          //  -> https://www.baeldung.com/groovy-io
          def bytes = new byte[contentLength]
          def inputStream = file.newInputStream()
          inputStream.skip(startByte)
          inputStream.read(bytes, 0, bytes.length) //it's important to set zero for the second argument: see https://stackoverflow.com/questions/23071164/grails-ios-specific-returning-video-mp4-file-gives-broken-pipe-exception-g
          response.reset()
          response.setStatus(206)
          response.contentType = uploadedFile.contentType
          response.addHeader("Accept-Ranges", "bytes")
          response.addHeader("Content-Range", "bytes ${startByte}-${endByte}/${fileSize}")
          response.addHeader("Content-Length", "${contentLength}")
          response.addHeader("Cache-Control", "no-cache")
          response.outputStream << bytes
*/

          file.withInputStream { stream ->
            stream.skip(startByte)
            response.reset()
            response.setStatus(206)
            response.contentType = uploadedFile.contentType
            response.addHeader("Accept-Ranges", "bytes")
            response.addHeader("Content-Range", "bytes ${startByte}-${endByte}/${fileSize}")
            response.addHeader("Content-Length", "${contentLength}")
            response.addHeader("Cache-Control", "no-cache")
            response.outputStream << stream
            //response.outputStream.flush() // seems unnecessary
          }
        } else {
          log.debug("Download failed. No uploaded file found in the meeting " + meetingId + ".")
          response.setStatus(404)
          response.addHeader("Cache-Control", "no-cache")
          response.contentType = 'plain/text'
          response.outputStream << 'no-file'
        }
      } catch (IOException e) {
        log.debug("Download failed.")
      }
    }
  }
}

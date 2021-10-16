package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.Util

import org.apache.commons.io.FilenameUtils

class UploadController {
  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil

  def check = {
    def meetingId = request.getHeader("x-meeting-id")
    def source = request.getHeader("x-source")
    def filename = request.getHeader("x-filename")
    def userId = request.getHeader("x-user-id")
    def token = request.getHeader("x-token")
    def contentLength = request.getHeader("x-content-length")

    def uploadSize = 0
    if (contentLength.isNumber()) {
      uploadSize = contentLength as int
    }

    def validRequest = meetingService.isUploadRequestValid(meetingId, source, filename, userId, token)

    def maxUploadSize = paramsProcessorUtil.getMaxUploadSize()
    def validSize = uploadSize != 0 && uploadSize < maxUploadSize

    if (validRequest && validSize) {
      response.setStatus(200)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'valid-upload'
    } else {
      log.debug("Upload failed. Invalid")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'invalid-upload'
    }
  }

  def upload = {
    def meetingId = request.getHeader("x-meeting-id")
    def userId = request.getHeader("x-user-id")
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId)
    if (meeting == null) {
      log.debug("Upload failed. No meeting running " + meetingId + ".")
      response.setStatus(404)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting'
    } else {
      def file = request.getFile('file')
      if (file && !file.empty) {
        def filename = file.getOriginalFilename()
        def contentType = file.getContentType()
        def extension = FilenameUtils.getExtension(filename)
        def source = request.getHeader("x-source")

        def rootDir = paramsProcessorUtil.getUploadDir()
        def uploadId = Util.generateUploadId(filename)
        def uploadDir = Util.createUploadDir(rootDir, source, meetingId, uploadId)

        if (uploadDir != null) {
          def localFilename = uploadId + "." + extension
          def localFilePath = uploadDir.absolutePath + File.separatorChar + localFilename
          def localFile = new File(localFilePath)
          file.transferTo(localFile)

          meetingService.fileUploaded(uploadId, source, filename, contentType, extension, userId, meetingId)
        } else {
          log.debug("Upload failed. Could not create upload dir.")
          response.addHeader("Cache-Control", "no-cache")
          response.contentType = 'plain/text'
          response.outputStream << 'upload-failed'
        }
      } else {
        log.debug("Upload failed. Empty file.")
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'upload-failed'
      }
      log.debug("Upload succeeded.")
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'upload-success'
    }
  }
}

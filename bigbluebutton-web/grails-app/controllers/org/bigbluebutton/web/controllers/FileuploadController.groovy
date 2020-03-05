/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.web.controllers


import org.apache.commons.io.FilenameUtils
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.Util
import org.bigbluebutton.presentation.UploadedPresentation
import org.bigbluebutton.web.services.FileuploadService
import com.google.gson.Gson



import java.nio.charset.StandardCharsets

class FileuploadController {
   MeetingService meetingService
   private static String rootStorageDir = "/var/bigbluebutton" //todo: move to config
   private static String fileuploads = "fileuploads"
   ParamsProcessorUtil paramsProcessorUtil

    def index = {
      render(view: 'upload-file')
    }

  def checkFileBeforeUploading = {
    try {
      def maxUploadFileSize = paramsProcessorUtil.getMaxPresentationFileUpload()
      def originalContentLengthString = request.getHeader("x-original-content-length")

      def originalContentLength = 0
      if (originalContentLengthString.isNumber()) {
        originalContentLength = originalContentLengthString as int
      }

      if (originalContentLength < maxUploadFileSize
              && 0 != originalContentLength) {
        log.debug "SUCCESS\n"
        response.setStatus(200);
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'upload-success';
      } else {
        log.debug "NO SUCCESS \n"
        response.setStatus(404);
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'file-empty';
      }
    } catch (IOException e) {
      log.error("Error in checkFileBeforeUploading.\n" + e.getMessage());
    }
  }

  def upload = {
    def meetingId = params.conference
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId);
    if (meeting == null) {
      flash.message = 'meeting is not running'
      log.error("Upload failed. No meeting running " + meetingId)
      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting';
    }else {
      log.info("Meeting running " + meetingId)
      def file = request.getFile('fileUpload')
      if (file && !file.empty) {
        log.info("File is loaded")
        flash.message = 'Your file has been uploaded'
        def fileName = file.getOriginalFilename()
        def fileId = Util.generateFileId(fileName);
        File rootMeetngFileDir = Util.createFileUploadDir(meetingId, rootStorageDir, fileId, false)

        if (rootMeetngFileDir != null) {
          File downloadFileDir = getDownloadFileDirectory(rootMeetngFileDir.absolutePath, true)
          if (downloadFileDir != null) {
            def notValidCharsRegExp = /[^0-9a-zA-Z_\.]/
            def downloadableFileName = fileName.replaceAll(notValidCharsRegExp, '-')
            def downloadableFile = new File(downloadFileDir.absolutePath + File.separatorChar + downloadableFileName)
            file.transferTo(downloadableFile)

            response.addHeader("Cache-Control", "no-cache")
            response.contentType = 'application/json'

            Map<String, Object> responseData = new HashMap<String, Object>();
            responseData.put("success", "true");
            responseData.put("fileId", fileId);
            responseData.put("fileName", downloadableFileName);

            response.outputStream << new Gson().toJson(responseData);
          }
        }
      } else {
        log.warn "Upload failed. File Empty."
        flash.message = 'file cannot be empty'
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << 'error'
      }
    }
  }
 //todo: move it to Util
  public static File getDownloadFileDirectory(String uploadDirectory, boolean create) {
    File dir = new File(uploadDirectory + File.separatorChar + fileuploads);
    if(!create){
      return dir;
    }else if (create && dir.mkdirs()) {
      return dir;
    }
    return null;
  }



  def download = {
    def fileId = params.fileId
    def fileName = params.fileName
    def meetingId = params.meetingId

    log.debug "Controller: Download request for $fileName"

    InputStream is = null;
    try {
      File rootMeetngFileDir = Util.createFileUploadDir(meetingId, rootStorageDir, fileId, true)
      if (rootMeetngFileDir != null) {
        File downloadFileDir = getDownloadFileDirectory(rootMeetngFileDir.absolutePath, false)
        if (downloadFileDir != null) {
          def downloadableFile = new File(downloadFileDir.absolutePath + File.separatorChar + fileName)
          if (downloadableFile.exists()) {
            log.debug "Controller: Sending download reply for $fileName"

            def bytes = downloadableFile.readBytes()
            def responseName = downloadableFile.getName();
            response.addHeader("content-disposition", "filename=" + URLEncoder.encode(responseName, StandardCharsets.UTF_8.name()))
            response.addHeader("Cache-Control", "no-cache")
            response.outputStream << bytes;
          } else {
            log.warn "$downloadableFile does not exist."
          }
        }
      }
    }
    catch (IOException e ) {
        log.error("Error reading file.\n" + e.getMessage());
    }
  }


}


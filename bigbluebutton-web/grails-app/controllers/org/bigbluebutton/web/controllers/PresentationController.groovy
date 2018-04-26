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

import grails.converters.*
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.web.services.PresentationService
import org.bigbluebutton.presentation.UploadedPresentation
import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.Util;

class PresentationController {
  MeetingService meetingService
  PresentationService presentationService
  ParamsProcessorUtil paramsProcessorUtil

  def index = {
    render(view:'upload-file') 
  }

  def checkPresentationBeforeUploading = {
    try {
      def maxUploadFileSize = paramsProcessorUtil.getMaxPresentationFileUpload()
      def presentationToken = request.getHeader("x-presentation-token")
      def originalUri = request.getHeader("x-original-uri")
      def originalContentLengthString = request.getHeader("x-original-content-length")

      def originalContentLength = 0
      if (originalContentLengthString.isNumber()) {
        originalContentLength = originalContentLengthString as int
      }

      if (null != presentationToken
               && meetingService.authzTokenIsValid(presentationToken) // this we do in the upload handling
              && originalContentLength < maxUploadFileSize
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
      log.error("Error in checkPresentationBeforeUploading.\n" + e.getMessage());
    }
  }

  def upload = {
    // check if the authorization token provided is valid
    if (null == params.authzToken || !meetingService.authzTokenIsValidAndExpired(params.authzToken)) {
      log.debug "WARNING! AuthzToken=" + params.authzToken + " was not valid in meetingId=" + params.conference
      return
    }

    def meetingId = params.conference
    def meeting = meetingService.getNotEndedMeetingWithId(meetingId);
    if (meeting == null) {
      flash.message = 'meeting is not running'

      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'no-meeting';
      return null;
    }

    def file = request.getFile('fileUpload')
    if (file && !file.empty) {
      flash.message = 'Your file has been uploaded'
      def presFilename = file.getOriginalFilename()
      def filenameExt = FilenameUtils.getExtension(presFilename);
      String presentationDir = presentationService.getPresentationDir()
      def presId = Util.generatePresentationId(presFilename)
      File uploadDir = Util.createPresentationDirectory(meetingId, presentationDir, presId) 
      
      if (uploadDir != null) {
         def newFilename = Util.createNewFilename(presId, filenameExt)
         def pres = new File(uploadDir.absolutePath + File.separatorChar + newFilename )
         file.transferTo(pres)
         
         def isDownloadable = params.boolean('is_downloadable') //instead of params.is_downloadable
         def podId = params.pod_id
         log.debug "@AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..." + podId

         if(isDownloadable) {
           log.debug "@Creating download directory..."
           File downloadDir = Util.downloadPresentationDirectory(uploadDir.absolutePath)
           if (downloadDir != null) {
             def notValidCharsRegExp = /[^0-9a-zA-Z_\.]/
             def downloadableFileName = presFilename.replaceAll(notValidCharsRegExp, '-')
             def downloadableFile = new File( downloadDir.absolutePath + File.separatorChar + downloadableFileName )
             downloadableFile << pres.newInputStream()
           }
         }

         def presentationBaseUrl = presentationService.presentationBaseUrl
         UploadedPresentation uploadedPres = new UploadedPresentation(podId, meetingId, presId,
                 presFilename, presentationBaseUrl, false /* default presentation */);

         if(isDownloadable) {
           log.debug "@Setting file to be downloadable..."
           uploadedPres.setDownloadable();
         }

         uploadedPres.setUploadedFile(pres);
         presentationService.processUploadedPresentation(uploadedPres)

         response.addHeader("Cache-Control", "no-cache")
         response.contentType = 'plain/text'
         response.outputStream << 'upload-success';
      }
    } else {
      flash.message = 'file cannot be empty'
    }

      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      response.outputStream << 'file-empty';
    }

  def testConversion = {
    presentationService.testConversionProcess();
  }

  //handle external presentation server 
  def delegate = {		
    
    def presentation_name = request.getParameter('presentation_name')
    def conference = request.getParameter('conference')
    def room = request.getParameter('room')
    def returnCode = request.getParameter('returnCode')
    def totalSlides = request.getParameter('totalSlides')
    def slidesCompleted = request.getParameter('slidesCompleted')
    
     presentationService.processDelegatedPresentation(conference, room, presentation_name, returnCode, totalSlides, slidesCompleted)
    redirect( action:list)
  }
  
  def showSlide = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def slide = params.id
    
    InputStream is = null;
    try {
      def pres = presentationService.showSlide(conf, rm, presentationName, slide)
      if (pres.exists()) {
        def bytes = pres.readBytes()
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'application/x-shockwave-flash'
        response.outputStream << bytes;
      }	
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }
    
    return null;
  }
  
  def showSvgImage = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def slide = params.id
  
    InputStream is = null;
    try {
      def pres = presentationService.showSvgImage(conf, rm, presentationName, slide)
      if (pres.exists()) {
        def bytes = pres.readBytes()
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'image/svg+xml'
        response.outputStream << bytes;
      }
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }
  
    return null;
  }
  
  def showThumbnail = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def thumb = params.id
    
    InputStream is = null;
    try {
      def pres = presentationService.showThumbnail(conf, rm, presentationName, thumb)
      if (pres.exists()) {
        
        def bytes = pres.readBytes()
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'image'
        response.outputStream << bytes;
      }
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }
    
    return null;
  }

  def showPng = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def png = params.id

    InputStream is = null;
    try {
      def pres = presentationService.showPng(conf, rm, presentationName, png)
      if (pres.exists()) {

        def bytes = pres.readBytes()
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'image'
        response.outputStream << bytes;
      }
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }

    return null;
  }
  
  def showTextfile = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def textfile = params.id
    log.debug "Controller: Show textfile request for $presentationName $textfile"
    
    InputStream is = null;
    try {
      def pres = presentationService.showTextfile(conf, rm, presentationName, textfile)
      if (pres.exists()) {
        log.debug "Controller: Sending textfiles reply for $presentationName $textfile"
  
        def bytes = pres.readBytes()
        response.addHeader("Cache-Control", "no-cache")
        response.contentType = 'plain/text'
        response.outputStream << bytes;
      } else {
        log.debug "$pres does not exist."
      }
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }
  
    return null;
  }
  
  def downloadFile = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    println "Controller: Download request for $presentationName"

    InputStream is = null;
    try {
      def pres = presentationService.getFile(conf, rm, presentationName)
      if (pres.exists()) {
        println "Controller: Sending pdf reply for $presentationName"

        def bytes = pres.readBytes()
        def responseName = pres.getName();
        response.addHeader("content-disposition", "filename=$responseName")
        response.addHeader("Cache-Control", "no-cache")
        response.outputStream << bytes;
      } else {
        println "$pres does not exist."
      }
    } catch (IOException e) {
      println("Error reading file.\n" + e.getMessage());
    }

    return null;
  }

  def thumbnail = {
    def filename = params.id.replace('###', '.')
    def presDir = confDir() + File.separatorChar + filename
    try {
      def pres = presentationService.showThumbnail(presDir, params.thumb)
      if (pres.exists()) {
        def bytes = pres.readBytes()

        response.contentType = 'image'
        response.outputStream << bytes;
      }	
    } catch (IOException e) {
      log.error("Error reading file.\n" + e.getMessage());
    }
    
    return null;
  }

  def numberOfSlides = {
    def presentationName = params.presentation_name
    def conf = params.conference
    def rm = params.room
    
    def numThumbs = presentationService.numberOfThumbnails(conf, rm, presentationName)
      response.addHeader("Cache-Control", "no-cache")
      withFormat {						
        xml {
          render(contentType:"text/xml") {
            conference(id:conf, room:rm) {
              presentation(name:presentationName) {
                slides(count:numThumbs) {
                  for (def i = 1; i <= numThumbs; i++) {
                    slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}", textfile:"textfile/${i}")
                  }
                }
              }
            }
          }
        }
      }		
  }
    
  def numberOfThumbnails = {
    def filename = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def numThumbs = presentationService.numberOfThumbnails(conf, rm, filename)
      withFormat {				
        xml {
          render(contentType:"text/xml") {
            conference(id:f.conference, room:f.room) {
              presentation(name:filename) {
                thumbnails(count:numThumbs) {
                  for (def i=0;i<numThumbs;i++) {
                      thumb(name:"thumbnails/${i}")
                    }
                }
              }
            }
          }
        }
      }
  }

  def numberOfSvgs = {
    def filename = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def numSvgs = presentationService.numberOfSvgs(conf, rm, filename)
      withFormat {
        xml {
          render(contentType:"text/xml") {
            conference(id:f.conference, room:f.room) {
              presentation(name:filename) {
                svgs(count:numSvgs) {
                  for (def i=0;i<numSvgs;i++) {
                      svg(name:"svgs/${i}")
                    }
                }
              }
            }
          }
        }
      }
  }

  def numberOfTextfiles = {
    def filename = params.presentation_name
    def conf = params.conference
    def rm = params.room
    def numFiles = presentationService.numberOfTextfiles(conf, rm, filename)
    
    withFormat {
      xml {
        render(contentType:"text/xml") {
          conference(id:f.conference, room:f.room) {
            presentation(name:filename) {
              textfiles(count:numFiles) {
                for (def i=0;i<numFiles;i++) {
                  textfile(name:"textfiles/${i}")
                }
              }
            }
          }
        }
      }
    }
  }
}


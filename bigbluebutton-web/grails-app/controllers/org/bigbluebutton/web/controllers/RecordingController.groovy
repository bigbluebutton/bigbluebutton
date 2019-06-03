package org.bigbluebutton.web.controllers

import grails.web.context.ServletContextHolder
import groovy.json.JsonBuilder
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.util.ResponseBuilder
import org.bigbluebutton.api.ApiErrors
import org.bigbluebutton.api.ApiParams
import org.apache.commons.lang3.StringUtils
import org.json.JSONArray


class RecordingController {
  private static final String CONTROLLER_NAME = 'RecordingController'
  protected static final String RESP_CODE_SUCCESS = 'SUCCESS'
  protected static final String RESP_CODE_FAILED = 'FAILED'
  protected static Boolean REDIRECT_RESPONSE = true

  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil
  ResponseBuilder responseBuilder = initResponseBuilder()

  def initResponseBuilder = {
    String protocol = this.getClass().getResource("").getProtocol()
    if (Objects.equals(protocol, "jar")) {
      // Application running inside a JAR file
      responseBuilder = new ResponseBuilder(getClass().getClassLoader(), "/WEB-INF/freemarker")
    } else if (Objects.equals(protocol, "file")) {
      // Application unzipped and running outside a JAR file
      String templateLoc = ServletContextHolder.servletContext.getRealPath("/WEB-INF/freemarker")
      // We should never have a null `templateLoc`
      responseBuilder = new ResponseBuilder(new File(templateLoc))
    }
  }

  /******************************************************
   * GET RECORDING TEXT TRACKS API
   ******************************************************/
  def getRecordingTextTracksHandler = {
    String API_CALL = "getRecordingTextTracks"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.")
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    // Do we agree on the checksum? If not, complain.
    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    String recId = StringUtils.strip(params.recordID)
    String result = meetingService.getRecordingTextTracks(recId)

    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      json {
        render(text: result, contentType: "application/json")
      }
    }
  }

  private void respondWithError(errorKey, errorMessage) {
    response.addHeader("Cache-Control", "no-cache")
    withFormat {
      json {
        log.debug "Rendering as json"
        def builder = new JsonBuilder()
        builder.response {
          returncode RESP_CODE_FAILED
          messageKey errorKey
          message errorMessage
        }
        render(contentType: "application/json", text: builder.toPrettyString())
      }
    }
  }

  def putRecordingTextTrack = {
    String API_CALL = "putRecordingTextTrack"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      respondWithError("paramError", "Missing param checksum.")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      respondWithError("paramError", "Missing param recordID.")
      return
    }

    String recordId = StringUtils.strip(params.recordID)

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    String captionsDirPath = meetingService.getCaptionsDir() + File.separatorChar + recordId
    File captionsDir = new File(captionsDirPath);
    if (!captionsDir.exists() || !captionsDir.isDirectory()) {
      respondWithError("noRecordings", "No recording was found for " + recordId)
      return;
    }

    if (StringUtils.isEmpty(params.kind)) {
      respondWithError("paramError", "Missing param kind.")
      return
    }

    String captionsKind = StringUtils.strip(params.kind)
    def isAllowedKind = captionsKind in ['subtitles', 'captions']
    if (!isAllowedKind) {
      respondWithError("invalidKind", "Invalid kind parameter, expected='subtitles|captions' actual=" + captionsKind)
      return
    }

    Locale locale;
    if (StringUtils.isEmpty(params.lang)) {
      respondWithError("paramError", "Missing param lang.")
      return
    }

    String paramsLang = StringUtils.strip(params.lang)

    Collection<Locale> locales = new ArrayList<>()
    locales.add(Locale.forLanguageTag(paramsLang))
    try {
      List<Locale.LanguageRange> languageRanges = Locale.LanguageRange.parse(paramsLang)
      locale = Locale.lookup(languageRanges, locales)
      if (locale == null) {
        respondWithError("invalidLang", "Invalid lang param, received=" + paramsLang)
        return
      }
    } catch (IllegalArgumentException e) {
      respondWithError("invalidLang", "Malformed lang param, received=" + paramsLang)
      return
    }

    String contentType = request.getContentType()

    String captionsLang = locale.toString()
    String captionsLabel = captionsLang

    if (!StringUtils.isEmpty(params.label)) {
      captionsLabel = StringUtils.strip(params.label)
    }

    def uploadedCaptionsFile = request.getFile('file')
    if (uploadedCaptionsFile && !uploadedCaptionsFile.empty) {
      def origFilename = uploadedCaptionsFile.getOriginalFilename()
      def trackId = recordId + "-" + System.currentTimeMillis()
      def tempFilename = trackId + "-track.txt"
      def captionsFilePath = meetingService.getCaptionTrackInboxDir() + File.separatorChar + tempFilename
      def captionsFile = new File(captionsFilePath)

      uploadedCaptionsFile.transferTo(captionsFile)

      String result = meetingService.putRecordingTextTrack(recordId, captionsKind,
          captionsLang, captionsFile, captionsLabel, origFilename, trackId, contentType, tempFilename)

      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          render(text: result, contentType: "application/json")
        }
      }
    } else {
      log.warn "Upload failed. File Empty."
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            messageKey = "empty_uploaded_text_track"
            message = "Empty uploaded text track."
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }

  }

  private void invalid(key, msg, redirectResponse = false) {
    // Note: This xml scheme will be DEPRECATED.
    log.debug CONTROLLER_NAME + "#invalid " + msg
    if (redirectResponse) {
      ArrayList<Object> errors = new ArrayList<Object>()
      Map<String, String> errorMap = new LinkedHashMap<String, String>()
      errorMap.put("key", key)
      errorMap.put("message", msg)
      errors.add(errorMap)

      JSONArray errorsJSONArray = new JSONArray(errors)
      log.debug "JSON Errors {}", errorsJSONArray.toString()

      respondWithRedirect(errorsJSONArray)
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildError(key, msg, RESP_CODE_FAILED), contentType: "text/xml")
        }
        json {
          log.debug "Rendering as json"
          def builder = new JsonBuilder()
          builder.response {
            returncode RESP_CODE_FAILED
            messageKey key
            message msg
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  private void respondWithRedirect(errorsJSONArray) {
    String logoutUrl = paramsProcessorUtil.getDefaultLogoutUrl()
    URI oldUri = URI.create(logoutUrl)

    if (!StringUtils.isEmpty(params.logoutURL)) {
      try {
        oldUri = URI.create(params.logoutURL)
      } catch (Exception e) {
        // Do nothing, the variable oldUri was already initialized
      }
    }

    String newQuery = oldUri.getQuery()

    if (newQuery == null) {
      newQuery = "errors="
    } else {
      newQuery += "&" + "errors="
    }
    newQuery += errorsJSONArray

    URI newUri = new URI(oldUri.getScheme(), oldUri.getAuthority(), oldUri.getPath(), newQuery, oldUri.getFragment())

    log.debug "Constructed logout URL {}", newUri.toString()
    redirect(url: newUri)
  }

}
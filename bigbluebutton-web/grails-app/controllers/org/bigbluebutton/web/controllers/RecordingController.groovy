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
import org.apache.commons.lang.LocaleUtils

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
   * GET_RECORDINGS API
   ******************************************************/
  def getRecordingsHandler = {
    String API_CALL = "getRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    //sanitizeInput
    params.each {
      key, value -> params[key] = sanitizeInput(value)
    }

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
      respondWithErrors(errors)
      return
    }

    log.debug request.getQueryString()

    // Do we agree on the checksum? If not, complain.
    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    List<String> externalMeetingIds = new ArrayList<String>();
    if (!StringUtils.isEmpty(params.meetingID)) {
      externalMeetingIds = paramsProcessorUtil.decodeIds(params.meetingID);
    }

    ArrayList<String> internalRecordIds = new ArrayList<String>()
    if (!StringUtils.isEmpty(params.recordID)) {
      internalRecordIds = paramsProcessorUtil.decodeIds(params.recordID)
    }

    ArrayList<String> states = new ArrayList<String>()
    if (!StringUtils.isEmpty(params.state)) {
      states = paramsProcessorUtil.decodeIds(params.state)
    }

    // Everything is good so far.
    if (internalRecordIds.size() == 0 && externalMeetingIds.size() > 0) {
      // No recordIDs, process the request based on meetingID(s)
      // Translate the external meeting ids to internal meeting ids (which is the seed for the recordIDs).
      internalRecordIds = paramsProcessorUtil.convertToInternalMeetingId(externalMeetingIds);
    }

    for(String intRecId : internalRecordIds) {
      log.debug intRecId
    }

    Map<String, String> metadataFilters = ParamsProcessorUtil.processMetaParam(params)

    String offset
    if(!StringUtils.isEmpty(params.offset)) {
      offset = params.offset
      log.info("Requested offset [${offset}]")
    }

    String limit
    if(!StringUtils.isEmpty(params.limit)) {
      limit = params.limit
      log.info("Requested item limit [${limit}]")
    }

    def getRecordingsResult = meetingService.getRecordings2x(internalRecordIds, states, metadataFilters, offset, limit)

    withFormat {
      xml {
        render(text: getRecordingsResult, contentType: "text/xml")
      }
    }
  }

  /******************************************************
   * UPDATE_RECORDINGS API
   ******************************************************/
  def updateRecordingsHandler = {
    String API_CALL = "updateRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    //sanitizeInput
    params.each {
      key, value -> params[key] = sanitizeInput(value)
    }

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.");
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a recording id? If none, complain.
    String recordId = params.recordID
    if (StringUtils.isEmpty(recordId)) {
      errors.missingParamError("recordID");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    List<String> recordIdList = new ArrayList<String>();
    if (!StringUtils.isEmpty(recordId)) {
      recordIdList = paramsProcessorUtil.decodeIds(recordId);
    }

    if (!meetingService.existsAnyRecording(recordIdList)) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find recordings");
      return;
      // END - backward compatibility
    }

    //Execute code specific for this call
    Map<String, String> metaParams = ParamsProcessorUtil.processMetaParam(params)
    if (!metaParams.empty) {
      //Proceed with the update
      meetingService.updateRecordings(recordIdList, metaParams);
    }
    withFormat {
      xml {
        // No need to use the response builder here until we have a more complex response
        render(text: "<response><returncode>$RESP_CODE_SUCCESS</returncode><updated>true</updated></response>", contentType: "text/xml")
      }
    }
  }



  /******************************************************
   * PUBLISH_RECORDINGS API
   ******************************************************/
  def publishRecordings = {
    String API_CALL = "publishRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    //sanitizeInput
    params.each {
      key, value -> params[key] = sanitizeInput(value)
    }

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.");
      return
    }

    if (StringUtils.isEmpty(params.publish)) {
      invalid("missingParamPublish", "You must specify a publish value true or false.");
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a recording id? If none, complain.
    String recordId = params.recordID
    if (StringUtils.isEmpty(recordId)) {
      errors.missingParamError("recordID");
    }
    // Do we have a publish status? If none, complain.
    String publish = params.publish
    if (StringUtils.isEmpty(publish)) {
      errors.missingParamError("publish");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    ArrayList<String> recordIdList = new ArrayList<String>();
    if (!StringUtils.isEmpty(recordId)) {
      recordIdList = paramsProcessorUtil.decodeIds(recordId);
    }

    if (!meetingService.existsAnyRecording(recordIdList)) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find recordings");
      return;
      // END - backward compatibility

    }

    meetingService.setPublishRecording(recordIdList, publish.toBoolean());
    withFormat {
      xml {
        // No need to use the response builder here until we have a more complex response
        render(text: "<response><returncode>$RESP_CODE_SUCCESS</returncode><published>$publish</published></response>", contentType: "text/xml")
      }
    }
  }

  /******************************************************
   * DELETE_RECORDINGS API
   ******************************************************/
  def deleteRecordings = {
    String API_CALL = "deleteRecordings"
    log.debug CONTROLLER_NAME + "#${API_CALL}"

    //sanitizeInput
    params.each {
      key, value -> params[key] = sanitizeInput(value)
    }

    // BEGIN - backward compatibility
    if (StringUtils.isEmpty(params.checksum)) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (StringUtils.isEmpty(params.recordID)) {
      invalid("missingParamRecordID", "You must specify a recordID.");
      return
    }

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }
    // END - backward compatibility

    ApiErrors errors = new ApiErrors()

    // Do we have a checksum? If none, complain.
    if (StringUtils.isEmpty(params.checksum)) {
      errors.missingParamError("checksum");
    }

    // Do we have a recording id? If none, complain.
    String recordId = params.recordID
    if (StringUtils.isEmpty(recordId)) {
      errors.missingParamError("recordID");
    }

    if (errors.hasErrors()) {
      respondWithErrors(errors)
      return
    }

    // Do we agree on the checksum? If not, complain.
    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      errors.checksumError()
      respondWithErrors(errors)
      return
    }

    List<String> recordIdList = new ArrayList<String>();
    if (!StringUtils.isEmpty(recordId)) {
      recordIdList = paramsProcessorUtil.decodeIds(recordId);
    }

    if (!meetingService.existsAnyRecording(recordIdList)) {
      // BEGIN - backward compatibility
      invalid("notFound", "We could not find recordings");
      return;
      // END - backward compatibility
    }

    meetingService.deleteRecordings(recordIdList);
    withFormat {
      xml {
        // No need to use the response builder here until we have a more complex response
        render(text: "<response><returncode>$RESP_CODE_SUCCESS</returncode><deleted>true</deleted></response>", contentType: "text/xml")
      }
    }
  }

  def checkTextTrackAuthToken = {
    try {
      def textTrackToken = request.getHeader("x-textTrack-token")
      def textTrackRecordId = request.getHeader("x-textTrack-recordId")
      def textTrackTrack = request.getHeader("x-textTrack-track")

      def isValid = false
      if (textTrackToken != null &&
              textTrackRecordId != null &&
              textTrackTrack != null) {
        isValid = meetingService.validateTextTrackSingleUseToken(textTrackRecordId, textTrackTrack, textTrackToken)
      }

      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      if (isValid) {
        response.setStatus(200)
        response.outputStream << 'authorized'
      } else {
        response.setStatus(401)
        response.outputStream << 'unauthorized'
      }
    } catch (IOException e) {
      log.error("Error while checking text track token.\n" + e.getMessage())
      response.setStatus(401)
      response.outputStream << 'unauthorized'
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
    log.debug("Captions for recordID: " + recordId)

    if (!paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
      invalid("checksumError", "You did not pass the checksum security check")
      return
    }

    if (!meetingService.isRecordingExist(recordId)) {
      respondWithError("noRecordings", "No recording was found for " + recordId)
      return
    }

    if (StringUtils.isEmpty(params.kind)) {
      respondWithError("paramError", "Missing param kind.")
      return
    }

    String captionsKind = StringUtils.strip(params.kind)
    log.debug("Captions kind: " + captionsKind)

    def isAllowedKind = captionsKind in ['subtitles', 'captions']
    if (!isAllowedKind) {
      respondWithError("invalidKind", "Invalid kind parameter, expected='subtitles|captions' actual=" + captionsKind)
      return
    }

    Locale locale
    if (StringUtils.isEmpty(params.lang)) {
      respondWithError("paramError", "Missing param lang.")
      return
    }

    String paramsLang = StringUtils.strip(params.lang)
    log.debug("Captions lang: " + paramsLang)


    try {
      locale = LocaleUtils.toLocale(paramsLang)
      log.debug("Captions locale: " + locale.toLanguageTag())
    } catch (IllegalArgumentException e) {
      respondWithError("invalidLang", "Malformed lang param, received=" + paramsLang)
      return
    }

    String captionsLang = locale.toLanguageTag()
    String captionsLabel = locale.getDisplayLanguage()

    if (!StringUtils.isEmpty(params.label)) {
      captionsLabel = StringUtils.strip(params.label)
    }

    def uploadedCaptionsFile = request.getFile('file')
    if (uploadedCaptionsFile && !uploadedCaptionsFile.empty) {
      def fileContentType = uploadedCaptionsFile.getContentType()
      log.debug("Captions content type: " + fileContentType)
      def origFilename = uploadedCaptionsFile.getOriginalFilename()
      def trackId = recordId + "-" + System.currentTimeMillis()
      def tempFilename = trackId + "-track.txt"
      def captionsFilePath = meetingService.getCaptionTrackInboxDir() + File.separatorChar + tempFilename
      def captionsFile = new File(captionsFilePath)

      uploadedCaptionsFile.transferTo(captionsFile)

      String result = meetingService.putRecordingTextTrack(recordId, captionsKind,
          captionsLang, captionsFile, captionsLabel, origFilename, trackId, fileContentType, tempFilename)

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

  private def sanitizeInput (input) {
    if(input == null)
      return

    if(!("java.lang.String".equals(input.getClass().getName())))
      return input

    StringUtils.strip(input.replaceAll("\\p{Cntrl}", ""));
  }

  private void respondWithErrors(errorList, redirectResponse = false) {
    log.debug CONTROLLER_NAME + "#invalid"
    if (redirectResponse) {
      ArrayList<Object> errors = new ArrayList<Object>();
      errorList.getErrors().each { error ->
        Map<String, String> errorMap = new LinkedHashMap<String, String>()
        errorMap.put("key", error[0])
        errorMap.put("message", error[1])
        errors.add(errorMap)
      }

      JSONArray errorsJSONArray = new JSONArray(errors);
      log.debug errorsJSONArray

      respondWithRedirect(errorsJSONArray)
    } else {
      response.addHeader("Cache-Control", "no-cache")
      withFormat {
        xml {
          render(text: responseBuilder.buildErrors(errorList.getErrors(), RESP_CODE_FAILED), contentType: "text/xml")
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
}

package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.apache.commons.lang.StringUtils;
import org.bigbluebutton.api.ApiErrors;

class RecordingController {
    private static final String CONTROLLER_NAME = 'RecordingController'

    MeetingService meetingService;
    ParamsProcessorUtil paramsProcessorUtil

    def getRecordingTextTracks = {

        String API_CALL = "publishRecordings"
        log.debug CONTROLLER_NAME + "#${API_CALL}"

        // BEGIN - backward compatibility
        if (StringUtils.isEmpty(params.checksum)) {
            respondWithError("paramError", "Missing param checksum.")
            return
        }

        if (StringUtils.isEmpty(params.recordID)) {
            respondWithError("paramError", "Missing param recordID.");
            return
        }

        String recordId = StringUtils.strip(params.recordID)

        // Do we agree on the checksum? If not, complain.
        //if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
        //    respondWithError("checksumError", "You did not pass the checksum security check.")
        //    return
        //}

        /*
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
        //if (! paramsProcessorUtil.isChecksumSame(API_CALL, params.checksum, request.getQueryString())) {
        //    errors.checksumError()
        //    respondWithErrors(errors)
        //    return
        //}
*/
        String result = meetingService.getRecordingTextTracks(recordId)

        println("************* RESULT = " + result)
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
                render(contentType: "application/json") {
                    response () {
                        returncode = "FAILED"
                        key = errorKey
                        msg = errorMessage
                    }
                }
            }
        }
    }

    private void respondWithErrors(reqErrors) {
        response.addHeader("Cache-Control", "no-cache")
        withFormat {
            json {
                render(contentType: "application/json") {
                    response () {
                        returncode = "FAILED"
                        errors = array {
                            for (b in reqErrors.getErrors()) {
                                error key: b[0], msg:  b[1]
                            }
                        }
                    }
                }
            }
        }
    }

    def putRecordingTextTrack = {
        log.debug CONTROLLER_NAME + "#putRecordingTextTrack"

        // BEGIN - backward compatibility
        if (StringUtils.isEmpty(params.checksum)) {
            respondWithError("paramError", "Missing param checksum.")
            return
        }

        if (StringUtils.isEmpty(params.recordID)) {
            respondWithError("paramError", "Missing param recordID.");
            return
        }

        String recordId = StringUtils.strip(params.recordID)

        if (StringUtils.isEmpty(params.kind)) {
            respondWithError("paramError", "Missing param kind.");
            return
        }

        String captionsKind = StringUtils.strip(params.recordID)

        if (StringUtils.isEmpty(params.lang)) {
            respondWithError("paramError", "Missing param lang.");
            return
        }

        String captionsLang = StringUtils.strip(params.lang)
        String captionsLabel = captionsLang

        if (!StringUtils.isEmpty(params.label)) {
            captionsLabel = StringUtils.strip(params.label)
        }

        def captionsFile = request.getFile('file')
        if (captionsFile && !captionsFile.empty) {
            def origFilename = captionsFile.getOriginalFilename()
            String result = meetingService.putRecordingTextTrack(recordId, captionsKind,
                    captionsLang, captionsFile, captionsLabel, origFilename)
            println("************* RESULT = " + result)
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
                    render(contentType: "application/json") {
                        response = {
                            returncode = "FAILED"
                            message = "Failed to put recording text tracks."
                        }
                    }
                }
            }
        }

    }
}
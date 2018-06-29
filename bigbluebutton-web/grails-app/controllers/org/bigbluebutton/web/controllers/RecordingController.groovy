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

        String API_CALL = "getRecordingTextTracks"
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

        String result = meetingService.getRecordingTextTracks(recordId)

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
                        messageKey = errorKey
                        messsage = errorMessage
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

        String captionsKind = StringUtils.strip(params.kind)

        if (StringUtils.isEmpty(params.lang)) {
            respondWithError("paramError", "Missing param lang.");
            return
        }

        String captionsLang = StringUtils.strip(params.lang)
        String captionsLabel = captionsLang

        if (!StringUtils.isEmpty(params.label)) {
            captionsLabel = StringUtils.strip(params.label)
        }

        def uploadedCaptionsFile = request.getFile('file')
        if (uploadedCaptionsFile && !uploadedCaptionsFile.empty) {
            def origFilename = uploadedCaptionsFile.getOriginalFilename()
            def trackId = recordId + "-" + System.currentTimeMillis()
            def captionsFilePath = meetingService.getCaptionTrackInboxDir() + File.separatorChar + trackId + "-track.txt"
            def captionsFile = new File(captionsFilePath)

            uploadedCaptionsFile.transferTo(captionsFile)

            String result = meetingService.putRecordingTextTrack(recordId, captionsKind,
                    captionsLang, captionsFile, captionsLabel, origFilename, trackId)

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
                            messageKey = "empty_uploaded_text_track"
                            message = "Empty uploaded text track."
                        }
                    }
                }
            }
        }

    }
}
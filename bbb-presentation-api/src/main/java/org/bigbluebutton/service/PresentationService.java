package org.bigbluebutton.service;

import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.PresentationUploadToken;
import org.bigbluebutton.util.Pair;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

public interface PresentationService {

    boolean isPresentationTokenValid(String token);
    boolean isPresentationTokenValidAndExpired(String token);
    PresentationUploadToken getPresentationUploadToken(String token);
    void sendPresentationUploadMaxFileSizeMessage(PresentationUploadToken uploadToken, int uploadedFileSize, int maxUploadFileSize);
    Pair<String, File> movePresentationFile(MultipartFile file, String presentationFileName, String meetingId, String fileNameExtension);
    UploadedPresentation generateUploadedPresentation(String podId, String meetingId, String presId, String tempPresId,
                                                      String presFileName, boolean current, String presentationToken,
                                                      boolean uploadFailed, List<String> uploadFailedReasons, boolean isDownloadable);
    void processUploadedPresentation(UploadedPresentation uploadedPresentation);
    File showSlide(String conference, String room, String presentationName, String slide);
    File showSvgImage(String conference, String room, String presentationName, String slide);
    File showThumbnail(String conference, String room, String presentationName, String thumbnail);
    File showPng(String conference, String room, String presentationName, String png);
    File showTextFile(String conference, String room, String presentationName, String file);
    File getDownloadablePresentationFile(String meetingId, String presId, String presentationFilename);
    int numberOfThumbnails(String conference, String room, String presentationName);
}

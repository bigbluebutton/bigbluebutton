package org.bigbluebutton.presentation.imp;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.presentation.FileTypeConstants;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class OfficeDocumentValidator2 {
  private static Logger log = LoggerFactory.getLogger(OfficeDocumentValidator2.class);

  private String presCheckExec;

  public boolean isValid(UploadedPresentation pres) {
    boolean valid = true;

    if (FilenameUtils.isExtension(pres.getUploadedFile().getName(), FileTypeConstants.PPTX)) {
      String COMMAND = "timeout 20 " + presCheckExec + " " + pres.getUploadedFile().getAbsolutePath();

      log.info("Running pres check " + COMMAND);

      boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);

      if (done) {
        return true;
      } else {
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("message", "PPTX failed validation.");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.error("-- analytics -- {}", logStr);

        return false;
      }
    }
    return valid;
  }

  public void setPresCheckExec(String path) {
    this.presCheckExec = path;
  }

}

package org.bigbluebutton.presentation.imp;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Predicate;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.util.LittleEndian;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.bigbluebutton.presentation.FileTypeConstants;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class OfficeDocumentValidator {
  private static Logger log = LoggerFactory.getLogger(OfficeDocumentValidator.class);

  public boolean isValid(UploadedPresentation pres) {
    boolean valid = true;
    if (FilenameUtils.isExtension(pres.getUploadedFile().getName(),
        FileTypeConstants.PPTX)) {
      XMLSlideShow xmlSlideShow;
      try {
        xmlSlideShow = new XMLSlideShow(
            new FileInputStream(pres.getUploadedFile()));
        valid &= !embedsEmf(xmlSlideShow, pres);
        valid &= !containsTinyTileBackground(xmlSlideShow, pres);
        // Close the resource once we finished reading it
        xmlSlideShow.close();
      } catch (IOException e) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("message", "Cannot open PPTX file " + pres.getName());
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.error("-- analytics -- {}", logStr);

        valid = false;
      }
    }
    return valid;
  }

  /**
   * Checks if the slide-show file embeds any EMF document
   * 
   * @param xmlSlideShow
   * @return
   */
  private boolean embedsEmf(XMLSlideShow xmlSlideShow, UploadedPresentation pres) {
    EmfPredicate emfPredicate = new EmfPredicate();
    ArrayList<XSLFPictureData> embeddedEmfFiles = (ArrayList<XSLFPictureData>) CollectionUtils
        .select(xmlSlideShow.getPictureData(), emfPredicate);
    if (!embeddedEmfFiles.isEmpty()) {

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("message", "Found " + embeddedEmfFiles.size() + " EMF files in presentation.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn("-- analytics -- {}", logStr);

      return true;
    }
    return false;
  }

  /**
   * Checks if the slide-show contains a small background tile image
   * 
   * @param xmlSlideShow
   * @return
   */
  private boolean containsTinyTileBackground(XMLSlideShow xmlSlideShow, UploadedPresentation pres) {
    TinyTileBackgroundPredicate tinyTileCondition = new TinyTileBackgroundPredicate();
    ArrayList<XSLFPictureData> tileImage = (ArrayList<XSLFPictureData>) CollectionUtils
        .select(xmlSlideShow.getPictureData(), tinyTileCondition);
    if (!tileImage.isEmpty()) {

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("message", "Found small background tile image.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn("-- analytics -- {}", logStr);

      return true;
    }
    return false;
  }

  private final class EmfPredicate implements Predicate<XSLFPictureData> {
    @Override
    public boolean evaluate(XSLFPictureData img) {
      return "image/x-emf".equals(img.getContentType());
    }
  }

  private final class TinyTileBackgroundPredicate
      implements Predicate<XSLFPictureData> {
    @Override
    public boolean evaluate(XSLFPictureData img) {
      return img.getContentType() != null
          && "image/jpeg".equals(img.getContentType())
          && LittleEndian.getLong(img.getChecksum()) == 4114937224L;
    }
  }
}

package org.bigbluebutton.presentation.imp;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;

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

public class OfficeDocumentValidator {
  private static Logger log = LoggerFactory
      .getLogger(OfficeDocumentValidator.class);

  public boolean isValid(UploadedPresentation pres) {
    boolean valid = true;
    if (FilenameUtils.isExtension(pres.getUploadedFile().getName(),
        FileTypeConstants.PPTX)) {
      XMLSlideShow xmlSlideShow;
      try {
        xmlSlideShow = new XMLSlideShow(
            new FileInputStream(pres.getUploadedFile()));
        valid &= !embedsEmf(xmlSlideShow);
        valid &= !containsTinyTileBackground(xmlSlideShow);
        // Close the resource once we finished reading it
        xmlSlideShow.close();
      } catch (IOException e) {
        log.error("Cannot open PPTX file " + pres.getName());
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
  private boolean embedsEmf(XMLSlideShow xmlSlideShow) {
    EmfPredicate emfPredicate = new EmfPredicate();
    ArrayList<XSLFPictureData> embeddedEmfFiles = (ArrayList<XSLFPictureData>) CollectionUtils
        .select(xmlSlideShow.getPictureData(), emfPredicate);
    if (embeddedEmfFiles.size() > 0) {
      log.warn(
          "Found " + embeddedEmfFiles.size() + " EMF files in presentation.");
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
  private boolean containsTinyTileBackground(XMLSlideShow xmlSlideShow) {
    TinyTileBackgroundPredicate tinyTileCondition = new TinyTileBackgroundPredicate();
    ArrayList<XSLFPictureData> tileImage = (ArrayList<XSLFPictureData>) CollectionUtils
        .select(xmlSlideShow.getPictureData(), tinyTileCondition);
    if (tileImage.size() > 0) {
      log.warn("Found small background tile image.");
      return true;
    }
    return false;
  }

  private final class EmfPredicate implements Predicate<XSLFPictureData> {
    @Override
    public boolean evaluate(XSLFPictureData img) {
      return img.getContentType().equals("image/x-emf");
    }
  }

  private final class TinyTileBackgroundPredicate
      implements Predicate<XSLFPictureData> {
    @Override
    public boolean evaluate(XSLFPictureData img) {
      return img.getContentType() != null
          && img.getContentType().equals("image/jpeg")
          && LittleEndian.getLong(img.getChecksum()) == 4114937224L;
    }
  }
}

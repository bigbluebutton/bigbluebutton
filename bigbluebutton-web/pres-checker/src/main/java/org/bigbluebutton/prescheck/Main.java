package org.bigbluebutton.prescheck;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Predicate;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.util.LittleEndian;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFSlide;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;

public class Main {

  public static void main(String[] args) {
    Main main = new Main();

    String filepath;
    try {
       // Parse the string argument into an integer value.
       filepath = args[0];
       boolean valid = main.check(main, filepath);
       if (!valid) System.exit(2);
       	System.exit(0);
    }
    catch (Exception nfe) {
       System.exit(1);
    }

  }

  private boolean check(Main main, String file) {
  	boolean valid = true;
  	XMLSlideShow xmlSlideShow;
      try {
        xmlSlideShow = new XMLSlideShow(new FileInputStream(file));
        valid &= !main.embedsEmf(xmlSlideShow);
        valid &= !main.containsTinyTileBackground(xmlSlideShow);
        valid &= !main.allSlidesAreHidden(xmlSlideShow);
        // Close the resource once we finished reading it
        xmlSlideShow.close();
      } catch (IOException e) {
        valid = false;
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
      return true;
    }
    return false;
  }

	private boolean allSlidesAreHidden(XMLSlideShow xmlSlideShow) {
		HiddenSlidePredicate hiddenSlidePredicate = new HiddenSlidePredicate();
    ArrayList<XSLFSlide> hiddenSlides = (ArrayList<XSLFSlide>) CollectionUtils
		    .select(xmlSlideShow.getSlides(), hiddenSlidePredicate);
		if (hiddenSlides.size() == xmlSlideShow.getSlides().size()) {
			return true;
		}
		return false;
	}

  private final class EmfPredicate implements Predicate<XSLFPictureData> {
    public boolean evaluate(XSLFPictureData img) {
      return img.getContentType().equals("image/x-emf");
    }
  }

  private final class TinyTileBackgroundPredicate
      implements Predicate<XSLFPictureData> {
    public boolean evaluate(XSLFPictureData img) {
      return img.getContentType() != null
          && img.getContentType().equals("image/jpeg")
          && LittleEndian.getLong(img.getChecksum()) == 4114937224L;
    }
  }

	private final class HiddenSlidePredicate implements Predicate<XSLFSlide> {
		public boolean evaluate(XSLFSlide slide) {
			return !slide.getXmlObject().getShow();
		}
	}
}

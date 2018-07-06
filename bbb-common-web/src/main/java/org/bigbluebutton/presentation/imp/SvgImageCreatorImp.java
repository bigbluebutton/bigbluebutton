package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class SvgImageCreatorImp implements SvgImageCreator {
  private static Logger log = LoggerFactory.getLogger(SvgImageCreatorImp.class);

  private String IMAGEMAGICK_DIR;

  @Override
  public boolean createSvgImages(UploadedPresentation pres) {
    boolean success = false;
    File svgImagesPresentationDir = determineSvgImagesDirectory(
        pres.getUploadedFile());
    if (!svgImagesPresentationDir.exists())
      svgImagesPresentationDir.mkdir();

    cleanDirectory(svgImagesPresentationDir);

    try {
      success = generateSvgImages(svgImagesPresentationDir, pres);
    } catch (InterruptedException e) {
      log.warn("Interrupted Exception while generating images.");
      success = false;
    }

    return success;
  }

  private boolean generateSvgImages(File imagePresentationDir,
      UploadedPresentation pres) throws InterruptedException {
    String source = pres.getUploadedFile().getAbsolutePath();
    String dest;
    String COMMAND = "";
    boolean done = true;
    if (SupportedFileTypes.isImageFile(pres.getFileType())) {
      dest = imagePresentationDir.getAbsolutePath() + File.separatorChar
          + "slide1.pdf";
      COMMAND = IMAGEMAGICK_DIR + File.separatorChar + "convert " + source + " "
          + dest;

      done = new ExternalProcessExecutor().exec(COMMAND, 60000);

      source = imagePresentationDir.getAbsolutePath() + File.separatorChar
          + "slide1.pdf";
      dest = imagePresentationDir.getAbsolutePath() + File.separatorChar
          + "slide1.svg";
      COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f 1 -l 1 " + source + " "
          + dest;

      done = new ExternalProcessExecutor().exec(COMMAND, 60000);

    } else {
      for (int i = 1; i <= pres.getNumberOfPages(); i++) {
        File destsvg = new File(imagePresentationDir.getAbsolutePath()
            + File.separatorChar + "slide" + i + ".svg");
        COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f " + i + " -l " + i
            + " " + File.separatorChar + source + " "
            + destsvg.getAbsolutePath();

        done = new ExternalProcessExecutor().exec(COMMAND, 60000);
        if (!done) {
          break;
        }
      }
    }

    if (done) {
      return true;
    }

    Map<String, Object> logData = new HashMap<>();
    logData.put("meetingId", pres.getMeetingId());
    logData.put("presId", pres.getId());
    logData.put("filename", pres.getName());
    logData.put("message", "Failed to create svg images.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);
    log.warn("-- analytics -- {}", logStr);

    return false;
  }

  private File determineSvgImagesDirectory(File presentationFile) {
    return new File(presentationFile.getParent() + File.separatorChar + "svgs");
  }

  private void cleanDirectory(File directory) {
    File[] files = directory.listFiles();
    for (File file : files) {
      file.delete();
    }
  }

  public void setImageMagickDir(String imageMagickDir) {
    IMAGEMAGICK_DIR = imageMagickDir;
  }

}

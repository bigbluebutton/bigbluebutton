package org.bigbluebutton.presentation.imp;


import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class PageToConvert {
  private static Logger log = LoggerFactory.getLogger(PageToConvert.class);

  private String BLANK_THUMBNAIL;
  private String BLANK_PNG;
  private String BLANK_SVG;

  private long execTimeout = 60000;

  private UploadedPresentation pres;
  private int page;

  private boolean svgImagesRequired=true;
  private boolean generatePngs;
  private PageExtractor pageExtractor;


  private TextFileCreator textFileCreator;
  private SvgImageCreator svgImageCreator;
  private ThumbnailCreator thumbnailCreator;
  private PngCreator pngCreator;
  private SlidesGenerationProgressNotifier notifier;
  private File pageFile;
  private String messageErrorInConversion;

  public PageToConvert(UploadedPresentation pres,
                       int page,
                       File pageFile,
                       boolean svgImagesRequired,
                       boolean generatePngs,
                       TextFileCreator textFileCreator,
                       SvgImageCreator svgImageCreator,
                       ThumbnailCreator thumbnailCreator,
                       PngCreator pngCreator,
                       SlidesGenerationProgressNotifier notifier) {
    this.pres = pres;
    this.page = page;
    this.pageFile = pageFile;
    this.svgImagesRequired = svgImagesRequired;
    this.generatePngs = generatePngs;
    this.textFileCreator = textFileCreator;
    this.svgImageCreator = svgImageCreator;
    this.thumbnailCreator = thumbnailCreator;
    this.pngCreator = pngCreator;
    this.notifier = notifier;
  }

  public File getPageFile() {
    return pageFile;
  }

  public int getPageNumber() {
    return page;
  }

  public String getPresId() {
    return pres.getId();
  }

  public String getMeetingId() {
    return pres.getMeetingId();
  }

  public String getMessageErrorInConversion() {
    return messageErrorInConversion;
  }

  public void setMessageErrorInConversion(String messageErrorInConversion) {
    this.messageErrorInConversion = messageErrorInConversion;
  }

  public PageToConvert convert() {

    /* adding accessibility */
    //createThumbnails(pres, page, pageFile);

//    createTextFiles(pres, page);

    // only create SVG images if the configuration requires it
//    if (svgImagesRequired) {
//      try{
//        createSvgImages(pres, page);
//      } catch (TimeoutException e) {
//        messageErrorInConversion = e.getMessage();
//      }
//    }

    // only create PNG images if the configuration requires it
//    if (generatePngs) {
//      createPngImages(pres, page, pageFile);
//    }

    File textfilesDir = determineTextfilesDirectory(pres.getUploadedFile());
    if (!textfilesDir.exists())
      textfilesDir.mkdir();

    File thumbsDir = determineThumbnailDirectory(pres.getUploadedFile());
    if (!thumbsDir.exists())
      thumbsDir.mkdir();

    File pngDir = determinePngDirectory(pres.getUploadedFile());
    if (!pngDir.exists())
      pngDir.mkdir();

    File svgImagesPresentationDir = determineSvgImagesDirectory(pres.getUploadedFile());
    if (!svgImagesPresentationDir.exists())
      svgImagesPresentationDir.mkdir();

    String service = "pdfprocess@" + pres.getMeetingId() + "_" + pres.getId() +"_" + page + ".service";
    log.info("Starting PDF processing service [{}]", service);
    String COMMAND = "sudo systemctl start " + service;

    boolean done = new ExternalProcessExecutor().exec(COMMAND, execTimeout);

    //createBlankThumbnail(thumbsDir, page);

    return this;
  }

  private File determineTextfilesDirectory(File presentationFile) {
    return new File(
            presentationFile.getParent() + File.separatorChar + "textfiles");
  }

  private File determineThumbnailDirectory(File presentationFile) {
    return new File(
            presentationFile.getParent() + File.separatorChar + "thumbnails");
  }

  private File determinePngDirectory(File presentationFile) {
    return new File(presentationFile.getParent() + File.separatorChar + "pngs");
  }

  private File determineSvgImagesDirectory(File presentationFile) {
    return new File(presentationFile.getParent() + File.separatorChar + "svgs");
  }

  private void createBlankThumbnail(File thumbsDir, int page) {
    File thumb = new File(thumbsDir.getAbsolutePath() + File.separatorChar + "thumb-" + page + ".png");
    if (!thumb.exists()) {
      log.info("Copying blank thumbnail for slide {}", page);
      copyBlankThumbnail(thumb);
    }
  }

  private void copyBlankThumbnail(File thumb) {
    try {
      FileUtils.copyFile(new File(BLANK_THUMBNAIL), thumb);
    } catch (IOException e) {
      log.error("IOException while copying blank thumbnail.", e);
    }
  }

  private void createBlankPng(File pngsDir, int page) {
    File png = new File(pngsDir.getAbsolutePath() + File.separator + "slide-" + page + ".png");
    if (!png.exists()) {
      log.info("Copying blank png for slide {}", page);
      copyBlankPng(png);
    }
  }

  private void copyBlankPng(File png) {
    try {
      FileUtils.copyFile(new File(BLANK_PNG), png);
    } catch (IOException e) {
      log.error("IOException while copying blank PNG.");
    }
  }

  private void copyBlankSvgs(File svgssDir, int pageCount) {
    File[] svgs = svgssDir.listFiles();

    if (svgs.length != pageCount) {
      for (int i = 1; i <= pageCount; i++) {
        File svg = new File(svgssDir.getAbsolutePath() + File.separator + "slide" + i + ".svg");
        if (!svg.exists()) {
          log.info("Copying blank svg for slide {}", i);
          copyBlankSvg(svg);
        }
      }
    }
  }

  private void copyBlankSvg(File svg) {
    try {
      log.info("Copying blank SVG to {}", svg);
      FileUtils.copyFile(new File(BLANK_SVG), svg);
    } catch (IOException e) {
      log.error("IOException while copying blank SVG.");
    }
  }

  private void createThumbnails(UploadedPresentation pres, int page, File pageFile) {
    //notifier.sendCreatingThumbnailsUpdateMessage(pres);
    thumbnailCreator.createThumbnail(pres, page, pageFile);
  }

  private void createTextFiles(UploadedPresentation pres, int page) {
    //notifier.sendCreatingTextFilesUpdateMessage(pres);
    textFileCreator.createTextFile(pres, page);
  }

  private void createSvgImages(UploadedPresentation pres, int page) throws TimeoutException {
    //notifier.sendCreatingSvgImagesUpdateMessage(pres);
    svgImageCreator.createSvgImage(pres, page);
  }

  private void createPngImages(UploadedPresentation pres, int page, File pageFile) {
    pngCreator.createPng(pres, page, pageFile);
  }
}

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

  private String blankThumbnail;
  private String blankPng;
  private String blankSvg;

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
                       SlidesGenerationProgressNotifier notifier,
                       String blankThumbnail,
                       String blankPng,
                       String blankSvg) {
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
    this.blankThumbnail = blankThumbnail;
    this.blankPng = blankPng;
    this.blankSvg = blankSvg;
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
    File textfilesDir = determineTextfilesDirectory(pres.getUploadedFile());
    if (!textfilesDir.exists())
      textfilesDir.mkdir();

    File thumbsDir = determineThumbnailDirectory(pres.getUploadedFile());
    if (!thumbsDir.exists())
      thumbsDir.mkdir();

    File pngDir = determinePngDirectory(pres.getUploadedFile());
    if (!pngDir.exists())
      pngDir.mkdir();

    File svgDir = determineSvgImagesDirectory(pres.getUploadedFile());
    if (!svgDir.exists())
      svgDir.mkdir();

    String service;
    if (SupportedFileTypes.isImageFile(pres.getFileType())) {
      service = "imgprocess@" + pres.getMeetingId() + "_" + pres.getId() +"_" + pres.getFileType() + ".service";
    } else {
      service = "pdfprocess@" + pres.getMeetingId() + "_" + pres.getId() +"_" + page + ".service";
    }
    log.info("Starting processing service [{}]", service);
    String COMMAND = "sudo systemctl start " + service;

    boolean done = new ExternalProcessExecutor().exec(COMMAND, execTimeout);

    createBlankThumbnail(thumbsDir, page);
    createBlankPng(pngDir, page);
    createBlankSvg(svgDir, page);

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

  private void createBlankThumbnail(File dir, int page) {
    File thumb = new File(dir.getAbsolutePath() + File.separatorChar + "thumb-" + page + ".png");
    if (!thumb.exists()) {
      log.info("Copying blank thumbnail for slide {}", page);
      copyBlankThumbnail(thumb);
    }
  }

  private void copyBlankThumbnail(File thumb) {
    try {
      FileUtils.copyFile(new File(blankThumbnail), thumb);
    } catch (IOException e) {
      log.error("IOException while copying blank thumbnail.", e);
    }
  }

  private void createBlankPng(File dir, int page) {
    File png = new File(dir.getAbsolutePath() + File.separator + "slide-" + page + ".png");
    if (!png.exists()) {
      log.info("Copying blank png for slide {}", page);
      copyBlankPng(png);
    }
  }

  private void copyBlankPng(File png) {
    try {
      FileUtils.copyFile(new File(blankPng), png);
    } catch (IOException e) {
      log.error("IOException while copying blank PNG.");
    }
  }

  private void createBlankSvg(File dir, int page) {
    File svg = new File(dir.getAbsolutePath() + File.separator + "slide" + page + ".svg");
    if (!svg.exists()) {
      log.info("Copying blank svg for slide {}", page);
      copyBlankSvg(svg);
    }
  }

  private void copyBlankSvg(File svg) {
    try {
      FileUtils.copyFile(new File(blankSvg), svg);
    } catch (IOException e) {
      log.error("IOException while copying blank SVG.");
    }
  }
}

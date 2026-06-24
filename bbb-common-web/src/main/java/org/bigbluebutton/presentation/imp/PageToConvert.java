package org.bigbluebutton.presentation.imp;


import org.bigbluebutton.presentation.*;
import java.io.File;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

public class PageToConvert {

  private UploadedPresentation pres;
  private int page;

  private boolean svgImagesRequired=true;
  private boolean generatePngs;
  private boolean useBlanks;
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
                       boolean useBlanks,
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
    this.useBlanks = useBlanks;
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

  public UploadedPresentation getPres() { return this.pres; }

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

  public boolean convert() {
    /* adding accessibility */
    createThumbnails(pres, page, pageFile, useBlanks);

    createTextFiles(pres, page, useBlanks);

    // only create SVG images if the configuration requires it
    if (svgImagesRequired) {
      try{
        createSvgImages(pres, page, useBlanks);
      } catch (TimeoutException e) {
        messageErrorInConversion = e.getMessage();
      }
    }

    // only create PNG images if the configuration requires it
    if (generatePngs) {
      createPngImages(pres, page, pageFile, useBlanks);
    }

    return true;
  }

  public void createBlanks() {
    thumbnailCreator.createBlank(pres, page);
    textFileCreator.createBlank(pres, page);
    if (svgImagesRequired) svgImageCreator.createBlank(pres, page);
    if (generatePngs) pngCreator.createBlank(pres, page);
  }

  private void createThumbnails(UploadedPresentation pres, int page, File pageFile, boolean useBlank) {
    //notifier.sendCreatingThumbnailsUpdateMessage(pres);
    thumbnailCreator.createThumbnail(pres, page, pageFile, useBlank);
  }

  private void createTextFiles(UploadedPresentation pres, int page, boolean useBlank) {
    //notifier.sendCreatingTextFilesUpdateMessage(pres);
    textFileCreator.createTextFile(pres, page, useBlank);
  }

  private void createSvgImages(UploadedPresentation pres, int page, boolean useBlank) throws TimeoutException {
    //notifier.sendCreatingSvgImagesUpdateMessage(pres);
    svgImageCreator.createSvgImage(pres, page, useBlank);
  }

  private void createPngImages(UploadedPresentation pres, int page, File pageFile, boolean useBlank) {
    pngCreator.createPng(pres, page, pageFile, useBlank);
  }

}

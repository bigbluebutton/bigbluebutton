package org.bigbluebutton.presentation.imp;


import org.bigbluebutton.presentation.*;
import java.io.File;
import java.util.concurrent.TimeoutException;

public class PageToConvert {

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
    createThumbnails(pres, page, pageFile);

    createTextFiles(pres, page);

    // only create SVG images if the configuration requires it
    if (svgImagesRequired) {
      try{
        createSvgImages(pres, page);
      } catch (TimeoutException e) {
        messageErrorInConversion = e.getMessage();
      }
    }

    // only create PNG images if the configuration requires it
    if (generatePngs) {
      createPngImages(pres, page, pageFile);
    }

    return this;
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

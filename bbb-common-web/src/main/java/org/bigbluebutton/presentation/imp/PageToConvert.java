package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import org.bigbluebutton.presentation.*;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

public class PageToConvert {

  private UploadedPresentation pres;
  private int page;
  private File pageFile;

  private boolean swfSlidesRequired;
  private boolean svgImagesRequired;
  private boolean generatePngs;

  private String BLANK_SLIDE;
  private int MAX_SWF_FILE_SIZE;

  private TextFileCreator textFileCreator;
  private SvgImageCreator svgImageCreator;
  private ThumbnailCreator thumbnailCreator;
  private PngCreator pngCreator;
  private PageConverter pdfToSwfConverter;
  private SwfSlidesGenerationProgressNotifier notifier;

  public PageToConvert(UploadedPresentation pres,
                       int page,
                       File pageFile,
                       boolean swfSlidesRequired,
                       boolean svgImagesRequired,
                       boolean generatePngs,
                       TextFileCreator textFileCreator,
                       SvgImageCreator svgImageCreator,
                       ThumbnailCreator thumbnailCreator,
                       PngCreator pngCreator,
                       PageConverter pdfToSwfConverter,
                       SwfSlidesGenerationProgressNotifier notifier,
                       String blankSlide,
                       int maxSwfFileSize) {
    this.pres = pres;
    this.page = page;
    this.pageFile = pageFile;
    this.swfSlidesRequired = swfSlidesRequired;
    this.svgImagesRequired = svgImagesRequired;
    this.generatePngs = generatePngs;
    this.textFileCreator = textFileCreator;
    this.svgImageCreator = svgImageCreator;
    this.thumbnailCreator = thumbnailCreator;
    this.pngCreator = pngCreator;
    this.pdfToSwfConverter = pdfToSwfConverter;
    this.notifier = notifier;
    this.BLANK_SLIDE = blankSlide;
    this.MAX_SWF_FILE_SIZE = maxSwfFileSize;
  }

  public File getPageFile() {
    return pageFile;
  }

  public int getPageNumber() {
    return page;
  }

  public PageToConvert convert() {
    // Only create SWF files if the configuration requires it
    if (swfSlidesRequired) {
      convertPdfToSwf(pres, page, pageFile);
    }

    System.out.println("****** CREATING THM page=" + page);
    /* adding accessibility */
    createThumbnails(pres, page, pageFile);

    System.out.println("****** CREATING TXTs page=" + page);
    createTextFiles(pres, page);

    System.out.println("****** CREATING SVGs page=" + page);
    // only create SVG images if the configuration requires it
    if (svgImagesRequired) {
      createSvgImages(pres, page);
    }

    System.out.println("****** CREATING PNGs page=" + page);
    // only create PNG images if the configuration requires it
    if (generatePngs) {
      createPngImages(pres, page, pageFile);
    }

    return this;
  }


  private void createThumbnails(UploadedPresentation pres, int page, File pageFile) {
    notifier.sendCreatingThumbnailsUpdateMessage(pres);
    thumbnailCreator.createThumbnail(pres, page, pageFile);
  }

  private void createTextFiles(UploadedPresentation pres, int page) {
    notifier.sendCreatingTextFilesUpdateMessage(pres);
    textFileCreator.createTextFile(pres, page);
  }

  private void createSvgImages(UploadedPresentation pres, int page) {
    notifier.sendCreatingSvgImagesUpdateMessage(pres);
    svgImageCreator.createSvgImage(pres, page);
  }

  private void createPngImages(UploadedPresentation pres, int page, File pageFile) {
    pngCreator.createPng(pres, page, pageFile);
  }

  private void convertPdfToSwf(UploadedPresentation pres, int page, File pageFile) {
    PdfToSwfSlide slide = setupSlide(pres, page, pageFile);
    generateSlides(pres, slide);
  }


  private void generateSlides(UploadedPresentation pres, PdfToSwfSlide slide) {
    slide.createSlide();
    if (!slide.isDone()) {
      slide.generateBlankSlide();
    }
  }

  private PdfToSwfSlide setupSlide(UploadedPresentation pres, int page, File pageFile) {
    PdfToSwfSlide slide = new PdfToSwfSlide(pres, page, pageFile);
    slide.setBlankSlide(BLANK_SLIDE);
    slide.setMaxSwfFileSize(MAX_SWF_FILE_SIZE);
    slide.setPageConverter(pdfToSwfConverter);

    return slide;
  }
}

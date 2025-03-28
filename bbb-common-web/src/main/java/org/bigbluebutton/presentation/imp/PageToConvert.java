package org.bigbluebutton.presentation.imp;


import org.bigbluebutton.presentation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;

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
  private PresentationProcessExternal presentationProcessExternal;

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
                       PresentationProcessExternal presentationProcessExternal,
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
    this.presentationProcessExternal = presentationProcessExternal;
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
    File textfilesDir = Util.determineTextfilesDirectory(pres.getUploadedFile());
    if (!textfilesDir.exists())
      textfilesDir.mkdir();

    File thumbsDir = Util.determineThumbnailDirectory(pres.getUploadedFile());
    if (!thumbsDir.exists())
      thumbsDir.mkdir();

    File pngDir = Util.determinePngDirectory(pres.getUploadedFile());
    if (!pngDir.exists())
      pngDir.mkdir();

    File svgDir = Util.determineSvgImagesDirectory(pres.getUploadedFile());
    if (!svgDir.exists())
      svgDir.mkdir();

    // Call external application to process the page in a sandbox
    presentationProcessExternal.processPage(pres.getMeetingId(), pres.getId(), page);

    Util.createBlankThumbnail(thumbsDir, page, blankThumbnail);
    if (generatePngs) {
      Util.createBlankPng(pngDir, page, blankPng);
    }
    Util.createBlankSvg(svgDir, page, blankSvg);

    return this;
  }

}

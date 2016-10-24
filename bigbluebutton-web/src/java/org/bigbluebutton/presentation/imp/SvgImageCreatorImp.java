package org.bigbluebutton.presentation.imp;

import java.io.File;

import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SvgImageCreatorImp implements SvgImageCreator {
    private static Logger log = LoggerFactory
            .getLogger(SvgImageCreatorImp.class);

    private String IMAGEMAGICK_DIR;

    @Override
    public boolean createSvgImages(UploadedPresentation pres) {
        boolean success = false;
        File svgImagesPresentationDir = determineSvgImagesDirectory(pres
                .getUploadedFile());
        if (!svgImagesPresentationDir.exists())
            svgImagesPresentationDir.mkdir();

        cleanDirectory(svgImagesPresentationDir);

        try {
            extractPdfPages(pres);
            success = generateSvgImages(svgImagesPresentationDir, pres);
        } catch (InterruptedException e) {
            log.warn("Interrupted Exception while generating images.");
            success = false;
        }

        return success;
    }

    private void extractPdfPages(UploadedPresentation pres) {
        File pdfDir = new File(pres.getUploadedFile().getParent()
                + File.separatorChar + "pdfs");
        if (!pdfDir.exists())
            pdfDir.mkdir();

        if (SupportedFileTypes.isPdfFile(pres.getFileType())) {
            for (int i = 1; i <= pres.getNumberOfPages(); i++) {
                File pdfFile = new File(pdfDir.getAbsolutePath()
                        + File.separatorChar + "slide" + i + ".pdf");
                String COMMAND = IMAGEMAGICK_DIR
                        + "/gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dFirstPage="
                        + i + " -dLastPage=" + i + " -sOutputFile="
                        + pdfFile.getAbsolutePath()
                        + " /etc/bigbluebutton/nopdfmark.ps "
                        + pres.getUploadedFile().getAbsolutePath();
                new ExternalProcessExecutor().exec(COMMAND, 60000);
            }

        }
    }

    private boolean generateSvgImages(File imagePresentationDir,
            UploadedPresentation pres) throws InterruptedException {
        String source = pres.getUploadedFile().getAbsolutePath();
        String dest;
        String COMMAND = "";
        boolean done = true;
        if (SupportedFileTypes.isImageFile(pres.getFileType())) {
            dest = imagePresentationDir.getAbsolutePath() + File.separator
                    + "slide1.pdf";
            COMMAND = IMAGEMAGICK_DIR + "/convert " + source + " " + dest;
            done = new ExternalProcessExecutor().exec(COMMAND, 60000);

            source = imagePresentationDir.getAbsolutePath() + File.separator
                    + "slide1.pdf";
            dest = imagePresentationDir.getAbsolutePath() + File.separator
                    + "slide1.svg";
            COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f 1 -l 1 " + source
                    + " " + dest;
            done = new ExternalProcessExecutor().exec(COMMAND, 60000);

        } else {
            for (int i = 1; i <= pres.getNumberOfPages(); i++) {
                File pdfFile = new File(imagePresentationDir.getParent()
                        + File.separatorChar + "pdfs" + File.separatorChar
                        + "slide" + i + ".pdf");
                File destsvg = new File(imagePresentationDir.getAbsolutePath()
                        + File.separatorChar + "slide" + i + ".svg");
                COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f 1 -l 1 "
                        + File.separatorChar + pdfFile.getAbsolutePath() + " "
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
        log.warn("Failed to create svg images: " + COMMAND);
        return false;
    }

    private File determineSvgImagesDirectory(File presentationFile) {
        return new File(presentationFile.getParent() + File.separatorChar
                + "svgs");
    }

    private void cleanDirectory(File directory) {
        File[] files = directory.listFiles();
        for (int i = 0; i < files.length; i++) {
            files[i].delete();
        }
    }

    public void setImageMagickDir(String imageMagickDir) {
        IMAGEMAGICK_DIR = imageMagickDir;
    }

}

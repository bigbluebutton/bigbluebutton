package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.handlers.AddNamespaceToSvgHandler;
import org.bigbluebutton.presentation.handlers.Pdf2PngPageConverterHandler;
import org.bigbluebutton.presentation.handlers.Png2SvgConversionHandler;
import org.bigbluebutton.presentation.handlers.SvgConversionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class SvgImageCreatorImp implements SvgImageCreator {
    private static Logger log = LoggerFactory.getLogger(SvgImageCreatorImp.class);

    private SwfSlidesGenerationProgressNotifier notifier;
    private long imageTagThreshold;
    private long pathsThreshold;
    private String convTimeout = "7s";
    private int WAIT_FOR_SEC = 7;
	private String BLANK_SVG;

    @Override
    public boolean createSvgImage(UploadedPresentation pres, int page) {
        boolean success = false;
        File svgImagesPresentationDir = determineSvgImagesDirectory(pres.getUploadedFile());
        if (!svgImagesPresentationDir.exists())
            svgImagesPresentationDir.mkdir();

        try {
            success = generateSvgImage(svgImagesPresentationDir, pres, page);
        } catch (Exception e) {
            log.error("Interrupted Exception while generating images {}", pres.getName(), e);
            success = false;
        }

        return success;
    }

    private boolean generateSvgImage(File imagePresentationDir, UploadedPresentation pres, int page)
            throws InterruptedException {
        String source = pres.getUploadedFile().getAbsolutePath();
        String dest;

        int numSlides = 1;
        boolean done = false;

        // Convert single image file
        if (SupportedFileTypes.isImageFile(pres.getFileType())) {

            dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide-1.pdf";

            NuProcessBuilder convertImgToSvg = new NuProcessBuilder(
                    Arrays.asList("timeout", convTimeout, "convert", source, "-auto-orient", dest));

            Png2SvgConversionHandler pHandler = new Png2SvgConversionHandler();
            convertImgToSvg.setProcessListener(pHandler);

            NuProcess process = convertImgToSvg.start();
            try {
                process.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
                done = true;
            } catch (InterruptedException e) {
                done = false;
                log.error("InterruptedException while converting to SVG {}", dest, e);
            }

            // Use the intermediate PDF file as source
            source = dest;
        }

        //System.out.println("******** CREATING SVG page ");

        // Continue image processing
        long startConv = System.currentTimeMillis();

        File destsvg = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "slide" + page + ".svg");

        NuProcessBuilder convertPdfToSvg = createConversionProcess("-svg", page, source, destsvg.getAbsolutePath(),
                    true);

        SvgConversionHandler pHandler = new SvgConversionHandler();
        convertPdfToSvg.setProcessListener(pHandler);

        NuProcess process = convertPdfToSvg.start();
        try {
            process.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
            done = true;
        } catch (InterruptedException e) {
            log.error("Interrupted Exception while generating SVG slides {}", pres.getName(), e);
        }

        if (!done) {
            return done;
        }

        if (destsvg.length() == 0 || pHandler.numberOfImageTags() > imageTagThreshold
                || pHandler.numberOfPaths() > pathsThreshold) {
            // We need t delete the destination file as we are starting a
            // new conversion process
            if (destsvg.exists()) {
                destsvg.delete();
            }

            done = false;

            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("page", page);
            logData.put("convertSuccess", pHandler.isCommandSuccessful());
            logData.put("fileExists", destsvg.exists());
            logData.put("numberOfImages", pHandler.numberOfImageTags());
            logData.put("numberOfPaths", pHandler.numberOfPaths());
            logData.put("logCode", "potential_problem_with_svg");
            logData.put("message", "Potential problem with generated SVG");
            Gson gson = new Gson();
            String logStr = gson.toJson(logData);

            log.warn(" --analytics-- data={}", logStr);

            File tempPng = null;
            String basePresentationame = UUID.randomUUID().toString();
            try {
                tempPng = File.createTempFile(basePresentationame + "-" + page, ".png");
            } catch (IOException ioException) {
                // We should never fall into this if the server is correctly
                // configured
                logData = new HashMap<String, Object>();
                logData.put("meetingId", pres.getMeetingId());
                logData.put("presId", pres.getId());
                logData.put("filename", pres.getName());
                logData.put("logCode", "problem_with_creating_svg");
                logData.put("message", "Unable to create temporary files");
                gson = new Gson();
                logStr = gson.toJson(logData);
                log.error(" --analytics-- data={}", logStr, ioException);
            }

            // Step 1: Convert a PDF page to PNG using a raw pdftocairo
            NuProcessBuilder convertPdfToPng = createConversionProcess("-png", page, source,
                        tempPng.getAbsolutePath().substring(0, tempPng.getAbsolutePath().lastIndexOf('.')), false);

            Pdf2PngPageConverterHandler pngHandler = new Pdf2PngPageConverterHandler();
            convertPdfToPng.setProcessListener(pngHandler);
            NuProcess pngProcess = convertPdfToPng.start();
            try {
                pngProcess.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                log.error("Interrupted Exception while generating PNG image {}", pres.getName(), e);
            }

            // Step 2: Convert a PNG image to SVG
            NuProcessBuilder convertPngToSvg = new NuProcessBuilder(Arrays.asList("timeout", convTimeout, "convert",
                        tempPng.getAbsolutePath(), destsvg.getAbsolutePath()));

            Png2SvgConversionHandler svgHandler = new Png2SvgConversionHandler();
            convertPngToSvg.setProcessListener(svgHandler);
            NuProcess svgProcess = convertPngToSvg.start();
            try {
                svgProcess.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                log.error("Interrupted Exception while generating SVG image {}", pres.getName(), e);
            }

            done = svgHandler.isCommandSuccessful();

            // Delete the temporary PNG after finishing the image conversion
            tempPng.delete();

            // Step 3: Add SVG namespace to the destionation file
            // Check : https://phabricator.wikimedia.org/T43174
            NuProcessBuilder addNameSpaceToSVG = new NuProcessBuilder(Arrays.asList("timeout", convTimeout,
                        "/bin/sh", "-c",
                        "sed -i "
                                + "'4s|>| xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.2\">|' "
                                + destsvg.getAbsolutePath()));

            AddNamespaceToSvgHandler namespaceHandler = new AddNamespaceToSvgHandler();
            addNameSpaceToSVG.setProcessListener(namespaceHandler);
            NuProcess namespaceProcess = addNameSpaceToSVG.start();
            try {
                namespaceProcess.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                log.error("Interrupted Exception while adding SVG namespace {}", pres.getName(), e);
            }
        }

        long endConv = System.currentTimeMillis();

        //System.out.println("******** CREATING SVG page " + page + " " + (endConv - startConv));

        if (done) {
            return true;
        }

        copyBlankSvgs(imagePresentationDir, pres.getNumberOfPages());

        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("logCode", "create_svg_images_failed");
        logData.put("message", "Failed to create svg images.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);

        return false;
    }

    private NuProcessBuilder createConversionProcess(String format, int page, String source, String destFile,
            boolean analyze) {
        String rawCommand = "pdftocairo -r " + (analyze ? " 300 " : " 150 ") + format + (analyze ? "" : " -singlefile")
                + " -q -f " + String.valueOf(page) + " -l " + String.valueOf(page) + " " + source + " " + destFile;
        if (analyze) {
            rawCommand += " && cat " + destFile;
            rawCommand += " | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2";
        }
        return new NuProcessBuilder(Arrays.asList("timeout", convTimeout, "/bin/sh", "-c", rawCommand));
    }

    private File determineSvgImagesDirectory(File presentationFile) {
        return new File(presentationFile.getParent() + File.separatorChar + "svgs");
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
			FileUtils.copyFile(new File(BLANK_SVG), svg);
		} catch (IOException e) {
			log.error("IOException while copying blank SVG.");
		}
	}


	public void setBlankSvg(String blankSvg) {
		BLANK_SVG = blankSvg;
	}

    public void setImageTagThreshold(long threshold) {
        imageTagThreshold = threshold;
    }

    public void setPathsThreshold(long threshold) {
        pathsThreshold = threshold;
    }
    
    public void setSwfSlidesGenerationProgressNotifier(
        SwfSlidesGenerationProgressNotifier notifier) {
      this.notifier = notifier;
    }
}

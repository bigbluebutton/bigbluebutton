package org.bigbluebutton.presentation.imp;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.*;
import org.bigbluebutton.presentation.handlers.AddNamespaceToSvgHandler;
import org.bigbluebutton.presentation.handlers.Pdf2PngPageConverterHandler;
import org.bigbluebutton.presentation.handlers.Png2SvgConversionHandler;
import org.bigbluebutton.presentation.handlers.SvgConversionHandler;
import org.bigbluebutton.presentation.handlers.PdfFontType3DetectorHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class SvgImageCreatorImp implements SvgImageCreator {
    // These values should be kept in sync across all BBB components.
    // See the values under "process" in bbb-export-annotations/config/settings.json
    private static final int MAX_SVG_WIDTH = 1440;
    private static final int MAX_SVG_HEIGHT = 1080;

    private static Logger log = LoggerFactory.getLogger(SvgImageCreatorImp.class);

    private SlidesGenerationProgressNotifier notifier;
    private long imageTagThreshold;
    private long pathsThreshold;
    private int convPdfToSvgTimeout = 60;
    private int pdfFontsTimeout = 3;
    private int svgResolutionPpi = 300;
    private boolean forceRasterizeSlides = false;
    private int pngWidthRasterizedSlides = 2048;
	private String BLANK_SVG;
    private int maxNumberOfAttempts = 3;
    private ImageResizer imageResizer;

    @Override
    public boolean createSvgImage(UploadedPresentation pres, int page) throws TimeoutException{
        boolean success = false;
        File svgImagesPresentationDir = determineSvgImagesDirectory(pres.getUploadedFile());
        if (!svgImagesPresentationDir.exists())
            svgImagesPresentationDir.mkdir();

        try {
            success = generateSvgImage(svgImagesPresentationDir, pres, page);
        } catch (InterruptedException e) {
            log.error("Interrupted Exception while generating images {}", pres.getName(), e);
            success = false;
        }

        if (!success) {
            File destSvg = new File(svgImagesPresentationDir.getAbsolutePath() + File.separatorChar + "slide" + page + ".svg");
            if (destSvg.exists()) {
                destSvg.delete();
            }
            copyBlankSvg(destSvg);
        }


        return success;
    }

    @Override
    public void createBlank(UploadedPresentation pres, int page) {
        File dir = determineSvgImagesDirectory(pres.getUploadedFile());

        if (!dir.exists()) {
            boolean created = dir.mkdir();
            if (!created) {
                log.warn("Failed to create SVG directory");
                return;
            }
        }

        File destSvg = new File(dir.getAbsolutePath() + File.separatorChar + "slide" + page + ".svg");
        copyBlankSvg(destSvg);
    }

    private PdfFontType3DetectorHandler createDetectFontType3tHandler(boolean done, int page, String source, UploadedPresentation pres) {
        long pdfFontsTimeout = this.pdfFontsTimeout;
        if (pdfFontsTimeout > pres.getMaxPageConversionTime()) {
            pdfFontsTimeout = pres.getMaxPageConversionTime();
        }

        //Detect if PDF contains text with font Type 3
        //Pdftocairo has problem to convert Pdf to Svg when text contains font Type 3
        //Case detects type 3, rasterize will be forced to avoid the problem
        NuProcessBuilder detectFontType3Process = this.createDetectFontType3Process(source, page);
        PdfFontType3DetectorHandler detectFontType3tHandler = new PdfFontType3DetectorHandler("font3pdf-" + pres.getMeetingId() + "-" + pres.getId() + "-" + page);
        detectFontType3Process.setProcessListener(detectFontType3tHandler);

        NuProcess processDetectFontType3 = detectFontType3Process.start();
        try {
            processDetectFontType3.waitFor(pdfFontsTimeout + 1, TimeUnit.SECONDS);
            done = true;
        } catch (InterruptedException e) {
            done = false;
            log.error("InterruptedException while verifing font type 3 on {} page {}: {}", pres.getName(), page, e);
        }
        return detectFontType3tHandler;
    }

    private boolean generateSvgImage(File imagePresentationDir, UploadedPresentation pres, int page)
            throws InterruptedException, TimeoutException {
        long convPdfToSvgTimeout = this.convPdfToSvgTimeout;
        if (convPdfToSvgTimeout > pres.getMaxPageConversionTime()) {
            convPdfToSvgTimeout = pres.getMaxPageConversionTime();
        }

        long pdfFontsTimeout = this.pdfFontsTimeout;
        if (pdfFontsTimeout > pres.getMaxPageConversionTime()) {
            pdfFontsTimeout = pres.getMaxPageConversionTime();
        }

        String source = pres.getUploadedFile().getAbsolutePath();
        String dest;

        // Skip processing if the destination file exists, as it was likely restored from the cache
        File destsvg = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "slide" + page + ".svg");
        if(destsvg.exists()) {
            return true;
        }

        int countOfTimeOut = 0;

        int numSlides = 1;
        boolean done = false;
        Boolean rasterizeCurrSlide = this.forceRasterizeSlides;

        // Convert single image file
        if (SupportedFileTypes.isImageFile(pres.getFileType())) {

            dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide-1.pdf";

            NuProcessBuilder convertImgToSvg = new NuProcessBuilder(
                    Arrays.asList("/usr/share/bbb-web/run-in-systemd.sh", convPdfToSvgTimeout + "s", "convert", source, "-auto-orient", dest));

            Png2SvgConversionHandler pHandler = new Png2SvgConversionHandler("png2svg-" + pres.getMeetingId() + "-" + pres.getId() + "-" + page);
            convertImgToSvg.setProcessListener(pHandler);

            NuProcess process = convertImgToSvg.start();
            try {
                process.waitFor(convPdfToSvgTimeout + 1, TimeUnit.SECONDS);
                done = true;
            } catch (InterruptedException e) {
                log.error("InterruptedException while converting to SVG {}", dest, e);
                return done;
            }

            if(pHandler.isCommandTimeout()) {
                log.error("Command execution (convertImgToSvg) exceeded the {} secs timeout for {} page {}.", convPdfToSvgTimeout, pres.getName(), page);
            }

            // Use the intermediate PDF file as source
            source = dest;
        }

        //System.out.println("******** CREATING SVG page ");

        // Continue image processing
        long startConv = System.currentTimeMillis();

        PdfFontType3DetectorHandler detectFontType3tHandler = this.createDetectFontType3tHandler(done, page, source, pres);

        while (detectFontType3tHandler.isCommandTimeout()) {
            // Took the first process of the function out of the count because it already happened above
            if (countOfTimeOut >= maxNumberOfAttempts - 1) {
                log.error("Command execution (detectFontType3) exceeded the {} secs timeout within {} attempts for {} page {}.", pdfFontsTimeout, maxNumberOfAttempts, pres.getName(), page);
                throw new TimeoutException("(Timeout error) The slide " + page +
                        " could not be processed within "
                        + convPdfToSvgTimeout +
                        " seconds.");
            }
            detectFontType3tHandler = this.createDetectFontType3tHandler(done, page, source, pres);
            countOfTimeOut += 1;
        }

        if(detectFontType3tHandler.hasFontType3()) {
            log.info("Font Type 3 identified on {} page {}, slide will be rasterized.", pres.getName(), page);
            rasterizeCurrSlide = true;
        }

        SvgConversionHandler pHandler = new SvgConversionHandler("pdf2svg-" + pres.getMeetingId() + "-" + pres.getId() + "-" + page);

        if(rasterizeCurrSlide == false) {
            NuProcessBuilder convertPdfToSvg = createConversionProcess("-svg", page, source, destsvg.getAbsolutePath(),
                    true, convPdfToSvgTimeout);

            convertPdfToSvg.setProcessListener(pHandler);

            NuProcess process = convertPdfToSvg.start();
            try {
                process.waitFor(convPdfToSvgTimeout, TimeUnit.SECONDS);
                done = true;
            } catch (InterruptedException e) {
                log.error("Interrupted Exception while generating SVG slides {}", pres.getName(), e);
                return false;
            }

            if(pHandler.isCommandTimeout()) {
                log.error("Command execution (convertPdfToSvg) exceeded the {} secs timeout for {} page {}.", convPdfToSvgTimeout, pres.getName(), page);
            }

            if (!done) {
                return done;
            }
        }


        if (destsvg.length() == 0 ||
                pHandler.numberOfImageTags() > imageTagThreshold ||
                pHandler.numberOfPaths() > pathsThreshold ||
                rasterizeCurrSlide) {

            // We need t delete the destination file as we are starting a
            // new conversion process
            if (destsvg.exists()) {
                destsvg.delete();
            }

            done = false;

            if(!rasterizeCurrSlide) {
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
            }


            File tempPng = null;
            String basePresentationame = UUID.randomUUID().toString();
            try {
                tempPng = File.createTempFile(basePresentationame + "-" + page, ".png");
            } catch (IOException ioException) {
                // We should never fall into this if the server is correctly
                // configured
                Map<String, Object> logData = new HashMap<String, Object>();
                logData = new HashMap<String, Object>();
                logData.put("meetingId", pres.getMeetingId());
                logData.put("presId", pres.getId());
                logData.put("filename", pres.getName());
                logData.put("logCode", "problem_with_creating_svg");
                logData.put("message", "Unable to create temporary files");
                Gson gson = new Gson();
                String logStr = gson.toJson(logData);
                log.error(" --analytics-- data={}", logStr, ioException);
            }

            // Step 1: Convert a PDF page to PNG using a raw pdftocairo
            NuProcessBuilder convertPdfToPng = createConversionProcess("-png", page, source,
                        tempPng.getAbsolutePath().substring(0, tempPng.getAbsolutePath().lastIndexOf('.')), false,
                    convPdfToSvgTimeout);

            Pdf2PngPageConverterHandler pngHandler = new Pdf2PngPageConverterHandler("pdf2png-" + pres.getMeetingId() + "-" + pres.getId() + "-" + page);
            convertPdfToPng.setProcessListener(pngHandler);
            NuProcess pngProcess = convertPdfToPng.start();
            try {
                pngProcess.waitFor(convPdfToSvgTimeout + 1, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                log.error("Interrupted Exception while generating PNG image {}", pres.getName(), e);
                return false;
            }

            if(pngHandler.isCommandTimeout()) {
                log.error("Command execution (convertPdfToPng) exceeded the {} secs timeout for {} page {}.", convPdfToSvgTimeout, pres.getName(), page);
            }

            if(tempPng.length() > 0) {
                try  {
                    byte[] pngData = readFileToByteArray(tempPng);
                    String base64encodedPng = Base64.getEncoder().encodeToString(pngData);
                    int base64Size = base64encodedPng.getBytes(StandardCharsets.UTF_8).length;

                    // Maximum base64 encoded PNG size to embed in the SVG (currently 4MB)
                    int browserLimit = 2 * 2 * 1024 * 1024;

                    if (base64Size > browserLimit) {
                        log.error("Encoded PNG is too large for the browser");
                    } else {
                        int width = 500;
                        int height = 500;

                        ImageResolutionService imgResService = new ImageResolutionService();
                        ImageResolution imageResolution = imgResService.identifyImageResolution(tempPng);
                        log.debug("Identified page {} image {} width={} and height={}", page, pres.getName(), imageResolution.getWidth(), imageResolution.getHeight());

                        if (imageResolution.getWidth() != 0 && imageResolution.getHeight() != 0) {
                            width = imageResolution.getWidth();
                            height = imageResolution.getHeight();
                        }

                        if(imageResolution.getWidth() > MAX_SVG_WIDTH || imageResolution.getHeight() > MAX_SVG_HEIGHT) {
                            log.info("The image exceeds max dimension allowed, it will be resized.");
                            imageResizer.resize(tempPng, MAX_SVG_WIDTH + "x" + MAX_SVG_HEIGHT);
                            imageResolution = imgResService.identifyImageResolution(tempPng);
                            width = imageResolution.getWidth();
                            height = imageResolution.getHeight();
                        }

                        String svg = createSvgWithEmbeddedPng(base64encodedPng, width, height);
                        try (FileWriter writer = new FileWriter(destsvg)) {
                            writer.write(svg);
                        }
                    }
                } catch (IOException e) {
                    log.error("Error during conversion from PNG to SVG: {}", e.getMessage());
                }

                if(destsvg.length() > 0) {
                    // Step 3: Add SVG namespace to the destination file
                    // Check : https://phabricator.wikimedia.org/T43174
                    NuProcessBuilder addNameSpaceToSVG = new NuProcessBuilder(Arrays.asList(
                            "/usr/share/bbb-web/run-in-systemd.sh", convPdfToSvgTimeout + "s",
                            "/bin/sh", "-c",
                            "sed -i "
                                    + "'4s|>| xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.2\">|' "
                                    + destsvg.getAbsolutePath()));

                    AddNamespaceToSvgHandler namespaceHandler = new AddNamespaceToSvgHandler("svg-namespace-" + pres.getMeetingId() + "-" + pres.getId() + "-" + page);
                    addNameSpaceToSVG.setProcessListener(namespaceHandler);
                    NuProcess namespaceProcess = addNameSpaceToSVG.start();
                    try {
                        namespaceProcess.waitFor(convPdfToSvgTimeout + 1, TimeUnit.SECONDS);
                    } catch (InterruptedException e) {
                        log.error("Interrupted Exception while adding SVG namespace {}", pres.getName(), e);
                        return false;
                    }
                    if (namespaceHandler.isCommandTimeout()) {
                        log.error("Command execution (addNameSpaceToSVG) exceeded the {} secs timeout for {} page {}.", convPdfToSvgTimeout, pres.getName(), page);
                    }

                    done = true;
                }
            }

            // Delete the temporary PNG after finishing the image conversion
            if(tempPng.exists()) {
                tempPng.delete();
            }
        }


        long endConv = System.currentTimeMillis();

        //System.out.println("******** CREATING SVG page " + page + " " + (endConv - startConv));

        if (done) {
            return true;
        }

        copyBlankSvg(destsvg);

        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", page);
        logData.put("logCode", "create_svg_images_failed");
        logData.put("message", "Failed to create svg image.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);

        return false;
    }

    private NuProcessBuilder createConversionProcess(String format, int page, String source, String destFile,
            boolean analyze, long timeout) {
        String rawCommand = "pdftocairo -r " + this.svgResolutionPpi + " " + format + (analyze ? "" : " -singlefile");

        //Resize png resolution to avoid too large files
        if(format.equals("-png") && this.pngWidthRasterizedSlides != 0) {
            rawCommand += " -scale-to-x " + this.pngWidthRasterizedSlides + " -scale-to-y -1 ";
        }

        rawCommand  += " -q -f " + String.valueOf(page) + " -l " + String.valueOf(page) + " " + source + " " + destFile;
        if (analyze) {
            rawCommand += " && cat " + destFile;
            rawCommand += " | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2";
        }

        return new NuProcessBuilder(Arrays.asList("/usr/share/bbb-web/run-in-systemd.sh", timeout + "s", "/bin/sh", "-c", rawCommand));
    }

    private NuProcessBuilder createDetectFontType3Process(String source, int page) {
        String rawCommand  = "pdffonts -f " + String.valueOf(page) + " -l " + String.valueOf(page) + " " + source;
        rawCommand += " | grep -m 1 'Type 3'";
        rawCommand += " | wc -l";

        return new NuProcessBuilder(Arrays.asList("/usr/share/bbb-web/run-in-systemd.sh", pdfFontsTimeout + "s", "/bin/sh", "-c", rawCommand));
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
            log.info("Copying blank SVG to {}", svg);
			FileUtils.copyFile(new File(BLANK_SVG), svg);
		} catch (IOException e) {
			log.error("IOException while copying blank SVG.");
		}
	}

    private byte[] readFileToByteArray(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead);
            }
            return bos.toByteArray();
        }
    }

    private String createSvgWithEmbeddedPng(String base64Png, int width, int height) {
        return """
            <svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d">
                <image href="data:image/png;base64,%s" width="%d" height="%d"/>
            </svg>
            """.formatted(width, height, base64Png, width, height);
    }

	public void setBlankSvg(String blankSvg) {
		BLANK_SVG = blankSvg;
	}
    public void setMaxNumberOfAttempts(int maxNumberOfAttempts) {
        this.maxNumberOfAttempts = maxNumberOfAttempts;
    }
    public void setPdfFontsTimeout(int pdfFontsTimeout) {
        this.pdfFontsTimeout = pdfFontsTimeout;
    }

    public void setImageTagThreshold(long threshold) {
        imageTagThreshold = threshold;
    }

    public void setPathsThreshold(long threshold) {
        pathsThreshold = threshold;
    }
    
    public void setSlidesGenerationProgressNotifier(
        SlidesGenerationProgressNotifier notifier) {
      this.notifier = notifier;
    }

    public void setConvPdfToSvgTimeout(int convPdfToSvgTimeout) {
        this.convPdfToSvgTimeout = convPdfToSvgTimeout;
    }

    public void setSvgResolutionPpi(int svgResolutionPpi) {
        this.svgResolutionPpi = svgResolutionPpi;
    }

    public void setForceRasterizeSlides(boolean forceRasterizeSlides) {
        this.forceRasterizeSlides = forceRasterizeSlides;
    }

    public void setPngWidthRasterizedSlides(int pngWidthRasterizedSlides) {
        this.pngWidthRasterizedSlides = pngWidthRasterizedSlides;
    }

    public void setImageResizer(ImageResizer imageResizer) {
        this.imageResizer = imageResizer;
    }
}

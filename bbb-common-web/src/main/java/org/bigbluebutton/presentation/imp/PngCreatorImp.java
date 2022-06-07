/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;
import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.PngCreator;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.handlers.Png2SvgConversionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PngCreatorImp implements PngCreator {
	private static Logger log = LoggerFactory.getLogger(PngCreatorImp.class);

	private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(.+-png)-([0-9]+)-([0-9]+)(.png)");

	private String BLANK_PNG;
	private int slideWidth = 800;
	private String convTimeout = "7s";
	private int WAIT_FOR_SEC = 7;

	private static final String TEMP_PNG_NAME = "temp-png";

	public boolean createPng(UploadedPresentation pres, int page, File pageFile) {
		boolean success = false;
		File pngDir = determinePngDirectory(pres.getUploadedFile());

		if (!pngDir.exists())
			pngDir.mkdir();

		try {
			long start = System.currentTimeMillis();
			success = generatePng(pngDir, pres, page, pageFile);
			long end = System.currentTimeMillis();
			//System.out.println("*** GENERATE PNG " + (end - start));
		} catch (InterruptedException e) {
			log.warn("Interrupted Exception while generating png.");
			success = false;
		}

		long start = System.currentTimeMillis();
		renamePng(pngDir, page);
		// Create blank thumbnails for pages that failed to generate a thumbnail.
		createBlankPng(pngDir, page);
		long end = System.currentTimeMillis();
		//System.out.println("*** GENERATE BLANK PNG " + (end - start));

		//start = System.currentTimeMillis();
		//renamePng(pngDir);
		//end = System.currentTimeMillis();
		//System.out.println("*** RENAME PNG " + (end - start));

		return success;
	}

	private boolean generatePng(File pngsDir, UploadedPresentation pres, int page, File pageFile)
					throws InterruptedException {
		String source = pageFile.getAbsolutePath();
		String dest;

		if (SupportedFileTypes.isImageFile(pres.getFileType())) {
			// Need to create a PDF as intermediate step.
			// Convert single image file
			dest = pngsDir.getAbsolutePath() + File.separator + "slide-1.pdf";

			NuProcessBuilder convertImgToSvg = new NuProcessBuilder(
					Arrays.asList("timeout", convTimeout, "convert", source, "-auto-orient", dest));

			Png2SvgConversionHandler pHandler = new Png2SvgConversionHandler();
			convertImgToSvg.setProcessListener(pHandler);

			NuProcess process = convertImgToSvg.start();
			try {
				process.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
			} catch (InterruptedException e) {
				log.error("InterruptedException while converting to PDF {}", dest, e);
				return false;
			}

			// Use the intermediate PDF file as source
			source = dest;
		}

		String COMMAND = "";
		dest = pngsDir.getAbsolutePath() + File.separator + TEMP_PNG_NAME + "-" + page; // the "-x.png" is appended automagically
		COMMAND = "pdftocairo -png -scale-to " + slideWidth + " " + source + " " + dest;

		//System.out.println("********* CREATING PNGs " + COMMAND);

		boolean done = new ExternalProcessExecutor().exec(COMMAND, 10000);

		if (done) {
			return true;
		} else {
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", pres.getMeetingId());
			logData.put("presId", pres.getId());
			logData.put("filename", pres.getName());
			logData.put("logCode", "png_create_failed");
			logData.put("message", "Failed to create png.");

			Gson gson = new Gson();
			String logStr = gson.toJson(logData);
			log.warn(" --analytics-- data={}",  logStr);
		}

		return false;
	}

	private File determinePngDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "pngs");
	}

	private void renamePng(File dir, int page) {
		/*
		 * If more than 1 file, filename like 'temp-png-X.png' else filename is
		 * 'temp-png.png'
		 */
		if (dir.list().length > 1) {
			File[] files = dir.listFiles();
			Matcher matcher;
			for (int i = 0; i < files.length; i++) {

				//System.out.println("*** PPNG file " + files[i].getAbsolutePath());

				matcher = PAGE_NUMBER_PATTERN.matcher(files[i].getAbsolutePath());
				if (matcher.matches()) {
					// Path should be something like
					// 'c:/temp/bigluebutton/presname/pngs/temp-png-1.png'
					// Extract the page number. There should be 4 matches.
					// 0. c:/temp/bigluebutton/presname/pngs/temp-png-1.png
					// 1. c:/temp/bigluebutton/presname/pngs/temp-png
					// 2. 1 ---> what we are interested in
					// 3. .png
					// We are interested in the second match.
					int pageNum = Integer.parseInt(matcher.group(2).trim());
					if (pageNum == page) {
						String newFilename = "slide-" + (page) + ".png";
						File renamedFile = new File(
								dir.getAbsolutePath() + File.separator + newFilename);
						files[i].renameTo(renamedFile);
					}

				}
			}
		} else if (dir.list().length == 1) {
			File oldFilename = new File(
							dir.getAbsolutePath() + File.separator + dir.list()[0]);
			//System.out.println("*** PPNG file " + oldFilename.getAbsolutePath());
			String newFilename = "slide-1.png";
			File renamedFile = new File(
							oldFilename.getParent() + File.separator + newFilename);
			oldFilename.renameTo(renamedFile);
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

	private void cleanDirectory(File directory) {
		File[] files = directory.listFiles();
		for (int i = 0; i < files.length; i++) {
			files[i].delete();
		}
	}

	public void setBlankPng(String blankPng) {
		BLANK_PNG = blankPng;
	}

	public void setSlideWidth(int width) {
		slideWidth = width;
	}

}

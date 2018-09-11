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
import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.PngCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PngCreatorImp implements PngCreator {
	private static Logger log = LoggerFactory.getLogger(PngCreatorImp.class);

	private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(.+-png)-([0-9]+)(.png)");

	private String BLANK_PNG;
	private int slideWidth = 800;

	private static String TEMP_PNG_NAME = "temp-png";

	public boolean createPng(UploadedPresentation pres) {
		boolean success = false;
		File pngDir = determinePngDirectory(pres.getUploadedFile());

		if (!pngDir.exists())
			pngDir.mkdir();

		cleanDirectory(pngDir);

		try {
			success = generatePngs(pngDir, pres);
		} catch (InterruptedException e) {
			log.warn("Interrupted Exception while generating png.");
			success = false;
		}

		// Create blank thumbnails for pages that failed to generate a thumbnail.
		createBlankPngs(pngDir, pres.getNumberOfPages());

		renamePng(pngDir);

		return success;
	}

	private boolean generatePngs(File pngsDir, UploadedPresentation pres)
					throws InterruptedException {
		String source = pres.getUploadedFile().getAbsolutePath();
		String dest;
		String COMMAND = "";
		dest = pngsDir.getAbsolutePath() + File.separator + TEMP_PNG_NAME;
		COMMAND = "pdftocairo -png -scale-to " + slideWidth + " " + source + " " + dest;

		boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);

		if (done) {
			return true;
		} else {
			Map<String, Object> logData = new HashMap<String, Object>();
			logData.put("meetingId", pres.getMeetingId());
			logData.put("presId", pres.getId());
			logData.put("filename", pres.getName());
			logData.put("message", "Failed to create png.");

			Gson gson = new Gson();
			String logStr = gson.toJson(logData);
			log.warn("-- analytics -- " + logStr);
		}

		return false;
	}

	private File determinePngDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "pngs");
	}

	private void renamePng(File dir) {
		/*
		 * If more than 1 file, filename like 'temp-png-X.png' else filename is
		 * 'temp-png.png'
		 */
		if (dir.list().length > 1) {
			File[] files = dir.listFiles();
			Matcher matcher;
			for (int i = 0; i < files.length; i++) {
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
					int pageNum = Integer.valueOf(matcher.group(2).trim()).intValue();
					String newFilename = "slide-" + (pageNum) + ".png";
					File renamedFile = new File(
									dir.getAbsolutePath() + File.separator + newFilename);
					files[i].renameTo(renamedFile);
				}
			}
		} else if (dir.list().length == 1) {
			File oldFilename = new File(
							dir.getAbsolutePath() + File.separator + dir.list()[0]);
			String newFilename = "slide-1.png";
			File renamedFile = new File(
							oldFilename.getParent() + File.separator + newFilename);
			oldFilename.renameTo(renamedFile);
		}
	}

	private void createBlankPngs(File pngsDir, int pageCount) {
		File[] pngs = pngsDir.listFiles();

		if (pngs.length != pageCount) {
			for (int i = 0; i < pageCount; i++) {
				File png = new File(pngsDir.getAbsolutePath() + File.separator + TEMP_PNG_NAME + "-" + i + ".png");
				if (!png.exists()) {
					log.info("Copying blank png for slide " + i);
					copyBlankPng(png);
				}
			}
		}
	}

	private void copyBlankPng(File png) {
		try {
			FileUtils.copyFile(new File(BLANK_PNG), png);
		} catch (IOException e) {
			log.error("IOException while copying blank thumbnail.");
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

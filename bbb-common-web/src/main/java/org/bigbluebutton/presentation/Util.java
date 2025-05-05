/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.presentation;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public final class Util {
	private static Logger log = LoggerFactory.getLogger(Util.class);

	public static void deleteDirectory(File directory) {
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (File file : files) {
			if (file.isDirectory()) {
				deleteDirectory(file);
			} else {
				file.delete();
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete();	
	}


	public static void deleteDirectoryFromFileHandlingErrors(File presentationFile) {
		if ( presentationFile != null ){
			Path presDir = presentationFile.toPath().getParent();
			try {
				File presFileDir = new File(presDir.toString());
				if (presFileDir.exists()) {
					deleteDirectory(presFileDir);
				}
			} catch (Exception ex) {
				log.error("Error while trying to delete directory {}", presDir.toString(), ex);
			}
		}
	}

	public static File determineTextfilesDirectory(File presentationFile) {
		return new File(
				presentationFile.getParent() + File.separatorChar + "textfiles");
	}

	public static File determineThumbnailDirectory(File presentationFile) {
		return new File(
				presentationFile.getParent() + File.separatorChar + "thumbnails");
	}

	public static File determinePngDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "pngs");
	}

	public static File determineSvgImagesDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "svgs");
	}

	public static void createBlankThumbnail(File dir, int page, String blankThumb) {
		File thumb = new File(dir.getAbsolutePath() + File.separatorChar + "thumb-" + page + ".png");
		if (!thumb.exists()) {
			log.info("Copying blank thumbnail for slide {}", page);
			copyBlankThumbnail(thumb, blankThumb);
		}
	}

	private static void copyBlankThumbnail(File thumb, String blankThumb) {
		try {
			FileUtils.copyFile(new File(blankThumb), thumb);
		} catch (IOException e) {
			log.error("IOException while copying blank thumbnail.", e);
		}
	}

	public static void createBlankPng(File dir, int page, String blankPng) {
		File png = new File(dir.getAbsolutePath() + File.separator + "slide-" + page + ".png");
		if (!png.exists()) {
			log.info("Copying blank png for slide {}", page);
			copyBlankPng(png, blankPng);
		}
	}

	private static void copyBlankPng(File png, String blankPng) {
		try {
			FileUtils.copyFile(new File(blankPng), png);
		} catch (IOException e) {
			log.error("IOException while copying blank PNG.");
		}
	}

	public static void createBlankSvg(File dir, int page, String blankSvg) {
		File svg = new File(dir.getAbsolutePath() + File.separator + "slide" + page + ".svg");
		if (!svg.exists()) {
			log.info("Copying blank svg for slide {}", page);
			copyBlankSvg(svg, blankSvg);
		}
	}

	private static void copyBlankSvg(File svg, String blankSvg) {
		try {
			FileUtils.copyFile(new File(blankSvg), svg);
		} catch (IOException e) {
			log.error("IOException while copying blank SVG.");
		}
	}
}

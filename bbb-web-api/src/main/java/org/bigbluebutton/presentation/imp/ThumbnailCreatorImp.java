/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ThumbnailCreatorImp implements ThumbnailCreator {
	private static Logger log = LoggerFactory.getLogger(ThumbnailCreatorImp.class);
	
	private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(.+-thumb)-([0-9]+)(.png)");
	
	private String IMAGEMAGICK_DIR;
	private String BLANK_THUMBNAIL;
	
	private static String TEMP_THUMB_NAME = "temp-thumb";
	
	public boolean createThumbnails(UploadedPresentation pres){
		boolean success = false;
	 	File thumbsDir = determineThumbnailDirectory(pres.getUploadedFile());
	 	
	 	if (! thumbsDir.exists())
	 		thumbsDir.mkdir();
	 		
	 	cleanDirectory(thumbsDir);
	 	
		try {
			success = generateThumbnails(thumbsDir, pres);
	    } catch (InterruptedException e) {
	    	log.warn("Interrupted Exception while generating thumbnails.");
	        success = false;
	    }
	    
	    // Create blank thumbnails for pages that failed to generate a thumbnail.
	    createBlankThumbnails(thumbsDir, pres.getNumberOfPages());
	    
	    renameThumbnails(thumbsDir);
	    
	    return true;
	}

	private boolean generateThumbnails(File thumbsDir, UploadedPresentation pres) throws InterruptedException {
	 	String source = pres.getUploadedFile().getAbsolutePath();
	 	String dest;
	 	String COMMAND = "";
	 	if(SupportedFileTypes.isImageFile(pres.getFileType())){
	 		dest = thumbsDir.getAbsolutePath() + File.separator + TEMP_THUMB_NAME + ".png";
	 		COMMAND = IMAGEMAGICK_DIR + "/convert -thumbnail 150x150 " + source + " " + dest;
	 	}else{
	 		dest = thumbsDir.getAbsolutePath() + File.separator + "thumb-";
	 		COMMAND = IMAGEMAGICK_DIR + "/gs -q -sDEVICE=pngalpha -dBATCH -dNOPAUSE -dNOPROMPT -dDOINTERPOLATE -dPDFFitPage -r16 -sOutputFile=" + dest +"%d.png " + source;
	 	}

	 	boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);

	 	if (done) {
	 		return true;
	 	} else {
			log.warn("Failed to create thumbnails: " + COMMAND);
	 	}

		return false;
	}

	private File determineThumbnailDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "thumbnails");
	}

	private void renameThumbnails(File dir) {
		/*
		 * If more than 1 file, filename like 'temp-thumb-X.png' else filename is 'temp-thumb.png'
		 */
		if (dir.list().length > 1) {
			File[] files = dir.listFiles();
			Matcher matcher;
			for (int i = 0; i < files.length; i++) {
				matcher = PAGE_NUMBER_PATTERN.matcher(files[i].getAbsolutePath());
	    		if (matcher.matches()) {
	    			// Path should be something like 'c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png'
	    			// Extract the page number. There should be 4 matches.
	    			// 0. c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png
					// 1. c:/temp/bigluebutton/presname/thumbnails/temp-thumb
					// 2. 1 ---> what we are interested in
					// 3. .png
	    			// We are interested in the second match.
				    int pageNum = Integer.valueOf(matcher.group(2).trim()).intValue();
				    String newFilename = "thumb-" + (pageNum + 1) + ".png";
				    File renamedFile = new File(dir.getAbsolutePath() + File.separator + newFilename);
				    files[i].renameTo(renamedFile);
	    		}
			}
		} else if (dir.list().length == 1) {
			File oldFilename = new File(dir.getAbsolutePath() + File.separator + dir.list()[0]);
			String newFilename = "thumb-1.png";
			File renamedFile = new File(oldFilename.getParent() + File.separator + newFilename);
			oldFilename.renameTo(renamedFile);
		}
	}
	
	private void createBlankThumbnails(File thumbsDir, int pageCount) {
		File[] thumbs = thumbsDir.listFiles();
		
		if (thumbs.length != pageCount) {
			for (int i = 0; i < pageCount; i++) {
				File thumb = new File(thumbsDir.getAbsolutePath() + File.separator + TEMP_THUMB_NAME + "-" + i + ".png");
				if (! thumb.exists()) {
					log.info("Copying blank thumbnail for slide " + i);
					copyBlankThumbnail(thumb);
				}
			}
		}
	}

	private void copyBlankThumbnail(File thumb) {
		try {
			FileUtils.copyFile(new File(BLANK_THUMBNAIL), thumb);
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

	public void setImageMagickDir(String imageMagickDir) {
		IMAGEMAGICK_DIR = imageMagickDir;
	}

	public void setBlankThumbnail(String blankThumbnail) {
		BLANK_THUMBNAIL = blankThumbnail;
	}

}

package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ThumbnailCreatorImp implements ThumbnailCreator {
	private static Logger log = LoggerFactory.getLogger(ThumbnailCreatorImp.class);
	
	private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(.+-thumb)-([0-9]+)(.png)");
	
	String imageMagickDir;
	String blankThumbnail;
	
	private static String TEMP_THUMB_NAME = "temp-thumb";
	
	public boolean createThumbnails(File presentationFile, int pageCount){
		boolean success = false;
	 	File thumbsDir = determineThumbnailDirectory(presentationFile);
	 	
	 	if (! thumbsDir.exists())
	 		thumbsDir.mkdir();
	 		
	 	cleanDirectory(thumbsDir);
	 	
		try {
			success = generateThumbnails(thumbsDir, presentationFile);
	    } catch (InterruptedException e) {
	        success = false;
	    }
	    
	    if (! success) createBlankThumbnails(thumbsDir, pageCount);
	    
	    renameThumbnails(thumbsDir);
	    
	    return true;
	}

	private boolean generateThumbnails(File thumbsDir, File presentationFile) throws InterruptedException {
	 	String source = presentationFile.getAbsolutePath();
	 	String dest = thumbsDir.getAbsolutePath() + File.separator + TEMP_THUMB_NAME + ".png";
	 	
		String COMMAND = imageMagickDir + "/convert -thumbnail 150x150 " + source + " " + dest;
		
		Process p;
		try {
			p = Runtime.getRuntime().exec(COMMAND);
			int exitValue = p.waitFor();
			if (exitValue != 0) {
		    	log.warn("Exit Value != 0 while for " + COMMAND);
		    } else {
		    	return true;
		    }
		} catch (IOException e) {
			log.error("IOException while processing " + COMMAND);
		}       
		
		log.warn("Failed to create thumbnails: " + COMMAND);
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
					copyBlankThumbnail(thumb);
				}
			}
		}
	}
	
	private void copyBlankThumbnail(File thumb) {
		try {
			FileUtils.copyFile(new File(blankThumbnail), thumb);
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

}

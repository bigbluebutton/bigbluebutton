package org.bigbluebutton.presentation.imp;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import org.bigbluebutton.presentation.PngImageCreator;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PngImageCreatorImp implements PngImageCreator {
	private static Logger log = LoggerFactory.getLogger(PngImageCreatorImp.class);
	
	private String IMAGEMAGICK_DIR;
	
	@Override
	public boolean createPngImages(UploadedPresentation pres) {
		boolean success = false;
		File imagePresentationDir = determinePngImagesDirectory(pres.getUploadedFile());
		if (! imagePresentationDir.exists())
			imagePresentationDir.mkdir();
		
		cleanDirectory(imagePresentationDir);
		
		try {
			success = generatePngImages(imagePresentationDir, pres);
	    } catch (InterruptedException e) {
	    	log.warn("Interrupted Exception while generating images.");
	        success = false;
	    }
	    
	    //TODO: in case that it doesn't generated the textfile, we should create a textfile with some message
	    // createUnavailableTextFile
		
		return success;
	}

	private boolean generatePngImages(File imagePresentationDir, UploadedPresentation pres) throws InterruptedException {
		String source = pres.getUploadedFile().getAbsolutePath();
	 	String dest;
	 	String COMMAND = "";
	 	
	 	if(SupportedFileTypes.isImageFile(pres.getFileType())){
	 		dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide1.png";
	 		//COMMAND = IMAGEMAGICK_DIR + "/convert " + source + " -resize 800x600 " + dest;
	 		COMMAND = IMAGEMAGICK_DIR + "/convert " + source + " " + dest;
	 	}else{
	 		dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide";
	 		//COMMAND = IMAGEMAGICK_DIR + "/gs -q -sDEVICE=pngalpha -dBATCH -dNOPAUSE -dNOPROMPT -dDOINTERPOLATE -dPDFFitPage -r800x600 -sOutputFile=" + dest +"%d.png " + source;
	 		COMMAND = IMAGEMAGICK_DIR + "/gs -q -sDEVICE=pngalpha -dBATCH -dNOPAUSE -dNOPROMPT -dDOINTERPOLATE -dPDFFitPage -sOutputFile=" + dest +"%d.png " + source;
	 	}
	 	
	 	boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);
	 	
	 	if (done) {
	 		return true;
	 	} else {			
			log.warn("Failed to create png images: " + COMMAND);	 		
	 	}

		return false;
	}
	
	private File determinePngImagesDirectory(File presentationFile) {
		return new File(presentationFile.getParent() + File.separatorChar + "pngs");
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

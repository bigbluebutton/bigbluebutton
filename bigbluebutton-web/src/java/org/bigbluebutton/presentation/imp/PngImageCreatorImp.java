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
			extractPdfPages(pres);
			success = generatePngImages(imagePresentationDir,pres);
	    } catch (InterruptedException e) {
	    	log.warn("Interrupted Exception while generating images.");
	        success = false;
	    }
		
		return success;
	}
	
	private void extractPdfPages(UploadedPresentation pres){
		File tmpDir = new File(pres.getUploadedFile().getParent() + File.separatorChar + "pngs" + File.separatorChar + "tmp");
		if (! tmpDir.exists())
			tmpDir.mkdir();
		
	 	if(SupportedFileTypes.isPdfFile(pres.getFileType())){
	 		for(int i=1; i<=pres.getNumberOfPages(); i++){
	 			File tmp = new File(tmpDir.getAbsolutePath() + File.separatorChar + "slide" + i + ".pdf");
	 			String COMMAND = IMAGEMAGICK_DIR + "/gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dFirstPage=" + i + " -dLastPage=" + i + " -sOutputFile=" + tmp.getAbsolutePath() + " /etc/bigbluebutton/nopdfmark.ps " + pres.getUploadedFile().getAbsolutePath();
	 			new ExternalProcessExecutor().exec(COMMAND, 60000);
	 		}
	 		
	 	}
	}

	private boolean generatePngImages(File imagePresentationDir, UploadedPresentation pres) throws InterruptedException {
		String source = pres.getUploadedFile().getAbsolutePath();
	 	String dest;
	 	String COMMAND = "";
	 	boolean done = true;
	 	if(SupportedFileTypes.isImageFile(pres.getFileType())){
	 		dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide1.png";
	 		COMMAND = IMAGEMAGICK_DIR + "/convert " + source + " " + dest;
	 		done = new ExternalProcessExecutor().exec(COMMAND, 60000);
		 	
	 	}else{
	 		for(int i=1; i<=pres.getNumberOfPages(); i++){
	 			File tmp = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "tmp" + File.separatorChar + "slide" + i + ".pdf");
	 			File destpng = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "slide" + i + ".png");
				COMMAND = IMAGEMAGICK_DIR + "/convert -density 300x300 -quality 90 +dither -depth 8 -colors 256 " + File.separatorChar + tmp.getAbsolutePath() + " " + destpng.getAbsolutePath();

	 			done = new ExternalProcessExecutor().exec(COMMAND, 60000);
	 			if(!done){
	 				break;
	 			}
	 		}
	 	}
	 	
	 	if (done) {
	 		return true;
	 	} 
	 	log.warn("Failed to create png images: " + COMMAND);	 		
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

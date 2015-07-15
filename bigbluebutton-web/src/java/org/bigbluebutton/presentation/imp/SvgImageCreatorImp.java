package org.bigbluebutton.presentation.imp;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SvgImageCreatorImp implements SvgImageCreator {
	private static Logger log = LoggerFactory.getLogger(SvgImageCreatorImp.class);
	
	private String IMAGEMAGICK_DIR;
	
	@Override
	public boolean createSvgImages(UploadedPresentation pres) {
		boolean success = false;
		File imagePresentationDir = determineSvgImagesDirectory(pres.getUploadedFile());
		if (! imagePresentationDir.exists())
			imagePresentationDir.mkdir();
		
		cleanDirectory(imagePresentationDir);
		
		try {
			extractPdfPages(pres);
			success = generateSvgImages(imagePresentationDir,pres);
	    } catch (InterruptedException e) {
	    	log.warn("Interrupted Exception while generating images.");
	        success = false;
	    }
		
		return success;
	}
	
	private void extractPdfPages(UploadedPresentation pres){
		File tmpDir = new File(pres.getUploadedFile().getParent() + File.separatorChar + "svgs" + File.separatorChar + "tmp");
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

	private boolean generateSvgImages(File imagePresentationDir, UploadedPresentation pres) throws InterruptedException {
		String source = pres.getUploadedFile().getAbsolutePath();
	 	String dest;
	 	String COMMAND = "";
	 	boolean done = true;
	 	if(SupportedFileTypes.isImageFile(pres.getFileType())){
                       dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide1.pdf";
	 		COMMAND = IMAGEMAGICK_DIR + "/convert " + source + " " + dest;
	 		done = new ExternalProcessExecutor().exec(COMMAND, 60000);

                       source = imagePresentationDir.getAbsolutePath() + File.separator + "slide1.pdf";
                       dest = imagePresentationDir.getAbsolutePath() + File.separator + "slide1.svg";
                       COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f 1 -l 1 " + source + " " + dest;
                       done = new ExternalProcessExecutor().exec(COMMAND, 60000);
		 	
	 	}else{
	 		for(int i=1; i<=pres.getNumberOfPages(); i++){
	 			File tmp = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "tmp" + File.separatorChar + "slide" + i + ".pdf");
	 			File destsvg = new File(imagePresentationDir.getAbsolutePath() + File.separatorChar + "slide" + i + ".svg");
				COMMAND = "pdftocairo -rx 300 -ry 300 -svg -q -f 1 -l 1 " + File.separatorChar + tmp.getAbsolutePath() + " " + destsvg.getAbsolutePath();

	 			done = new ExternalProcessExecutor().exec(COMMAND, 60000);
	 			if(!done){
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
		return new File(presentationFile.getParent() + File.separatorChar + "svgs");
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

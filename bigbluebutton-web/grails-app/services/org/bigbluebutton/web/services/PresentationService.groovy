package org.bigbluebutton.web.services

import javax.jms.Message
import javax.jms.Session
import javax.jms.JMSException
import javax.jms.MapMessage
import org.springframework.jms.core.JmsTemplate
import java.util.*;
import java.util.concurrent.*;
import java.lang.InterruptedException
class PresentationService {

    boolean transactional = false
	def jmsTemplate	
	def imageMagickDir
	def ghostScriptExec
	def swfToolsDir
	def presentationDir
	
	/*
	 * This is a workaround for this problem.
	 * http://groups.google.com/group/comp.lang.postscript/browse_thread/thread/c2e264ca76534ce0?pli=1
	 */
	def noPdfMarkWorkaround
	    
	private static String JMS_UPDATES_Q = 'UpdatesQueue'
	    
    def deletePresentation = {conf, room, filename ->
    	def directory = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename)
    	deleteDirectory(directory) 
	}
	
	def deleteDirectory = {directory ->
		log.debug "delete = ${directory}"
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				deleteDirectory(files[i])
			} else {
				files[i].delete()
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete()	
	}
	
	def listPresentations = {conf, room ->
		def presentationsList = []
		def directory = roomDirectory(conf, room)
		log.debug "directory ${directory.absolutePath}"
		if( directory.exists() ){
			directory.eachFile(){ file->
				System.out.println(file.name)
				if( file.isDirectory() )
					presentationsList.add( file.name )
			}
		}	
		return presentationsList
	}
	
    public File uploadedPresentationDirectory(String conf, String room, String presentation_name) {
	    println "Uploaded presentation ${presentation_name}"
		File dir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentation_name)
		println "upload to directory ${dir.absolutePath}"
			
		/* If the presentation name already exist, delete it. We should provide a check later on to notify user
			that there is already a presentation with that name. */
		if (dir.exists()) deleteDirectory(dir)		
		dir.mkdirs()
		
		assert dir.exists()
		return dir
    }

	def processUploadedPresentation = {conf, room, presentationName, presentationFile ->	
		// Run conversion on another thread.
		new Timer().runAfter(1000) 
		{
			//first we need to know how many pages in this pdf
			log.debug "Determining number of pages"
			int numPages = determineNumberOfPages(presentationFile)
			log.info "There are $numPages pages in $presentationFile.absolutePath"
			convertUploadedPresentation(room, presentationName, presentationFile, numPages)		
		}
	}
	
    public int determineNumberOfPages(File presentationFile) {
		def numPages = -1 //total numbers of this pdf, also used as errorcode(-1)	

		try 
		{
			def command = swfToolsDir + "/pdf2swf -I " + presentationFile.getAbsolutePath()        
			log.debug "Executing $command"
			def p = Runtime.getRuntime().exec(command);            

			def stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
			def stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			def info
			def str //output information to console for stdInput and stdError
			while ((info = stdInput.readLine()) != null) {
				//The output would be something like this 'page=21 width=718.00 height=538.00'.
	    		//We need to extract the page number (i.e. 21) from it.
	    		def infoRegExp = /page=([0-9]+)(?: .+)/
	    		def matcher = (info =~ infoRegExp)
	    		if (matcher.matches()) {
	    			numPages = matcher[0][1]
	    		} else {
	    			println "no match info: ${info}"
	    		}
			}
			while ((info = stdError.readLine()) != null) {
				System.out.println("Got error getting info from file):\n");
				System.out.println(str);
			}
			stdInput.close();
			stdError.close();

			//assert(p.exitValue() == 0)
			if(p.exitValue() != 0) return -1;
		}
		catch (IOException e) {
			System.out.println("exception happened - here's what I know: ");
			e.printStackTrace();
		}		

		return new Integer(numPages).intValue()
    }
 	
	def showSlide(String conf, String room, String presentationName, String id) {
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar + "slide-${id}.swf")
	}
	
	def showPresentation = {conf, room, filename ->
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename + File.separatorChar + "slides.swf")
	}
	
	def showThumbnail = {conf, room, presentationName, thumb ->
		def thumbFile = roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar +
					"thumbnails" + File.separatorChar + "thumb-${thumb}.png"
		log.debug "showing $thumbFile"
		
		new File(thumbFile)
	}
	
	def numberOfThumbnails = {conf, room, name ->
		def thumbDir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "thumbnails")
		thumbDir.listFiles().length
	}   
	
    def roomDirectory = {conf, room ->
		return new File(presentationDir + File.separatorChar + conf + File.separatorChar + room)
    }

	public boolean convertUploadedPresentation(String room, String presentationName, File presentationFile, int numPages) {		
		log.debug "Converting uploaded presentation $presentationFile.absolutePath"
		for (int page = 1; page <= numPages; page++) 
	    {
			def msg = new HashMap()
			msg.put("room", room)
			msg.put("returnCode", "CONVERT")
			msg.put("presentationName", presentationName)
			msg.put("totalSlides", new Integer(numPages))
			msg.put("slidesCompleted", new Integer(page))
			sendJmsMessage(msg)
			
			log.debug "Converting page $page of $presentationFile.absolutePath"
			
			convertPage(presentationFile, page)
	    }

		log.debug "Creating thumbnails for $presentationFile.absolutePath"
		createThumbnails(presentationFile)
		
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "SUCCESS")
		msg.put("presentationName", presentationName)
		msg.put("message", "The presentation is now ready.")
		log.info "Sending presentation conversion success for $presentationFile.absolutePath."
		sendJmsMessage(msg)			
	}

	public boolean convertPage(File presentationFile, int page) {
	    if (! convertUsingPdf2Swf(presentationFile, page)) {
	    	log.info "cannot convert page $page"
	    	if (extractPageUsingGhostScript(presentationFile, page)) {
	    		log.info "created using ghostscript page $page"
	    		if (convertUsingImageMagick(presentationFile, page)) {
	    			log.info "created using imagemagick page $page"
	    			if (convertUsingJpeg2Swf(presentationFile, page)) {
	    				log.info "create using jpeg page $page"
	    				return true
	    			}
	    		}
	    	}
	    }

	    return false	
	}
	
	public boolean extractPageUsingGhostScript(File presentationFile, int page) {	
		def tempDir = new File(presentationFile.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		String OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH"
		String PAGE = "-dFirstPage=${page} -dLastPage=${page}"
		String dest = tempDir.absolutePath + File.separator + "temp-${page}.pdf"
		
		//extract that specific page and create a temp-pdf(only one page) with GhostScript
		def command = ghostScriptExec + " " + OPTIONS + " " + PAGE + " " + "-sOutputFile=${dest}" + " " + noPdfMarkWorkaround + " " + presentationFile          
        log.debug "Executing $command"
        
        def process
        try {
    		def now = new Date()
    		println "GS starting $now"
    		
        	process = Runtime.getRuntime().exec(command);            
        	
        	// Wait for the process to finish.
        	int exitVal = process.waitFor()
        	
        	now = new Date()
    		println "GS starting $now"
    		
        	def stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
        	def stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        	def str
        	while ((str = stdInput.readLine()) != null) {
        		System.out.println(str);
        	}
        	// read any errors from the attempted command
        	System.out.println("Here is the standard error of the command (if any):\n");
        	while ((str = stdError.readLine()) != null) {
        		System.out.println(str);
        	}
        	stdInput.close();
        	stdError.close();		
        } catch (InterruptedException e) {
        	System.out.println(e.toString());
        }
        
	    if (process.exitValue() == 0) {
	    	return true
	    } else {
	    	return false
	    }
	}
		
	public boolean convertUsingJpeg2Swf(File presentationFile, int page) {
		def tempDir = new File(presentationFile.getParent() + File.separatorChar + "temp")
		
		def source = tempDir.absolutePath + File.separator + "temp-${page}.jpeg"
		def dest = presentationFile.parent + File.separatorChar + "slide-${page}.swf"
		println "converting $source to $dest"

		def now = new Date()
		println "JPEG2SWF starting $now"
		
        def command = swfToolsDir + "/jpeg2swf -o " + dest + " " + source
        log.debug "Executing $command"
	    def process = Runtime.getRuntime().exec(command);            

		// Wait for the process to finish.
		int exitValue = process.waitFor()
		
		now = new Date()
		println "JPEG2SWF ended $now"
		
		def stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
		def stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
		def str
        while ((str = stdInput.readLine()) != null) {
	        System.out.println(str);
    	}
	    // read any errors from the attempted command
        System.out.println("Here is the standard error of the command (if any):\n");
	    while ((str = stdError.readLine()) != null) {
    		System.out.println(str);
	    }
    	stdInput.close();
	    stdError.close();	
	    
		File destFile = new File(dest)
		if (destFile.exists()) return true		
		return false
	}
	
	public boolean convertUsingImageMagick(File presentationFile, int page) {
		def tempDir = new File(presentationFile.getParent() + File.separatorChar + "temp")
		tempDir.mkdir()
		
		def source = tempDir.getAbsolutePath() + "/temp-${page}.pdf"
		def dest = tempDir.getAbsolutePath() + "/temp-${page}.jpeg"

		def now = new Date()
		println "IMAGEMAGICK starting $now"
		
        def command = imageMagickDir + "/convert " + source + " " + dest          
		log.debug "Executing $command"
		def process = Runtime.getRuntime().exec(command);            
		// Wait for the process to finish.
		int exitValue = process.waitFor()
		
		now = new Date()
		println "IMAGEMAGICK ends $now"
		
		File destFile = new File(dest)
		if (destFile.exists()) return true		
		return false
	}
		
	public boolean convertUsingPdf2Swf(File presentationFile, int page) {
	    def source = presentationFile.getAbsolutePath()
	    def dest = presentationFile.parent + File.separatorChar + "slide-" + page + ".swf"
	       
	    def command = swfToolsDir + "/pdf2swf -p " + page + " " + source + " -o " + dest     
	    log.debug "Executing $command"
		def process = Runtime.getRuntime().exec(command)
		
		// Wait for the process to finish
		int exitValue = process.waitFor()
		
		File destFile = new File(dest)
		if (destFile.exists()) return true		
		return false
	}

	public boolean createThumbnails(File presentationFile) { 
		try {
			log.debug "Creating thumbnails:"
		 	def thumbsDir = new File(presentationFile.getParent() + File.separatorChar + "thumbnails")
		 	thumbsDir.mkdir()
	        
		 	def source = presentationFile.getAbsolutePath()
		 	def dest = thumbsDir.getAbsolutePath() + "/temp-thumb.png"
		 	
	        def command = imageMagickDir + "/convert -thumbnail 150x150 " + source + " " + dest
	        log.debug "Executing $command"
	        Process p = Runtime.getRuntime().exec(command);            
			int exitValue = p.waitFor()
			
	        renameThumbnails(thumbsDir)
			
	        if (exitValue == 0) return true
			
			return false
	    }
	    catch (InterruptedException e) {
	        log.error "exception happened - here's what I know: "
	        log.error e.printStackTrace()
	        return false
	    }
	}	
	
	private renameThumbnails(File dir) {
        dir.eachFile{file ->
        	// filename should be something like 'c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png'
        	def filename = file.absolutePath

        	// Extract the page number. There should be 3 matches.
        	// 1. c:/temp/bigluebutton/presname/thumbnails/temp-thumb
        	// 2. 1 ---> what we are interested in
        	// 3. .png
        	def infoRegExp = /(.+-thumb)-([0-9]+)(.png)/
        	def matcher = (filename =~ infoRegExp)
        	if (matcher.matches()) {  
        		// We are interested in the second match.
        	    int pageNum = new Integer(matcher[0][2]).intValue()
        	    def newFilename = "thumb-${++pageNum}.png"
        	    File renamedFile = new File(file.parent + File.separator + newFilename)
        	    file.renameTo(renamedFile)
        	}        	
        }
	}
	
	private sendJmsMessage(HashMap message) {
		jmsTemplate.convertAndSend(JMS_UPDATES_Q, message)
	}
}	

/*** Helper classes **/
import java.io.FilenameFilter;
import java.io.File;
class PngFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
        return (name.endsWith(".png"));
    }
}

import javax.jms.Message
import javax.jms.Session
import javax.jms.JMSException
import javax.jms.MapMessage
import org.springframework.jms.core.JmsTemplate

class PresentationService {

    boolean transactional = false
	def jmsTemplate	
	def imageMagick
	def swfTools
	def presentationDir
	
	private static String JMS_UPDATES_Q = 'UpdatesQueue'
	
    def deletePresentation = {conf, room, filename ->
    	def directory = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename)
    	deleteDirectory(directory) 
	}
	
	def deleteDirectory = {directory ->
		System.out.println("delete = ${directory}")
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
		println "directory ${directory.absolutePath}"
		if( directory.exists() ){
			directory.eachFile(){ file->
				System.out.println(file.name)
				if( file.isDirectory() )
					presentationsList.add( file.name )
			}
		}	
		return presentationsList
	}
	
	def processUploadedPresentation = {conf, room, name, presentation ->
		def dir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name)
		println "upload to directory ${dir.absolutePath}"
		
		/* If the presentation name already exist, delete it. We should provide a check later on to notify user
			that there is already a presentation with that name. */
		if (dir.exists()) deleteDirectory(dir)
		
		dir.mkdirs()
		def newFilename = presentation.getOriginalFilename().replace(' ', '-')
		def pres = new File( dir.absolutePath + File.separatorChar + newFilename )
		presentation.transferTo( pres )
		new Timer().runAfter(1000) {
			convertUploadedPresentation(conf, room, pres)	
			createThumbnails(pres)		
	
			/* We just assume that everything is OK. Send a SUCCESS message to the client */
			def msg = new HashMap()
			msg.put("room", room)
			msg.put("returnCode", "SUCCESS")
			msg.put("message", "The presentation is now ready.")
			System.out.println("Sending presentation conversion success.")
			jmsTemplate.convertAndSend(JMS_UPDATES_Q,msg)		
		}
	}
	
	def showSlide(String conf, String room, String presentationName, String id) {
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar + "slide-${id}.swf")
	}
	
	def showPresentation = {conf, room, filename ->
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + filename + File.separatorChar + "slides.swf")
	}
	
	def showThumbnail = {conf, room, presentationName, thumb ->
		new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentationName + File.separatorChar + 
			"thumbnails" + File.separatorChar + "thumb-${thumb}.png")
	}
	
	def numberOfThumbnails = {conf, room, name ->
		def thumbDir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + name + File.separatorChar + "thumbnails")
		System.out.println(thumbDir.absolutePath + " " + thumbDir.listFiles().length)
		thumbDir.listFiles().length
	}
	
	def convertUploadedPresentation = {conf, room, presentation ->
        try {
        	
        	/** Let's get how many pages this presentation has */
			def infoCmd = swfTools + "/pdf2swf -I " + presentation.getAbsolutePath()        
          	Process p = Runtime.getRuntime().exec(infoCmd);            
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));

			def info
			def numPages = 0
            while ((info = stdInput.readLine()) != null) {
            	/* The output would be something like this 'page=21 width=718.00 height=538.00'.
            	 * We need to extract the page number (i.e. 21) from it.
            	 */            	 
            	def infoRegExp = /page=([0-9]+)(?: .+)/
				def matcher = (info =~ infoRegExp)
				if (matcher.matches()) {
				    //if ((matcher[0][1]) > numPages) {
				    	numPages = matcher[0][1]
				    //	println "Number of pages = ${numPages}"
				   // } else {
				   // 	println "Number of pages = ${numPages} match=" + matcher[0][1]
				   // }
				} else {
				    println "no match info: ${info}"
				}
            }
            
            while ((info = stdError.readLine()) != null) {
            	System.out.println("Got error getting info from file):\n");
            	System.out.println(info);
            }
            
            def page
	        for (page = 1; page <= new Integer(numPages); page++) {
	            /* Now we convert the pdf file to swf 
	             * We start the output with a page number starting at zero (0) so it's consistent
	             * with the naming convention when we create the thumbnails. Looks like ImageMagick
	             * uses zero-base when creating the thumbnails.	
	            */                         
	            def command = swfTools + "/pdf2swf -p " + page + " " + presentation.getAbsolutePath() + " -o " + presentation.parent + File.separatorChar + "slide-" + (page-1) + ".swf"         
				p = Runtime.getRuntime().exec(command)
				stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
	            stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
	            
				System.out.println("Converting slide: ${page}\n");
				def numSlidesProcessed = 0
				def convertInfo
	            while ((convertInfo = stdInput.readLine()) != null) {
					def msg = new HashMap()
					msg.put("room", room)
					msg.put("returnCode", "CONVERT")
					msg.put("totalSlides", numPages)
					
					/* The convert output is something like ''NOTICE  processing PDF page 2 (718x538:0:0) (move:-37:-37)'.
					 * We extract the page number from it taking it as a successful conversion.
					 */
					def convertRegExp = /NOTICE (?: .+) page ([0-9]+)(?: .+)/
					def matcher = (convertInfo =~ convertRegExp)
					if (matcher.matches()) {
					    //println matcher[0][1]
					    numSlidesProcessed++ // increment the number of slides processed
					    msg.put("slidesCompleted", page)
	            	    println "number of slides completed ${page}"
	            	    jmsTemplate.convertAndSend(JMS_UPDATES_Q,msg)
					} else {
					    println "no match convert: ${convertInfo}"
					}

	            }
	            
	            while ((convertInfo = stdError.readLine()) != null) {
	            	System.out.println("Got error converting file):\n");
	            	System.out.println(convertInfo);
	            }
	        }
            stdInput.close();
            stdError.close();
        }
        catch (IOException e) {
            System.out.println("exception happened - here's what I know: ");
            e.printStackTrace();
        }		
	}

	/** THis converts PDF to SWF using new swftool where we don't need to explode the PDF into single file 
	 * we dont' use this for now since it involves more changes on the client.
	 * Will tackle this later on.
	 */
	def convertUploadedPresentation_New = {conf, room, presentation ->
        try {
        	
        	/** Let's get how many pages this presentation has */
			def infoCmd = swfTools + "/pdf2swf -I " + presentation.getAbsolutePath()        
          	Process p = Runtime.getRuntime().exec(infoCmd);            
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));

			def info
			def numPages = 0
            while ((info = stdInput.readLine()) != null) {
            	/* The output would be something like this 'page=21 width=718.00 height=538.00'.
            	 * We need to extract the page number (i.e. 21) from it.
            	 */            	 
            	def infoRegExp = /page=([0-9]+)(?: .+)/
				def matcher = (info =~ infoRegExp)
				if (matcher.matches()) {
				    //if ((matcher[0][1]) > numPages) {
				    	numPages = matcher[0][1]
				    //	println "Number of pages = ${numPages}"
				   // } else {
				   // 	println "Number of pages = ${numPages} match=" + matcher[0][1]
				   // }
				} else {
				    println 'no match info'
				}
            }
            
            while ((info = stdError.readLine()) != null) {
            	System.out.println("Got error getting info from file):\n");
            	System.out.println(s);
            }
            
            /* Now we convert the pdf file to swf */                         
            def command = swfTools + "pdf2swf -tT 9 " + presentation.getAbsolutePath() + " -o " + presentation.parent + File.separatorChar + "slides.swf"         
			p = Runtime.getRuntime().exec(command)
			stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
            
			System.out.println("Converting slide:\n");
			def numSlidesProcessed = 0
			def convertInfo
            while ((convertInfo = stdInput.readLine()) != null) {
				def msg = new HashMap()
				msg.put("room", room)
				msg.put("returnCode", "CONVERT")
				msg.put("totalSlides", numPages)
				
				/* The convert output is something like ''NOTICE  processing PDF page 2 (718x538:0:0) (move:-37:-37)'.
				 * We extract the page number from it taking it as a successful conversion.
				 */
				def convertRegExp = /NOTICE (?: .+) page ([0-9]+)(?: .+)/
				def matcher = (convertInfo =~ convertRegExp)
				if (matcher.matches()) {
				    //println matcher[0][1]
				    numSlidesProcessed++ // increment the number of slides processed
				} else {
				    println 'no match convert'
				}
            	msg.put("slidesCompleted", numSlidesProcessed)
            	jmsTemplate.convertAndSend(JMS_UPDATES_Q,msg)
            }
            
            while ((convertInfo = stdError.readLine()) != null) {
            	System.out.println("Got error converting file):\n");
            	System.out.println(s);
            }
            stdInput.close();
            stdError.close();
        }
        catch (IOException e) {
            System.out.println("exception happened - here's what I know: ");
            e.printStackTrace();
        }		
	}
	
	def createThumbnails = {presentation ->
		/* We create thumbnails for the uploaded presentation. */ 
		try {
			System.out.println("Creating thumbnails:\n");
		 	def thumbsDir = new File(presentation.getParent() + File.separatorChar + "thumbnails")
		 	thumbsDir.mkdir()
            def command = imageMagick + "/convert -thumbnail 150x150 " + presentation.getAbsolutePath() + " " + thumbsDir.getAbsolutePath() + "/thumb.png"         
            Process p = Runtime.getRuntime().exec(command);            
            BufferedReader stdInput = new BufferedReader(new 
                 InputStreamReader(p.getInputStream()));
            BufferedReader stdError = new BufferedReader(new 
                 InputStreamReader(p.getErrorStream()));
			def s
            while ((s = stdInput.readLine()) != null) {
                System.out.println(s);
            }
            
            // read any errors from the attempted command
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
            	System.out.println(s);
            }
            stdInput.close();
            stdError.close();
        }
        catch (IOException e) {
            System.out.println("exception happened - here's what I know: ");
            e.printStackTrace();
        }
	}
	
	def roomDirectory = {conf, room ->
		return new File(presentationDir + File.separatorChar + conf + File.separatorChar + room)
	}
}

import javax.jms.Message
import javax.jms.Session
import javax.jms.JMSException
import javax.jms.MapMessage
import org.springframework.jms.core.JmsTemplate
import java.util.*;
import java.util.concurrent.*;

class PresentationService {

    boolean transactional = false
	def jmsTemplate	
	def imageMagick
	def ghostScript
	def swfTools
	def presentationDir
	
	private static String JMS_UPDATES_Q = 'UpdatesQueue'
	
	//using java.util.concurrent.* for converting presentation
    private final ExecutorService executor = Executors.newCachedThreadPool();
	
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
	
	def processUploadedPresentation = {conf, room, presentation_name, presentation ->
		def dir = new File(roomDirectory(conf, room).absolutePath + File.separatorChar + presentation_name)
		println "upload to directory ${dir.absolutePath}"
		
		/* If the presentation name already exist, delete it. We should provide a check later on to notify user
			that there is already a presentation with that name. */
		if (dir.exists()) deleteDirectory(dir)
		
		dir.mkdirs()
		def newFilename = presentation.getOriginalFilename().replace(' ', '-')
		def pres = new File( dir.absolutePath + File.separatorChar + newFilename )
		presentation.transferTo( pres )
	
		Thread.start //for "fast-return" this http request
		{
			new Timer().runAfter(1000) 
			{
				/*
				//this code cannot be built by grails(inner class problem by grails), so we have to add more classes who implements Callable and override call() there
				Callable<Integer> task_convertUploadedPresentation = 
					new Callable<Integer>(){
						public Integer call(){
							//return convertUploadedPresentation(conf, room, presentation_name, pres);
							return null;
						}
					};	
				*/

				//first we need to know how many pages in this pdf
				def numPages = getPresentationNumPages(conf, room, presentation_name, pres)
				assert((new Integer(numPages).intValue()) != -1)
				
			    println "PresentationService.groory::processUploadedPresentation()... now we get how many pages in this pdf with swftools:  numPages=" + numPages 

		        //CompletionService<Integer> completionService = new ExecutorCompletionService<Integer>(executor);

				//then submit a task to processUploadedPresentation
				//swftools(0.8.1) has concurrency problem(the newer pdf2swf-thread will cancel old one), so we need to make sure to use newer one, like swftools-2009-04-13-0127.exe
			    println "PresentationService.groory::processUploadedPresentation()... now call Callable_convertUploadedPresentation" 
				Callable<Integer> task_convertUploadedPresentation = new Callable_convertUploadedPresentation(this, conf, room, presentation_name, pres, numPages);
				Future<Integer> future_convertUploadedPresentation = executor.submit(task_convertUploadedPresentation);
				//completionService.submit(task_convertUploadedPresentation);
				
				//then submit a task to createThumbnails
			    println "PresentationService.groory::processUploadedPresentation()... now call Callable_createThumbnails" 
				Callable<Integer> task_createThumbnails = new Callable_createThumbnails(this, pres, numPages);
				Future<Integer> future_createThumbnails = executor.submit(task_createThumbnails);
				//completionService.submit(task_createThumbnails);

				
				//then wait for future_convertUploadedPresentation.get()
				try{				
					int errorcode = future_convertUploadedPresentation.get().intValue();
					assert(errorcode != -1)	
		        } 
		        catch (InterruptedException e) {
        		    // Re-assert the thread's interrupted status
		            Thread.currentThread().interrupt();
        		    // We don't need the result, so cancel the task too
		            future_convertUploadedPresentation.cancel(true);
        		} catch (ExecutionException e) {
            		//throw launderThrowable(e.getCause());
		    	    e.printStackTrace();
        		}

				//then wait for future_createThumbnails.get() 
				try{				
					int errorcode = future_createThumbnails.get().intValue();	
					assert(errorcode != -1)	
		        } 
		        catch (InterruptedException e) {
        		    // Re-assert the thread's interrupted status
		            Thread.currentThread().interrupt();
        		    // We don't need the result, so cancel the task too
		            future_convertUploadedPresentation.cancel(true);
        		} catch (ExecutionException e) {
            		//throw launderThrowable(e.getCause());
		    	    e.printStackTrace();
        		}
        		
        		
        		/*
				//then wait for the above two completionService(tasks)
        		try {
            		for (int t = 0; t < 2; t++) {
	                	Future<Integer> f = completionService.take();
						int errorcode = f.get().intValue();
						assert(errorcode != -1)	
            		}
        		} catch (InterruptedException e) {
            		Thread.currentThread().interrupt();
        		} catch (ExecutionException e) {
            		//throw launderThrowable(e.getCause());
		    	    e.printStackTrace();
		        }
        		*/
        		
	
				/* We just assume that everything is OK. Send a SUCCESS message to the client */
			    println "PresentationService.groory::processUploadedPresentation()... now converting(slides & thumbnails) is OK, we send message by JMS" 
				def msg = new HashMap()
				msg.put("room", room)
				msg.put("presentationName", presentation_name)
				msg.put("returnCode", "SUCCESS")
				msg.put("message", "The presentation is now ready.")
				System.out.println("Sending presentation conversion success.")
				jmsTemplate.convertAndSend(JMS_UPDATES_Q,msg)		
			}
		}
	}
	
	def getPresentationNumPages = {conf, room, presentation_name, presentation ->
		def numPages = -1 //total numbers of this pdf, also used as errorcode(-1)	

        try 
   		{
			def command = swfTools + "/pdf2swf -I " + presentation.getAbsolutePath()        
		    println "PresentationService.groory::processUploadedPresentation()... first get how many pages in this pdf with swftools:  command=" + command 
   			def p = Runtime.getRuntime().exec(command);            

			//p.waitFor();
			
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

		return numPages
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
	
	def roomDirectory = {conf, room ->
		return new File(presentationDir + File.separatorChar + conf + File.separatorChar + room)
	}
}





class Callable_convertUploadedPresentation implements Callable
{
	def caller
	def conf
	def room
	def presentation_name
	def presentation
	def numPages

	Callable_convertUploadedPresentation(PresentationService caller, String conf, String room, String presentation_name, File presentation, String numPages)
	{
		this.caller = caller;
		this.conf = conf;
		this.room = room;
		this.presentation_name = presentation_name;
		this.presentation = presentation;
		this.numPages = numPages;
	}
	
	public Integer call(){
		return convertUploadedPresentation(conf, room, presentation_name, presentation, numPages);
	}

	def convertUploadedPresentation = {conf, room, presentation_name, presentation, numPages ->
		def command        
       	def Process p            
        def BufferedReader stdInput
        def BufferedReader stdError
		def info
        def page = 0
		def str //output information to console for stdInput and stdError

	    println "PresentationService.groory@Callable_convertUploadedPresentation::convertUploadedPresentation()... numPages=" + numPages + "  now start to convert this pdf one page by one page....."
        try 
        {
        	Future<Integer>[] futures = new Future<Integer>[(new Integer(numPages)).intValue()];

	        for (page = 1; page <= new Integer(numPages); page++) 
	        {
			    println "PresentationService.groory@Callable_convertUploadedPresentation::convertUploadedPresentation()... submit task:  page=" + page
				Callable<Integer> task_convertOnePage = new Callable_convertOnePage(caller, conf, room, presentation_name, presentation, numPages, page);
				futures[page-1] = caller.executor.submit(task_convertOnePage);
	        }

	        for (page = 1; page <= new Integer(numPages); page++) 
	        {
			    println "PresentationService.groory@Callable_convertUploadedPresentation::convertUploadedPresentation()... get future:  page=" + page
				try
				{				
					int errorcode = futures[page-1].get().intValue();
					if(errorcode != 0) return new Integer(-1)
		        }
		        catch (InterruptedException e) {
        		    // Re-assert the thread's interrupted status
		            Thread.currentThread().interrupt();
        		    // We don't need the result, so cancel the task too
		            futures[page-1].cancel(true);
        		} catch (ExecutionException e) {
            		//throw launderThrowable(e.getCause());
            		println(e);
        		}
	        }
        }
        catch (Exception e) {
            e.printStackTrace();
        }		
        
        return new Integer(0)
	}
}	

class Callable_createThumbnails implements Callable
{
	def caller
	def presentation
	def numPages

	Callable_createThumbnails(PresentationService caller, File presentation, String numPages)
	{
		this.caller = caller;
		this.presentation = presentation;
		this.numPages = numPages;
	}
	
	public Integer call(){
		return createThumbnails(presentation, numPages);
	}

	def createThumbnails = {presentation, numPages ->
		/* We create thumbnails for the uploaded presentation. */ 
		try {
			System.out.println("Creating thumbnails:\n");
		 	def thumbsDir = new File(presentation.getParent() + File.separatorChar + "thumbnails")
		 	thumbsDir.mkdir()
            
            def command
            def num = new Integer(numPages)
            if(num == 1) command = caller.imageMagick + "/convert -thumbnail 150x150 " + presentation.getAbsolutePath() + " " + thumbsDir.getAbsolutePath() + "/thumb-0.png"         
            else         command = caller.imageMagick + "/convert -thumbnail 150x150 " + presentation.getAbsolutePath() + " " + thumbsDir.getAbsolutePath() + "/thumb.png"
            Process p = Runtime.getRuntime().exec(command);            

            BufferedReader stdInput = new BufferedReader(new 
                 InputStreamReader(p.getInputStream()));
            BufferedReader stdError = new BufferedReader(new 
                 InputStreamReader(p.getErrorStream()));
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
            
			//assert(p.exitValue() == 0)
			if(p.exitValue() != 0) return new Integer(-1);
        }
        catch (IOException e) {
            System.out.println("exception happened - here's what I know: ");
            e.printStackTrace();
        }

		return new Integer(0);
	}
}	

class Callable_convertOnePage implements Callable
{
	def caller
	def conf
	def room
	def presentation_name
	def presentation
	def numPages
	def page

	Callable_convertOnePage(PresentationService caller, String conf, String room, String presentation_name, File presentation, String numPages, Integer page)
	{
		this.caller = caller;
		this.conf = conf;
		this.room = room;
		this.presentation_name = presentation_name;
		this.presentation = presentation;
		this.numPages = numPages;
		this.page = page;
	}
	
	public Integer call(){
		return convertOnePage(conf, room, presentation_name, presentation, numPages, page);
	}

	def convertOnePage = {conf, room, presentation_name, presentation, numPages, page ->
		def command        
       	def Process p            
        def BufferedReader stdInput
        def BufferedReader stdError
		def info
		def str //output information to console for stdInput and stdError

	    println "PresentationService.groory@Callable_convertOnePage::convertOnePage()... numPages=" + numPages + "  now start to convert this page by one page..... page=" + page
        try 
        {
	            /* Now we convert the pdf file to swf 
	             * We start the output with a page number starting at zero (0) so it's consistent
	             * with the naming convention when we create the thumbnails. Looks like ImageMagick
	             * uses zero-base when creating the thumbnails.	
	            */                         
	            command = caller.swfTools + "/pdf2swf -p " + page + " " + presentation.getAbsolutePath() + " -o " + presentation.parent + File.separatorChar + "slide-" + (page-1) + ".swf"         
			    println "PresentationService.groory::convertUploadedPresentation()... first we use swftools to convert this page:  command=" + command 
				p = Runtime.getRuntime().exec(command)

				stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
	            stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
				System.out.println("Converting slide: ${page}\n");
				def numSlidesProcessed = 0
	            while ((str = stdInput.readLine()) != null) {
					def msg = new HashMap()
					msg.put("room", room)
					msg.put("presentationName", presentation_name)
					msg.put("returnCode", "CONVERT")
					msg.put("totalSlides", numPages)
					
					/* The convert output is something like ''NOTICE  processing PDF page 2 (718x538:0:0) (move:-37:-37)'.
					 * We extract the page number from it taking it as a successful conversion.
					 */
					def convertRegExp = /NOTICE (?: .+) page ([0-9]+)(?: .+)/
					def matcher = (str =~ convertRegExp)
					if (matcher.matches()) {
					    //println matcher[0][1]
					    numSlidesProcessed++ // increment the number of slides processed
					    msg.put("slidesCompleted", page)
	            	    println "number of slides completed ${page}"
	            	    caller.jmsTemplate.convertAndSend(caller.JMS_UPDATES_Q,msg)
					} else {
					    println "no match convert: ${str}"
					}
	            }
	            while ((str = stdError.readLine()) != null) {
	            	System.out.println("Got error converting file):\n");
	            	System.out.println(str);
	            }
   	        	stdInput.close();
        	    stdError.close();

	            //got error for "pdf-swf" way with swftools, so now we switch to "pdf-jpeg-swf" way with ImageMagick
				if(p.exitValue()!=0) 
				{
					println("PresentationService.groory::convertUploadedPresentation()... got error for 'pdf-swf' with swftools, so now we switch to 'pdf-jpeg-swf' with GhostScript&ImageMagick&swftools(jpeg2swf), page=" + page);
				 	def tempDir = new File(presentation.getParent() + File.separatorChar + "temp")
		 			tempDir.mkdir()
					
	            	//extract that specific page and create a temp-pdf(only one page) with GhostScript
					command = caller.ghostScript + " -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dFirstPage=" + page +" -dLastPage=" + page + " -sOutputFile=" + (tempDir.getAbsolutePath() + "/temp.pdf") + " " + presentation.getAbsolutePath()          
					println("PresentationService.groory::convertUploadedPresentation()... extract this page from pdf and create a temp-pdf(one page only) with GhostScript:  command=" + command);
    		        p = Runtime.getRuntime().exec(command);            

        		    stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            		stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
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

					//assert(p.exitValue() == 0)
					if(p.exitValue() != 0) return new Integer(-1);
		        	
	            	//convert that temp-pdf to jpeg with ImageMagick
			        def num = new Integer(numPages)
		            if(num == 1) command = caller.imageMagick + "/convert " + (tempDir.getAbsolutePath() + "/temp.pdf") + " " + (tempDir.getAbsolutePath() + "/temp-0.jpeg")         
		            else         command = caller.imageMagick + "/convert " + (tempDir.getAbsolutePath() + "/temp.pdf") + " " + (tempDir.getAbsolutePath() + "/temp.jpeg")         
					println("PresentationService.groory::convertUploadedPresentation()... convert that temp-pdf to jpeg with ImageMagick:  command=" + command);
    		        p = Runtime.getRuntime().exec(command);            

        		    stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
            		stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
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

					//assert(p.exitValue() == 0)
					if(p.exitValue() != 0) return new Integer(-1);
	        	
	        		//now convert that jpeg to swf with swftools(jpeg2swf)
		            command = caller.swfTools + "/jpeg2swf -o " + presentation.parent + File.separatorChar + "slide-" + (page-1) + ".swf" + " " + presentation.parent + File.separatorChar + "temp/temp-" + (page-1) + ".jpeg"
					println("PresentationService.groory::convertUploadedPresentation()... convert that jpeg to swf with swftools(jpeg2swf):  command=" + command);
   			        p = Runtime.getRuntime().exec(command);            

       			    stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
           			stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
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

					//assert(p.exitValue() == 0)
					if(p.exitValue() != 0) return new Integer(-1);
				}
				else{
					println("PresentationService.groory::convertUploadedPresentation()... convert this page to swf with swftools OK, page=" + page);
				}	
        }
        catch (IOException e) {
            System.out.println("exception happened - here's what I know: ");
            e.printStackTrace();
        }		
        
        return new Integer(0)
	}
}	

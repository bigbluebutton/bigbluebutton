import org.jsecurity.authc.AuthenticationException
import org.jsecurity.authc.UsernamePasswordToken
import org.jsecurity.SecurityUtils
import org.jsecurity.session.Session
import org.jsecurity.subject.Subject
import org.springframework.util.FileCopyUtils

import grails.converters.*

class PresentationController {
    PresentationService presentationService
    static transactional = true
    
    def index = {
    	println 'in PresentationController index'
    	render(view:'upload-file') 
    }
	
    def list = {						      				
		def f = confInfo()
		println "conference info ${f.conference} ${f.room}"
		def presentationsList = presentationService.listPresentations(f.conference, f.room)

		if (presentationsList) {
			withFormat {				
				xml {
					render(contentType:"text/xml") {
						conference(id:f.conference, room:f.room) {
							presentations {
								for (s in presentationsList) {
									presentation(name:s)
								}
							}
						}
					}
				}
			}
		} else {
			render(view:'upload-file')
		}
    }

    def delete = {		
		def filename = params.presentation_name
		def f = confInfo()
		presentationService.deletePresentation(f.conference, f.room, filename)
		flash.message = "file ${filename} removed" 
		redirect( action:list )
    }

	def upload = {		
		println 'PresentationController:upload'
		def file = request.getFile('fileUpload')
	    if(!file.empty) {
	      flash.message = 'Your file has been uploaded'
	      def f = confInfo()
		  presentationService.processUploadedPresentation(params.conference, params.room, params.presentation_name, file)							             			     	
		}    
	    else {
	       flash.message = 'file cannot be empty'
	    }
		redirect( action:list)
	}
	
	def showSlide = {
		def presentationName = params.presentation_name
		def slide = params.id
		
		InputStream is = null;
		try {
			def f = confInfo()
			def pres = presentationService.showSlide(f.conference, f.room, presentationName, slide)
			if (pres.exists()) {
				def bytes = pres.readBytes()
				response.addHeader("Cache-Control", "no-cache")
				response.contentType = 'application/x-shockwave-flash'
				response.outputStream << bytes;
			}	
		} catch (IOException e) {
			System.out.println("Error reading file.\n" + e.getMessage());
		}
		
		return null;
	}
	
	def showThumbnail = {
		def presentationName = params.presentation_name
		def thumb = params.id
		
		InputStream is = null;
		try {
			def f = confInfo()
			def pres = presentationService.showThumbnail(f.conference, f.room, presentationName, thumb)
			if (pres.exists()) {
				def bytes = pres.readBytes()
				response.addHeader("Cache-Control", "no-cache")
				response.contentType = 'image'
				response.outputStream << bytes;
			}	
		} catch (IOException e) {
			System.out.println("Error reading file.\n" + e.getMessage());
		}
		
		return null;
	}
	
	def show = {
		//def filename = params.id.replace('###', '.')
		def filename = params.presentation_name
		InputStream is = null;
		System.out.println("showing ${filename}")
		try {
			def f = confInfo()
			def pres = presentationService.showPresentation(f.conference, f.room, filename)
			if (pres.exists()) {
				System.out.println("Found ${filename}")
				def bytes = pres.readBytes()

				response.contentType = 'application/x-shockwave-flash'
				response.outputStream << bytes;
			}	
		} catch (IOException e) {
			System.out.println("Error reading file.\n" + e.getMessage());
		}
		
		return null;
	}
	
	def thumbnail = {
		def filename = params.id.replace('###', '.')
		System.out.println("showing ${filename} ${params.thumb}")
		def presDir = confDir() + File.separatorChar + filename
		try {
			def pres = presentationService.showThumbnail(presDir, params.thumb)
			if (pres.exists()) {
				def bytes = pres.readBytes()

				response.contentType = 'image'
				response.outputStream << bytes;
			}	
		} catch (IOException e) {
			System.out.println("Error reading file.\n" + e.getMessage());
		}
		
		return null;
	}

	def numberOfSlides = {
		def filename = params.presentation_name
		def f = confInfo()
		/* Let's just use the thumbnail count */
		def numThumbs = presentationService.numberOfThumbnails(f.conference, f.room, filename)
			response.addHeader("Cache-Control", "no-cache")
			withFormat {						
				xml {
					render(contentType:"text/xml") {
						conference(id:f.conference, room:f.room) {
							presentation(name:filename) {
								slides(count:numThumbs) {
								  for (def i=0; i<numThumbs;i++) {
								  	slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
								  }
								}
							}
						}
					}
				}
			}		
	}
		
	def numberOfThumbnails = {
		def filename = params.presentation_name
		def f = confInfo()
		def numThumbs = presentationService.numberOfThumbnails(f.conference, f.room, filename)
			withFormat {				
				xml {
					render(contentType:"text/xml") {
						conference(id:f.conference, room:f.room) {
							presentation(name:filename) {
								thumbnails(count:numThumbs) {
									for (def i=0;i<numThumbs;i++) {
								  		thumb(name:"thumbnails/${i}")
								  	}
								}
							}
						}
					}
				}
			}		
	}
	
	def confInfo = {
    	Subject currentUser = SecurityUtils.getSubject() 
		Session session = currentUser.getSession()

	    def fname = session.getAttribute("fullname")
	    def rl = session.getAttribute("role")
	    def conf = session.getAttribute("conference")
	    def rm = session.getAttribute("room")
	    println "Conference info: ${conf} ${rm}"
		return [conference:conf, room:rm]
	}
}

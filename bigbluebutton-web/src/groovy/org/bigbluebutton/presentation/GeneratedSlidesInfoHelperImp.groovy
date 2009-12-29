package org.bigbluebutton.presentation


public class GeneratedSlidesInfoHelperImp implements GeneratedSlidesInfoHelper {

	public String generateUploadedPresentationInfo(UploadedPresentation pres) {
		def writer = new java.io.StringWriter()
		def builder = new groovy.xml.MarkupBuilder(writer)
		        		
		def uploadedpresentation = builder.uploadedpresentation {        
		    conference(id:pres.conference, room:pres.room) {
		       presentation(name:pres.name) {
		          slides(count:pres.numberOfPages) {
		             for (def i = 1; i <= pres.numberOfPages; i++) {
		                slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
		             }
		          }
		       }
			}
		}
	
		return writer.toString()		
	}
	
}

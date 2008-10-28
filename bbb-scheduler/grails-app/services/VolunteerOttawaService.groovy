import org.apache.commons.httpclient.*
import org.apache.commons.httpclient.auth.AuthScope
import org.apache.commons.httpclient.methods.*

public class VolunteerOttawaService {

    boolean transactional = true

	static final URL = "http://www.volunteerottawa.ca/vo-clean/ws.php"
	static final reply = """
	<sessionid>3ba9c30076797e7dc3bef88be5cbbefe</sessionid>
<userid>1110</userid>
<email>wow@crystalbaymedia.com</email>
<login>Conference</login>
<firstname></firstname>
<lastname></lastname>
<vologin>
</vologin>
"""

    private vologin(String sessionId, Closure callable) {
			
		// build the URL
		def url = "${URL}?sessionId=${sessionId}"
		
		def client = new HttpClient()
		
		def get = new GetMethod(url)
		
		client.executeMethod(get)		
		callable( new XmlSlurper().parseText(get.getResponseBodyAsString() )  ) 
    }
    
    def loginToVo(sessionId) {
    	vologin(sessionId) { xml ->
    	println xml
    	println "email ${xml.email} fullname ${xml.firstname} ${xml.lastname}"
    	def res = [email: xml.email, fullname: "${xml.firstname} ${xml.lastname}"]
    	return res
        }

/*
		 def url = new URL("http://www.volunteerottawa.ca/vo-clean/ws.php?sessionId=${sessionId}")
		 def connection = url.openConnection()
		
		      def result = [:]
		      if(connection.responseCode == 200){
		        def xml = connection.content.text
		        println xml
		        def user = new XmlSlurper().parseText(xml)
		        result.email = user.email as String 
		        result.fullname = (user.firstname as String) + " " + (user.lastname as String)
//		        result.lastname = user.lastname as String
		      }
		      else{
		        log.error("GeocoderService.geocodeAirport FAILED")
		        log.error(url)
		        log.error(connection.responseCode)
		        log.error(connection.responseMessage)
		      }      
		return result
*/
    }
}

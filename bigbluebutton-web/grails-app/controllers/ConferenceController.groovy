import org.jsecurity.SecurityUtils
import org.jsecurity.session.Session
import org.jsecurity.subject.Subject
          
class ConferenceController {
    def index = { redirect(action:list,params:params) }

    // the delete, save and update actions only accept POST requests
    def allowedMethods = [delete:'POST', save:'POST', update:'POST']

    def list = {
        if(!params.max) params.max = 10
        
		Subject currentUser = SecurityUtils.getSubject(); 
		Session session = currentUser.getSession();  
   		def username = session.getAttribute( "username");  

        return [ conferenceList: Conference.findAllByUsername(username)]       	
    }

    def show = {
        def conference = Conference.get( params.id )

        if(!conference) {
            flash.message = "Conference not found with id ${params.id}"
            redirect(action:list)
        }
        else { 
        	return [ conference : conference ] 
        }
    }

    def delete = {
        def conference = Conference.get( params.id )
        if(conference) {
            conference.delete()
            flash.message = "${conference.conferenceName} has been deleted."
            redirect(action:list)
        }
        else {
            flash.message = "Cannot find conference."
            redirect(action:list)
        }
    }

    def edit = {
        def conference = Conference.get( params.id )

        if(!conference) {
            flash.message = "Cannot find conference ${conference.conferenceName}."
            redirect(action:list)
        }
        else {
            return [ conference : conference ]
        }
    }

    def update = {
        def conference = Conference.get( params.id )
        if(conference) {
            conference.properties = params
            if(!conference.hasErrors() && conference.save()) {
                flash.message = "The conference has been updated."
                redirect(action:show,id:conference.id)
            }
            else {
                render(view:'edit',model:[conference:conference])
            }
        }
        else {
            flash.message = "Conference not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }

    def create = {
        def conference = new Conference()
        conference.properties = params     
        Subject currentUser = SecurityUtils.getSubject(); 
		Session session = currentUser.getSession();  
   		conference.username = session.getAttribute( "username"); 
        def now = new Date()
        conference.conferenceName = "$now Conference"   
        return ['conference':conference]
    }

    def save = {
        Subject currentUser = SecurityUtils.getSubject(); 
		Session session = currentUser.getSession();  
   		params.username = session.getAttribute("username");
   		def userid =  session.getAttribute( "userid");
   		def user = User.get(userid)
   		params.user = user
   		
        def conference = new Conference(params)
/*        
        def highestConfId = Conference.listOrderByConferenceNumber(max:1, order:"desc")
        def nextConfId
        if (highestConfId) {
            nextConfId = highestConfId[0].conferenceNumber + 1
        } else {
            nextConfId = 8000 + 1
        }
        conference.conferenceNumber = nextConfId
*/        
        if(!conference.hasErrors() && conference.save()) {
            flash.message = "You have successfully created a conference."
            redirect(action:show,id:conference.id)
        }
        else {
        	System.out.println("Username ${conference.username}")
            render(view:'create',model:[conference:conference])
        }
    }
}
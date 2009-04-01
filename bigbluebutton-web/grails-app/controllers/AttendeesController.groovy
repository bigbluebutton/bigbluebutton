            
class AttendeesController {
    def index = { redirect(action:list,params:params) }

    // the delete, save and update actions only accept POST requests
    def allowedMethods = [delete:'POST', save:'POST', update:'POST']

    def list = {
        if(!params.max) params.max = 50
			def conf = new Integer(params.conferenceNumber)
			def startTime = new Date(new Long(params.start))
			def endTime = new Date(new Long(params.start) + 5*60*1000)
			flash.message = "${startTime} ${endTime}"
        	return [ attendeesList: 
        		Attendees.findAllByConferenceNumberAndDateJoinedBetween(conf, startTime, endTime)]
    }

    def show = {
        def attendees = Attendees.get( params.id )

        if(!attendees) {
            flash.message = "Attendees not found with id ${params.id}"
            redirect(action:list)
        }
        else { return [ attendees : attendees ] }
    }

    def delete = {
        def attendees = Attendees.get( params.id )
        if(attendees) {
            attendees.delete()
            flash.message = "Attendees ${params.id} deleted"
            redirect(action:list)
        }
        else {
            flash.message = "Attendees not found with id ${params.id}"
            redirect(action:list)
        }
    }

    def edit = {
        def attendees = Attendees.get( params.id )

        if(!attendees) {
            flash.message = "Attendees not found with id ${params.id}"
            redirect(action:list)
        }
        else {
            return [ attendees : attendees ]
        }
    }

    def update = {
        def attendees = Attendees.get( params.id )
        if(attendees) {
            attendees.properties = params
            if(!attendees.hasErrors() && attendees.save()) {
                flash.message = "Attendees ${params.id} updated"
                redirect(action:show,id:attendees.id)
            }
            else {
                render(view:'edit',model:[attendees:attendees])
            }
        }
        else {
            flash.message = "Attendees not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }

    def create = {
        def attendees = new Attendees()
        attendees.properties = params
        return ['attendees':attendees]
    }

    def save = {
        def attendees = new Attendees(params)
        if(!attendees.hasErrors() && attendees.save()) {
            flash.message = "Attendees ${attendees.id} created"
            redirect(action:show,id:attendees.id)
        }
        else {
            render(view:'create',model:[attendees:attendees])
        }
    }
}
package org.bigbluebutton.web.controllers

import org.jsecurity.crypto.hash.Sha1Hash
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.UserRoleRel
import org.bigbluebutton.web.domain.Role

class UserController {
    
    def index = { redirect(action:list,params:params) }

    // the delete, save and update actions only accept POST requests
    def allowedMethods = [delete:'POST', save:'POST', update:'POST']

    def list = {
        if(!params.max) params.max = 10
        [ userInstanceList: User.list( params ) ]
    }

    def show = {
        def userInstance = User.get( params.id )

        if(!userInstance) {
            flash.message = "User not found with id ${params.id}"
            redirect(action:list)
        }
        else { return [ userInstance : userInstance ] }
    }

    def delete = {
        def userInstance = User.get( params.id )
        if(userInstance) {
            userInstance.delete()
            flash.message = "User ${params.id} deleted"
            redirect(action:list)
        }
        else {
            flash.message = "User not found with id ${params.id}"
            redirect(action:list)
        }
    }

    def edit = {
        def userInstance = User.get( params.id )

        if(!userInstance) {
            flash.message = "User not found with id ${params.id}"
            redirect(action:list)
        }
        else {
            return [ userInstance : userInstance ]
        }
    }

    def changepassword = {
        def userInstance = User.get( params.id )

        if(!userInstance) {
            flash.message = "User not found with id ${params.id}"
            redirect(action:list)
        }
        else {
            return [ userInstance : userInstance ]
        }
    }

    def updatepassword = {
        def userInstance = User.get( params.id )
        if(userInstance) {
            userInstance.passwordHash = new Sha1Hash(params.newpassword).toHex()
            if(!userInstance.hasErrors() && userInstance.save()) {
                flash.message = "User password updated"
                redirect(action:show,id:userInstance.id)
            }
            else {
                render(view:'editpassword',model:[userInstance:userInstance])
            }
        }
        else {
            flash.message = "User not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }
    
    def update = {
        def userInstance = User.get( params.id )
        if(userInstance) {
            userInstance.properties = params
            if(!userInstance.hasErrors() && userInstance.save()) {
                flash.message = "User ${params.id} updated"
                redirect(action:show,id:userInstance.id)
            }
            else {
                render(view:'edit',model:[userInstance:userInstance])
            }
        }
        else {
            flash.message = "User not found with id ${params.id}"
            redirect(action:edit,id:params.id)
        }
    }

    def create = {
        def userInstance = new User()
        userInstance.properties = params
        return ['userInstance':userInstance]
    }

    def save = {
    	def userRole = Role.findByName("User")
    	def userInstance = new User(username: params.username, passwordHash: new Sha1Hash(params.password).toHex(),
									email: params.email, fullName: params.fullName)
		def userRoleRel = new UserRoleRel(user: userInstance, role: userRole)
									
        if(!userInstance.hasErrors() && userInstance.save() && userRoleRel.save()) {
            flash.message = "User ${userInstance.id} created"
            redirect(action:show,id:userInstance.id)
        }
        else {
            render(view:'create',model:[userInstance:userInstance])
        }
    }
}



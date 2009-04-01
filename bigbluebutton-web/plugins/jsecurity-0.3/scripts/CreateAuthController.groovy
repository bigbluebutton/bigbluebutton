import org.codehaus.groovy.grails.commons.GrailsClassUtils as GCU

grailsHome = Ant.project.properties."environment.GRAILS_HOME"

includeTargets << new File ("${grailsHome}/scripts/Init.groovy")
includeTargets << new File ("${jsecurityPluginDir}/scripts/_JsecInternal.groovy")

target("default": "The description of the script goes here!") {
    // Make sure any arguments have been parsed if the parser is
    // available.
    def hasArgsParser = getBinding().variables.containsKey('argsMap')
    if (hasArgsParser) {
        depends(parseArguments, checkVersion)
    }
    else {
        depends(checkVersion)
    }

    createAuthController()
}

target(createAuthController: "The implementation task") {
    // Copy over the standard auth controller.
    installTemplate("AuthController.groovy", "grails-app/controllers", "controllers")

    // Now copy over the views for the controller.
    installTemplate("login.gsp", "grails-app/views/auth", "views/auth")
}

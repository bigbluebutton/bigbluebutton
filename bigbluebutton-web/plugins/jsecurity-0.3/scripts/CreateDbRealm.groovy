import org.codehaus.groovy.grails.commons.GrailsClassUtils as GCU

Ant.property(environment: 'env')
grailsHome = Ant.antProject.properties.'env.GRAILS_HOME'

includeTargets << new File ("${grailsHome}/scripts/Init.groovy")
includeTargets << new File ("${jsecurityPluginDir}/scripts/_JsecInternal.groovy")

target ('default': 'Creates a database JSecurity realm') {
    // Make sure any arguments have been parsed if the parser is
    // available.
    hasArgsParser = getBinding().variables.containsKey('argsMap')
    if (hasArgsParser) {
        depends(parseArguments, checkVersion)
    }
    else {
        depends(checkVersion)
    }

    createDbRealm()
}

target('createDbRealm': 'Creates a basic, but flexible database-backed realm.') {
    // Get the prefix for the realm name. Default is "Jsec" to avoid
    // name conflicts.
    def prefix = "Jsec"
    if (hasArgsParser && argsMap['prefix'] != null) {
        prefix = argsMap['prefix']
    }

    // First create the domain objects: JsecUser, JsecRole, etc.
    def domainClasses = [
        'User',
        'Role',
        'Permission',
        'RolePermissionRel',
        'UserRoleRel',
        'UserPermissionRel' ]

    def artefactPath = "grails-app/domain"
    Ant.mkdir(dir:"${basedir}/${artefactPath}")

    domainClasses.each { domainClass ->
        installTemplateEx("${prefix}${domainClass}.groovy", artefactPath, "domain", "Jsec${domainClass}.groovy") {
            Ant.replace(file: artefactFile) {
                Ant.replacefilter(token: '@domain.prefix@', value: prefix)
            }
        }
        event("CreatedArtefact", ['', domainClass])
    }

    // Copy over the standard DB realm.
    def className = "${prefix}DbRealm"
    installTemplateEx("${className}.groovy", "grails-app/realms", "", "JsecDbRealm.groovy") {
        Ant.replace(file: artefactFile) {
            Ant.replacefilter(token: '@realm.name@', value: className)
            Ant.replacefilter(token: '@domain.prefix@', value: prefix)
        }
    }

    event("CreatedArtefact", ['Realm', className])
}

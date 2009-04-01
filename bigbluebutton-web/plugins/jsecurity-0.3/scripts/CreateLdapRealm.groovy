Ant.property(environment: 'env')
grailsHome = Ant.antProject.properties.'env.GRAILS_HOME'

includeTargets << new File ("${grailsHome}/scripts/Init.groovy")

target ('default': 'Creates a database JSecurity realm') {
    // Make sure any arguments have been parsed if the parser is
    // available.
    def hasArgsParser = getBinding().variables.containsKey('argsMap')
    if (hasArgsParser) {
        depends(parseArguments, checkVersion)
    }
    else {
        depends(checkVersion)
    }

    // Get the prefix for the realm name. Default is "Jsec" to avoid
    // name conflicts.
    def prefix = "Jsec"
    if (hasArgsParser && argsMap['prefix'] != null) {
        prefix = argsMap['prefix']
    }

    // Copy over the standard LDAP realm.
    def className = "${prefix}LdapRealm".toString()
    def artefactPath = 'grails-app/realms'
    def artefactFile = "${basedir}/${artefactPath}/${className}.groovy"
    if (new File(artefactFile).exists()) {
        Ant.input(
            addProperty: "${args}.${className}.overwrite",
            message: "${className} already exists. Overwrite? [y/n]")

        if (Ant.antProject.properties."${args}.${className}.overwrite" == "n") {
            return
        }
    }

    // Copy the template file to the 'grails-app/realms' directory.
    templateFile = "${jsecurityPluginDir}/src/templates/artifacts/JsecLdapRealm.groovy"
    if (!new File(templateFile).exists()) {
        Ant.echo("[JSecurity plugin] Error: src/templates/artifacts/JsecLdapRealm.groovy does not exist!")
        return
    }

    Ant.copy(file: templateFile, tofile: artefactFile, overwrite: true)
    Ant.replace(file: artefactFile) {
        Ant.replacefilter(token: '@realm.name@', value: className)
    }

    event("CreatedFile", [artefactFile])
    event("CreatedArtefact", ['Realm', className])
}

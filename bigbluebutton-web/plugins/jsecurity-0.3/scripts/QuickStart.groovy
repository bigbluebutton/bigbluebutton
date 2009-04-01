includeTargets << new File ("${jsecurityPluginDir}/scripts/CreateDbRealm.groovy")
includeTargets << new File ("${jsecurityPluginDir}/scripts/CreateAuthController.groovy")

target("default": "Sets up a basic security system with a database realm, auth controller, etc.") {
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
    createAuthController()
}

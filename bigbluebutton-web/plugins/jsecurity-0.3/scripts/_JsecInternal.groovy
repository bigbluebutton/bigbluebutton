/**
 * Installs a JSecurity template into the current project, where the
 * new file has the same name as the template.
 * @param artefactName The name of the file to create, i.e. the name
 * of the template.
 * @param artefactPath The location relative to the project root to
 * store the new file.
 * @param templatePath The location relative to the plugin's
 * "src/templates" directory where the template file can be found.
 */
installTemplate = { String artefactName, String artefactPath, String templatePath ->
    installTemplateEx(artefactName, artefactPath, templatePath, artefactName, null)
}

/**
 * Installs a JSecurity template into the current project, with optional
 * post-processing.
 * @param artefactName The name of the file to create.
 * @param artefactPath The location relative to the project root to
 * store the new file.
 * @param templatePath The location relative to the plugin's
 * "src/templates" directory where the template file can be found.
 * @param templateName The filename of the template.
 * @param c An optional closure that will be invoked once the template
 * has been installed. The closure has the property "artefactFile"
 * available to it, which is the file path (as a File) of the newly
 * created file. This parameter may be <code>null</code>, in which
 * no post-processing is performed.
 */
installTemplateEx = { String artefactName, String artefactPath, String templatePath, String templateName, Closure c ->
    // Copy over the standard auth controller.
    def artefactFile = "${basedir}/${artefactPath}/${artefactName}"
    if (new File(artefactFile).exists()) {
        Ant.input(
            addProperty: "${args}.${artefactName}.overwrite",
            message: "${artefactName} already exists. Overwrite? [y/n]")

        if (Ant.antProject.properties."${args}.${artefactName}.overwrite" == "n") {
            return
        }
    }

    // Copy the template file to the 'grails-app/controllers' directory.
    templateFile = "${jsecurityPluginDir}/src/templates/artifacts/${templatePath}/${templateName}"
    if (!new File(templateFile).exists()) {
        Ant.echo("[JSecurity plugin] Error: src/templates/artifacts/${templatePath}/${templateName} does not exist!")
        return
    }

    Ant.copy(file: templateFile, tofile: artefactFile, overwrite: true)

    // Perform any custom processing that may be required.
    if (c) {
        c.delegate = [ artefactFile: artefactFile ]
        c.call()
    }

    event("CreatedFile", [artefactFile])
}

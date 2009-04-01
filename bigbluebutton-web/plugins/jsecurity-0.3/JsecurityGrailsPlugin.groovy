/*
 * Copyright 2007 Peter Ledbrook.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import org.codehaus.groovy.grails.commons.ControllerArtefactHandler
import org.codehaus.groovy.grails.commons.GrailsClassUtils
import org.codehaus.groovy.grails.plugins.support.GrailsPluginUtils
import org.codehaus.groovy.grails.plugins.web.filters.FilterConfig

import org.jsecurity.SecurityUtils
import org.jsecurity.authc.credential.Sha1CredentialsMatcher
import org.jsecurity.grails.*
import org.jsecurity.realm.Realm
import org.jsecurity.subject.DelegatingSubject
import org.jsecurity.web.DefaultWebSecurityManager

import org.springframework.beans.factory.config.MethodInvokingFactoryBean

class JsecurityGrailsPlugin {
    def version = '0.3'
    def author = 'Peter Ledbrook'
    def authorEmail = 'peter@cacoethes.co.uk'
    def title = 'Security support via the JSecurity framework.'
    def description = '''\
Adds a security layer to your Grails application, allowing you to
protect pages based on a user's roles and/or permissions.
'''
    def documentation = 'http://grails.codehaus.org/JSecurity+Plugin'

    def grailsVersion = GrailsPluginUtils.grailsVersion
    def loadAfter = [ 'controllers', 'services' ]
    def observe = [ 'controllers' ]
    def watchedResources = 'file:./grails-app/realms/**/*Realm.groovy'
    def artefacts = [ RealmArtefactHandler ]

    def roleMaps = [:]
    def permMaps = [:]

    def doWithSpring = {
        // Configure the realms defined in the project.
        def realmBeans = []
        def realmClasses = application.realmClasses
        application.realmClasses.each { realmClass ->
            log.info "Registering realm: ${realmClass.fullName}"
            configureRealm.delegate = delegate

            realmBeans << configureRealm(realmClass)
        }

        // This currently does not work in certain cases because of
        // a bug in Grails.
//        'org.jsecurity.spring.LifecycleBeanPostProcessor'(org.jsecurity.spring.LifecycleBeanPostProcessor)


        // The default credential matcher.
        credentialMatcher(Sha1CredentialsMatcher) {
            storedCredentialsHexEncoded = true
        }

        jsecSecurityManager(DefaultWebSecurityManager) { bean ->
            bean.destroyMethod = "destroy"

            realms = realmBeans.collect { ref(it) }

            // Allow the user to customise the session type: either
            // 'http' or 'jsecurity'.
            if (application.config.jsecurity.session.mode) {
                sessionMode = application.config.jsecurity.session.mode
            }

            // Allow the user to customise the authentication strategy.
            if (application.config.jsecurity.authentication.strategy) {
                modularAuthenticationStrategy = application.config.jsecurity.authentication.strategy
            }
        }
    }

    def doWithApplicationContext = { applicationContext ->
        // Add any extra realms that might have been defined in the
        // project. To do that, we first just get all the beans that
        // implement the Realm interface.
        def beans = applicationContext.getBeanNamesForType(Realm) as List

        // Now filter out the beans created by the plugin for the
        // realm artefacts.
        beans = beans.findAll { !(it.endsWith("Wrapper") || it.endsWith("Proxy")) }

        // Finally add the remaining beans to the security manager.
        log.info "Registering native realms: $beans"
        def mgr = applicationContext.getBean('jsecSecurityManager')
        mgr.realms.addAll(beans.collect { applicationContext.getBean(it) })
    }

    /**
     * Adds 'roleMap' and 'permissionMap' properties to controllers
     * so that our before-interceptor can query them to find out
     * whether a user has the required role/permission for an action.
     */
    def doWithDynamicMethods = { ctx ->
        // Get the access control information from the controllers, if
        // there are any.
        if (manager?.hasGrailsPlugin("controllers")) {
            // Process each controller.
            application.controllerClasses.each { controllerClass ->
                processController(controllerClass, log)
            }
        }

        application.filtersClasses.each { filterClass ->
            filterClass.clazz.metaClass.getRoleMap = { String controller -> return roleMaps[controller] }
            filterClass.clazz.metaClass.getPermissionMap = { String controller -> return permMaps[controller] }
        }

        // Get the config option that determines whether authentication
        // is required for access control or not. By default, it is
        // required.
        boolean authcRequired = true
        if (application.config.jsecurity.authc.required instanceof Boolean) {
            authcRequired = application.config.jsecurity.authc.required
        }

        // Add an 'accessControl' method to FilterConfig (so that it's
        // available from Grails filters).
        def mc = FilterConfig.metaClass

        mc.accessControl << { -> return accessControlMethod(delegate, authcRequired) }
        mc.accessControl << { Map args -> return accessControlMethod(delegate, authcRequired, args) }
        mc.accessControl << { Closure c -> return accessControlMethod(delegate, authcRequired, [:], c) }
        mc.accessControl << { Map args, Closure c -> return accessControlMethod(delegate, authcRequired, args, c) }
    }

    def doWithWebDescriptor = { webXml ->
        def contextParam = webXml.'context-param'
        contextParam[contextParam.size() - 1] + {
            'filter' {
                'filter-name'('securityContextFilter')
                'filter-class'('org.jsecurity.spring.SpringJSecurityFilter')
                'init-param' {
                    'param-name'('securityManagerBeanName')
                    'param-value'('jsecSecurityManager')
                }

                // If a JSecurity configuration is available, add it
                // as an 'init-param' of the filter. This config should
                // be in .ini format. See the JSecurity documentation
                // for more information.
                if (application.config.jsecurity.filter.config) {
                    'init-param' {
                        'param-name'('config')
                        'param-value'(application.config.jsecurity.filter.config)
                    }
                }
            }
        }

        // Place the JSecurity filter after the Spring character encoding
        // filter, otherwise the latter filter won't work.
        def filter = webXml.'filter-mapping'.find { it.'filter-name'.text() == "charEncodingFilter" }

        // NOTE: The following shenanigans are designed to ensure that
        // the filter mapping is inserted in the right location under
        // a variety of circumstances. However, at this point in time
        // it's a bit of wasted effort because Grails itself can't handle
        // certain situations, such as no filter mappings at all, or
        // a SiteMesh one but no character encoding filter mapping.
        // Bleh.

        if (!filter) {
            // Of course, if there is no char encoding filter, the next
            // requirement is that we come before the SiteMesh filter.
            // This is trickier to accomplish. First we find out at what
            // index the SiteMesh filter mapping is.
            int i = 0
            int siteMeshIndex = -1
            webXml.'filter-mapping'.each {
                if (it.'filter-name'.text().equalsIgnoreCase("sitemesh")) {
                    siteMeshIndex = i
                }
                i++
            }

            if (siteMeshIndex > 0) {
                // There is at least one other filter mapping that comes
                // before the SiteMesh one, so we can simply use the filter
                // mapping that comes immediately before SiteMesh as the
                // insertion point.
                filter = webXml.'filter-mapping'[siteMeshIndex - 1]
            }
            else if (siteMeshIndex == 0 || webXml.'filter-mapping'.size() == 0) {
                // If the index of the SiteMesh filter mapping is 0, i.e.
                // it's the first one, we need to use the last filter
                // definition as the insertion point. We also need to do
                // this if there are no filter mappings.
                def filters = webXml.'filter'
                filter = filters[filters.size() - 1]
            }
            else {
                // Simply add this filter mapping to the end.
                def filterMappings = webXml.'filter-mapping'
                filter = filterMappings[filterMappings.size() - 1]
            }
        }

        // Finally add the JSecurity filter mapping after the selected
        // insertion point.
        filter + {
            'filter-mapping' {
                'filter-name'('securityContextFilter')
                'url-pattern'("/*")
            }
        }
    }

    def onChange = { event ->
        if (application.isControllerClass(event.source)) {
            // Get the GrailsClass instance for the controller.
            def controllerClass = application.getControllerClass(event.source?.name)

            // If no GrailsClass can be found, i.e. 'controllerClass'
            // is null, then this is a new controller.
            if (controllerClass == null) {
                controllerClass = application.addArtefact(ControllerArtefactHandler.TYPE, event.source)
            }

            // Now update the role and permission information for this
            // controller.
            log.info "Reconfiguring access control for ${controllerClass.shortName}"
            processController(controllerClass, log)
            return
        }
        else if (application.isRealmClass(event.source)) {
            log.info "Realm modified!"
            
            def context = event.ctx
            if (!context) {
                log.debug("Application context not found - can't reload.")
                return
            }

            boolean isNew = event.application.getRealmClass(event.source?.name) == null
            def realmClass = application.addArtefact(RealmArtefactHandler.TYPE, event.source)

            if (isNew) {
                try {
                    def beanDefinitions = beans(configureRealm.curry(realmClass))
                    beanDefinitions.registerBeans(context)
                }
                catch (MissingMethodException ex) {
                    // This version of Grails does not support this.
                    log.warn("Unable to register beans (Grails version < 0.5.5)")
                }
            }
            else {
                def realmName = realmClass.shortName
                def wrapperName = "${realmName}Wrapper".toString()

                def beans = beans {
                    "${realmName}Class"(MethodInvokingFactoryBean) {
                        targetObject = ref('grailsApplication', true)
                        targetMethod = 'getArtefact'
                        arguments = [RealmArtefactHandler.TYPE, realmClass.fullName]
                    }

                    "${realmName}Instance"(ref("${realmName}Class")) {bean ->
                        bean.factoryMethod = 'newInstance'
                        bean.singleton = true
                        bean.autowire = 'byName'
                    }

                    "${wrapperName}"(RealmWrapper) {
                        realm = ref("${realmName}Instance")
                        tokenClass = GrailsClassUtils.getStaticPropertyValue(realmClass.clazz, 'authTokenClass')
                    }
                }

                if (context) {
                    context.registerBeanDefinition("${realmName}Class", beans.getBeanDefinition("${realmName}Class"))
                    context.registerBeanDefinition("${realmName}Instance", beans.getBeanDefinition("${realmName}Instance"))
                    context.registerBeanDefinition(wrapperName, beans.getBeanDefinition(wrapperName))
                }

                // HACK
                //
                // The problem here is that the subject has been created
                // within a servlet filter *before* the realm reloading
                // has occurred. The above 'registerBeanDefinition()'
                // calls result in the security manager being destroyed
                // and a new one created, but the subject still refers
                // to the old security manager.
                //
                // So, we update the subject's security manager directly.
                // Note that we are using Groovy's ability to circumvent
                // visibility controls since the 'securityManager' field
                // is protected, not public.
                if (SecurityUtils.subject instanceof DelegatingSubject) {
                    SecurityUtils.subject.@securityManager = context.getBean("jsecSecurityManager")
                }
            }
        }
    }

    def onApplicationChange = { event ->
        // TODO Implement code that is executed when any class in a GrailsApplication changes
        // the event contain: event.source, event.application and event.applicationContext objects
    }

    def configureRealm = { grailsClass ->
        def realmName = grailsClass.shortName

        // Create the realm bean.
        "${realmName}Class"(MethodInvokingFactoryBean) {
            targetObject = ref('grailsApplication', true)
            targetMethod = 'getArtefact'
            arguments = [RealmArtefactHandler.TYPE, grailsClass.fullName]
        }

        "${realmName}Instance"(ref("${realmName}Class")) {bean ->
            bean.factoryMethod = 'newInstance'
            bean.singleton = true
            bean.autowire = 'byName'
        }

        // Wrap each realm with an adapter that implements the
        // JSecurity Realm interface.
        def wrapperName = "${realmName}Wrapper".toString()
        "${wrapperName}"(RealmWrapper) {
            realm = ref("${realmName}Instance")
            tokenClass = GrailsClassUtils.getStaticPropertyValue(grailsClass.clazz, 'authTokenClass')
        }

        // Return the bean name for this realm.
        return wrapperName
    }

    /**
     * Implementation of the "accessControl()" dynamic method available
     * to filters. It requires a reference to the filter so that it can
     * access the dynamic properties and methods, such as "request" and
     * "redirect()".
     * @param filter The filter instance that the "accessControl()"
     * method is called from.
     * @param authcRequired Specifies whether the default behaviour is
     * to only allow access if the user is authenticated. If
     * <code>false</code>, remembered users are also allowed unless this
     * setting is overridden in the arguments of the method.
     * @param args An argument map as passed to the "accessControl()"
     * method. Only the "auth" argument is supported at the moment.
     * @param c The closure to execute if the user has not been blocked
     * by the authentication requirement. The closure should return
     * <code>true</code> to allow access, or <code>false</code> otherwise.
     */
    boolean accessControlMethod(filter, boolean authcRequired, Map args = [:], Closure c = null) {
        // If we're accessing the auth controller itself, we don't
        // want to check whether the user is authenticated, otherwise
        // we end up in an infinite loop of redirects.
        if (filter.controllerName == 'auth') return true

        // Get hold of the filters class instance.
        def filtersClass = filter.filtersDefinition

        // ...and the HTTP request.
        def request = filter.request

        // Is an authenticated user required for this URL? If not,
        // then we can do a permission check for remembered users
        // as well as authenticated ones. Otherwise, remembered
        // users will have to log in.
        def authenticatedUserRequired = args["auth"] || (args["auth"] == null && authcRequired)

        // If required, check that the user is authenticated.
        def subject = SecurityUtils.subject
        if (subject.principal == null || (authenticatedUserRequired && !subject.authenticated)) {
            // User is not authenticated, so deal with it.
            if (filtersClass.metaClass.respondsTo(filtersClass, 'onNotAuthenticated')) {
                filtersClass.onNotAuthenticated(subject, filter)
            }
            else {
                // Default behaviour is to redirect to the login
                // page.
                def targetUri = request.forwardURI - request.contextPath
                def query = request.queryString
                if (query) {
                    if (!query.startsWith('?')) {
                        query = '?' + query
                    }
                    targetUri += query
                }

                filter.redirect(
                        controller: 'auth',
                        action: 'login',
                        params: [ targetUri: targetUri ])
            }

            return false
        }

        def isPermitted
        if (c == null) {
            // Check that the user has the required permission for
            // the target controller/action. This is access control
            // by convention.
            isPermitted = subject.isPermitted(new JsecBasicPermission(filter.controllerName, filter.actionName ?: 'index'))
        }
        else {
            // Call the closure with the access control builder and
            // check the result. The closure will return 'true' if the
            // user is permitted access, otherwise 'false'.
            c.delegate = new FilterAccessControlBuilder(subject)
            isPermitted = c.call()
        }

        if (!isPermitted) {
            // User does not have the required permission(s)
            if (filtersClass.metaClass.respondsTo(filtersClass, 'onUnauthorized')) {
                filtersClass.onUnauthorized(subject, filter)
            }
            else {
                // Default behaviour is to redirect to the
                // 'unauthorized' page.
                filter.redirect(controller: 'auth', action: 'unauthorized')
            }

            return false
        }
        else {
            return true
        }
    }

    def processController(controllerClass, log) {
        // This is the wrapped class.
        def clazz = controllerClass.clazz

        // These maps are made available to controllers via the
        // dynamically injected 'roleMap' and 'permissionMap'
        // properties.
        def roleMap = [:]
        def permissionMap = [:]
        this.roleMaps[controllerClass.logicalPropertyName] = roleMap
        this.permMaps[controllerClass.logicalPropertyName] = permissionMap

        // Process any annotations that this controller declares.
        try {
            // Check whether the JVM supports annotations.
            Class.forName('java.lang.annotation.Annotation')

            // Process any annotations on this controller.
            log.debug "Processing annotations on ${controllerClass.shortName}"
            processAnnotations(controllerClass, roleMap, permissionMap, log)
        }
        catch (ClassNotFoundException ex) {
        }

        // Check whether this controller class has a static
        // 'accessControl' property. If so, use that as a definition
        // of the controller's role and permission requirements.
        // Note that these settings override any annotations that
        // are declared in the class.
        if (GrailsClassUtils.isStaticProperty(clazz, 'accessControl')) {
            // The property should be a Closure. If it's not, we
            // can't do anything with it.
            def c = GrailsClassUtils.getStaticPropertyValue(clazz, 'accessControl')
            if (!(c instanceof Closure)) {
                log.error("Static property [accessControl] on controller [${controllerClass.fullName}] is not a closure.")
                return
            }

            // Process the closure, building a map of actions to
            // permissions and a map of actions to roles.
            def b = new AccessControlBuilder(clazz)
            c.delegate = b
            c.call()

            roleMap.putAll(b.roleMap)
            permissionMap.putAll(b.permissionMap)

            if (log.isDebugEnabled()) {
                log.debug("Access control role map for controller '${controllerClass.logicalPropertyName}': ${roleMap}")
                log.debug("Access control permission map for controller '${controllerClass.logicalPropertyName}': ${permissionMap}")
            }
        }

        // Inject the role and permission maps into the controller.
        controllerClass.metaClass.getRoleMap = {->
            return roleMap
        }

        controllerClass.metaClass.getPermissionMap = {->
            return permissionMap
        }
    }

    /**
     * Process any plugin annotations (RoleRequired or PermissionRequired)
     * on the given controller. Any annotations are evaluated and used
     * to update the role and permission maps.
     */
    def processAnnotations(controllerClass, roleMap, permissionMap, log) {
        def clazz = controllerClass.clazz
        clazz.declaredFields.each { field ->
            // First see whether this field/action requires any roles.
            // We load the annotation classes dynamically so that the
            // plugin can be used with the 1.4 JDK.
            def ann = field.getAnnotation(Class.forName('org.jsecurity.grails.annotation.RoleRequired'))
            if (ann != null) {
                if (log.isDebugEnabled()) {
                    log.debug("Annotation role required by controller '${controllerClass.logicalPropertyName}', action '${field.name}': ${ann.value()}")
                }

                // Found RoleRequired annotation. Configure the
                // interceptor for this.
                def roles = roleMap[field.name]
                if (!roles) {
                    roles = []
                    roleMap[field.name] = roles
                }
                roles << ann.value()
            }

            // Now check for permission requirements.
            ann = field.getAnnotation(Class.forName('org.jsecurity.grails.annotation.PermissionRequired'))
            if (ann != null) {
                if (log.isDebugEnabled()) {
                    log.debug("Annotation permission required by controller '${controllerClass.logicalPropertyName}', action '${field.name}': ${ann.value()}")
                }

                // Found PermissionRequired annotation. Configure
                // the interceptor for this.
                def permissions = permissionMap[field.name]
                if (!permissions) {
                    permissions = []
                    permissionMap[field.name] = permissions
                }

                def constructor = ann.type().getConstructor([ String, String ] as Class[])
                permissions << constructor.newInstance([ ann.target(), ann.actions() ] as Object[])
            }
        }
    }
}

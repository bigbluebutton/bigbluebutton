<% import org.codehaus.groovy.grails.orm.hibernate.support.ClosureEventTriggeringInterceptor as Events %>
<%=packageName%>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Create ${className}</title>         
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="\${resource(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">${className} List</g:link></span>
        </div>
        <div class="body">
            <h1>Create ${className}</h1>
            <g:if test="\${flash.message}">
            <div class="message">\${flash.message}</div>
            </g:if>
            <g:hasErrors bean="\${${propertyName}}">
            <div class="errors">
                <g:renderErrors bean="\${${propertyName}}" as="list" />
            </div>
            </g:hasErrors>
            <g:form action="save" method="post" <%= multiPart ? ' enctype="multipart/form-data"' : '' %>>
                <div class="dialog">
                    <table>
                        <tbody>
                        <%

                            excludedProps = ['version',
                                             'id',
                                               Events.ONLOAD_EVENT,
                                               Events.BEFORE_DELETE_EVENT,
                                               Events.BEFORE_INSERT_EVENT,
                                               Events.BEFORE_UPDATE_EVENT]
                            props = domainClass.properties.findAll { !excludedProps.contains(it.name) }

                            Collections.sort(props, comparator.constructors[0].newInstance([domainClass] as Object[]))
                            props.each { p ->
                                if(!Collection.class.isAssignableFrom(p.type)) {
                                    cp = domainClass.constrainedProperties[p.name]
                                    display = (cp ? cp.display : true)        
                                    if(display) { %>
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="${p.name}">${p.naturalName}:</label>
                                </td>
                                <td valign="top" class="value \${hasErrors(bean:${propertyName},field:'${p.name}','errors')}">
                                    ${renderEditor(p)}
                                </td>
                            </tr> 
                        <%  }   }   } %>
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><input class="save" type="submit" value="Create" /></span>
                </div>
            </g:form>
        </div>
    </body>
</html>

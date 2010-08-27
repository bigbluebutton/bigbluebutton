package org.bigbluebutton

import org.codehaus.groovy.grails.web.json.JSONObject
import org.codehaus.groovy.grails.web.json.JSONArray
import grails.converters.*
import groovy.sql.Sql

class EventController {

    def dataSource

    def conferences = {
        groovy.sql.Sql sql = new groovy.sql.Sql(dataSource)

        def conferenceNames = new ArrayList()
        sql.eachRow("""
                        SELECT
                            distinct(conferenceid)
                        FROM
                            event
                  """, { row ->
                def obj=new HashMap()
                obj.put("conferenceid",row.conferenceid);
                conferenceNames.add(obj)
                }
            )
        withFormat{
            xml{
                render conferenceNames as XML
            }
            json{
                render conferenceNames as JSON
            }
        }
    }

    def json = {
        List list_events=Event.findAllByConferenceid(params.confid)
        render(contentType:'text/json'){
            "${params.confid}"{
                for(evt in list_events)
                {
                    def json_data=evt.message //as JSON
                    JSONObject json_obj=JSON.parse(json_data)
                    String event_str=json_obj.remove("module")
                    "${evt.tsevent}"{
                        "${event_str}"(json_obj)
                    }

                }
            }
        }
    }

    def xml = {
        List list_events=Event.findAllByConferenceid(params.confid)
        
        render(contentType:'text/xml'){
            lecture(conference:params.confid){
                par{
                    seq{
                        for(evt in list_events)
                        {
                            def json_data=evt.message //as JSON
                            JSONObject json_obj=JSON.parse(json_data)
                            String event_str=json_obj.remove("module")
                            json_obj.put("timestamp",evt.tsevent)

                            ArrayList attribs=new ArrayList(json_obj.keySet())
                            ArrayList arr_subnodes=new ArrayList();
                            for(attrib in attribs){
                                Object obj=json_obj.get(attrib);
                                if(obj instanceof JSONArray||attrib.equalsIgnoreCase("text")){
                                    JSONObject arr=new JSONObject()
                                    arr.put(attrib,obj);
                                    arr_subnodes.add(arr)
                                    json_obj.remove(attrib)
                                }
                            }

                            "${event_str}"(json_obj){
                                for(subnode in arr_subnodes){
                                    String name=new ArrayList(subnode.keySet()).get(0);
                                    if(name.equalsIgnoreCase("text"))
                                        render subnode.get(name)
                                    else{
                                        JSONArray arr_att=subnode.get(name)
                                        for(int j=0;j<arr_att.size();j++)
                                            "${name}"(arr_att.getString(j))
                                    }
                                }
                            }
                            
                        }
                    }
                }
            }
        }
    }
}
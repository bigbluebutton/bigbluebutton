#!/usr/bin/ruby

require 'builder'

title = "HERE TITLE"
subject = "HERE SUBJECT"
description = "HERE DESCRIPTION"
creator = "HERE CREATOR"
contributor = "HERE CONTRIBUTOR"
language = "HERE LANGUAGE"
identifier = "HERE IDENTIFIER"

xml = Builder::XmlMarkup.new( :indent => 2 )

result = xml.instruct! :xml, :version => "1.0"

xml.dublincore("xmlns" => "http://www.opencastproject.org/xsd/1.0/dublincore/", "xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance/", "xsi:schemaLocation" => "http://www.opencastproject.org http://www.opencastproject.org/schema.xsd", "xmlns:dcterms" => "http://purl.org/dc/terms/","xmlns:oc" => "http://www.opencastproject.org/matterhorn"){
  xml.tag!("dcterms:title",title)
  xml.tag!("dcterms:subject",subject)
  xml.tag!("dcterms:description",description)
  xml.tag!("dcterms:creator",creator)
  xml.tag!("dcterms:contributor",contributor)
  xml.tag!("dcterms:language",language)
  xml.tag!("dcterms:identifier",identifier)
}


puts result

aFile = File.new("dublincore.xml","w+")
aFile.write(result)
aFile.close



require 'rubygems'
require 'fileutils'
require 'builder'
require 'streamio-ffmpeg'
require 'mime/types'
require 'digest/md5'
require 'zip/zip'

module BigBlueButton
  class MediaFormatException < StandardError
  end

  class MatterhornProcessor    
    def self.create_manifest_xml(webcam, deskshare, manifest)
      vpresenter = FFMPEG::Movie.new(webcam)
      vpresentation = FFMPEG::Movie.new(deskshare)

      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"

      timestamp = (Time::now).utc.strftime("%Y-%m-%dT%H:%M:%S")
      xml.tag!("ns2:mediapackage", "duration" => vpresenter.duration.round.to_s.split(".")[0] + "000", 
              "start" => timestamp, "xmlns:ns2" => "http://mediapackage.opencastproject.org") {

        xml.media{
          xml.track("id" => "track-1", "type" => "presenter/source") {
            xml.mimetype(MIME::Types.type_for(vpresenter.path).first.content_type)
            xml.tags
            # Remove path and just have video.flv
            xml.url(vpresenter.path.sub(/.+\//, ""))
            xml.checksum(Digest::MD5.hexdigest(File.read(vpresenter.path)), "type" => "md5")
            xml.duration(vpresenter.duration.round.to_s.split(".")[0] + "000")
            xml.video("id" => "video1") {
              xml.encoder("type" => vpresenter.video_codec)
              xml.bitrate(vpresenter.bitrate.to_s + "000")
              xml.framerate(vpresenter.frame_rate)
              xml.resolution(vpresenter.width.to_s + "x" + vpresenter.height.to_s)
            }
          }

          xml.track("id" => "track-2", "type" => "presentation/source") {
            xml.mimetype(MIME::Types.type_for(vpresentation.path).first.content_type)
            xml.tags
            # Remove path and just have deskshare.flv
            xml.url(vpresentation.path.sub(/.+\//, ""))
            xml.checksum(Digest::MD5.hexdigest(File.read(vpresentation.path)),"type" => "md5")
            xml.duration(vpresentation.duration.round.to_s.split(".")[0] + "000")
            xml.video("id" => "video2") {
              xml.encoder("type" => vpresentation.video_codec)
              xml.bitrate(vpresentation.bitrate.to_s + "000")
              xml.framerate(vpresentation.frame_rate)
              xml.resolution(vpresentation.width.to_s + "x" + vpresentation.height.to_s)
            }
          }
        }
        
        xml.metadata {
          xml.catalog("id" => "catalog-1", "type" => "dublincore/episode"){
            xml.mimetype("text/xml")
            xml.url("dublincore.xml")
          }
        }
      }

      BigBlueButton.logger.info("Task: Creating manifest.xml = \n#{result}")

      aFile = File.new(manifest,"w+")
        aFile.write(result)
        aFile.close

    end

    # Creates dublincore.xml
    #  Example:
    #    create_dublin_core_xml( "/path/to/save/dublincore.xml",
    #                             {:title => metadata[:title],
    #                             :subject => metadata[:subject],
    #                             :description => metadata[:description],
    #                             :creator => metadata[:creator],
    #                             :contributor => metadata[:contributor],
    #                             :language => metadata[:language],
    #                             :identifier => metadata[:identifier]})
    #
    def self.create_dublincore_xml(dublin_core_xml, metadata)
      
      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"

      xml.dublincore("xmlns" => "http://www.opencastproject.org/xsd/1.0/dublincore/", 
        "xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance/", 
        "xsi:schemaLocation" => "http://www.opencastproject.org http://www.opencastproject.org/schema.xsd", 
        "xmlns:dcterms" => "http://purl.org/dc/terms/","xmlns:oc" => "http://www.opencastproject.org/matterhorn") {
          xml.tag!("dcterms:title", metadata[:title])
          xml.tag!("dcterms:subject", metadata[:subject])
          xml.tag!("dcterms:description", metadata[:description])
          xml.tag!("dcterms:creator", metadata[:creator])
          xml.tag!("dcterms:contributor", metadata[:contributor])
          xml.tag!("dcterms:language", metadata[:language])
          xml.tag!("dcterms:identifier", metadata[:identifier])
      }

      BigBlueButton.logger.info("Task: Creating dublincore.xml = \n#{result}")

      aFile = File.new(dublin_core_xml, "w+")
      aFile.write(result)
      aFile.close
    end

    def self.zip_artifacts(webcam, deskshare, dublincore, manifest, zipped_file)
      BigBlueButton.logger.info("Task: Zipping package... #{zipped_file} #{webcam} #{deskshare} #{dublincore} #{manifest}")
      files = [webcam, deskshare, dublincore, manifest]
      Zip::ZipFile.open(zipped_file, Zip::ZipFile::CREATE) do |zipfile|
        files.each { |f| 
          BigBlueButton.logger.info("Zipping #{f} into #{zipped_file}")
          zipfile.add(f, f) 
        }
      end
  
    end
    
    def upload_to_matterhorn(host, username, password, file)
      BigBlueButton.logger.info("Task: Sending zipped package")
      c = Curl::Easy.new("#{host}/ingest/rest/addZippedMediaPackage")
      c.http_auth_types = :digest
      c.username = username
      c.password = password
      c.headers["X-Requested-Auth"] = "Digest"
      c.multipart_form_post = true
      c.http_post(Curl::PostField.file('upload', file))
      c.verbose = true

      begin
        c.perform
      rescue Exception=>e	
      end
    end    
  end
end

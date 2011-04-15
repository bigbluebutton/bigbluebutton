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
    def self.process(archive_dir, meeting_id)
      matterhorn_dir = "#{archive_dir}/matterhorn"
      if not FileTest.directory?(matterhorn_dir)
        FileUtils.mkdir_p matterhorn_dir
      end
        
      process_audio(archive_dir, matterhorn_dir)
      process_deskshare(archive_dir, matterhorn_dir)
      process_video(archive_dir, meeting_id, matterhorn_dir)            
    end
    
    def self.process_deskshare(archive_dir, matterhorn_dir)      
      FileUtils.cp_r("#{archive_dir}/deskshare", matterhorn_dir)
      deskshare_file = "#{matterhorn_dir}/deskshare/*.flv"
      Dir.glob("#{matterhorn_dir}/deskshare/*.flv").each do |file|
        puts "Converting #{file}"
        proc = IO.popen("ffmpeg -i #{file} -an -vcodec copy #{matterhorn_dir}/deskshare.flv", "w+")
        Process.wait()
      end
    end
    
    def self.process_video(archive_dir, meeting_id, matterhorn_dir)
      FileUtils.cp_r("#{archive_dir}/video", matterhorn_dir)
      video_dir = "#{matterhorn_dir}/video/#{meeting_id}"
      
      begin
        Dir.glob("#{video_dir}/*.flv").each do |file|
          puts "Converting #{file}"
          proc = IO.popen("ffmpeg -i #{file} -an -vcodec copy #{matterhorn_dir}/video.flv", "w+")
          Process.wait()
        end
      rescue Exception => e
      end    
    end
    
    def self.process_audio(archive_dir, matterhorn_dir)
      audio_dir = "#{archive_dir}/audio"
      FileUtils.cp_r("#{archive_dir}/audio", matterhorn_dir)
            
      wav_file = "#{matterhorn_dir}/audio/*.wav"
      ogg_file = "#{matterhorn_dir}/audio.ogg"
      proc = IO.popen("oggenc -Q --resample 44100 -o #{ogg_file} #{wav_file} 2>&1", "w+")
      Process.wait()
    end
    
    def self.create_manifest_xml(audio, video, deskshare, manifest)
      vpresenter = FFMPEG::Movie.new(video)
      apresenter = FFMPEG::Movie.new(audio)
      vpresentation = FFMPEG::Movie.new(deskshare)

      puts "Creating manifest.xml ..."

      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"

      puts "Setting timestamp ..."
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

          xml.track("id" => "track-3", "type" => "presenter/source") {
            xml.mimetype("application/ogg")
            xml.tags
            # Remove path and just have audio.ogg
            xml.url(apresenter.path.sub(/.+\//, ""))
            xml.checksum(Digest::MD5.hexdigest(File.read(apresenter.path)),"type" => "md5")
            xml.duration(apresenter.duration.round.to_s.split(".")[0] + "000")
            xml.audio("id" => "audio1") {
              xml.encoder("type" => apresenter.audio_codec)
              xml.channels(apresenter.audio_channels)
              xml.bitrate(apresenter.bitrate.to_s + "000")
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

      puts result

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

      puts result

      aFile = File.new(dublin_core_xml, "w+")
      aFile.write(result)
      aFile.close
    end

    def self.zip_artifacts(audio, video, deskshare, dublincore, manifest, zipped_file)
      puts "Zipping package... #{zipped_file} #{audio} #{video} #{deskshare} #{dublincore} #{manifest}"
      files = [audio, video, deskshare, dublincore, manifest]
      Zip::ZipFile.open(zipped_file, Zip::ZipFile::CREATE) do |zipfile|
        files.each { |f| 
          puts f
          zipfile.add(f, f) 
        }
      end
  
    end
    
    def upload_to_matterhorn(host, username, password, file)
      puts "Sending zipped package..."
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

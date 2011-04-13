require 'fileutils'
require 'builder'
require 'streamio-ffmpeg'
require 'mime/types'
require 'digest/md5'

module BigBlueButton
  class MediaFormatException < StandardError
  end

  class MatterhornProcessor
    def self.process(archive_dir, meeting_id)
      process_audio(archive_dir)
      process_deskshare(archive_dir)
      process_video(archive_dir, meeting_dir)
      deskshare_dir = "#{archive_dir}/deskshare"
      video_dir = "#{archive_dir}/video/#{meeting_id}"      
    end
    
    def self.process_deskshare(archive_dir)
    
    end
    
    def self.process_video(archive_dir, meeting_id)
      begin
        executeCommand("ffmpeg -i #{a} -an -vcodec copy justvideopresenter.flv")
      rescue Exception=>e
      end    
    end
    
    def self.process_audio(archive_dir)
      audio_dir = "#{archive_dir}/audio"
      events_xml = "#{archive_dir}/events.xml"
      audio_events = Generator::AudioEvents.process_events(events_xml)
      if not audio_events == nil
        audio_files = []
        audio_events.each do |ae|
          if ae.padding 
            ae.file = "#{audio_dir}/#{ae.length_of_gap}.wav"
            Generator::AudioEvents.generate_silence(ae.length_of_gap, ae.file, 16000)
          else
            # Substitute the original file location with the archive location
            ae.file = ae.file.sub(/.+\//, "#{audio_dir}/")
          end
          audio_files << ae.file
        end
      
        wav_file = "#{audio_dir}/recording.wav"
        ogg_file = "#{audio_dir}/recording.ogg"
        Generator::AudioEvents.concatenate_audio_files(audio_files, wav_file)    
        Generator::AudioEvents.wav_to_ogg(wav_file, ogg_file)
        puts "resampling : #{a} and converting to ogg format ..."
        executeCommand("oggenc --resample 44100 -o audiopresenter.ogg #{a}")
      end    
    end
    
    def executeCommand(command)
      IO.popen(command) do |pipe|
        pipe.each("r") do |line|
          puts line
        end
      end
      raise MediaFormatException if $?.exitstatus != 0
    end

    def create_manifest_xml(audio, video, deskshare)
      vpresenter = FFMPEG::Movie.new(video)
      apresenter = FFMPEG::Movie.new(audio)
      vpresentation = FFMPEG::Movie.new(deskshare)

      puts "Creating manifest.xml ..."

      xml = Builder::XmlMarkup.new( :indent => 2 )
      result = xml.instruct! :xml, :version => "1.0"

      puts "Setting timestamp ..."
      timestamp = ( Time::now ).utc.strftime("%Y-%m-%dT%H:%M:%S")
      xml.tag!("ns2:mediapackage", "duration" => vpresenter.duration.round.to_s.split(".")[0] + "000", 
              "start" => timestamp, "xmlns:ns2" => "http://mediapackage.opencastproject.org") {

        xml.media{
          xml.track("id" => "track-1", "type" => "presenter/source") {
            xml.mimetype(MIME::Types.type_for(vpresenter.path).first.content_type)
            xml.tags
            xml.url(vpresenter.path)
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
            xml.url(vpresentation.path)
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
            xml.url(apresenter.path)
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

      aFile = File.new("manifest.xml","w+")
        aFile.write(result)
        aFile.close

    end

    def executeScript(args)
      args.each do|a|
        if (a.include? ".wav")
          puts "resampling : #{a} and converting to ogg format ..."
          executeCommand("oggenc --resample 44100 -o audiopresenter.ogg #{a}")
        elsif (a.include? "presenter.flv")
          puts "extracting just presenter video: #{a} ..."
          begin
            executeCommand("ffmpeg -i #{a} -an -vcodec copy justvideopresenter.flv")
          rescue Exception=>e
          end
        elsif(a.include? "presentation.flv")
          puts "extracting just presentation video: #{a} ..."
          executeCommand("ffmpeg -i #{a} -an -vcodec copy justvideopresentation.flv")
        end
      end
    end

    # Creates dublincore.xml
    #  Example:
    #    create_dublin_core_xml( "/path/to/save/dublincore.xml",
    #                             {:title => metadata[:title]
    #                             :subject => metadata[:subject]
    #                             :description => metadata[:description]
    #                             :creator => metadata[:creator]
    #                             :contributor => metadata[:contributor]
    #                             :language => metadata[:language]
    #                             :identifier => metadata[:identifier]}
    #
    def create_dublincore_xml(dublin_core_xml, metadata)
      
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

    def zip_artifacts(audio, video, presentation, dublincore, manifest, zipped_file)
      puts "Zipping package..."
      executeCommand("zip #{zipped_file} #{audio} #{video} #{deskshare} #{dublincore} #{manifest}");
    end
    
    def upload_to_matterhorn
      puts "Compiling java ..."
      executeCommand("javac SendToMatterhorn.java")

      puts "Executing java class"
      executeCommand("java SendToMatterhorn")
    end        
  end
end

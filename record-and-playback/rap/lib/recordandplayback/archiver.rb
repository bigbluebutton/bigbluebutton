module BigBlueButton  
  class AudioArchiver  
    def self.archive(meeting_id, from, archive_dir)
      to_dir = "#{archive_dir}/#{meeting_id}/audio"
      if not FileTest.directory?(to_dir)
        FileUtils.mkdir_p to_dir
      end
      
      Collector::Audio.collect_audio(meeting_id, from, to_dir)
    end
  end
  
  class EventsArchiver
    def self.archive(archive_dir, meeting_id, redis_host, redis_port)
      redis = BigBlueButton::RedisWrapper.new(redis_host, redis_port)
      events_archiver = BigBlueButton::RedisEventsArchiver.new redis
      
      events_archiver.save_events_to_file("#{archive_dir}/#{meeting_id}", events_archiver.store_events(meeting_id))
    end
  end
  
  class PresentationArchiver
    def self.archive(meeting_id, from, archive_dir)
      to_dir = "#{archive_dir}/#{meeting_id}/presentations"
      if not FileTest.directory?(to_dir)
        FileUtils.mkdir_p to_dir
      end
      
      Collector::Presentation.collect_presentation(meeting_id, from, to_dir)
    end
  end
  
  class VideoArchiver
    def self.archive(meeting_id, from, archive_dir)
      to_dir = "#{archive_dir}/#{meeting_id}/video"
      if not FileTest.directory?(to_dir)
        FileUtils.mkdir_p to_dir
      end
      
      Collector::Video.collect_video(meeting_id, from, to_dir)    
    end
  end

  class DeskshareArchiver
    def self.archive(meeting_id, from, archive_dir)
      to_dir = "#{archive_dir}/#{meeting_id}/deskshare"
      if not FileTest.directory?(to_dir)
        FileUtils.mkdir_p to_dir
      end
      
      Collector::Deskshare.collect_deskshare(meeting_id, from, to_dir)    
    end
  end
  
end

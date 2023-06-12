#!/usr/bin/env ruby
require 'optparse'
require 'rexml/document'
require 'logger'
require 'ffi-icu'
require 'cgi/escape'
require 'json'

$logger = Logger.new(STDOUT)
$logger.level = Logger::DEBUG
$logger.formatter = proc do |severity, datetime, progname, msg|
  "#{severity}: #{msg}\n"
end

def webvtt_timestamp(ms)
  frac_s = ms % 1000
  s = ms / 1000 % 60
  m = ms / 1000 / 60 % 60
  h = ms / 1000 / 60 / 60
  return "%02d:%02d:%02d.%03d" % [h, m, s, frac_s]
end

class CaptionLine
  attr_accessor :text, :start_time, :end_time
  def initialize()
    @text = ""
    @start_time = 0
    @end_time = 0
  end
end

class Caption
  attr_accessor :locale, :text, :timestamps, :_del_timestamps
  def initialize(locale)
    @locale = locale
    @text = ""
    @timestamps = []
    @_del_timestamps = []
    @group = [] #new variable to normalise timestamps
  end

  def apply_edit(i, j, timestamp, text)
    #compatible code to the original script
    del_timestamp = nil
    if j > i and i < @timestamps.size
      if @_del_timestamps[i]
        del_timestamp = @_del_timestamps[i]
      else
        del_timestamp = @timestamps[i]
      end
      @_del_timestamps[i] = del_timestamp
      $logger.debug("Removing text #{@text[i...j]} at #{i}:#{j}, del_ts: #{del_timestamp}")
    end

    if text.size > 0
      $logger.debug("Inserting text #{text} at #{i}:#{j}, ts: #{timestamp}")

      if i < @timestamps.size and timestamp > @timestamps[i]
        timestamp = @_del_timestamps[i]
        unless timestamp
          if i > 0
            timestamp = @timestamps[i - 1]
          else
            timestamp = @timestamps[i]
          end
        end
        $logger.debug("Out of order timestamps, using ts: #{timestamp}")
      end
    end

    @_del_timestamps[i...j] = [del_timestamp] * text.size
    if i < @_del_timestamps.size
      @_del_timestamps[i] = del_timestamp
    end
    @text[i...j] = text
    @timestamps[i...j] = [timestamp] * text.size
=begin
    #Alternative code; simply adding new elements without deleting overlapped letters
    @text[i...j] = text
    @timestamps += [timestamp] * (text.size + i - j) if text.size + i - j > 0
=end
  end

  def apply_record_events(events)
    record = false
    ts_offset = 0
    stop_ts = 0
    start_ts = nil
    stop_pos = 0
    start_pos = nil
    events.each do |event|
      if event["name"] == "record_status"
        status = event["status"]
        timestamp = event["timestamp"]

        if status and !record
          record = true
          start_ts = timestamp
          $logger.debug("Recording started at ts: #{start_ts}")

          # Find the position of the first character after recording
          # started
          start_pos = stop_pos
          while start_pos < @timestamps.size and @timestamps[start_pos] < start_ts do
            start_pos += 1
          end

          $logger.debug("Replacing characters #{stop_pos}:#{start_pos}")
          @text[stop_pos...start_pos] = "\n"
          @timestamps[stop_pos...start_pos] = [stop_ts - ts_offset]

          start_pos = stop_pos + 1
          ts_offset += start_ts - stop_ts
          $logger.debug("Timestamp offset now #{ts_offset}")

          stop_ts = nil
          stop_pos = nil
        end

        if !status and record
          record = false
          stop_ts = timestamp
          $logger.debug("Recording stopped at ts: #{stop_ts}")

          # Find the position of the first character after recording
          # stopped, and apply ts offsets
          stop_pos = start_pos
          while stop_pos < @timestamps.size and @timestamps[stop_pos] < stop_ts do
            @timestamps[stop_pos] -= ts_offset
            stop_pos += 1
          end
        end
      end
    end

    if record
      $logger.debug("No recording stop, applying final ts offsets")

      while start_pos < @timestamps.size do
        @timestamps[start_pos] -= ts_offset
        start_pos += 1
      end
    end
  end

  def self.from_events(events, apply_record_events=true)
    captions = {}
    events.each do |event|
      if event["name"] == "edit_caption_history"
        locale = event["locale"]
        i = event["start_index"]
        j = event["end_index"]
        timestamp = event["timestamp"]
        text = event["text"]

        caption = captions[locale]
        unless caption
          $logger.info("Started caption stream for locale '#{locale}'")
          captions[locale] = caption = Caption.new(locale)
        end

        caption.apply_edit(i, j, timestamp, text)
      end
    end

    if apply_record_events
      captions.each do |locale, caption|
        $logger.info("Applying recording events to locale '#{locale}'")
        caption.apply_record_events(events)
      end
    end

    $logger.info("Generated #{captions.size} caption stream(s)")

    captions
  end

  def split_lines(max_length=32)
    lines = []
    locale = ICU::Locale.new(@locale)
    $logger.debug("Using locale #{locale.display_name(locale)} for word-wrapping")

    breaker = /^ja|^zh/ =~ @locale ? :word : :line
    break_iter = ICU::BreakIterator.new(breaker, @locale)
    break_iter.text = @text

    line = CaptionLine.new
    line_start = 0
    prev_break = 0
    next_break = break_iter.following(prev_break)

    # Super simple "greedy" line break algorithm.
    while prev_break < @text.size do
      line_end = next_break
      $logger.debug("text len: #{@text.size}, line end: #{line_end}")
      while line_end > line_start and (@text[line_end - 1].strip.empty? or /\p{Cc}/ =~ @text[line_end - 1] or /\p{Mn}/ =~ @text[line_end - 1])
        line_end -= 1
      end

      do_break = false
      text_section = @text[line_start...line_end].unicode_normalize(:nfc) #Unicode normalization necessary?
      timestamps_section = @timestamps[line_start...next_break]
      start_time = timestamps_section.min
      end_time = timestamps_section.max

      if text_section.size > max_length
        if prev_break == line_start
          # Over-long string. Just chop it into bits
          next_break = prev_break + max_length
          next
        else
          next_break = prev_break
          do_break = true
        end
      else
        if next_break >= @text.size or /\n/=~@text[prev_break]
          line.text = text_section
          line.start_time = start_time
          line.end_time = end_time
          do_break = true
        end
      end

      if do_break
          $logger.debug("text section #{line.start_time} -> #{line.end_time} (#{line.text.size}): '#{line.text}'")
          lines.push(line)
          line = CaptionLine.new
          line_start = next_break
      else
          line.text = text_section
          line.start_time = start_time
          line.end_time = end_time
      end

      prev_break = next_break
      next_break = break_iter.following(prev_break)
    end

    lines
  end

=begin
  def group_lines(lines)
    @group.push([lines[0]])
    lines[1..-1].each do |l|
      if @group[-1][-1].end_time >= l.start_time
        @group[-1].push(l)
      else
        @group.push([l])
      end
    end
  end

  def smoothen_timestamps(sm)
    @group.each do |g|
      next if g.size < sm
      g[0..-sm].each_with_index do |l, i|
        inverval = (g[i+sm-1].end_time - l.start_time) / sm
        (i..(i+sm-2)).each do |k|
          g[k].end_time = g[k+1].start_time = g[k].start_time + inverval - 1
        end
      end
    end
  end
=end

  def norm_lines(lines, st, en)
    interval = (lines[en].end_time - lines[st].start_time) / (en - st + 1)
    (st...en).each do |k|
      lines[k].end_time = lines[k+1].start_time = lines[k].start_time + interval
    end
  end

  def write_webvtt(f, sm)
    # Write magic
    f.write("WEBVTT\n\n".encode(Encoding::UTF_8))

    #This code is to reduce the max caption length 
    # for locales using bulky multi-byte characters such as Japanese
    maxlength = 32
    minduration = 100
    if @text.size * 2 < @text.bytesize
      maxlength /= 2 
      minduration *= 2
      $logger.debug("Max lentgh reduced for the locale #{@locale} due to the bulky characters.")
    end
    
    lines = self.split_lines(maxlength)

    i = 0
    # Don't generate cues for empty lines
    lines.delete_if{|l| l.text.size == 0}

    #Grouping consecutive lines
    #group_lines(lines)

    #Smoothen timestamps within sliding frames
    #smoothen_timestamps(sm)

    # Normalise the jammed captions;
    #  leaving the code redundant to better understand the logic
    jammedline_start = nil
    lines.each_with_index do |l, i|
      if l.start_time == l.end_time
        if jammedline_start
          if lines.size == i+1
            # normalise jammed line [jammedline_start..i]
            norm_lines(lines, jammedline_start, i)
          else
            # jammed line continues
          end
        else
          # jammed line starts
          jammedline_start = i>0 ? i-1 : 0
        end
      else
        if jammedline_start
          # jammed line ends, start normalisation [jammedline_start..i]
          norm_lines(lines, jammedline_start, i)
          jammedline_start = nil
        else
          # healthy line
        end
      end
    end

    i = 0
    while i < lines.size
      line = lines[i]
      i += 1

      text = line.text
      start_time = line.start_time
      end_time = line.end_time
      # Apply some duration cleanup heuristics to give some reasonable
      # line durations
      duration = end_time - start_time
      # A minimum per-character time for display (up to 3.2s for 32char)
      if duration < minduration * text.size
        duration = minduration * text.size
      end
      # Don't show a caption (even a short one) for less than 1s
      if duration < 1000
        duration = 1000
      end
      # Make lines go away if they've been showing for >16 seconds
      if duration > 16000
        duration = 16000
      end
      end_time = start_time + duration
      if i < lines.size
        next_line = lines[i]
        next_start_time = next_line.start_time

        # If this end time would overlap with the next line, ether
        # merge them into a single cue or un-overlap them if there's
        # already multiple lines.
        if end_time > next_start_time
          if text.split(/\R/).size < 2
            next_line.text = text + "\n" + next_line.text
            next_line.start_time = start_time
            next
          else
            end_time = next_start_time
          end
        end

        # If the next line is close after the current line, make the
        # timestamps continuous so the subtitle doesn't "flicker"
        if next_start_time - end_time < 500
          end_time = next_start_time
        end
      end

      f.write("#{webvtt_timestamp(start_time)} --> #{webvtt_timestamp(end_time)}\n".encode(Encoding::UTF_8))
      f.write(CGI.escapeHTML(text).encode(Encoding::UTF_8))
      f.write("\n\n".encode(Encoding::UTF_8))
    end
  end

=begin
  def utf8escape(s)
    #str = ""
    #s.each_codepoint{|cp| if cp > 127 ; str << "\\u" << cp.to_s(16) else str << cp.chr end}
    #s.each_codepoint{|cp| if cp > 127 ; str << "\\u%04x"%cp else str << cp.chr end}
    #str
    s.dump[1...-1]
  end
=end

  def caption_desc()
    locale = ICU::Locale.new(@locale)
    #esclocname = utf8escape(locale.display_name(locale))
    #return {"locale": @locale, "localeName": esclocname}
    return {"locale": @locale, "localeName": locale.display_name(locale)}
  end

end

def parse_record_status(event, element)
  userId = element.elements["userId"]
  status = element.elements["status"]

  event["name"] = "record_status"
  event["user_id"] = userId.text
  event["status"] = status.text == "true"
end

def parse_caption_edit(event, element)
  locale = element.elements["locale"]
  text = element.elements["text"]
  startIndex = element.elements["startIndex"]
  endIndex = element.elements["endIndex"]
  localeCode = element.elements["localeCode"]

  event["name"] = "edit_caption_history"
  event["locale_name"] = locale.text
  if localeCode
    event["locale"] = localeCode.text
  else
    # Fallback for missing 'localeCode'
    event["locale"] = "en"
  end
  if text.text
    event["text"] = text.text
  else
    event["text"] = ""
  end
  event["start_index"] = startIndex.text.to_i
  event["end_index"] = endIndex.text.to_i
end

def parse_events(directory)
  start_time = nil
  have_record_events = false
  events = []
  doc = REXML::Document.new(File.open(directory+"/events.xml"))
  doc.elements.each('recording/event') do |element|
    begin
      event = {}
      timestamp = element.attribute('timestamp').value.to_i
      start_time = timestamp if !start_time
      timestamp = timestamp - start_time

      next unless ["CAPTION", "PARTICIPANT"].include?(element.attribute('module').value)

      event["name"] = name = element.attribute('eventname').value
      event["timestamp"] = timestamp

      if name == "RecordStatusEvent"
        parse_record_status(event, element)
        have_record_events = true
      elsif name == "EditCaptionHistoryEvent"
        parse_caption_edit(event, element)
      else
        $logger.debug("Unhandled event: #{name}")
        next
      end

      events.push(event)
    rescue
      event.clear
    end
  end

  unless have_record_events
    # Add a fake record start event to the events list
    event = {
      "name" => "record_status",
      "user_id" => nil,
      "timestamp" => 0,
      "status" => true,
    }
    events.unshift(event)
  end

  events

end

def json_dump(desc, f)
  f.write(JSON.pretty_generate(desc).gsub(/"([^"]+)"/) {'"' + $1.dump[1...-1] + '"'})
end

if __FILE__ == $0 then
  rawdir = "."
  outputdir = "."
  smoothfactor = 3
  opt = OptionParser.new
  opt.on('-i', '--input DIR', 'input directory with events.xml file') { |v| rawdir = v }
  opt.on('-d', '--output DIR', 'output directory') { |v| outputdir = v }
  opt.on('-s', '--smooth INT', 'timestamp smooth factor') { |v| smoothfactor = v.to_i }
  opt.parse(ARGV)

  smoothfactor = 3 if smoothfactor < 3

  $logger.info("Reading recording events file")
  events = parse_events(rawdir)

  $logger.info("Generating caption data from recording events")
  captions = Caption.from_events(events)

  captions.each do |locale, caption|
    filename = File.join(outputdir, "caption_#{locale}.vtt")
    $logger.info("Writing captions for locale #{locale} to #{filename}")
    File.open(filename, "wb") do |f|
      caption.write_webvtt(f, smoothfactor)
    end
  end

  filename = File.join(outputdir, "captions.json")
  $logger.info("Writing captions index file to #{filename}")

  caption_descs = captions.values.map{|c| c.caption_desc()}
  File.open(filename, "w") do |f|
    json_dump(caption_descs, f)
  end
end

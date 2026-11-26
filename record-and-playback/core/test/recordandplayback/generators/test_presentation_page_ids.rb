# frozen_string_literal: true

require 'minitest/autorun'
require 'nokogiri'
require 'tmpdir'
require 'fileutils'

require 'recordandplayback'

class TestPresentationPageIds < Minitest::Test
  def conversion(presentation, page_ids = nil)
    ids = page_ids ? "<pageIds>#{page_ids.join(',')}</pageIds>" : ''
    <<~XML
      <event module="PRESENTATION" eventname="ConversionCompletedEvent">
        <presentationName>#{presentation}</presentationName>#{ids}
      </event>
    XML
  end

  def insert(presentation, page_ids)
    <<~XML
      <event module="PRESENTATION" eventname="PresentationPagesInsertedEvent">
        <presentationName>#{presentation}</presentationName><pageIds>#{page_ids.join(',')}</pageIds>
      </event>
    XML
  end

  def share(presentation)
    <<~XML
      <event module="PRESENTATION" eventname="SharePresentationEvent">
        <presentationName>#{presentation}</presentationName><share>true</share>
      </event>
    XML
  end

  def events(*xml)
    Nokogiri::XML("<recording>#{xml.join}</recording>")
  end

  def thumbnails(dir, presentation, count)
    FileUtils.mkdir_p("#{dir}/#{presentation}/thumbnails")
    count.times { |i| FileUtils.touch("#{dir}/#{presentation}/thumbnails/thumb-#{i + 1}.png") }
  end

  def test_page_ids_of_the_conversion
    doc = events(conversion('p1', %w[c3 a1 b2]), share('p1'))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => %w[c3 a1 b2] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_last_conversion_wins
    doc = events(conversion('p1', %w[a1]), conversion('p1', %w[a1 b2]), share('p1'))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => %w[a1 b2] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_numbers_for_a_recording_without_page_ids
    doc = events(conversion('p1'), share('p1'))
    Dir.mktmpdir do |dir|
      thumbnails(dir, 'p1', 11)
      assert_equal({ 'p1' => (1..11).map(&:to_s) }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_image_without_thumbnails_has_one_page
    doc = events(conversion('p1'), share('p1'))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => ['1'] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_only_shown_presentations_once_in_order_of_first_share
    doc = events(conversion('p1', %w[a1]), conversion('p2', %w[b1]), conversion('p3', %w[c1]),
                 share('p2'), share('p1'), share('p2'))
    Dir.mktmpdir do |dir|
      page_ids = BigBlueButton::Events.presentation_page_ids(doc, dir)
      assert_equal(%w[p2 p1], page_ids.keys)
      assert_equal({ 'p2' => %w[b1], 'p1' => %w[a1] }, page_ids)
    end
  end

  def test_an_insert_lists_every_page
    doc = events(conversion('p1', %w[a1 b2]), share('p1'), insert('p1', %w[a1 x9 b2]))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => %w[a1 x9 b2] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_the_last_insert_wins
    doc = events(conversion('p1', %w[a1 b2]), share('p1'), insert('p1', %w[x9 a1 b2]), insert('p1', %w[x9 a1 y8 b2]))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => %w[x9 a1 y8 b2] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_an_insert_into_a_presentation_shown_later
    doc = events(conversion('p1', %w[a1]), conversion('p2', %w[b1]), share('p1'), insert('p2', %w[b1 x9]), share('p2'))
    Dir.mktmpdir do |dir|
      assert_equal({ 'p1' => %w[a1], 'p2' => %w[b1 x9] }, BigBlueButton::Events.presentation_page_ids(doc, dir))
    end
  end

  def test_first_page_is_the_first_page_when_first_shown
    # An insert at position 1 after the share does not change the page the presentation was shown on.
    doc = events(conversion('p1', %w[a1 b2]), share('p1'), insert('p1', %w[x9 a1 b2]))
    Dir.mktmpdir do |dir|
      page_ids = BigBlueButton::Events.presentation_page_ids(doc, dir)
      assert_equal({ 'p1' => 'a1' }, BigBlueButton::Events.presentation_first_pages(doc, page_ids))
    end
  end

  def test_first_page_after_an_insert_before_the_share
    doc = events(conversion('p1', %w[a1]), conversion('p2', %w[b1]), share('p1'), insert('p2', %w[x9 b1]), share('p2'))
    Dir.mktmpdir do |dir|
      page_ids = BigBlueButton::Events.presentation_page_ids(doc, dir)
      assert_equal({ 'p1' => 'a1', 'p2' => 'x9' }, BigBlueButton::Events.presentation_first_pages(doc, page_ids))
    end
  end

  def test_first_page_of_a_recording_without_page_ids
    doc = events(conversion('p1'), share('p1'))
    Dir.mktmpdir do |dir|
      thumbnails(dir, 'p1', 3)
      page_ids = BigBlueButton::Events.presentation_page_ids(doc, dir)
      assert_equal({ 'p1' => '1' }, BigBlueButton::Events.presentation_first_pages(doc, page_ids))
    end
  end
end

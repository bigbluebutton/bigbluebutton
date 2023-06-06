# frozen_string_literal: true

require 'minitest/autorun'
require 'nokogiri'

require 'recordandplayback'

class TestEvents < Minitest::Test
  def test_enforce_cut_lengths_short_cut_start
    edl = [
      {
        timestamp: 0,
        areas: { webcam: [{ timestamp: 0, filename: 'a' }] },
      },
      {
        timestamp: 10,
        areas: { webcam: [{ timestamp: 10, filename: 'a' }, { timestamp: 0, filename: 'b' }] },
      },
      {
        timestamp: 10_000, areas: { webcam: [] },
      },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(2, edl.length)
    assert_equal(0, edl[0][:timestamp])
    # In this special case, it deletes the original first entry, but then offsets start timestamps
    # back to 0, which can result in negative video timestamps
    assert_equal(2, edl[0][:areas][:webcam].length)
    assert_equal({ timestamp: 0, filename: 'a' }, edl[0][:areas][:webcam][0])
    assert_equal({ timestamp: -10, filename: 'b' }, edl[0][:areas][:webcam][1])
    assert_equal(10_000, edl[1][:timestamp])
  end

  def test_enforce_cut_lengths_short_cut_middle
    edl = [
      {
        timestamp: 0,
        areas: { webcam: [{ timestamp: 0, filename: 'a' }, { timestamp: 0, filename: 'b' }, { timestamp: 0, filename: 'c' }] },
      },
      {
        timestamp: 1000,
        areas: { webcam: [{ timestamp: 1000, filename: 'a' }, { timestamp: 1000, filename: 'b' }] },
      },
      {
        timestamp: 1010,
        areas: { webcam: [{ timestamp: 1010, filename: 'a' }] },
      },
      {
        timestamp: 10_000, areas: { webcam: [] },
      },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(3, edl.length)
    assert_equal(0, edl[0][:timestamp])
    assert_equal(1010, edl[1][:timestamp])
    assert_equal(1, edl[1][:areas][:webcam].length)
    assert_equal({ timestamp: 1010, filename: 'a' }, edl[1][:areas][:webcam][0])
    assert_equal(10_000, edl[2][:timestamp])
  end

  def test_enforce_cut_lengths_short_cut_end
    edl = [
      {
        timestamp: 0,
        areas: { webcam: [{ timestamp: 0, filename: 'a' }, { timestamp: 0, filename: 'b' }] },
      },
      {
        timestamp: 9990,
        areas: { webcam: [{ timestamp: 9990, filename: 'a' }] },
      },
      {
        timestamp: 10_000, areas: { webcam: [] },
      },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(2, edl.length)
    assert_equal(0, edl[0][:timestamp])
    assert_equal(2, edl[0][:areas][:webcam].length)
    assert_equal({ timestamp: 0, filename: 'a' }, edl[0][:areas][:webcam][0])
    assert_equal({ timestamp: 0, filename: 'b' }, edl[0][:areas][:webcam][1])
    assert_equal(10_000, edl[1][:timestamp])
    assert_equal(0, edl[1][:areas][:webcam].length)
  end

  def test_enforce_cut_lengths_combines_multiple
    edl = [
      {
        timestamp: 0,
        areas: { webcam: [{ timestamp: 0, filename: 'a' }] },
      },
      {
        timestamp: 1000,
        areas: { webcam: [{ timestamp: 1000, filename: 'a' }, { timestamp: 0, filename: 'b' }] },
      },
      {
        timestamp: 1005,
        areas: { webcam: [{ timestamp: 5, filename: 'b' }] },
      },
      {
        timestamp: 1010,
        areas: { webcam: [{ timestamp: 10, filename: 'b' }, { timestamp: 0, filename: 'c' }] },
      },
      {
        timestamp: 10_000, areas: { webcam: [] },
      },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(3, edl.length)
    assert_equal(0, edl[0][:timestamp])
    assert_equal(1, edl[0][:areas][:webcam].length)
    assert_equal({ timestamp: 0, filename: 'a' }, edl[0][:areas][:webcam][0])
    assert_equal(1010, edl[1][:timestamp])
    assert_equal(2, edl[1][:areas][:webcam].length)
    assert_equal({ timestamp: 10, filename: 'b' }, edl[1][:areas][:webcam][0])
    assert_equal({ timestamp: 0, filename: 'c' }, edl[1][:areas][:webcam][1])
    assert_equal(10_000, edl[2][:timestamp])
  end

  def test_enforce_cut_lengths_extend_full_recording
    edl = [
      { timestamp: 0, areas: {} },
      { timestamp: 10, areas: {} },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(2, edl.length)
    assert_equal(0, edl[0][:timestamp])
    assert_equal(1000 / 25 * 2, edl[1][:timestamp])
  end

  def test_enforce_cut_lengths_no_change_above_min
    edl = [
      {
        timestamp: 0,
        areas: { webcam: [{ timestamp: 0, filename: 'a' }, { timestamp: 0, filename: 'b' }, { timestamp: 0, filename: 'c' }] },
      },
      {
        timestamp: 1000,
        areas: { webcam: [{ timestamp: 1000, filename: 'a' }, { timestamp: 1000, filename: 'b' }] },
      },
      {
        timestamp: 1080,
        areas: { webcam: [{ timestamp: 1080, filename: 'a' }] },
      },
      {
        timestamp: 10_000, areas: { webcam: [] },
      },
    ]

    BigBlueButton::EDL::Video.enforce_cut_lengths(edl, 25)

    assert_equal(4, edl.length)
    assert_equal(0, edl[0][:timestamp])
    assert_equal(1000, edl[1][:timestamp])
    assert_equal(2, edl[1][:areas][:webcam].length)
    assert_equal({ timestamp: 1000, filename: 'a' }, edl[1][:areas][:webcam][0])
    assert_equal({ timestamp: 1000, filename: 'b' }, edl[1][:areas][:webcam][1])
    assert_equal(1080, edl[2][:timestamp])
    assert_equal(1, edl[2][:areas][:webcam].length)
    assert_equal({ timestamp: 1080, filename: 'a' }, edl[2][:areas][:webcam][0])
    assert_equal(10_000, edl[3][:timestamp])
  end
end

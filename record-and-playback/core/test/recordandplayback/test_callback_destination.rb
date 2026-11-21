# frozen_string_literal: true

require 'minitest/autorun'
require 'socket'

require 'recordandplayback/callback_destination'

# CallbackDestination.post has to open its connection to the address that was
# checked, whether or not the environment names a proxy.
class TestCallbackDestination < Minitest::Test
  PROXY_VARIABLES = %w[http_proxy HTTP_PROXY no_proxy NO_PROXY].freeze

  # Accepts connections on a loopback port, answers each with +reply+ and
  # keeps the first line and the Host header of what it received.
  class Listener
    attr_reader :port, :received

    def initialize(reply)
      @server = TCPServer.new('127.0.0.1', 0)
      @port = @server.addr[1]
      @received = []
      @thread = Thread.new do
        loop { answer(@server.accept, reply) }
      rescue IOError
        nil
      end
    end

    def answer(client, reply)
      head = +''
      while (line = client.gets) && line != "\r\n"
        head << line
      end
      client.read(head[/^Content-Length: (\d+)/i, 1].to_i)
      @received << { first_line: head.lines.first.to_s.strip, host: head[/^Host: (.*)\r$/i, 1] }
      client.write(reply)
    ensure
      client.close
    end

    def close
      @server.close
      @thread.join(1)
    end
  end

  OK = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
  FORBIDDEN = "HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"

  def setup
    @saved_environment = PROXY_VARIABLES.to_h { |name| [name, ENV.fetch(name, nil)] }
    PROXY_VARIABLES.each { |name| ENV.delete(name) }
    @receiver = Listener.new(OK)
    @proxy = Listener.new(FORBIDDEN)
  end

  def teardown
    @saved_environment.each { |name, value| value.nil? ? ENV.delete(name) : ENV[name] = value }
    @receiver.close
    @proxy.close
  end

  # A host name that never resolves stands for the callback receiver, and the
  # checked address is the receiver's loopback listener.
  def decision(scheme)
    BigBlueButton::CallbackDestination::Decision.new(
      uri: URI.parse("#{scheme}://callback.invalid:#{@receiver.port}/ready"), addresses: ['127.0.0.1']
    )
  end

  def callback_request
    request = Net::HTTP::Post.new('/ready')
    request.set_form_data(signed_parameters: 'token')
    request
  end

  def test_plain_http_goes_to_the_checked_address
    response = BigBlueButton::CallbackDestination.post(decision('http'), callback_request)

    assert_equal('200', response.code)
    assert_equal([{ first_line: 'POST /ready HTTP/1.1', host: "callback.invalid:#{@receiver.port}" }], @receiver.received)
  end

  def test_plain_http_goes_to_the_checked_address_with_a_proxy_in_the_environment
    ENV['http_proxy'] = "http://127.0.0.1:#{@proxy.port}"

    response = BigBlueButton::CallbackDestination.post(decision('http'), callback_request)

    assert_equal('200', response.code)
    assert_equal([{ first_line: 'POST /ready HTTP/1.1', host: "callback.invalid:#{@receiver.port}" }], @receiver.received)
    assert_empty(@proxy.received)
  end

  def test_https_asks_the_proxy_for_the_checked_address
    ENV['http_proxy'] = "http://127.0.0.1:#{@proxy.port}"

    assert_raises(Net::HTTPClientException) do
      BigBlueButton::CallbackDestination.post(decision('https'), callback_request)
    end

    assert_equal(["CONNECT 127.0.0.1:#{@receiver.port} HTTP/1.1"], @proxy.received.map { |request| request[:first_line] })
    assert_empty(@receiver.received)
  end
end

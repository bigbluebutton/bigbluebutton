# frozen_string_literal: true

# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2026 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by the Free
# Software Foundation; either version 3.0 of the License, or (at your option)
# any later version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
# details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

require 'ipaddr'
require 'net/http'
require 'socket'
require 'uri'

module BigBlueButton
  # Decides whether a callback URL taken from meeting metadata may be called,
  # using the same settings and rules bbb-web applies to its own callback URLs
  # (fetchUrlSupportedProtocols, fetchUrlBlockedExternalHosts,
  # fetchUrlAllowedLocalHosts), and sends the request to the address that was
  # checked, so a second DNS answer cannot redirect it.
  module CallbackDestination
    BBB_WEB_PROPERTIES = [
      '/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties',
      '/etc/bigbluebutton/bbb-web.properties',
    ].freeze

    DEFAULT_PROTOCOLS = 'https'
    CALLBACK_SCHEMES = %w[http https].freeze

    # Addresses that are not publicly routable. bbb-web refuses loopback,
    # unspecified, private and link-local addresses; the other ranges here
    # (shared address space, benchmarking, multicast, reserved, broadcast,
    # documentation) are not valid callback receivers either.
    REFUSED_IPV4 = %w[
      0.0.0.0/8 10.0.0.0/8 100.64.0.0/10 127.0.0.0/8 169.254.0.0/16
      172.16.0.0/12 192.168.0.0/16 198.18.0.0/15 224.0.0.0/4 240.0.0.0/4
    ].map { |range| IPAddr.new(range) }.freeze
    GLOBAL_UNICAST_IPV6 = IPAddr.new('2000::/3')
    # 6to4 embeds an arbitrary IPv4 address; 2001:db8::/32 is documentation.
    REFUSED_IPV6 = %w[2002::/16 2001:db8::/32].map { |range| IPAddr.new(range) }.freeze

    DEFAULT_RESOLVER = lambda do |host|
      Addrinfo.getaddrinfo(host, nil, nil, :STREAM).map(&:ip_address).uniq
    end

    Policy = Struct.new(:protocols, :blocked_hosts, :allowed_local_hosts, keyword_init: true)

    Decision = Struct.new(:reason, :uri, :addresses, keyword_init: true) do
      def admitted?
        reason.nil?
      end

      # Safe to log: no path, query, credentials or token.
      def describe
        "reason=#{reason || 'admitted'} scheme=#{uri&.scheme || '-'} host=#{uri&.host.to_s.empty? ? '-' : uri.host}"
      end
    end

    def self.policy_from_bbb_web(paths = BBB_WEB_PROPERTIES)
      require 'java_properties'

      props = {}
      paths.each do |path|
        JavaProperties::Properties.new(path).each { |key, value| props[key] = value } if File.file?(path)
      end
      policy_from_properties(props)
    end

    def self.policy_from_properties(props)
      protocols = split_list(props.fetch(:fetchUrlSupportedProtocols, DEFAULT_PROTOCOLS))
      # bbb-web treats an empty list or "all" as "any protocol"; a callback is
      # an HTTP request, so that means http and https here.
      protocols = CALLBACK_SCHEMES.dup if protocols.empty? || protocols == ['all']
      Policy.new(
        protocols: protocols & CALLBACK_SCHEMES,
        blocked_hosts: split_list(props.fetch(:fetchUrlBlockedExternalHosts, '')),
        allowed_local_hosts: split_list(props.fetch(:fetchUrlAllowedLocalHosts, ''))
      )
    end

    def self.split_list(value)
      value.to_s.split(',').map { |item| item.strip.downcase }.reject(&:empty?)
    end

    def self.check(url, policy:, resolver: DEFAULT_RESOLVER)
      uri = parse(url)
      return Decision.new(reason: :malformed) if uri.nil?

      scheme = uri.scheme.to_s.downcase
      return Decision.new(reason: :scheme, uri: uri) unless policy.protocols.include?(scheme)

      host = uri.hostname.to_s
      return Decision.new(reason: :host, uri: uri) if host.empty?
      return Decision.new(reason: :blocked_host, uri: uri) if policy.blocked_hosts.include?(host.downcase)

      addresses = resolve(host, resolver)
      return Decision.new(reason: :unresolvable, uri: uri) if addresses.empty?

      if !policy.allowed_local_hosts.include?(host.downcase) && addresses.any? { |address| refused_address?(address) }
        return Decision.new(reason: :address, uri: uri)
      end

      Decision.new(uri: uri, addresses: addresses.map(&:to_s))
    end

    def self.parse(url)
      URI.parse(url.to_s.strip)
    rescue URI::InvalidURIError
      nil
    end

    def self.resolve(host, resolver)
      [IPAddr.new(host)]
    rescue IPAddr::InvalidAddressError
      begin
        Array(resolver.call(host)).map { |address| IPAddr.new(address) }
      rescue SocketError, SystemCallError, IPAddr::InvalidAddressError
        []
      end
    end

    def self.refused_address?(address)
      address = address.native if address.ipv6? && address.ipv4_mapped?
      return REFUSED_IPV4.any? { |range| range.include?(address) } if address.ipv4?

      !GLOBAL_UNICAST_IPV6.include?(address) || REFUSED_IPV6.any? { |range| range.include?(address) }
    end

    # Sends +request+ to an address from an admitted +decision+, trying them in
    # order like a plain connect would. The URL's host name stays in the Host
    # header and in TLS verification. Redirects are not followed.
    def self.post(decision, request, cert_store: nil)
      raise ArgumentError, "callback destination refused (#{decision.describe})" unless decision.admitted?

      # What Net::HTTP#request sets when it opens the connection itself.
      request['connection'] ||= 'close'
      last_error = nil
      decision.addresses.each do |address|
        http = Net::HTTP.new(decision.uri.host, decision.uri.port)
        http.use_ssl = (decision.uri.scheme == 'https')
        http.cert_store = cert_store if cert_store
        http.ipaddr = address
        begin
          http.start
        rescue SystemCallError, Net::OpenTimeout => e
          last_error = e
          next
        end
        begin
          return http.request(request)
        ensure
          http.finish if http.started?
        end
      end
      raise last_error
    end

    def self.log_refusal(decision, logger = BigBlueButton.logger)
      logger.info("Callback not sent, destination not allowed by the callback URL policy: #{decision.describe}")
    end
  end
end

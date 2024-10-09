import React from "react";

import { Row, Col, Card, Statistic } from "antd";

import { SystemType } from "../types/SystemType";
import { NetworkType } from "../types/NetworkType";
import { DevicesType } from "../types/DevicesType";

type Props = {
  systemInfos: SystemType | undefined;
  networkInfos: NetworkType | undefined;
  devicesInfos: DevicesType | undefined;
};

const SystemResults = ({ systemInfos }) => {
  return (
    <>
      {systemInfos.os.name !== "" && (
        <Col span={8}>
          <Statistic title="Operating System" value={systemInfos.os.name} />
        </Col>
      )}
      {systemInfos.browser.name !== "" && (
        <Col span={8}>
          <Statistic
            title="Browser"
            value={systemInfos.browser.name}
            suffix={
              <span className="stat-small">{systemInfos.browser.version}</span>
            }
          />
        </Col>
      )}
      {systemInfos.browser.isPrivate !== undefined && (
        <Col span={8}>
          <Statistic
            title="Private Browser"
            value={systemInfos.browser.isPrivate ? "Yes" : "No"}
            valueStyle={{
              color: systemInfos.browser.isPrivate ? "#3f8600" : "#cf1322",
            }}
          />
        </Col>
      )}

      {systemInfos.browser.capabilities?.WebRTC !== undefined && (
        <Col span={8}>
          <Statistic
            title="WebRTC"
            value={
              systemInfos.browser.capabilities.WebRTC
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.WebRTC
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.ORTC !== undefined && (
        <Col span={8}>
          <Statistic
            title="ORTC"
            value={
              systemInfos.browser.capabilities.ORTC
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.ORTC
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.WebSockets !== undefined && (
        <Col span={8}>
          <Statistic
            title="WebSockets"
            value={
              systemInfos.browser.capabilities.WebSockets
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.WebSockets
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.AudioContext !== undefined && (
        <Col span={8}>
          <Statistic
            title="WebAudio API"
            value={
              systemInfos.browser.capabilities.AudioContext
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.AudioContext
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.SCTPDataChannels !== undefined && (
        <Col span={8}>
          <Statistic
            title="SCTP Data Channels"
            value={
              systemInfos.browser.capabilities.SCTPDataChannels
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.SCTPDataChannels
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.RTPDataChannels !== undefined && (
        <Col span={8}>
          <Statistic
            title="RTP Data Channels"
            value={
              systemInfos.browser.capabilities.RTPDataChannels
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.RTPDataChannels
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.isMultiMonitorScreenCapturing !==
        undefined && (
        <Col span={8}>
          <Statistic
            title="MultiMonitor ScreenCapturing"
            value={
              systemInfos.browser.capabilities.isMultiMonitorScreenCapturing
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities
                .isMultiMonitorScreenCapturing
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.VideoStreamCapturing !== undefined && (
        <Col span={8}>
          <Statistic
            title="Video StreamCapturing"
            value={
              systemInfos.browser.capabilities.VideoStreamCapturing
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.VideoStreamCapturing
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.CanvasStreamCapturing !==
        undefined && (
        <Col span={8}>
          <Statistic
            title="Canvas StreamCapturing"
            value={
              systemInfos.browser.capabilities.CanvasStreamCapturing
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.CanvasStreamCapturing
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.browser.capabilities?.Promises !== undefined && (
        <Col span={12}>
          <Statistic
            title="Promises"
            value={
              systemInfos.browser.capabilities.Promises
                ? "Supported"
                : "Not Supported"
            }
            valueStyle={{
              color: systemInfos.browser.capabilities.Promises
                ? "#3f8600"
                : "#cf1322",
            }}
          />
        </Col>
      )}
      {systemInfos.isMobileDevice !== undefined && (
        <Col span={12}>
          <Statistic
            title="Mobile Device"
            value={systemInfos.isMobileDevice ? "Yes" : "No"}
            valueStyle={{
              color: systemInfos.isMobileDevice ? "#3f8600" : "#cf1322",
            }}
          />
        </Col>
      )}
    </>
  );
};
const NetworkResults = ({ networkInfos }) => {
  return (
    <>
      {networkInfos.ipAddressType !== undefined && (
        <Col span={8}>
          <Statistic
            title="IpAddress Type"
            value={networkInfos.ipAddressType}
            valueStyle={{ textTransform: "capitalize" }}
          />
        </Col>
      )}
      {networkInfos.IPv4 !== undefined && (
        <Col span={8}>
          <Statistic title="IPv4" value={networkInfos.IPv4} />
        </Col>
      )}
      {networkInfos.IPv6 !== undefined && (
        <Col span={8}>
          <Statistic title="IPv6" value={networkInfos.IPv6} />
        </Col>
      )}
      {networkInfos.vpn !== undefined && (
        <Col span={8}>
          <Statistic
            title="VPN Detection"
            value={networkInfos.vpn ? "VPN detected" : "Any VPN detected"}
          />
        </Col>
      )}
    </>
  );
};
const DevicesResults = ({ devicesInfos }) => {
  console.log(devicesInfos.speakers);
  return (
    <>
      {devicesInfos.microphone !== undefined && (
        <Col span={8}>
          <Statistic
            title="Microphone"
            value={
              devicesInfos.microphone.allowed
                ? devicesInfos.microphone.devices!.length > 0
                  ? devicesInfos.microphone.devices?.length + " microphone(s)"
                  : "No"
                : "Not Allowed"
            }
            valueStyle={{
              color:
                devicesInfos.microphone.allowed &&
                devicesInfos.microphone.devices!.length > 0
                  ? "#3f8600"
                  : "#cf1322",
            }}
            suffix={
              <div className="stat-small">
                {devicesInfos.microphone.allowed &&
                  devicesInfos.microphone.devices!.length > 0 &&
                  devicesInfos.microphone.devices?.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
              </div>
            }
          />
        </Col>
      )}
      {devicesInfos.speakers !== undefined && (
        <Col span={8}>
          <Statistic
            title="Speakers"
            value={
              devicesInfos.speakers?.devices?.length > 0
                ? devicesInfos.speakers?.devices?.length + "speakers"
                : "No"
            }
            valueStyle={{
              color:
                devicesInfos.speakers?.devices?.length > 0
                  ? "#3f8600"
                  : "#cf1322",
            }}
            suffix={
              <div className="stat-small">
                {devicesInfos.speakers?.devices?.length > 0 &&
                  devicesInfos.speakers?.devices?.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
              </div>
            }
          />
        </Col>
      )}
      {devicesInfos.webcams !== undefined && (
        <Col span={8}>
          <Statistic
            title="Webcams"
            value={
              devicesInfos.webcams.allowed
                ? devicesInfos.webcams.devices!.length > 0
                  ? devicesInfos.webcams.devices?.length + " webcams"
                  : "No"
                : "Not Allowed"
            }
            valueStyle={{
              color:
                devicesInfos.webcams.allowed &&
                devicesInfos.webcams.devices!.length > 0
                  ? "#3f8600"
                  : "#cf1322",
            }}
            suffix={
              <div className="stat-small">
                {devicesInfos.webcams.allowed &&
                  devicesInfos.webcams.devices!.length > 0 &&
                  devicesInfos.webcams.devices?.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
              </div>
            }
          />
        </Col>
      )}
      {devicesInfos.screenshare !== undefined && (
        <Col span={8}>
          <Statistic
            title="ScreenSharing"
            value={devicesInfos.screenshare ? "Supported" : "Not Supported"}
            valueStyle={{
              color: devicesInfos.screenshare ? "#3f8600" : "#cf1322",
            }}
          />
        </Col>
      )}
    </>
  );
};

export const Step3 = (props: Props) => {
  const { systemInfos, networkInfos, devicesInfos } = props;

  return (
    <Row gutter={[16, 40]}>
      {systemInfos?.os !== undefined && systemInfos?.browser !== undefined && (
        <Col span={12}>
          <Card bordered={false} title={"System Tests"}>
            <Row gutter={[16, 40]}>
              <SystemResults systemInfos={systemInfos} />
            </Row>
          </Card>
        </Col>
      )}
      <Col span={12}>
        {(devicesInfos?.microphone !== undefined ||
          devicesInfos?.webcams !== undefined ||
          devicesInfos?.speakers !== undefined ||
          devicesInfos?.screenshare !== undefined) && (
          <>
            <Card bordered={false} title={"Devices Tests"}>
              <Row gutter={[16, 40]}>
                <DevicesResults devicesInfos={devicesInfos} />
              </Row>
            </Card>
            <br />
          </>
        )}
        {(networkInfos?.ipAddressType !== undefined ||
          networkInfos?.IPv4 !== undefined) && (
          <Card bordered={false} title={"Network Tests"}>
            <Row gutter={[16, 40]}>
              <NetworkResults networkInfos={networkInfos} />
            </Row>
          </Card>
        )}
      </Col>
    </Row>
  );
};

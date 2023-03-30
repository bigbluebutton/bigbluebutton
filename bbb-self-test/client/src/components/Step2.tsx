import React from "react";

import { List, Row, Col, Badge, Typography } from "antd";

import type { CheckboxValueType } from "antd/es/checkbox/Group";

import { SystemType } from "../types/SystemType";
import { NetworkType } from "../types/NetworkType";
import { DevicesType } from "../types/DevicesType";

const { Text } = Typography;

type Props = {
  checkedList: CheckboxValueType[];

  systemStatus: string;
  systemInfos: SystemType | undefined;

  networkStatus: string;
  networkInfos: NetworkType | undefined;

  devicesStatus: string;
  devicesInfos: DevicesType | undefined;
};

const SystemTesting = ({ systemInfos }) => {
  return (
    <ul>
      <li>
        <>
          Operating System
          {systemInfos?.os !== undefined && (
            <>
              : <Text strong>{systemInfos.os.name}</Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          Browser Name and Version
          {systemInfos?.browser !== undefined && (
            <>
              :{" "}
              <Text strong>
                {systemInfos.browser.name} {systemInfos.browser.version}
              </Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          Browser Capabilities
          {systemInfos?.browser?.capabilities !== undefined && (
            <>
              :
              <Text strong>
                <ol>
                  <Row>
                    <Col span={8}>
                      {systemInfos.browser.capabilities.WebRTC && (
                        <li>WebRTC</li>
                      )}
                      {systemInfos.browser.capabilities.ORTC && <li>ORTC</li>}
                      {systemInfos.browser.capabilities.WebSockets && (
                        <li>WebSockets</li>
                      )}
                      {systemInfos.browser.capabilities.AudioContext && (
                        <li>WebAudio API</li>
                      )}
                    </Col>
                    <Col span={8}>
                      {systemInfos.browser.capabilities.SCTPDataChannels && (
                        <li>SCTP DataChannels</li>
                      )}
                      {systemInfos.browser.capabilities.RTPDataChannels && (
                        <li>RTP DataChannels</li>
                      )}
                      {systemInfos.browser.capabilities.Promises && (
                        <li>Promises</li>
                      )}
                    </Col>
                    <Col span={8}>
                      {systemInfos.browser.capabilities
                        .isMultiMonitorScreenCapturing && (
                        <li>MultiMonitor ScreenCapturing</li>
                      )}
                      {systemInfos.browser.capabilities
                        .VideoStreamCapturing && <li>Video StreamCapturing</li>}
                      {systemInfos.browser.capabilities
                        .CanvasStreamCapturing && (
                        <li>Canvas StreamCapturing</li>
                      )}
                    </Col>
                  </Row>
                </ol>
              </Text>
            </>
          )}
        </>
      </li>
    </ul>
  );
};
const NetworkTesting = ({ networkInfos }) => {

  return (
    <ul>
      <li>
        <>
          IP Address Type
          {networkInfos?.ipAddressType !== undefined && (
            <>
              :{" "}
              <Text strong className={"text-capitalize"}>
                {networkInfos.ipAddressType}
              </Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          IP Address v4
          {networkInfos?.IPv4 !== undefined && (
            <>
              :{" "}
              <Text strong className={"text-capitalize"}>
                {networkInfos.IPv4}
              </Text>
            </>
          )}
        </>
      </li>
      <li>IP Address v6:</li>
        {networkInfos?.IPv6 !== undefined && (
            <>
                {" "}
                <Text strong className={"text-capitalize"}>
                    {networkInfos.IPv6}
                </Text>
            </>
        )}
      <li>
        Network Bandwidth:{" "}
        <>
          : <br />
          Upload :
          <Text strong className={"text-capitalize"}>
            {networkInfos?.bandwidth.uploadSpeed}
          </Text>
          <br />
          Download :
          <Text strong className={"text-capitalize"}>
            {networkInfos?.bandwidth.downloadSpeed}
          </Text>
          <br />
          Ping :
          <Text strong className={"text-capitalize"}>
            {networkInfos?.bandwidth.ping}
          </Text>
        </>
      </li>
      <li>
        <>
          VPN Detection
          {networkInfos?.vpn !== undefined && (
            <>
              :{" "}
              <Text strong className={"text-capitalize"}>
                {networkInfos.vpn ? "Yes" : "No"}
              </Text>
            </>
          )}
        </>
      </li>
    </ul>
  );
};
const DevicesTesting = ({ devicesInfos }) => {
  return (
    <ul>
      <li>
        <>
          Microphone
          {devicesInfos?.microphone?.allowed && (
            <>
              :{" "}
              <Text strong>
                {devicesInfos.microphone.devices?.length + " Device(s)"}
              </Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          Speakers
          {devicesInfos?.speakers !== undefined && (
            <>
              :{" "}
              <Text strong>
                {devicesInfos.speakers?.devices?.length + " Device(s)"}
              </Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          Webcams
          {devicesInfos?.webcams?.allowed && (
            <>
              :{" "}
              <Text strong>
                {devicesInfos.webcams.devices?.length + " Device(s)"}
              </Text>
            </>
          )}
        </>
      </li>
      <li>
        <>
          Screensharing
          {devicesInfos?.screenshare !== undefined && (
            <>
              :{" "}
              <Text strong>
                {devicesInfos.screenshare ? "Supported" : "Not Supported"}
              </Text>
            </>
          )}
        </>
      </li>
    </ul>
  );
};

export const Step2 = (props: Props) => {
  const {
    checkedList,
    systemStatus,
    systemInfos,
    networkStatus,
    networkInfos,
    devicesStatus,
    devicesInfos,
  } = props;
  const getItemStatus = (
    status: string
  ): "error" | "processing" | "default" | "success" | "warning" | undefined => {
    switch (status) {
      case "Processing":
        return "processing";
      case "Wait":
        return "default";
      case "Passed":
        return "success";
      case "Blocked":
        return "error";
    }
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={[
        {
          title: "System Tests",
          statusText: systemStatus,
          description: <SystemTesting systemInfos={systemInfos} />,
          enabled: checkedList.includes("System"),
        },
        {
          title: "Network Tests",
          statusText: networkStatus,
          description: <NetworkTesting networkInfos={networkInfos} />,
          enabled: checkedList.includes("Network"),
        },
        {
          title: "Devices Tests",
          statusText: devicesStatus,
          description: <DevicesTesting devicesInfos={devicesInfos} />,
          enabled: checkedList.includes("Devices"),
        },
      ]}
      renderItem={(item) => {
        if (item.enabled) {
          return (
            <List.Item
              className="text-left"
              actions={[
                <Badge
                  status={getItemStatus(item.statusText)}
                  text={item.statusText}
                />,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          );
        }
      }}
    />
  );
};

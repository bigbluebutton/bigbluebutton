import React, { useEffect, useState } from "react";
import "./App.css";

import {
  ConfigProvider,
  Col,
  Row,
  Button,
  Steps,
  Typography,
  Form,
} from "antd";

import DetectRTC from "detectrtc";
import * as turnItOff from "turn-it-off/main";

import enUS from "antd/locale/en_US";
import dayjs from "dayjs";

import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";

import NetworkSpeedService from "./services/network-speed.service";

import { delay } from "./functions/delay.function";
import { downloadJson } from "./functions/downloadJson.function";

import { SystemType } from "./types/SystemType";
import { NetworkType } from "./types/NetworkType";
import { DevicesType } from "./types/DevicesType";

import type { CheckboxValueType } from "antd/es/checkbox/Group";
import { PayCircleFilled } from "@ant-design/icons";
import networkSpeedService from "./services/network-speed.service";
import { upload } from "@testing-library/user-event/dist/upload";

dayjs.locale("en");

const { Title } = Typography;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const testOptions = ["System", "Network", "Devices"];
  const [checkedList, setCheckedList] =
    useState<CheckboxValueType[]>(testOptions);

  const [systemInfos, setSystemInfos] = useState<SystemType>();
  const [networkInfos, setNetworkInfos] = useState<NetworkType>();
  const [devicesInfos, setDevicesInfos] = useState<DevicesType>();

  const [systemStatus, setSystemStatus] = useState<string>("Wait");
  const [networkStatus, setNetworkStatus] = useState<string>("Wait");
  const [devicesStatus, setDevicesStatus] = useState<string>("Wait");

  const [testFinished, setTestFinished] = useState<boolean>(false);

  const testSteps = [
    {
      title: "Getting Started",
      content: (
        <Step1
          testOptions={testOptions}
          checkedList={checkedList}
          setCheckedList={setCheckedList}
        />
      ),
    },
    {
      title: "Testing",
      content: (
        <Step2
          checkedList={checkedList}
          systemStatus={systemStatus}
          systemInfos={systemInfos}
          networkStatus={networkStatus}
          networkInfos={networkInfos}
          devicesStatus={devicesStatus}
          devicesInfos={devicesInfos}
        />
      ),
    },
    {
      title: "Test Results",
      content: (
        <Step3
          systemInfos={systemInfos}
          networkInfos={networkInfos}
          devicesInfos={devicesInfos}
        />
      ),
    },
  ];
  const items = testSteps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const getSpeakers = async () => {
    const speakersDevices: string[] = [];
    await navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach(function (device) {
        if (device.kind.includes("audiooutput")) {
          speakersDevices.push(device.label);
        }
      });
    });
    return speakersDevices;
  };
  const getLocalStreamAndSaveDevicesInfo = async () => {
    await navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(async (stream) => {
        const videoDevices: string[] = [];
        const audioDevices: string[] = [];
        if (
          stream.getVideoTracks().length > 0 ||
          stream.getAudioTracks().length > 0
        ) {
          stream.getVideoTracks().forEach(function (device) {
            videoDevices.push(device.label);
          });
          stream.getTracks().forEach(function (device) {});

          stream.getAudioTracks().forEach(function (device) {
            audioDevices.push(device.label);
          });
        }
        const speakersDevices = await getSpeakers();

        setDevicesInfos({
          microphone: {
            allowed: true,
            devices: audioDevices,
          },
          webcams: {
            allowed: true,
            devices: videoDevices,
          },
          speakers: {
            allowed: true,
            devices: speakersDevices,
          },
          screenshare: DetectRTC.isScreenCapturingSupported,
        });
        setDevicesStatus("Passed");
      })
      .catch((error) => {
        console.log(error);
        if (error.name === "NotAllowedError") {
          setDevicesInfos({
            microphone: {
              allowed: false,
              devices: [],
            },
            webcams: {
              allowed: false,
              devices: [],
            },
            speakers: {
              allowed: false,
              devices: [],
            },
            screenshare: DetectRTC.isScreenCapturingSupported,
          });
          setDevicesStatus("Blocked");
        }
      });
  };

  const initData = () => {
    setTestFinished(false);

    setSystemStatus("Wait");
    setNetworkStatus("Wait");
    setDevicesStatus("Wait");

    setSystemInfos(undefined);
    setNetworkInfos(undefined);
    setDevicesInfos(undefined);
  };
  function getIPv6Address(): Promise<string> {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      pc.createOffer((sdp) => {
        const regex = /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/;

       const match =sdp?.sdp?.match(regex);
      if(match){
        const ipv6Address=match[0];
        resolve(ipv6Address);
      }

        pc.close();
      }, (error) => {
        console.error(error);
        resolve("");
      });
    });
  }

// Usage:

  const next = async () => {
    setCurrentStep(currentStep + 1);

    if (currentStep === 0) {
      if (checkedList.includes("System")) {
        setSystemStatus("Processing");
        await delay(1000);
        setSystemInfos({
          os: {
            name: DetectRTC.osName,
            version: DetectRTC.osVersion,
          },
          browser: {
            name: DetectRTC.browser.name,
            version: DetectRTC.browser.fullVersion,
            isPrivate: DetectRTC.browser.isPrivateBrowsing,
            capabilities: {
              WebRTC: DetectRTC.isWebRTCSupported,
              ORTC: DetectRTC.isORTCSupported,
              WebSockets: DetectRTC.isWebSocketsSupported,

              AudioContext: DetectRTC.isAudioContextSupported,

              SCTPDataChannels: DetectRTC.isSctpDataChannelsSupported,
              RTPDataChannels: DetectRTC.isRtpDataChannelsSupported,

              Promises: DetectRTC.isPromisesSupported,

              isMultiMonitorScreenCapturing:
                DetectRTC.isMultiMonitorScreenCapturingSupported,
              VideoStreamCapturing: DetectRTC.isVideoSupportsStreamCapturing,
              CanvasStreamCapturing: DetectRTC.isCanvasSupportsStreamCapturing,
            },
          },
          isMobileDevice: DetectRTC.isMobileDevice,
        });
        setSystemStatus("Passed");
      }

      if (checkedList.includes("Network")) {
        setNetworkStatus("Processing");
        await delay(1000);
        let vpnValue = undefined;
        await turnItOff.checkVPN().then((result) => {
          vpnValue = result?.hasVPN;
        });
       let downloadspeed = await networkSpeedService.getDownloadSpeed();
        let uploadspeed = await networkSpeedService.getUploadSpeed();
        let pingOutput = await networkSpeedService.getPing();
        let ipv6="";
      await  getIPv6Address().then((ipv6Address) => {
         ipv6=ipv6Address;
        });
        DetectRTC.DetectLocalIPAddress((ipAddress) => {
          if (!ipAddress) return;

          setNetworkInfos({
            ipAddressType:
              ipAddress.indexOf("Local") !== -1 ? "private" : "public",
            IPv4: ipAddress.substring(ipAddress.indexOf(":") + 2),
            IPv6:ipv6,
            vpn: vpnValue,
            bandwidth: {
             downloadSpeed:
                downloadspeed.data.speed.gbps > 1
                  ? downloadspeed.data.speed.gbps.toFixed(2) + " Gbps"
                  : downloadspeed.data.speed.mbps > 1
                  ? downloadspeed.data.speed.mbps.toFixed(2) + " Mbps"
                  : downloadspeed.data.speed.kbps > 1
                  ? downloadspeed.data.speed.kbps.toFixed(2) + " Kbps"
                  : downloadspeed.data.speed.bps.toFixed(2) + " bps",
              uploadSpeed:
                uploadspeed.data.speed.gbps > 1
                  ? uploadspeed.data.speed.gbps.toFixed(2) + " Gbps"
                  : uploadspeed.data.speed.mbps > 1
                  ? uploadspeed.data.speed.mbps.toFixed(2) + " Mbps"
                  : uploadspeed.data.speed.kbps > 1
                  ? uploadspeed.data.speed.kbps.toFixed(2) + " Kbps"
                  : uploadspeed.data.speed.bps.toFixed(2) + " bps",
              ping: pingOutput.data.alive
                ? pingOutput.data.time + " ms"
                : "dead",
            },
          });
        });
        setNetworkStatus("Passed");
      }

      if (checkedList.includes("Devices")) {
        setDevicesStatus("Processing");
        await delay(2000);
        await getLocalStreamAndSaveDevicesInfo();
      }

      setTestFinished(true);
    }
  };

  const prev = () => {
    if (currentStep === 1) {
      initData();
    }
    setCurrentStep(currentStep - 1);
  };
  const dowloadTests = () => {
    const checksObj = {
      systemTests: systemInfos,
      networkTests: networkInfos,
      devicesTests: devicesInfos,
    };

    downloadJson(checksObj);
  };

  useEffect(() => {}, []);

  return (
    <ConfigProvider
      locale={enUS}
      direction="ltr"
      componentSize="large"
      theme={{
        token: {
          colorPrimary: "#364259",
          fontSize: 14.5,
          fontFamily: "Segoe UI",
          sizeStep: 6,
        },
      }}
    >
      <div className="App">
        <Title className="app-title center-elements">
          <img className="logo-title" src={"./favicon.ico"} />
          BigBlueButton Pre-flight Check
        </Title>
        <Row justify="center" align="top" className="m-20">
          <Col span={4} className="mt-30 test-steps">
            <Steps
              /*percent={currentStep === 1 ? 60 : undefined}*/ direction="vertical"
              current={currentStep}
              items={items}
            />
          </Col>
          <Col span={16}>
            <Form layout="vertical" className="step-content">
              {testSteps[currentStep].content}
              <Form.Item
                className={
                  currentStep > 0
                    ? "button-container other-steps-btns"
                    : "button-container first-step-btn"
                }
              >
                {currentStep > 0 && (
                  <Button
                    className="prev"
                    style={{ margin: "0 8px" }}
                    onClick={() => prev()}
                    block
                  >
                    Previous
                  </Button>
                )}
                {currentStep < testSteps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={() => next()}
                    block
                    disabled={
                      checkedList.length === 0 ||
                      (currentStep === 1 && !testFinished)
                    }
                  >
                    Next
                  </Button>
                )}
                {currentStep === testSteps.length - 1 && (
                  <Button type="primary" onClick={dowloadTests} block>
                    Download Test Results
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default App;

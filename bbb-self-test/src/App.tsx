import React, {useEffect, useState} from 'react';
import './App.css';

import { ConfigProvider, Col, Row, Button, Steps, Typography, Checkbox, Space, Form, Statistic, Card, Badge, List } from 'antd';

import DetectRTC from 'detectrtc';
import * as turnItOff from 'turn-it-off/main';
import { UniversalSpeedtest, SpeedUnits } from "universal-speedtest";
import NetworkSpeed from 'network-speed';

import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';

import { SystemType } from './types/SystemType';
import { NetworkType } from './types/NetworkType';
import { DevicesType } from './types/DevicesType';

import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

dayjs.locale('en');

const { Title, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const [systemInfos, setSystemInfos] = useState<SystemType>();
    const [networkInfos, setNetworkInfos] = useState<NetworkType>();
    const [devicesInfos, setDevicesInfos] = useState<DevicesType>();

    const [systemStatus, setSystemStatus] = useState<string>('Wait');
    const [networkStatus, setNetworkStatus] = useState<string>('Wait');
    const [devicesStatus, setDevicesStatus] = useState<string>('Wait');

    const [testFinished, setTestFinished] = useState<boolean>(false);

    const testOptions = ['System', 'Network', 'Devices'];
    const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(testOptions);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(true);
    const onChange = (list: CheckboxValueType[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < testOptions.length);
        setCheckAll(list.length === testOptions.length);
    };
    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        setCheckedList(e.target.checked ? testOptions : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };
    const getItemStatus = (status: string) : "error" | "processing" | "default" | "success" | "warning" | undefined => {
      switch (status) {
          case 'Processing':
              return 'processing';
          case 'Wait':
              return 'default';
          case 'Passed':
              return 'success';
          case 'Blocked':
              return 'error';
      }
    }
    const testSteps = [
        {
            title: 'Getting Started',
            content:
                <Space direction='vertical' size="large">
                    <div className='tests-title'>
                        <Title level={5}>All Tests</Title>
                        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                            Check All
                        </Checkbox>
                    </div>
                    <CheckboxGroup options={testOptions} value={checkedList} onChange={onChange} />
                </Space>,
        },
        {
            title: 'Testing',
            content:
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        {
                            title: 'System Tests',
                            statusText: systemStatus,
                            description:
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
                                                    : <Text strong>{systemInfos.browser.name} {systemInfos.browser.version}</Text>
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
                                                                    {systemInfos.browser.capabilities.WebRTC && <li>WebRTC</li>}
                                                                    {systemInfos.browser.capabilities.ORTC && <li>ORTC</li>}
                                                                    {systemInfos.browser.capabilities.WebSockets && <li>WebSockets</li>}
                                                                    {systemInfos.browser.capabilities.AudioContext && <li>WebAudio API</li>}
                                                                </Col>
                                                                <Col span={8}>
                                                                    {systemInfos.browser.capabilities.SCTPDataChannels && <li>SCTP DataChannels</li>}
                                                                    {systemInfos.browser.capabilities.RTPDataChannels && <li>RTP DataChannels</li>}
                                                                    {systemInfos.browser.capabilities.Promises && <li>Promises</li>}
                                                                </Col>
                                                                <Col span={8}>
                                                                    {systemInfos.browser.capabilities.isMultiMonitorScreenCapturing && <li>MultiMonitor ScreenCapturing</li>}
                                                                    {systemInfos.browser.capabilities.VideoStreamCapturing && <li>Video StreamCapturing</li>}
                                                                    {systemInfos.browser.capabilities.CanvasStreamCapturing && <li>Canvas StreamCapturing</li>}
                                                                </Col>
                                                            </Row>
                                                        </ol>
                                                    </Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                </ul>,
                            enabled: checkedList.includes('System'),
                        },
                        {
                            title: 'Network Tests',
                            statusText: networkStatus,
                            description:
                                <ul>
                                    <li>
                                        <>
                                            IP Address Type
                                            {networkInfos?.ipAddressType !== undefined && (
                                                <>
                                                    : <Text strong className={'text-capitalize'}>{networkInfos.ipAddressType}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                    <li>
                                        <>
                                            IP Address v4
                                            {networkInfos?.IPv4 !== undefined && (
                                                <>
                                                    : <Text strong className={'text-capitalize'}>{networkInfos.IPv4}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                    <li>IP Address v6</li>
                                    <li>Network Bandwidth</li>
                                    <li>
                                        <>
                                            VPN Detection
                                            {networkInfos?.vpn !== undefined && (
                                                <>
                                                    : <Text strong className={'text-capitalize'}>{networkInfos.vpn ? 'Yes' : 'No'}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                </ul>,
                            enabled: checkedList.includes('Network'),
                        },
                        {
                            title: 'Devices Tests',
                            statusText: devicesStatus,
                            description:
                                <ul>
                                    <li>
                                        <>
                                            Microphone
                                            {devicesInfos?.microphone?.allowed && (
                                                <>
                                                    : <Text strong>{devicesInfos.microphone.devices?.length + ' Device(s)'}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                    <li>
                                        <>
                                            Speakers
                                            {devicesInfos?.speakers !== undefined && (
                                                <>
                                                    : <Text strong>{devicesInfos.speakers?.length + ' Device(s)'}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                    <li>
                                        <>
                                            Webcams
                                            {devicesInfos?.webcams?.allowed && (
                                                <>
                                                    : <Text strong>{devicesInfos.webcams.devices?.length + ' Device(s)'}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                    <li>
                                        <>
                                            Screensharing
                                            {devicesInfos?.screenshare !== undefined && (
                                                <>
                                                    : <Text strong>{devicesInfos.screenshare ? 'Supported' : 'Not Supported'}</Text>
                                                </>
                                            )}
                                        </>
                                    </li>
                                </ul>,
                            enabled: checkedList.includes('Devices'),
                        },
                    ]}
                    renderItem={(item) => {
                        if(item.enabled) {
                            return <List.Item className='text-left' actions={[<Badge status={getItemStatus(item.statusText)} text={item.statusText} />]}>
                                <List.Item.Meta
                                    title={item.title}
                                    description={item.description}
                                />
                            </List.Item>;
                        }
                    }}
                />
        },
        {
            title: 'Test Results',
            content:
            <>
                <Row gutter={[16, 40]}>
                    {systemInfos?.os !== undefined && systemInfos?.browser !== undefined && (
                        <Col span={12}>
                            <Card bordered={false} title={'System Tests'}>
                                <Row gutter={[16, 40]}>
                                    {systemInfos.os.name !== '' && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Operating System"
                                                value={systemInfos.os.name}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.name !== '' && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Browser"
                                                value={systemInfos.browser.name}
                                                suffix={<span className="stat-small">{systemInfos.browser.version}</span>}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.isPrivate !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Private Browser"
                                                value={systemInfos.browser.isPrivate ? 'Yes' : 'No'}
                                                valueStyle={{ color: systemInfos.browser.isPrivate ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}

                                    {systemInfos.browser.capabilities?.WebRTC !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebRTC"
                                                value={systemInfos.browser.capabilities.WebRTC ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.WebRTC ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.ORTC !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="ORTC"
                                                value={systemInfos.browser.capabilities.ORTC ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.ORTC ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.WebSockets !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebSockets"
                                                value={systemInfos.browser.capabilities.WebSockets ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.WebSockets ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.AudioContext !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebAudio API"
                                                value={systemInfos.browser.capabilities.AudioContext ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.AudioContext ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.SCTPDataChannels !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="SCTP Data Channels"
                                                value={systemInfos.browser.capabilities.SCTPDataChannels ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.SCTPDataChannels ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.RTPDataChannels !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="RTP Data Channels"
                                                value={systemInfos.browser.capabilities.RTPDataChannels ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.RTPDataChannels ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.isMultiMonitorScreenCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="MultiMonitor ScreenCapturing"
                                                value={systemInfos.browser.capabilities.isMultiMonitorScreenCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.isMultiMonitorScreenCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.VideoStreamCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Video StreamCapturing"
                                                value={systemInfos.browser.capabilities.VideoStreamCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.VideoStreamCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.CanvasStreamCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Canvas StreamCapturing"
                                                value={systemInfos.browser.capabilities.CanvasStreamCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.CanvasStreamCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities?.Promises !== undefined && (
                                        <Col span={12}>
                                            <Statistic
                                                title="Promises"
                                                value={systemInfos.browser.capabilities.Promises ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.Promises ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.isMobileDevice !== undefined && (
                                        <Col span={12}>
                                            <Statistic
                                                title="Mobile Device"
                                                value={systemInfos.isMobileDevice ? 'Yes' : 'No'}
                                                valueStyle={{ color: systemInfos.isMobileDevice ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    )}
                    <Col span={12}>
                        {(devicesInfos?.microphone !== undefined || devicesInfos?.webcams !== undefined || devicesInfos?.speakers !== undefined || devicesInfos?.screenshare !== undefined) && (
                            <>
                                <Card bordered={false} title={'Devices Tests'}>
                                    <Row gutter={[16, 40]}>
                                        {devicesInfos.microphone !== undefined && (
                                            <Col span={8}>
                                                <Statistic
                                                    title="Microphone"
                                                    value={devicesInfos.microphone.allowed ? devicesInfos.microphone.devices!.length > 0 ? devicesInfos.microphone.devices?.length + ' microphone(s)' : 'No' : 'Not Allowed'}
                                                    valueStyle={{ color: devicesInfos.microphone.allowed && devicesInfos.microphone.devices!.length > 0 ? '#3f8600' : '#cf1322' }}
                                                    suffix={<div className="stat-small">{(devicesInfos.microphone.allowed && devicesInfos.microphone.devices!.length > 0) && devicesInfos.microphone.devices?.map((item, index) => <p key={index}>{item}</p>)}</div>}
                                                />
                                            </Col>
                                        )}
                                        {devicesInfos.speakers !== undefined && (
                                            <Col span={8}>
                                                <Statistic
                                                    title="Speakers"
                                                    value={devicesInfos.speakers.length > 0 ? 'Yes' : 'No'}
                                                    valueStyle={{ color: devicesInfos.speakers.length > 0 ? '#3f8600' : '#cf1322' }}
                                                    suffix={<span className="stat-small">{devicesInfos.speakers.length > 0 && devicesInfos.speakers.length + ' speakers'}</span>}
                                                />
                                            </Col>
                                        )}
                                        {devicesInfos.webcams !== undefined && (
                                            <Col span={8}>
                                                <Statistic
                                                    title="Webcams"
                                                    value={devicesInfos.webcams.allowed ? devicesInfos.webcams.devices!.length > 0 ? devicesInfos.webcams.devices?.length + ' webcams' : 'No' : 'Not Allowed'}
                                                    valueStyle={{ color: devicesInfos.webcams.allowed && devicesInfos.webcams.devices!.length > 0 ? '#3f8600' : '#cf1322' }}
                                                    suffix={<div className="stat-small">{(devicesInfos.webcams.allowed && devicesInfos.webcams.devices!.length > 0) && devicesInfos.webcams.devices?.map((item, index) => <p key={index}>{item}</p>)}</div>}
                                                />
                                            </Col>
                                        )}
                                        {devicesInfos.screenshare !== undefined && (
                                            <Col span={8}>
                                                <Statistic
                                                    title="ScreenSharing"
                                                    value={devicesInfos.screenshare ? 'Supported' : 'Not Supported'}
                                                    valueStyle={{ color: devicesInfos.screenshare ? '#3f8600' : '#cf1322' }}
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                                <br/>
                            </>
                        )}
                        {(networkInfos?.ipAddressType !== undefined || networkInfos?.IPv4 !== undefined) && (
                            <Card bordered={false} title={'Network Tests'}>
                                <Row gutter={[16, 40]}>
                                    {networkInfos.ipAddressType !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="IpAddress Type"
                                                value={networkInfos.ipAddressType}
                                                valueStyle={{textTransform: "capitalize"}}
                                            />
                                        </Col>
                                    )}
                                    {networkInfos.IPv4 !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="IPv4"
                                                value={networkInfos.IPv4}
                                            />
                                        </Col>
                                    )}
                                    {networkInfos.IPv6 !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="IPv6"
                                                value={networkInfos.IPv6}
                                            />
                                        </Col>
                                    )}
                                    {networkInfos.vpn !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="VPN Detection"
                                                value={networkInfos.vpn ? 'VPN detected' : 'Any VPN detected'}
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        )}
                    </Col>
                </Row>
            </>
        },
    ];
    const items = testSteps.map((item) => ({ key: item.title, title: item.title }));

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const getLocalStreamAndSaveDevicesInfo = async () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                const videoDevices: string[] = [];
                const audioDevices: string[] = [];
                if (stream.getVideoTracks().length > 0 || stream.getAudioTracks().length > 0) {
                    stream.getVideoTracks().forEach(function(device) {
                        videoDevices.push(device.label);
                    });
                    stream.getAudioTracks().forEach(function(device) {
                        audioDevices.push(device.label);
                    });
                }
                setDevicesInfos({
                    microphone: {
                        allowed: true,
                        devices: audioDevices,
                    },
                    webcams: {
                        allowed: true,
                        devices: videoDevices,
                    },
                    //speakers: [],
                    screenshare: DetectRTC.isScreenCapturingSupported,
                });
                setDevicesStatus('Passed');
            })
            .catch((error) => {
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
                        speakers: [],
                        screenshare: DetectRTC.isScreenCapturingSupported,
                    });
                    setDevicesStatus('Blocked');
                }
            });
    }
    const initData = () => {
        setTestFinished(false);

        setSystemStatus('Wait');
        setNetworkStatus('Wait');
        setDevicesStatus('Wait');

        setSystemInfos(undefined);
        setNetworkInfos(undefined);
        setDevicesInfos(undefined);
    }
    const next = async () => {
        setCurrentStep(currentStep + 1);

        if (currentStep === 0) {
            if (checkedList.includes('System')) {
                setSystemStatus('Processing');
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

                            isMultiMonitorScreenCapturing: DetectRTC.isMultiMonitorScreenCapturingSupported,
                            VideoStreamCapturing: DetectRTC.isVideoSupportsStreamCapturing,
                            CanvasStreamCapturing: DetectRTC.isCanvasSupportsStreamCapturing,
                        },
                    },
                    isMobileDevice: DetectRTC.isMobileDevice,
                });
                setSystemStatus('Passed');
            }

            if (checkedList.includes('Network')) {
                setNetworkStatus('Processing');
                await delay(1000);
                let vpnValue = undefined;
                await turnItOff.checkVPN().then((result) => {
                    vpnValue = result.hasVPN;
                });
                DetectRTC.DetectLocalIPAddress((ipAddress) => {
                    if (!ipAddress) return;
                    setNetworkInfos({
                        ipAddressType: ipAddress.indexOf('Local') !== -1 ? 'private' : 'public',
                        IPv4: ipAddress.substring(ipAddress.indexOf(':') + 2),
                        vpn: vpnValue,
                    })
                });
                setNetworkStatus('Passed');
            }

            if(checkedList.includes('Devices')) {
                setDevicesStatus('Processing');
                await delay(2000);
                await getLocalStreamAndSaveDevicesInfo();
            }

            setTestFinished(true);
        }
    };
    const prev = () => {
        if(currentStep === 1) {
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

        const downloadNode = document.createElement('a');
        downloadNode.download = "bbb-checks.json";
        downloadNode.href =  "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(checksObj));
        downloadNode.click();
    }

    useEffect(() => {
        /*
        const universalSpeedtest = new UniversalSpeedtest({
            measureUpload: true,
            downloadUnit: SpeedUnits.MBps,
        });

        universalSpeedtest.runSpeedtestNet()
            .then(result => {
                console.log(`Ping: ${result.ping} ms`);
                console.log(`Download speed: ${result.downloadSpeed} MBps`);
                console.log(`Upload speed: ${result.uploadSpeed} Mbps`);
            }).catch(e => {
                console.error(e.message);
            });
        */

        async function getNetworkDownloadSpeed() {
            const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
            const fileSizeInBytes = 500000;
            const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
            console.log(speed);
        }
        async function getNetworkUploadSpeed() {
            const options = {
                hostname: 'www.google.com',
                port: 80,
                path: '/catchers/544b09b4599c1d0200000289',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const fileSizeInBytes = 2000000
            const speed = await testNetworkSpeed.checkUploadSpeed(options, fileSizeInBytes);
            console.log(speed);
        }

        const testNetworkSpeed = new NetworkSpeed();
        getNetworkDownloadSpeed();
        getNetworkUploadSpeed();
    }, []);

    return (
        <ConfigProvider
            locale={enUS}
            direction="ltr"
            componentSize="large"
            theme={{ token: { colorPrimary: '#364259', fontSize: 14.5, fontFamily: 'Segoe UI', sizeStep: 6 } }}
        >
            <div className="App">
                <Title className='app-title center-elements'><img className="logo-title" src={'./favicon.ico'} />BigBlueButton Pre-flight Check</Title>
                <Row justify="center" align="top" className="m-20">
                    <Col span={4} className="mt-30 test-steps">
                        <Steps /*percent={currentStep === 1 ? 60 : undefined}*/ direction="vertical" current={currentStep} items={items} />
                    </Col>
                    <Col span={16}>
                        <div className="step-content">
                            <Form layout="vertical">
                                {testSteps[currentStep].content}
                                <Form.Item className={currentStep > 0 ? 'button-container other-steps-btns' : 'button-container first-step-btn'}>
                                    {currentStep > 0 && (
                                        <Button className="prev" style={{ margin: '0 8px' }} onClick={() => prev()} block>
                                            Previous
                                        </Button>
                                    )}
                                    {currentStep < testSteps.length - 1 && (
                                        <Button type="primary" onClick={() => next()} block disabled={checkedList.length === 0 || (currentStep === 1 && !testFinished)}>
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
                        </div>
                    </Col>
                </Row>
            </div>
        </ConfigProvider>
    );
};

export default App;

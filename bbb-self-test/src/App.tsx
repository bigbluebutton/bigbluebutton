import React, {useEffect, useState} from 'react';
import './App.css';

import { ConfigProvider, Col, Row, Button, Steps, Typography, Checkbox, Space, Form, Statistic, Card, Badge, List } from 'antd';

import DetectRTC from "detectrtc";
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';

import { SystemType } from './types/SystemType';
import { NetworkType } from './types/NetworkType';
import { DevicesType } from './types/DevicesType';

import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

dayjs.locale('en');

const { Title } = Typography;
const CheckboxGroup = Checkbox.Group;

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const [systemInfos, setSystemInfos] = useState<SystemType>();
    const [networkInfos, setNetworkInfos] = useState<NetworkType>();
    const [devicesInfos, setDevicesInfos] = useState<DevicesType>();

    const [systemProcessing, setSystemProcessing] = useState<boolean>(false);
    const [networkProcessing, setNetworkProcessing] = useState<boolean>(false);
    const [devicesProcessing, setDevicesProcessing] = useState<boolean>(false);

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
                            statusText: systemInfos === undefined ? systemProcessing ? "Processing" : "Wait" : "Passed",
                            description:
                                <ul>
                                    <li>Operating System</li>
                                    <li>Browser Name and Version</li>
                                    <li>Browser Capabilities</li>
                                </ul>,
                            enabled: checkedList.includes('System'),
                        },
                        {
                            title: 'Network Tests',
                            statusText: networkInfos === undefined ? networkProcessing ? "Processing" : "Wait" : "Passed",
                            description:
                                <ul>
                                    <li>IP Address Type</li>
                                    <li>IP Address v4</li>
                                    <li>IP Address v6</li>
                                    <li>Network Bandwidth</li>
                                    <li>VPN Dectection</li>
                                </ul>,
                            enabled: checkedList.includes('Network'),
                        },
                        {
                            title: 'Devices Tests',
                            statusText: devicesInfos === undefined ? devicesProcessing ? "Processing" : "Wait" : "Passed",
                            description:
                                <ul>
                                    <li>Microphone</li>
                                    <li>Speakers</li>
                                    <li>Webcams</li>
                                    <li>Screensharing</li>
                                </ul>,
                            enabled: checkedList.includes('Devices'),
                        },
                    ]}
                    renderItem={(item) => {
                        if(item.enabled) {
                            return <List.Item className='text-left' actions={[<Badge status={getItemStatus(item.statusText)} text={item.statusText} />]}>
                                <List.Item.Meta
                                    //avatar={<ControlOutlined />}
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
                <Row gutter={[16, 40]}>
                    {systemInfos !== undefined && systemInfos.os !== undefined && systemInfos.browser !== undefined && (
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
                                    {systemInfos.browser.capabilities.WebRTC !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebRTC"
                                                value={systemInfos.browser.capabilities.WebRTC ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.WebRTC ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.ORTC !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="ORTC"
                                                value={systemInfos.browser.capabilities.ORTC ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.ORTC ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.WebSockets !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebSockets"
                                                value={systemInfos.browser.capabilities.WebSockets ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.WebSockets ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.AudioContext !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="WebAudio API"
                                                value={systemInfos.browser.capabilities.AudioContext ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.AudioContext ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.SCTPDataChannels !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="SCTP Data Channels"
                                                value={systemInfos.browser.capabilities.SCTPDataChannels ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.SCTPDataChannels ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.RTPDataChannels !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="RTP Data Channels"
                                                value={systemInfos.browser.capabilities.RTPDataChannels ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.RTPDataChannels ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.isMultiMonitorScreenCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="MultiMonitor ScreenCapturing"
                                                value={systemInfos.browser.capabilities.isMultiMonitorScreenCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.isMultiMonitorScreenCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.VideoStreamCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Video StreamCapturing"
                                                value={systemInfos.browser.capabilities.VideoStreamCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.VideoStreamCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.CanvasStreamCapturing !== undefined && (
                                        <Col span={8}>
                                            <Statistic
                                                title="Canvas StreamCapturing"
                                                value={systemInfos.browser.capabilities.CanvasStreamCapturing ? 'Supported' : 'Not Supported'}
                                                valueStyle={{ color: systemInfos.browser.capabilities.CanvasStreamCapturing ? '#3f8600' : '#cf1322' }}
                                            />
                                        </Col>
                                    )}
                                    {systemInfos.browser.capabilities.Promises !== undefined && (
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
                            {devicesInfos !== undefined && (devicesInfos.microphone !== undefined || devicesInfos.webcams !== undefined || devicesInfos.speakers !== undefined || devicesInfos.screenshare !== undefined) && (
                                <>
                                    <Card bordered={false} title={'Devices Tests'}>
                                        <Row gutter={[16, 40]}>
                                            {devicesInfos.microphone !== undefined && (
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Microphone"
                                                        value={devicesInfos.microphone.allowed ? devicesInfos.microphone.exists ? 'Yes' : 'No' : 'Not Allowed'}
                                                        valueStyle={{ color: devicesInfos.microphone.allowed && devicesInfos.microphone.exists ? '#3f8600' : '#cf1322' }}
                                                        suffix={<span className="stat-small">{(devicesInfos.microphone.allowed && devicesInfos.microphone.exists) && devicesInfos.microphone.nb + ' microphones'}</span>}
                                                    />
                                                </Col>
                                            )}
                                            {devicesInfos.speakers !== undefined && (
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Speakers"
                                                        value={devicesInfos.speakers.exists ? 'Yes' : 'No'}
                                                        valueStyle={{ color: devicesInfos.speakers.exists ? '#3f8600' : '#cf1322' }}
                                                        suffix={<span className="stat-small">{devicesInfos.speakers.exists && devicesInfos.speakers.nb + ' speakers'}</span>}
                                                    />
                                                </Col>
                                            )}
                                            {devicesInfos.webcams !== undefined && (
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Webcams"
                                                        value={devicesInfos.webcams.allowed ? devicesInfos.webcams.exists ? 'Yes' : 'No' : 'Not Allowed'}
                                                        valueStyle={{ color: devicesInfos.webcams.allowed && devicesInfos.webcams.exists ? '#3f8600' : '#cf1322' }}
                                                        suffix={<span className="stat-small">{(devicesInfos.webcams.allowed && devicesInfos.webcams.exists) && devicesInfos.webcams.nb + ' webcams'}</span>}
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
                            {networkInfos !== undefined && (networkInfos.ipAddressType !== undefined || networkInfos.IPv4 !== undefined) && (
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
                                    </Row>
                                </Card>
                            )}
                        </Col>
                </Row>
        },
    ];
    const items = testSteps.map((item) => ({ key: item.title, title: item.title }));

    const delay = ms => new Promise(res => setTimeout(res, ms));
    const getLocalStreamAndSaveDevicesInfo = async () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(() => {
                setDevicesInfos({
                    microphone: {
                        allowed: DetectRTC.isWebsiteHasMicrophonePermissions,
                        exists: DetectRTC.hasMicrophone,
                        nb: DetectRTC.audioInputDevices.length,
                    },
                    webcams: {
                        allowed: DetectRTC.isWebsiteHasWebcamPermissions,
                        exists: DetectRTC.hasWebcam,
                        nb: DetectRTC.videoInputDevices.length,
                    },
                    speakers: {
                        exists: DetectRTC.hasSpeakers,
                        nb: DetectRTC.audioOutputDevices.length,
                    },
                    screenshare: DetectRTC.isScreenCapturingSupported,
                });
            });
    }
    const initData = () => {
        setTestFinished(false);

        setSystemProcessing(false);
        setNetworkProcessing(false);
        setDevicesProcessing(false);

        setSystemInfos(undefined);
        setNetworkInfos(undefined);
        setDevicesInfos(undefined);
    }
    const next = async () => {
        setCurrentStep(currentStep + 1);

        if (currentStep === 0) {
            if (checkedList.includes('System')) {
                setSystemProcessing(true);
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
                setSystemProcessing(false);
            }

            if (checkedList.includes('Network')) {
                setNetworkProcessing(true);
                await delay(1000);
                DetectRTC.DetectLocalIPAddress((ipAddress) => {
                    if (!ipAddress) return;
                    setNetworkInfos({
                        ipAddressType: ipAddress.indexOf('Local') !== -1 ? 'private' : 'public',
                        IPv4: ipAddress.substring(ipAddress.indexOf(':') + 2),
                    })
                });
                setNetworkProcessing(false);
            }

            if(checkedList.includes('Devices')) {
                setDevicesProcessing(true);
                await delay(2000);
                await getLocalStreamAndSaveDevicesInfo();
                setDevicesProcessing(false);
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
        //getLocalStreamAndSaveDevicesInfo();
    }, []);

    return (
        <ConfigProvider
            locale={enUS}
            direction="ltr"
            componentSize="large"
            theme={{ token: { colorPrimary: '#364259', fontSize: 14.5, fontFamily: 'Segoe UI', sizeStep: 6 } }}
        >
            <div className="App">
                <Title className='app-title'>BigBlueButton Pre-flight Check</Title>
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

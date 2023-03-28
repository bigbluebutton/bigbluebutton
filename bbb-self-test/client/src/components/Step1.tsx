import React, { useState } from 'react';

import { Checkbox, Space, Typography } from 'antd';

import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Title } = Typography;
const CheckboxGroup = Checkbox.Group;

type Props = {
    testOptions: string[];
    checkedList: CheckboxValueType[];
    setCheckedList: (checkedList: CheckboxValueType[]) => void;
};

export const Step1 = (props: Props) => {
    const { testOptions, checkedList, setCheckedList } = props;

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

    return (
        <Space direction='vertical' size="large">
            <div className='tests-title'>
                <Title level={5}>All Tests</Title>
                <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                    Check All
                </Checkbox>
            </div>
            <CheckboxGroup options={testOptions} value={checkedList} onChange={onChange} />
        </Space>
    );
};
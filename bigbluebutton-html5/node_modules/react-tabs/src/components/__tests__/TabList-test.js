/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import Tab from '../Tab';
import TabList from '../TabList';
import TabPanel from '../TabPanel';
import Tabs from '../Tabs';
import { TabListWrapper, TabWrapper } from './helpers/higherOrder';

function expectToMatchSnapshot(component) {
  expect(renderer.create(component).toJSON()).toMatchSnapshot();
}

describe('<TabList />', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = error => {
      throw new Error(error);
    };
  });

  it('should have sane defaults', () => {
    expectToMatchSnapshot(<TabList />);
  });

  it('should accept className', () => {
    expectToMatchSnapshot(<TabList className="foobar" />);
  });

  it('should pass through custom properties', () => {
    expectToMatchSnapshot(<TabList data-tooltip="Tooltip contents" />);
  });

  it('should not allow overriding all default properties', () => {
    // eslint-disable-next-line jsx-a11y/aria-role
    expectToMatchSnapshot(<TabList role="micro-tab" />);
  });

  it('should retain the default classnames for active and disabled tab', () => {
    expectToMatchSnapshot(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Foo</Tab>
          <Tab disabled>Bar</Tab>
        </TabList>
        <TabPanel>Foo</TabPanel>
        <TabPanel>Bar</TabPanel>
      </Tabs>,
    );
  });

  it('should display the custom classnames for selected and disabled tab specified on tabs', () => {
    expectToMatchSnapshot(
      <Tabs
        defaultIndex={0}
        selectedTabClassName="active"
        disabledTabClassName="disabled"
      >
        <TabList>
          <Tab>Foo</Tab>
          <Tab disabled>Bar</Tab>
        </TabList>
        <TabPanel>Foo</TabPanel>
        <TabPanel>Bar</TabPanel>
      </Tabs>,
    );
  });

  it('should display the custom classnames for selected and disabled tab', () => {
    expectToMatchSnapshot(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab selectedClassName="active" disabledClassName="disabled">
            Foo
          </Tab>
          <Tab disabled selectedClassName="active" disabledClassName="disabled">
            Bar
          </Tab>
        </TabList>
        <TabPanel>Foo</TabPanel>
        <TabPanel>Bar</TabPanel>
      </Tabs>,
    );
  });

  it('should allow for higher order components', () => {
    expectToMatchSnapshot(
      <Tabs>
        <TabListWrapper>
          <TabWrapper>Foo</TabWrapper>
          <TabWrapper>Bar</TabWrapper>
        </TabListWrapper>
        <TabPanel>Foo</TabPanel>
        <TabPanel>Bar</TabPanel>
      </Tabs>,
    );
  });
});

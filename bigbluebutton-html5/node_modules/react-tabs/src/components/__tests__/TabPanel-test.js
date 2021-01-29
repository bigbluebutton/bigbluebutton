/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import TabPanel from '../TabPanel';
import { TabPanelWrapper } from './helpers/higherOrder';

function expectToMatchSnapshot(component) {
  expect(renderer.create(component).toJSON()).toMatchSnapshot();
}

describe('<TabPanel />', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = error => {
      throw new Error(error);
    };
  });

  it('should have sane defaults', () => {
    expectToMatchSnapshot(<TabPanel>Hola</TabPanel>);
  });

  it('should render when selected', () => {
    expectToMatchSnapshot(<TabPanel selected>Hola</TabPanel>);
  });

  it('should render when forced', () => {
    expectToMatchSnapshot(<TabPanel forceRender>Hola</TabPanel>);
  });

  it('should accept className', () => {
    expectToMatchSnapshot(<TabPanel className="foobar" />);
  });

  it('should support being selected', () => {
    expectToMatchSnapshot(
      <TabPanel selected id="abcd" tabId="1234">
        Hola
      </TabPanel>,
    );
  });

  it('should support being selected with custom class name', () => {
    expectToMatchSnapshot(
      <TabPanel selected id="abcd" tabId="1234" selectedClassName="selected">
        Hola
      </TabPanel>,
    );
  });

  it('should pass through custom properties', () => {
    expectToMatchSnapshot(<TabPanel data-tooltip="Tooltip contents" />);
  });

  it('should not allow overriding all default properties', () => {
    // eslint-disable-next-line jsx-a11y/aria-role
    expectToMatchSnapshot(<TabPanel role="micro-tab" />);
  });

  it('should allow for higher-order components', () => {
    expectToMatchSnapshot(<TabPanelWrapper />);
  });
});

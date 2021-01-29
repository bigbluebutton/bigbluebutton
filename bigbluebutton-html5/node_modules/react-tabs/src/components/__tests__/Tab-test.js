/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import Tab from '../Tab';
import { TabWrapper } from './helpers/higherOrder';

function expectToMatchSnapshot(component) {
  expect(renderer.create(component).toJSON()).toMatchSnapshot();
}

describe('<Tab />', () => {
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = error => {
      throw new Error(error);
    };
  });

  it('should have sane defaults', () => {
    expectToMatchSnapshot(<Tab />);
  });

  it('should accept className', () => {
    expectToMatchSnapshot(<Tab className="foobar" />);
  });

  it('should support being selected', () => {
    expectToMatchSnapshot(
      <Tab selected id="abcd" panelId="1234">
        Hello
      </Tab>,
    );
  });

  it('should support being selected with custom class', () => {
    expectToMatchSnapshot(<Tab selected selectedClassName="cool" />);
  });

  it('should support being disabled', () => {
    expectToMatchSnapshot(<Tab disabled />);
  });

  it('should support being disabled with custom class name', () => {
    expectToMatchSnapshot(<Tab disabled disabledClassName="coolDisabled" />);
  });

  it('should pass through custom properties', () => {
    expectToMatchSnapshot(<Tab data-tooltip="Tooltip contents" />);
  });

  it('should not allow overriding all default properties', () => {
    // eslint-disable-next-line jsx-a11y/aria-role
    expectToMatchSnapshot(<Tab role="micro-tab" />);
  });

  it('should allow to be wrapped in higher-order-component', () => {
    expectToMatchSnapshot(<TabWrapper />);
  });

  it('override the tabIndex if it was provided', () => {
    expectToMatchSnapshot(<Tab tabIndex="0">Hello</Tab>);
  });
});

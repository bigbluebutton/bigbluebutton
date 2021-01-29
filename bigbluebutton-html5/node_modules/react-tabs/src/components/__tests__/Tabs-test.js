/* eslint-env jest */
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import Tab from '../Tab';
import TabList from '../TabList';
import TabPanel from '../TabPanel';
import Tabs from '../Tabs';
import { reset as resetIdCounter } from '../../helpers/uuid';
import {
  TabListWrapper,
  TabWrapper,
  TabPanelWrapper,
} from './helpers/higherOrder';

Enzyme.configure({ adapter: new Adapter() });

function expectToMatchSnapshot(component) {
  expect(renderer.create(component).toJSON()).toMatchSnapshot();
}

function createTabs(props = {}) {
  return (
    <Tabs {...props}>
      <TabList>
        <Tab>Foo</Tab>
        <Tab>Bar</Tab>
        <Tab>
          <a href="a">Baz</a>
        </Tab>
        <Tab disabled>Qux</Tab>
      </TabList>
      <TabPanel>Hello Foo</TabPanel>
      <TabPanel>Hello Bar</TabPanel>
      <TabPanel>Hello Baz</TabPanel>
      <TabPanel>Hello Qux</TabPanel>
    </Tabs>
  );
}

function assertTabSelected(wrapper, index) {
  const tab = wrapper.find(Tab).at(index);
  const panel = wrapper.find(TabPanel).at(index);

  expect(tab.prop('selected')).toBe(true);
  expect(panel.prop('selected')).toBe(true);
}

describe('<Tabs />', () => {
  beforeEach(() => resetIdCounter());

  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = error => {
      throw new Error(error);
    };
  });

  describe('props', () => {
    test('should have sane defaults', () => {
      expectToMatchSnapshot(createTabs());
    });

    test('should honor positive defaultIndex prop', () => {
      expectToMatchSnapshot(createTabs({ defaultIndex: 1 }));
    });

    test('should honor negative defaultIndex prop', () => {
      expectToMatchSnapshot(createTabs({ defaultIndex: -1 }));
    });

    test('should call onSelect when selection changes', () => {
      const called = { index: -1, last: -1 };
      const wrapper = mount(
        createTabs({
          onSelect(index, last) {
            called.index = index;
            called.last = last;
          },
        }),
      );

      wrapper
        .find(Tab)
        .at(1)
        .simulate('click');

      expect(called.index).toBe(1);
      expect(called.last).toBe(0);
    });

    test('should accept className', () => {
      expectToMatchSnapshot(createTabs({ className: 'foobar' }));
    });

    test('should accept domRef', () => {
      let domNode;
      mount(
        createTabs({
          domRef: node => {
            domNode = node;
          },
        }),
      );

      expect(domNode).not.toBeUndefined();
      expect(domNode.className).toBe('react-tabs');
    });
  });

  describe('child props', () => {
    test('should reset ids correctly', () => {
      expectToMatchSnapshot(createTabs());

      resetIdCounter();

      expectToMatchSnapshot(createTabs());
    });
  });

  describe('interaction', () => {
    test('should update selectedIndex when clicked', () => {
      const wrapper = mount(createTabs());
      wrapper
        .find(Tab)
        .at(1)
        .simulate('click');

      assertTabSelected(wrapper, 1);
    });

    test('should update selectedIndex when tab child is clicked', () => {
      const wrapper = mount(createTabs());
      wrapper
        .find(Tab)
        .at(2)
        .childAt(0)
        .simulate('click');

      assertTabSelected(wrapper, 2);
    });

    test('should not change selectedIndex when clicking a disabled tab', () => {
      const wrapper = mount(createTabs({ defaultIndex: 0 }));
      wrapper
        .find(Tab)
        .at(3)
        .simulate('click');

      assertTabSelected(wrapper, 0);
    });
  });

  describe('performance', () => {
    test('should only render the selected tab panel', () => {
      const wrapper = mount(createTabs());
      const tabPanels = wrapper.find(TabPanel);

      expect(tabPanels.at(0).text()).toBe('Hello Foo');
      expect(tabPanels.at(1).text()).toBe('');
      expect(tabPanels.at(2).text()).toBe('');

      wrapper
        .find(Tab)
        .at(1)
        .simulate('click');

      expect(tabPanels.at(0).text()).toBe('');
      expect(tabPanels.at(1).text()).toBe('Hello Bar');
      expect(tabPanels.at(2).text()).toBe('');

      wrapper
        .find(Tab)
        .at(2)
        .simulate('click');

      expect(tabPanels.at(0).text()).toBe('');
      expect(tabPanels.at(1).text()).toBe('');
      expect(tabPanels.at(2).text()).toBe('Hello Baz');
    });

    test('should render all tabs if forceRenderTabPanel is true', () => {
      expectToMatchSnapshot(createTabs({ forceRenderTabPanel: true }));
    });
  });

  describe('validation', () => {
    test('should result with warning when tabs/panels are imbalanced', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      console.error = () => {}; // eslint-disable-line no-console
      const wrapper = shallow(
        <Tabs>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      // eslint-disable-next-line react/forbid-foreign-prop-types
      const result = Tabs.propTypes.children(
        wrapper.props(),
        'children',
        'Tabs',
      );
      expect(result).toBeInstanceOf(Error);
    });

    test('should result with warning when tab outside of tablist', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      console.error = () => {}; // eslint-disable-line no-console
      const wrapper = shallow(
        <Tabs>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
          <Tab>Foo</Tab>
          <TabPanel />
          <TabPanel />
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      // eslint-disable-next-line react/forbid-foreign-prop-types
      const result = Tabs.propTypes.children(
        wrapper.props(),
        'children',
        'Tabs',
      );
      expect(result).toBeInstanceOf(Error);
    });

    test('should result with warning when multiple tablist components exist', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      console.error = () => {}; // eslint-disable-line no-console
      const wrapper = shallow(
        <Tabs>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
          <TabPanel />
          <TabPanel />
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      // eslint-disable-next-line react/forbid-foreign-prop-types
      const result = Tabs.propTypes.children(
        wrapper.props(),
        'children',
        'Tabs',
      );
      expect(result).toBeInstanceOf(Error);
    });

    test('should result with warning when onSelect missing when selectedIndex set', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      let catchedError;
      // eslint-disable-next-line no-console
      console.error = error => {
        catchedError = error;
      };
      shallow(
        <Tabs selectedIndex={1}>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
          <TabPanel>Foo</TabPanel>
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      const expectedMessage =
        'The prop `onSelect` is marked as required in `Tabs`, but its value is `undefined` or `null`.';
      expect(catchedError).toMatch(expectedMessage);
    });

    test('should result with warning when defaultIndex and selectedIndex set', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      let catchedError;
      // eslint-disable-next-line no-console
      console.error = error => {
        catchedError = error;
      };
      shallow(
        <Tabs selectedIndex={1} defaultIndex={1}>
          <TabList>
            <Tab>Foo</Tab>
          </TabList>
          <TabPanel>Foo</TabPanel>
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      const expectedMessage =
        'The prop `selectedIndex` cannot be used together with `defaultIndex` in `Tabs`.';
      expect(catchedError).toMatch(expectedMessage);
    });

    test('should result with warning when tabs/panels are imbalanced and it should ignore non tab children', () => {
      const oldConsoleError = console.error; // eslint-disable-line no-console
      console.error = () => {}; // eslint-disable-line no-console
      const wrapper = shallow(
        <Tabs>
          <TabList>
            <Tab>Foo</Tab>
            <div>+</div>
          </TabList>

          <TabPanel>Hello Foo</TabPanel>
          <TabPanel>Hello Bar</TabPanel>
        </Tabs>,
      );
      console.error = oldConsoleError; // eslint-disable-line no-console

      // eslint-disable-next-line react/forbid-foreign-prop-types
      const result = Tabs.propTypes.children(
        wrapper.props(),
        'children',
        'Tabs',
      );
      expect(result).toBeInstanceOf(Error);
    });

    test('should allow random order for elements', () => {
      expectToMatchSnapshot(
        <Tabs forceRenderTabPanel>
          <TabPanel>Hello Foo</TabPanel>
          <TabList>
            <Tab>Foo</Tab>
            <Tab>Bar</Tab>
          </TabList>
          <TabPanel>Hello Bar</TabPanel>
        </Tabs>,
      );
    });

    test('should not throw a warning when wrong element is found', () => {
      const wrapper = shallow(
        <Tabs>
          <TabList>
            <Tab />
            <div />
          </TabList>
          <TabPanel />
        </Tabs>,
      );

      // eslint-disable-next-line react/forbid-foreign-prop-types
      const result = Tabs.propTypes.children(
        wrapper.props(),
        'children',
        'Tabs',
      );
      expect(result instanceof Error).toBe(false);
    });

    test('should be okay with rendering without any children', () => {
      expect(() => shallow(<Tabs />)).not.toThrow();
    });

    test('should be okay with rendering just TabList', () => {
      expect(() =>
        shallow(
          <Tabs>
            <TabList />
          </Tabs>,
        ),
      ).not.toThrow();
    });

    test('should gracefully render null', () => {
      expect(() =>
        shallow(
          <Tabs>
            <TabList>
              <Tab>Tab A</Tab>
              {false && <Tab>Tab B</Tab>}
            </TabList>
            <TabPanel>Content A</TabPanel>
            {false && <TabPanel>Content B</TabPanel>}
          </Tabs>,
        ),
      ).not.toThrow();
    });

    test('should support nested tabs', () => {
      const wrapper = mount(
        <Tabs className="first">
          <TabList>
            <Tab />
            <Tab />
          </TabList>
          <TabPanel>
            <Tabs className="second">
              <TabList>
                <Tab />
                <Tab />
              </TabList>
              <TabPanel />
              <TabPanel />
            </Tabs>
          </TabPanel>
          <TabPanel />
        </Tabs>,
      );

      wrapper
        .find('Tabs.second')
        .find(Tab)
        .at(1)
        .simulate('click');

      assertTabSelected(wrapper, 0);
      assertTabSelected(wrapper.find('Tabs.second'), 1);
    });

    test('should allow other DOM nodes', () => {
      expectToMatchSnapshot(
        <Tabs>
          <div id="tabs-nav-wrapper">
            <button type="button">Left</button>
            <div className="tabs-container">
              <TabList>
                <Tab />
                <Tab />
              </TabList>
            </div>
            <button type="button">Right</button>
          </div>
          <div className="tab-panels">
            <TabPanel />
            <TabPanel />
          </div>
        </Tabs>,
      );
    });
  });

  test('should pass through custom properties', () => {
    expectToMatchSnapshot(<Tabs data-tooltip="Tooltip contents" />);
  });

  test('should not add known props to dom', () => {
    expectToMatchSnapshot(<Tabs defaultIndex={3} />);
  });

  test('should cancel if event handler returns false', () => {
    const wrapper = mount(createTabs({ onSelect: () => false }));

    assertTabSelected(wrapper, 0);

    wrapper
      .find(Tab)
      .at(1)
      .simulate('click');
    assertTabSelected(wrapper, 0);

    wrapper
      .find(Tab)
      .at(2)
      .simulate('click');
    assertTabSelected(wrapper, 0);
  });

  test('should trigger onSelect handler when clicking', () => {
    let wasClicked = false;
    const wrapper = mount(
      createTabs({
        onSelect: () => {
          wasClicked = true;
        },
      }),
    );

    assertTabSelected(wrapper, 0);

    wrapper
      .find(Tab)
      .at(1)
      .simulate('click');
    assertTabSelected(wrapper, 1);
    expect(wasClicked).toBe(true);
  });

  test('should trigger onSelect handler when clicking on open tab', () => {
    let wasClicked = false;
    const wrapper = mount(
      createTabs({
        onSelect: () => {
          wasClicked = true;
        },
      }),
    );

    assertTabSelected(wrapper, 0);

    wrapper
      .find(Tab)
      .at(0)
      .simulate('click');
    assertTabSelected(wrapper, 0);
    expect(wasClicked).toBe(true);
  });

  test('should switch tabs if setState is called within onSelect', () => {
    class Wrap extends React.Component {
      state = {};

      handleSelect = () => this.setState({ foo: 'bar' });

      render() {
        const { foo } = this.state;
        return createTabs({
          onSelect: this.handleSelect,
          className: foo,
        });
      }
    }

    const wrapper = mount(<Wrap />);

    wrapper
      .find(Tab)
      .at(1)
      .simulate('click');
    assertTabSelected(wrapper, 1);

    wrapper
      .find(Tab)
      .at(2)
      .simulate('click');
    assertTabSelected(wrapper, 2);
  });

  test('should allow for higher order components', () => {
    expectToMatchSnapshot(
      <Tabs>
        <TabListWrapper>
          <TabWrapper>Foo</TabWrapper>
          <TabWrapper>Bar</TabWrapper>
        </TabListWrapper>
        <TabPanelWrapper>Foo</TabPanelWrapper>
        <TabPanelWrapper>Bar</TabPanelWrapper>
      </Tabs>,
    );
  });

  test('should allow string children', () => {
    expectToMatchSnapshot(
      <Tabs>
        Foo
        <TabList>
          Foo
          <Tab>Foo</Tab>
          Foo
          <Tab>Bar</Tab>
          Foo
        </TabList>
        <TabPanel>Bar</TabPanel>
        <TabPanel>Foo</TabPanel>
        Foo
      </Tabs>,
    );
  });
});

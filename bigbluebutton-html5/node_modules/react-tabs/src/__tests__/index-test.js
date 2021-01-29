/* eslint-env jest */
import { Tab, Tabs, TabList, TabPanel } from '../index';
import TabComponent from '../components/Tab';
import TabListComponent from '../components/TabList';
import TabsComponent from '../components/Tabs';
import TabPanelComponent from '../components/TabPanel';

describe('index.js', () => {
  it('should correctly export all component as named export', () => {
    expect(Tab).toEqual(TabComponent);
    expect(TabList).toEqual(TabListComponent);
    expect(Tabs).toEqual(TabsComponent);
    expect(TabPanel).toEqual(TabPanelComponent);
  });
});

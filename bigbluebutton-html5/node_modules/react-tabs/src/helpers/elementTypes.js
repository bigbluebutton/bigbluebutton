export function isTab(el) {
  return el.type && el.type.tabsRole === 'Tab';
}

export function isTabPanel(el) {
  return el.type && el.type.tabsRole === 'TabPanel';
}

export function isTabList(el) {
  return el.type && el.type.tabsRole === 'TabList';
}

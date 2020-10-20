import React from 'react';
import Tabs from '../tabs/Tabs';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Content from '../content/Content';
import TabsPanel from '../tabs-panel/TabsPanel';

const AppView = () => (
  <div id="main" className="flex h-screen">
    <Tabs />
    <TabsPanel />
    <section className="main-container w-11/12 py-2 px-5 flex items-center justify-between flex-col">
      <Header />
      <Content />
      <Footer />
    </section>
  </div>
);

export default AppView;

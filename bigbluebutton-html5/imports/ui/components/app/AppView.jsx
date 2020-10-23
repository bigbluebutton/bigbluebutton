import React from 'react';
import ModalContainer from '../modal/container';
import AudioContainer from '../audio/container';
import Tabs from '../tabs';
import Header from '../header';
import Footer from '../footer';
import Content from '../content';

const AppView = () => (
  <React.Fragment>
    <div id="main" className="flex h-screen">
      <Tabs />
      <section className="main-container w-11/12 py-2 px-5 flex items-center justify-between flex-col">
        <Header />
        <Content />
        <Footer />
      </section>
    </div>
    <ModalContainer />
    <AudioContainer />
  </React.Fragment>
);

export default AppView;

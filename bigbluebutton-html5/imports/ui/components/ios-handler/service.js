import React, { Component } from 'react';
import IosHandler from '/imports/ui/services/ios-handler';

export const withIosHandler = (ComponentToWrap, handlers) =>
  class IosHandlerWrapper extends ComponentToWrap {
    constructor(props) {
      super(props);

      Object.keys(handlers).forEach(k => {
        this[k] = (parameters) => {
          console.log(parameters);
          super[k](parameters);
          IosHandler[handlers[k]](parameters);
        }
      })
    }
  }

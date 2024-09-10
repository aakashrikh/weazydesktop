import React, { Component } from 'react';
import { InfinitySpin } from 'react-loader-spinner';

export class InfiniteLoader extends Component {
  render() {
    return <InfinitySpin width="150" color="#0066b2" />;
  }
}

export default InfiniteLoader;

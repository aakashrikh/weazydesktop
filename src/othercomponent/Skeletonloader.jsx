import React, { Component } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export class Skeletonloader extends Component {
  render() {
    return (
      <SkeletonTheme
        baseColor="hsl(200, 20%, 80%)"
        highlightColor="hsl(200, 20%, 95%)"
      >
        <Skeleton count={this.props.count} height={this.props.height} />
      </SkeletonTheme>
    );
  }
}

export default Skeletonloader;

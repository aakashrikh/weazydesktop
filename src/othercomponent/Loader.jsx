import React, { Component } from 'react';
import { ColorRing } from 'react-loader-spinner';

export class Loader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="main_loader">
        <ColorRing
          visible={true}
          height="40"
          width="40"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperclassName="blocks-wrapper"
          colors={['#000']}
        />
      </div>
    );
  }
}

export default Loader;

import React, { Component } from 'react';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

export class QRToggle extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      product_id: props.product_id,
      type: this.props.action_type,
    };
  }

  componentDidMount() {
    if (this.props.status == 'active') {
      this.setState({ status: true });
    } else {
      this.setState({ status: false });
    }
  }

  handleStatus = (e) => {
    if (this.state.status) {
      this.setState({ status: false });
      var status = 'inactive';
    } else {
      this.setState({ status: true });
      var status = 'active';
    }

    var product_id = this.state.product_id;
    fetch(api + 'update_qr_status_product', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        action_id: product_id,
        type: this.state.type,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  render() {
    return (
      <div className="status-toggle">
        <input
          type="checkbox"
          id={this.state.product_id}
          className="check"
          value={this.state.product_id}
          onChange={this.handleStatus}
          checked={this.state.status}
        />
        <label htmlFor={this.state.product_id} className="checktoggle"></label>
      </div>
    );
  }
}

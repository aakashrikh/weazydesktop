import React, { Component } from 'react';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

export class Toggle extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      product_id: this.props.product_id,
      type: this.props.action_type,
    };
  }

  componentDidMount() {
    if (this.props.status === 'active') {
      this.setState({ status: true });
    } else {
      this.setState({ status: false });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status) {
      if (this.props.status === 'active') {
        this.setState({ status: true });
      } else {
        this.setState({ status: false });
      }
    }
  }

  handleStatus = (e) => {
    var status;
    if (this.state.status) {
      this.setState({ status: false });
      status = 'inactive';
    } else {
      this.setState({ status: true });
      status = 'active';
    }
    fetch(api + 'update_status_product_offer', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        action_id: this.props.product_id,
        type: this.state.type,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          toast.success('Status updated successfully');
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // this.setState({ isloading: false })
      });
  };

  render() {
    return (
      <div className="status-toggle">
        <input
          type="checkbox"
          id={this.state.product_id + this.props.id}
          className="check"
          value={this.state.product_id}
          onChange={this.handleStatus}
          checked={this.state.status}
        />
        <label
          htmlFor={this.state.product_id + this.props.id}
          className="checktoggle-small"
        ></label>
      </div>
    );
  }
}

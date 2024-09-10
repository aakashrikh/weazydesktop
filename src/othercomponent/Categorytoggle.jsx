import React, { Component } from 'react';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

export class Categorytoggle extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      product_id: this.props.product_id,
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
    fetch(api + 'update_category_status_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        category_id: this.props.product_id,
        category_status: status,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
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

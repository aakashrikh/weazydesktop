import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

export class Pickuppoint extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      new_category_name: '',
      edit_category_name: '',
      category_id: '',
      is_buttonloding: false,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
  }

  fetchCategories = () => {
    fetch(api + 'fetch_pickup_point', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ category: json.data, is_loding: false });
        } else {
          this.setState({ is_loding: false, category: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  add = () => {
    if (this.state.new_category_name != '') {
      this.setState({ is_buttonloding: true });
      fetch(api + 'add_pickup_points', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          pickuppoint_name: this.state.new_category_name,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({ open: false, new_category_name: '' });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false, is_buttonloding: false });
        });
    } else {
      toast.error('Name is required!');
    }
  };

  edit = () => {
    if (this.state.edit_category_name != '') {
      this.setState({ is_buttonloding: true });
      fetch(api + 'update_pickup_point', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          pickup_point_name: this.state.edit_category_name,
          pickup_point_id: this.state.category_id,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.success(msg);
          } else {
            this.setState({ openedit: false, new_category_name: '' });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false, is_buttonloding: false });
        });
    } else {
      toast.error('Please add Pickup Point first!');
    }
  };

  delete = (id, name) => {
    fetch(api + 'delete_pickup_point', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        pickup_point_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
          toast.success('Pickup Point deleted');
          this.fetchCategories();
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Pickup Point Management</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Pickup Point Management</h4>
                </div>
                <div className="page-btn">
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                  >
                    Add New Pickup point
                  </a>
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.is_loding ? (
                <Loader />
              ) : this.state.category.length > 0 ? (
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table  datanew">
                        <thead>
                          <tr>
                            <th>S.no</th>
                            <th>Pickup Point</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.category.map((item, index) => (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{item.pickuppoint_name}</td>
                              <td>
                                <a
                                  className="me-3"
                                  onClick={() => {
                                    this.setState({
                                      openedit: true,
                                      category_id: item.id,
                                      edit_category_name: item.pickuppoint_name,
                                    });
                                  }}
                                >
                                  <img src={edit_icon} alt="img" />
                                </a>
                                <a
                                  className="confirm-text"
                                  onClick={() => {
                                    Swal.fire({
                                      title:
                                        'Are you sure you want to delete this Pickup Point?',
                                      text: "You won't be able to revert this!",
                                      showCancelButton: true,
                                      confirmButtonColor: '#0066b2',
                                      cancelButtonColor: '#d33',
                                      confirmButtonText: 'Yes, delete it!',
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        this.delete(item.id, item.name);
                                      }
                                    });
                                  }}
                                >
                                  <img src={delete_icon} alt="img" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center flex-column"
                  style={{
                    height: '70vh',
                  }}
                >
                  <img
                    src={no_img}
                    alt="img"
                    style={{
                      height: '250px',
                    }}
                  />
                  <h4>No Pickup point Found</h4>
                </div>
              )}
            </div>
          </div>
        </div>
        <Modal
          focusTrapped={false}
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add New Pickup point</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Pickup point Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.is_buttonloding ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Adding
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Add
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          focusTrapped={false}
          open={this.state.openedit}
          onClose={() => this.setState({ openedit: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Edit Pickup point</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Pickup point Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ edit_category_name: e.target.value });
                    }}
                    value={this.state.edit_category_name}
                  />
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.is_buttonloding ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Updating
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.edit();
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Update
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Pickuppoint;

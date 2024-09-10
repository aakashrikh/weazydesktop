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

export class Staffaccounts extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      add_data: [],

      edit: false,
      newaddonLoading: false,
      editaddonLoading: false,
      is_buttonloding: false,
      staff_contact: '',
      staff_name: '',
      staff_role: '',

      staff_id: '',
      staff_edit_role: '',
      staff_edit_name: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_staff();
  }

  add_staff = () => {
    if (this.state.add_data.length >= 10) {
      toast.error("You can't add more than 10 staff accounts");
      return;
    }
    const { staff_contact, staff_name, staff_role } = this.state;

    let number = /^[0]?[6789]\d{9}$/;

    if (!number.test(staff_contact)) {
      toast.error('Please enter valid contact');
      return;
    }

    this.setState({ newaddonLoading: true });

    if (staff_contact === '' || staff_name === '' || staff_role === '') {
      toast.error('Please fill all the fields');
      this.setState({ newaddonLoading: false });
    } else {
      fetch(api + 'add_staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          staff_contact: staff_contact,
          staff_name: staff_name,
          staff_role: staff_role,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            toast.success("Staff's account created successfully");
            this.setState({ newaddonLoading: false, open: false });
            this.fetch_staff();
          } else {
            if (data.errors[0] == undefined) {
              toast.error("Staff's account not created");
            } else {
              toast.error(data.errors[0]);
            }
            // toast.error("Staff's account not created");
            this.setState({ newaddonLoading: false });
          }
        })
        .catch((err) => {
          // toast.error('Something went wrong');
          // this.setState({ newaddonLoading: false });
        });
    }
  };

  //edit staff

  edit_staff = () => {
    this.setState({ newaddonLoading: true });
    const { staff_id, staff_edit_name, staff_edit_role } = this.state;

    if (staff_edit_name === '' || staff_edit_role === '') {
      toast.error('Please fill all the fields');
      this.setState({ newaddonLoading: false });
    } else {
      fetch(api + 'update_staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          staff_id: staff_id,
          staff_name: staff_edit_name,
          staff_role: staff_edit_role,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            toast.success(data.msg);
            this.setState({ newaddonLoading: false, edit: false });
            this.fetch_staff();
          } else {
            toast.error(data.msg);
            this.setState({ newaddonLoading: false });
          }
        })
        .catch((err) => {
          // toast.error('Something went wrong');
          // this.setState({ newaddonLoading: false });
        });
    }
  };

  delete_staff = (id) => {
    this.setState({ newaddonLoading: true });

    fetch(api + 'delete_staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        staff_id: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          toast.success("Staff's account deleted successfully");
          this.setState({ newaddonLoading: false, edit: false });
          this.fetch_staff();
        } else {
          toast.error("Staff's account not deleted");
          this.setState({ newaddonLoading: false });
        }
      })
      .catch((err) => {
        // toast.error('Something went wrong');
        // this.setState({ newaddonLoading: false });
      });
  };

  fetch_staff = () => {
    fetch(api + 'fetch_staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        staff_type:'all'
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          this.setState({ add_data: data.data, is_loding: false });
        } else {
          this.setState({ is_loding: false });
        }
      })
      .catch((err) => {
        this.setState({ is_loding: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Staff Accounts</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>
                    Staff Accounts{' '}
                    <span
                      className="text-muted"
                      style={{
                        fontSize: '14px',
                      }}
                    >
                      [{this.state.add_data.length} of 10]
                    </span>
                  </h4>
                </div>
                {/* display this button only till the this.state.add_data.length is less than or equal to 10*/}
                {this.state.add_data.length <= 10 ? (
                  <div className="page-btn">
                    <a
                      className="btn btn-added"
                      onClick={() => {
                        this.setState({ open: true });
                      }}
                    >
                      Create Staff Account
                    </a>
                  </div>
                ) : null}
              </div>

              <Topnav array="setup" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  {this.state.add_data.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Name</th>
                              <th>Phone Number</th>
                              <th>Role</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.add_data.map((item, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.staff_name}</td>
                                <td>{item.staff_contact}</td>
                                <td
                                  style={{
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {item.staff_role}
                                </td>
                                <td>
                                  {item.staff_role !== 'owner' ? (
                                    <>
                                      <a>
                                        <img
                                          className="me-3"
                                          src={edit_icon}
                                          alt="img"
                                          onClick={() => {
                                            this.setState({
                                              staff_edit_name: item.staff_name,
                                              staff_edit_role: item.staff_role,
                                              edit: true,
                                              staff_id: item.staff_id,
                                            });
                                          }}
                                        />
                                      </a>
                                      <a
                                        className="confirm-text"
                                        onClick={() =>
                                          Swal.fire({
                                            title:
                                              'Are you sure you want to delete this staff account?',
                                            text: "You won't be able to revert this!",
                                            showCancelButton: true,
                                            confirmButtonColor: '#0066b2',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText:
                                              'Yes, delete it!',
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              this.delete_staff(item.staff_id);
                                            }
                                          })
                                        }
                                      >
                                        <img src={delete_icon} alt="img" />
                                      </a>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                      <h4 className="mt-4">No Staff Found</h4>
                    </div>
                  )}
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
                <h4>Add New Staff</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ staff_name: e.target.value });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Mobile number
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    onChange={(e) => {
                      this.setState({
                        staff_contact: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Role
                    <span className="text-danger">*</span>
                  </label>

                  <select
                    onChange={(e) => {
                      this.setState({
                        staff_role: e.target.value,
                      });
                    }}
                    className="form-control"
                  >
                    <option selected disabled>
                      Select Role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="delivery_partner">Delivery Partner</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.newaddonLoading ? (
                  <button
                    className="btn btn-secondary btn-sm me-2"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    Adding...
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.add_staff();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add Staff
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.edit}
          onClose={() => this.setState({ edit: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Edit Role</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ staff_edit_name: e.target.value });
                    }}
                    value={this.state.staff_edit_name}
                  />
                </div>
                {/* <div className="form-group">
                      <label>
                        Mobile number
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({
                            staff_contact: e.target.value,
                          });
                        }}
                      />
                    </div> */}

                <div className="form-group">
                  <label>
                    Role
                    <span className="text-danger">*</span>
                  </label>

                  <select
                    onChange={(e) => {
                      this.setState({
                        staff_edit_role: e.target.value,
                      });
                    }}
                    className="form-control"
                    value={this.state.staff_edit_role}
                  >
                    <option selected disabled>
                      Select Role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="delivery_partner">Delivery Partner</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.newaddonLoading ? (
                  <button
                    className="btn btn-secondary btn-sm me-2"
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
                      this.edit_staff();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Update Staff
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

export default Staffaccounts;

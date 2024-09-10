import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Skeletonloader from '../othercomponent/Skeletonloader';

export class Roomlist extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      adding_table: false,
      edit_modal: false,
      edit_table_name_button: false,
      add_modal: false,
      open: false,
      status: '',
      room_name: '',
      category_id: '',
      pricePerDay: '',
      adult: '',
      child: '',
      tax: '',
      extraBedLimit: '',
      extraBedPrice: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_table_vendors();

    window.Echo.private(`checkTableStatus.` + this.context.user.id).listen(
      '.server.created',
      (e) => {
        this.setState({ data: e.tables });
      }
    );
  }

  fetch_table_vendors = () => {
    fetch(api + 'fetch_table_vendors', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ data: json.data, isLoading: false });
        } else {
          this.setState({ data: [], isLoading: false });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  delete_table = (id) => {
    fetch(api + 'delete_table_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error('Something went wrong! Please try again later.');
        } else {
          toast.success(json.msg);
          this.fetch_table_vendors();
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  add = () => {
    this.setState({ table_load: true, adding_table: true });
    fetch(api + 'add_new_table_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_name: this.state.table_name,
        capacity: this.state.capacity,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
          // toast.success(json.msg);
          this.setState({ table_name: '', capacity: 4 });
          toast.success('Dine In Added Successfully');

          this.fetch_table_vendors();
        }
        this.setState({ add_modal: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ table_load: false, adding_table: false });
      });
  };

  edit_table_name = () => {
    this.setState({ edit_table_name_button: true });
    fetch(api + 'edit_table_name', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: this.state.table_name_to_edit_id,
        table_name: this.state.table_name_to_edit,
        capacity: this.state.capacity,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error('Something went wrong! Please try again later.');
        } else {
          this.setState({ table_name: '', capacity: 4 });
          toast.success(json.msg);
          this.fetch_table_vendors();
          this.setState({
            edit_modal: false,
          });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ edit_table_name_button: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Room Management</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title d-flex align-items-center justify-content-between w-100">
                  <h4>Room Management</h4>
                  {this.state.adding_table ? (
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      style={{
                        pointerEvents: 'none',
                        opacity: '0.8',
                      }}
                    >
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Adding...
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => {
                        this.setState({ add_modal: true });
                      }}
                    >
                      Add Room
                    </button>
                  )}
                </div>
              </div>

              {/* <div className="row">
                <div
                  className="col-md-12  pb-2 mb-3 mt-3 "
                  style={{ borderBottom: '1px solid #ececec' }}
                >
                  <Link to="/roomlist" className="new-tabs-for-page-top active">
                    Room List
                  </Link>
                  <Link to="/pickuppoint" className="new-tabs-for-page-top ">
                    Reservation
                  </Link>

                  <Link to="/kitchens" className="new-tabs-for-page-top">
                    Checkout
                  </Link>

                  <Link to="/staffaccounts" className="new-tabs-for-page-top ">
                    Modify Booking
                  </Link>
                </div>
              </div> */}

              <div className="comp-sec-wrapper">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-12">
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == '' ? ' active' : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                isLoading: true,
                                status: '',
                                page: 1,
                              });
                              this.fetch_order(1, '');
                            }}
                          >
                            All
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'confirmed'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                isLoading: true,
                                status: 'confirmed',
                                page: 1,
                              });
                              this.fetch_order(1, 'confirmed');
                            }}
                          >
                            Suite
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'in_process'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                isLoading: true,
                                status: 'in_process',
                                page: 1,
                              });
                              this.fetch_order(1, 'in_process');
                            }}
                          >
                            Normal
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'processed'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                isLoading: true,
                                status: 'processed',
                                page: 1,
                              });
                              this.fetch_order(1, 'processed');
                            }}
                          >
                            Classic
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
              {this.state.data.length > 0 && (
                <div className="dashboard-status-card">
                  <div className="row w-100">
                    {this.state.isLoading ? (
                      <Skeletonloader count={1} height={100} />
                    ) : this.state.data.length > 0 ? (
                      this.state.data.map((item, index) => {
                        return (
                          <div key={index} className="col-lg-2 col-sm-6 col-12">
                            <Link
                              to={
                                item.table_status === 'active'
                                  ? '/viewroom'
                                  : '/reservation'
                              }
                              className=" d-flex w-100"
                            >
                              <div
                                className={
                                  item.table_status === 'active'
                                    ? 'dash-count1'
                                    : 'dash-count'
                                }
                              >
                                <h4>{item.table_name}</h4>
                                <div className="d-flex align-items-center">
                                  <i className="iconly-User3 icli sidebar_icons me-1"></i>
                                  {item.capacity}
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          focusTrapped={false}
          open={this.state.add_modal}
          onClose={() => this.setState({ add_modal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add New Room</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Room Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ room_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <div className="d-flex align-items-center justify-content-between">
                    <label>Category</label>
                  </div>
                  <div className="row">
                    <div className="col-10 pe-0">
                      <select
                        onChange={(e) => {
                          this.setState({ category_id: e.target.value });
                          // alert(e.target.value);
                        }}
                        className="select-container"
                      >
                        <option disabled selected>
                          Choose Category
                        </option>
                        <option value="1">Suite</option>
                        <option value="2">Normal</option>
                        <option value="3">Classic</option>
                      </select>
                    </div>
                    <div className="col-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: '35px' }}
                        onClick={() => {
                          this.setState({ open: true });
                        }}
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Price / Day
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ pricePerDay: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Adult
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ adult: e.target.value });
                    }}
                    value={this.state.adult}
                    defaultValue="1"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Child
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ child: e.target.value });
                    }}
                    defaultValue="1"
                    value={this.state.child}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Tax
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ tax: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Extra Bed Limit
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ extraBedLimit: e.target.value });
                    }}
                    value={this.state.extraBedLimit}
                    defaultValue="1"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Extra Bed Price
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ extraBedPrice: e.target.value });
                    }}
                    value={this.state.extraBedPrice}
                  />
                </div>
              </div>

              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.adding_table ? (
                  <button
                    className="btn btn-sm btn-secondary me-2"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Loading...
                  </button>
                ) : (
                  <a
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-sm btn-secondary me-2"
                  >
                    Add New
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.edit_modal}
          onClose={() => this.setState({ edit_modal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Edit Room</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Room Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ room_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <div className="d-flex align-items-center justify-content-between">
                    <label>Category</label>
                  </div>
                  <div className="row">
                    <div className="col-10 pe-0">
                      <select
                        onChange={(e) => {
                          this.setState({ category_id: e.target.value });
                          // alert(e.target.value);
                        }}
                        className="select-container"
                      >
                        <option disabled selected>
                          Choose Category
                        </option>
                        <option value="1">Suite</option>
                        <option value="2">Normal</option>
                        <option value="3">Classic</option>
                      </select>
                    </div>
                    <div className="col-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: '35px' }}
                        onClick={() => {
                          this.setState({ open: true });
                        }}
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Price / Day
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ pricePerDay: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Adult
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ adult: e.target.value });
                    }}
                    value={this.state.adult}
                    defaultValue="1"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Child
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ child: e.target.value });
                    }}
                    defaultValue="1"
                    value={this.state.child}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Tax
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ tax: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Extra Bed Limit
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ extraBedLimit: e.target.value });
                    }}
                    value={this.state.extraBedLimit}
                    defaultValue="1"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="form-group">
                  <label>
                    Extra Bed Price
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ extraBedPrice: e.target.value });
                    }}
                    value={this.state.extraBedPrice}
                  />
                </div>
              </div>

              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.adding_table ? (
                  <button
                    className="btn btn-sm btn-secondary me-2"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Updating...
                  </button>
                ) : (
                  <a
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-sm btn-secondary me-2"
                  >
                    Update
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

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
                <h4>Add Category</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.add_category_loading ? (
                  <button
                    className="btn btn-secondary btn-sm  me-2"
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
                  <button
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm  me-2"
                  >
                    Add Category
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Roomlist;

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import no_order from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

export class DineinList extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      adding_table: false,
      edit_modal: false,
      edit_table_name_button: false,
      table_name_to_edit_id: '',
      table_name_to_edit: '',
      table_name: '',
      add_modal: false,
      capacity: 4,
      table_category: '',
      table_category_to_edit: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_table_vendors();

    this.timerID = setInterval(() => {
      this.fetch_table_vendors();
    }, 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
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
        table_category: this.state.table_category,
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
        table_category: this.state.table_category_to_edit,
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
          <title>Dine In Management</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title d-flex align-items-center justify-content-between w-100">
                  <h4>Dine In Management</h4>
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
                      Adding
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => {
                        this.setState({ add_modal: true });
                      }}
                    >
                      Add Dine in
                    </button>
                  )}
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.isLoading ? (
                <Loader />
              ) : (
                <>
                  {this.state.data.length > 0 ? (
                    this.state.data.map((category, index) => (
                      <>
                        <h4>{category.table_category}</h4>
                        <div className="card">
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table  datanew">
                                <thead>
                                  <tr>
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Sitting</th>
                                    <th>Status</th>
                                    <th>QR Code</th>
                                    <th style={{ textAlign: 'end' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {category.tables.map((item, index) => {
                                    return (
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>
                                          <a
                                            onClick={() => {
                                              this.setState({
                                                edit_modal: true,
                                                table_name_to_edit_id:
                                                  item.table_uu_id,
                                                table_name_to_edit:
                                                  item.table_name,
                                                capacity: item.capacity,
                                                table_category_to_edit:
                                                  item.table_category,
                                              });
                                            }}
                                          >
                                            {item.table_name}
                                          </a>
                                        </td>
                                        <td>{item.capacity}</td>
                                        <td>
                                          <span
                                            className={
                                              item.table_status == 'active'
                                                ? 'text-success'
                                                : 'text-warning'
                                            }
                                            style={{
                                              textTransform: 'capitalize',
                                            }}
                                          >
                                            {item.table_status}
                                          </span>
                                        </td>

                                        <td>
                                          <a
                                            href={item.qr_link}
                                            target="_blank"
                                          >
                                            <i
                                              className="fa fa-qrcode"
                                              style={{
                                                marginRight: '10px',
                                              }}
                                            ></i>
                                            QR Code
                                          </a>
                                        </td>
                                        <td>
                                          <div className="d-flex justify-content-end">
                                            <Link
                                              to={
                                                '/viewtableorder/' +
                                                item.table_uu_id
                                              }
                                            >
                                              <button
                                                className="btn btn-secondary table-action-btn"
                                                style={{
                                                  marginRight: '10px',
                                                  padding: '2px 6px',
                                                }}
                                              >
                                                <i className="fa fa-eye"></i>
                                              </button>
                                            </Link>
                                            <img
                                              src={delete_icon}
                                              alt="img"
                                              style={{
                                                cursor: 'pointer',
                                              }}
                                              onClick={() => {
                                                Swal.fire({
                                                  title:
                                                    'Are you sure you want to delete this table?',
                                                  text: "You won't be able to revert this!",
                                                  showCancelButton: true,
                                                  confirmButtonColor: '#0066b2',
                                                  cancelButtonColor: '#d33',
                                                  confirmButtonText:
                                                    'Yes, delete it!',
                                                  cancelButtonText:
                                                    'No, cancel!',
                                                }).then((result) => {
                                                  if (result.isConfirmed) {
                                                    this.delete_table(
                                                      item.table_uu_id
                                                    );
                                                  }
                                                });
                                              }}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    ))
                  ) : (
                    <div
                      className="content"
                      style={{
                        height: '60vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <img src={no_order} alt="img" />
                      <h4>
                        {' '}
                        Sorry, we couldn't find any records at this moment.{' '}
                      </h4>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <Modal
          focusTrapped={false}
          open={this.state.add_modal}
          // open={true}
          onClose={() => this.setState({ add_modal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add new dine-in </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    New Dine-In Name{' '}
                    <span
                      className="text-muted"
                      style={{
                        fontSize: '10px',
                      }}
                    >
                      (Name will be auto generated if not filled.){' '}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ table_name: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Category
                    <span
                      className="text-muted"
                      style={{
                        fontSize: '10px',
                      }}
                    ></span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ table_category: e.target.value });
                    }}
                    value={this.state.table_category}
                  />
                </div>
              </div>
              {this.state.data.map((category, index) => (
                <>
                  {category.table_category == this.state.table_category ? (
                    <div
                      onClick={() =>
                        this.setState({
                          table_category: category.table_category,
                        })
                      }
                      className=""
                      style={{
                        cursor: 'pointer',
                        marginBottom: '5px',
                        marginTop: '5px',
                        marginRight: '10px',
                        marginLeft: '10px',
                        backgroundColor: '#0066b2',
                        borderRadius: '5px',
                        width: 'auto',
                        color: '#eee',
                      }}
                    >
                      <p>{category.table_category}</p>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        this.setState({
                          table_category: category.table_category,
                        })
                      }
                      className=""
                      style={{
                        cursor: 'pointer',
                        marginBottom: '5px',
                        marginTop: '5px',
                        marginRight: '10px',
                        marginLeft: '10px',
                        backgroundColor: '#787878',
                        borderRadius: '5px',
                        width: 'auto',
                        color: '#eee',
                      }}
                    >
                      <p>{category.table_category}</p>
                    </div>
                  )}
                </>
              ))}

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Sitting</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ capacity: e.target.value });
                    }}
                    value={this.state.capacity}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                  </select>
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
                <h4>Edit Dine-In</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>New Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ table_name_to_edit: e.target.value });
                    }}
                    value={this.state.table_name_to_edit}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>New Category</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ table_category_to_edit: e.target.value });
                    }}
                    value={this.state.table_category_to_edit}
                  />
                </div>
              </div>

              {this.state.data.map((category, index) => (
                <>
                  {category.table_category ==
                  this.state.table_category_to_edit ? (
                    <div
                      onClick={() =>
                        this.setState({
                          table_category_to_edit: category.table_category,
                        })
                      }
                      className=""
                      style={{
                        cursor: 'pointer',
                        marginBottom: '5px',
                        marginTop: '5px',
                        marginRight: '10px',
                        marginLeft: '10px',
                        backgroundColor: '#0066b2',
                        borderRadius: '5px',
                        width: 'auto',
                        color: '#eee',
                      }}
                    >
                      <p>{category.table_category}</p>
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        this.setState({
                          table_category_to_edit: category.table_category,
                        })
                      }
                      className=""
                      style={{
                        cursor: 'pointer',
                        marginBottom: '5px',
                        marginTop: '5px',
                        marginRight: '10px',
                        marginLeft: '10px',
                        backgroundColor: '#787878',
                        borderRadius: '5px',
                        width: 'auto',
                        color: '#eee',
                      }}
                    >
                      <p>{category.table_category}</p>
                    </div>
                  )}
                </>
              ))}

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Sitting</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ capacity: e.target.value });
                    }}
                    value={this.state.capacity}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4" selected>
                      4
                    </option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.edit_table_name_button ? (
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
                    Updating
                  </button>
                ) : (
                  <a
                    onClick={() => {
                      this.edit_table_name();
                    }}
                    className="btn btn-sm btn-secondary me-2"
                  >
                    Update Name
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

export default DineinList;

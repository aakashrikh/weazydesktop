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

class Inventorycategory extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      new_category_name: '',
      category_id: '',
      is_buttonloding: false,
      parent_category_id: '',
      category_status: 'active',
      parent_category_id_edit: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
  }

  fetchCategories = () => {
    fetch(api + 'fetch_inventory_category', {
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
          this.setState({ category: json.data.data });
          this.setState({ is_loding: false });
        } else {
          this.setState({ category: [], is_loding: false });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  add = () => {
    if (
      this.state.new_category_name != '' ||
      this.state.parent_category_id != ''
    ) {
      this.setState({ is_buttonloding: true });
      fetch(api + 'create_inventory_category', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          category_name: this.state.new_category_name,
          category_status: 'active',
          category_parent: this.state.parent_category_id,
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
      toast.error('Please fill all required fields!');
    }
  };

  edit = () => {
    if (this.state.category_id == this.state.parent_category_id_edit) {
      toast.error('Category can not be parent of itself!');
    } else if (
      this.state.new_category_name != '' ||
      this.state.parent_category_id_edit != ''
    ) {
      this.setState({ is_buttonloding: true });
      fetch(api + 'update_inventory_category', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          category_name: this.state.new_category_name,
          category_id: this.state.category_id,
          category_status: this.state.category_status,
          category_parent: this.state.parent_category_id_edit,
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
      toast.error('Please fill all required fields!');
    }
  };

  delete = (id) => {
    fetch(api + 'delete_inventory_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        category_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.show(msg);
        } else {
          toast.success('Category deleted');
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
          <title>Stock Category</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Stock Category</h4>
                </div>
                <div className="page-btn">
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                  >
                    Add New Category
                  </a>
                </div>
              </div>

              <Topnav array="inventory" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  {this.state.category.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Category</th>
                              <th>Parent</th>
                              <th>Products Count</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.category.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.category_name}</td>
                                <td>
                                  {item.parent != null
                                    ? item.parent.category_name
                                    : 'None'}
                                </td>
                                <td>{item.products_count}</td>
                                <td
                                  className={
                                    item.category_status == 'active'
                                      ? 'text-success text-capitalize'
                                      : 'text-danger text-capitalize'
                                  }
                                >
                                  {item.category_status}
                                </td>
                                <td>
                                  <a
                                    className="me-3"
                                    onClick={() => {
                                      this.setState({
                                        openedit: true,
                                        category_id: item.id,
                                        new_category_name: item.category_name,
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
                                          'Are you sure you want to delete this category?',
                                        text: 'All the products under this category will also be deleted',
                                        showCancelButton: true,
                                        confirmButtonColor: '#0066b2',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Yes, delete it!',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          this.delete(item.id);
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
                      <h4>No Category Found</h4>
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
                <h4>Add Category</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Choose Parent Categry <span className="text-danger">*</span>
                  </label>
                  <select
                    onChange={(e) => {
                      this.setState({ parent_category_id: e.target.value });
                      // alert(e.target.value);
                    }}
                    className="select-container"
                  >
                    <option>Choose Parent Category</option>
                    <option value={0}>None</option>
                    {this.state.category.length > 0 &&
                      this.state.category.map((item, index) => (
                        <option value={item.id} key={index}>
                          {item.category_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.is_buttonloding ? (
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
                    Adding
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add Category
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
                <h4>Edit Category</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Category Name
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                    value={this.state.new_category_name}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Category Status
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    onChange={(e) => {
                      this.setState({ category_status: e.target.value });
                    }}
                    className="select-container"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Choose Parent Categry <span className="text-danger">*</span>
                  </label>
                  <select
                    onChange={(e) => {
                      this.setState({
                        parent_category_id_edit: e.target.value,
                      });
                      // alert(e.target.value);
                    }}
                    className="select-container"
                  >
                    <option>Choose Parent Category</option>
                    <option value={0}>Parent Category</option>
                    {this.state.category.length > 0 &&
                      this.state.category.map((item, index) => (
                        <option value={item.id} key={index}>
                          {item.category_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.is_buttonloding ? (
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
                      this.edit();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Update Category
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

export default Inventorycategory;

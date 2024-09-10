import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_img_cat from '../assets/images/diet.png';
import upload from '../assets/images/icons/upload.svg';
import no_img from '../assets/images/no_product.webp';
import { Categorytoggle } from '../othercomponent/Categorytoggle';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

export class Categorylist extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      new_category_name: '',
      new_sort_order:'',
      is_buttonloding: false,
      edit_category_image: '',
      new_category_image: '',
      add_category_image: [],
      images: [],
      category_id: '',
      deleteCategoryLoader: false,
      sort_order:0,
      parent_id:0,
      new_parent_id:0
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
  }

  fetchCategories = () => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        status: 'all',
        sort_by:'sort_order'
      }),
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
    var formD = new FormData();
    formD.append('category_name', this.state.new_category_name);
    formD.append('sort_order', this.state.sort_order);
    formD.append('parent_id', this.state.parent_id);
    formD.append('status', 'active');
    if (this.state.images.length > 0) {
      this.state.images.map((item, index) => {
        formD.append('category_img', item);
      });
    }
    if (this.state.new_category_name != '') {
      this.setState({ is_buttonloding: true });
      fetch(api + 'create_category_vendor', {
        method: 'POST',
        headers: {
          Authorization: this.context.token,
        },
        body: formD,
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
      toast.error('Please enter Category Name first!');
    }
  };

  edit = () => {
    var formD = new FormData();
    if (this.state.new_category_name != '') {
      formD.append('name', this.state.new_category_name);
      formD.append('sort_order', this.state.new_sort_order);
      formD.append('status', 'active');
      formD.append('category_id', this.state.category_id);
      formD.append('parent_id', this.state.new_parent_id);
      if (this.state.images.length > 0) {
        this.state.images.map((item, index) => {
          formD.append('category_img', item);
        });
      }

      this.setState({ is_buttonloding: true });
      fetch(api + 'edit_category', {
        method: 'POST',
        headers: {
          Authorization: this.context.token,
        },
        body: formD,
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
      toast.error('Please add Category first!');
    }
  };

  delete = (id, name) => {
    this.setState({ deleteCategoryLoader: true });
    fetch(api + 'update_category_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        category_id: id,
        category_name: name,
        category_status: 'delete',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
          toast.success('Category deleted');
          this.fetchCategories();
          this.setState({
            openedit: false,
            new_category_name: '',
            category_id: '',
          });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ deleteCategoryLoader: false });
      });
  };

  uploadImage = async (e) => {
    let image = this.state.images;
    image.push(e.target.files[0]);
    this.setState({ images: image });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Categories</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Category List</h4>
                </div>
                <div className="page-btn">
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({ open: true, images: [] });
                    }}
                  >
                    Add New Category
                  </a>
                </div>
              </div>

              <Topnav array="catalogue" />

              {this.state.is_loding ? (
                <Loader />
              ) : this.state.category.length > 0 ? (
                <div className="row">
                  {this.state.category.map((item, index) => {
                    return (
                      <div className="col-md-4" key={index}>
                        <div className="card cursor-pointer">
                          <div className="card-body">
                            <div className="row">
                              <div
                                className="col-md-3 d-flex align-items-center justify-content-center"
                                onClick={() => {
                                  //  alert(item.parent_id);
                                  this.setState({
                                    openedit: true,
                                    images: [],
                                    category_id: item.id,
                                    new_category_name: item.name,
                                    new_category_image: item.category_image,
                                    new_parent_id: item.parent_id,
                                  });
                                }}
                              >
                                {item.category_image != null ? (
                                  <img
                                    src={item.category_image}
                                    alt="img"
                                    style={{
                                      width: '100%',
                                      objectFit: 'contain',
                                      height: '65px',
                                      minHeight: '65px',
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={no_img_cat}
                                    alt="img"
                                    style={{
                                      width: '100%',
                                      objectFit: 'contain',
                                      height: '65px',
                                      minHeight: '65px',
                                    }}
                                  />
                                )}
                              </div>
                              <div
                                className="col-md-7"
                                onClick={() => {
                                  this.setState({
                                    openedit: true,
                                    images: [],
                                    category_id: item.id,
                                    new_sort_order: item.sort_order,
                                    new_category_name: item.name,
                                    new_category_image: item.category_image,
                                    new_parent_id: item.parent_id,
                                  });
                                }}
                              >
                                <p className="mb-1">
                                  <strong>{item.name}</strong>
                                </p>
                                <p className="m-0">
                                  {item.products_count} Products
                                </p>
                              </div>
                              <div className="col-md-2 d-flex align-items-start justify-content-end">
                                <Categorytoggle
                                  id={item.id + 1}
                                  status={item.status}
                                  product_id={item.id}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      height: '400px',
                    }}
                  />
                  <h4> Sorry, we couldn't find any records at this moment. </h4>
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
                <h4>Add New Category</h4>
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

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ sort_order: e.target.value });
                    }}
                  />
                </div>
              </div>


              <div className="col-lg-12">
                <div className="form-group">
                  <label>Parent Category</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ parent_id: e.target.value });
                    }}
                  >
                    <option value="0">No Parent</option>
                    {this.state.category.map((item, index) => {
                      return (
                        <option value={item.id} key={index}>
                          {item.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Category Image</label>
                  <div
                    className="image-upload"
                    style={{
                      width: '200px',
                      height: '200px',
                    }}
                  >
                    {this.state.images.length > 0 ? null : (
                      <input
                        type={'file'}
                        accept=".png, .jpg, .jpeg"
                        className="upload"
                        onChange={(e) => {
                          this.uploadImage(e);
                        }}
                        style={{
                          width: '200px',
                          height: '200px',
                        }}
                      />
                    )}
                    <div className="image-uploads p-0 d-flex align-items-center justify-content-center">
                      {this.state.images.length > 0 ? (
                        this.state.images.map((item, index) => {
                          return (
                            <img
                              id="target"
                              src={URL.createObjectURL(item)}
                              style={{
                                width: '200px',
                                height: '200px',
                              }}
                              alt="img"
                            />
                          );
                        })
                      ) : (
                        <>
                          <img src={upload} alt="img" />
                          <h4>Upload image here...</h4>
                        </>
                      )}
                    </div>
                  </div>
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
                  <label>Category Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                    value={this.state.new_category_name}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_sort_order: e.target.value });
                    }}
                    value={this.state.new_sort_order}
                  />
                </div>
              </div>


              <div className="col-lg-12">
                <div className="form-group">
                  <label>Parent Category </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ new_parent_id: e.target.value });
                    }}
                    value={this.state.new_parent_id}
                  >
                    <option value="0">No Parent</option>
                    {this.state.category.map((item, index) => {
                      return (
                        <option value={item.id} key={index}>
                          {item.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Category Image </label>
                  <div
                    className="image-upload"
                    style={{
                      width: '200px',
                      height: '200px',
                    }}
                  >
                    <div className="image-uploads p-0 d-flex align-items-center justify-content-center">
                      {this.state.images.length > 0 ? (
                        <img
                          src={URL.createObjectURL(this.state.images[0])}
                          alt="img"
                          style={{
                            width: '200px',
                            height: '200px',
                          }}
                        />
                      ) : this.state.new_category_image != null ? (
                        <img
                          src={this.state.new_category_image}
                          alt="img"
                          style={{
                            width: '200px',
                            height: '200px',
                          }}
                        />
                      ) : (
                        <img
                          src={no_img_cat}
                          alt="img"
                          style={{
                            width: '200px',
                            height: '200px',
                          }}
                        />
                      )}
                    </div>
                    {this.state.images.length > 0 ? null : (
                      <input
                        type={'file'}
                        accept=".png, .jpg, .jpeg"
                        className="upload"
                        onChange={(e) => {
                          this.uploadImage(e);
                        }}
                        style={{
                          width: '200px',
                          height: '200px',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-between">
                {this.state.deleteCategoryLoader ? (
                  <button
                    className="btn btn-danger btn-sm me-2"
                    style={{
                      pointerEvents: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Deleting...
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure you want to delete this category?',
                        text: 'All the products under this category will also be deleted',
                        showCancelButton: true,
                        confirmButtonColor: '#0066b2',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          this.delete(
                            this.state.category_id,
                            this.state.new_category_name
                          );
                        }
                      });
                    }}
                    className="btn btn-danger btn-sm me-2"
                  >
                    Delete Category
                  </a>
                )}
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

export default Categorylist;

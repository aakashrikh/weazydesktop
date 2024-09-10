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

export class Kitchens extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      kitchen_name: '',
      new_category_name: '',
      category_id: '',
      is_buttonloding: false,
      productsKitchenModal: false,
      data: [],
      selectedProducts: [],
      kitchen_id: 0,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchKitchens();
  }

  categoryCheckbox = (item, index) => {
    let data = this.state.data;
    let selectedProducts = this.state.selectedProducts;
    if (item.target.checked) {
      data[index].checked = true;
      data[index].products.map((product) => {
        product.checked = true;
        selectedProducts.push(product.id);
      });
    } else {
      data[index].checked = false;
      data[index].products.map((product) => {
        product.checked = false;
        selectedProducts = selectedProducts.filter(
          (selectedProduct) => selectedProduct !== product.id
        );
      });
    }
    data.map((item) => {
      let count = 0;
      item.products.map((itemProduct) => {
        if (itemProduct.checked) {
          count++;
        }
      });
      if (count === item.products.length) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
    this.setState({ data, selectedProducts });
  };

  productCheckbox = (product, index) => {
    var selectedProduct = this.state.selectedProducts;
    var product_id = parseInt(product.target.id);
    if (product.target.checked) {
      if (!selectedProduct.includes(product_id)) {
        selectedProduct.push(product_id);
      }
    } else {
      var index = selectedProduct.indexOf(product_id);
      if (index > -1) {
        selectedProduct.splice(index, 1);
      }
    }
    this.setState({ selectedProducts: selectedProduct });
  };

  fetchKitchens = () => {
    fetch(api + 'fetch_kitchens', {
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
          this.setState({
            category: json.data,
            is_loding: false,
            data: json.products,
          });
        } else {
          this.setState({ is_loding: false, category: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  add = () => {
    if (this.state.kitchen_name != '') {
      this.setState({ is_buttonloding: true });
      fetch(api + 'add_kitchen', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          kitchen_name: this.state.kitchen_name,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({ open: false, kitchen_name: '' });
            toast.success(json.msg);
            this.fetchKitchens();
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

  update_kitchen_products = () => {
    this.setState({ is_buttonloding: true });
    fetch(api + 'vendor_kitchen_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        kitchen_id: this.state.kitchen_id,
        products: this.state.selectedProducts,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ productsKitchenModal: false, selectedProducts: [] });
          toast.success(json.msg);
          this.fetchKitchens();
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false, is_buttonloding: false });
      });
  };

  edit = () => {
    if (this.state.new_category_name != '') {
      this.setState({ is_buttonloding: true });
      fetch(api + 'update_kitchen', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          kitchen_id: this.state.category_id,
          kitchen_name: this.state.new_category_name,
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
            this.fetchKitchens();
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
      toast.error('Please add Kitchen first!');
    }
  };

  delete = (id) => {
    fetch(api + 'delete_kitchen', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        kitchen_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          toast.success('Kitchen deleted');
          this.fetchKitchens();
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  setproducts = (products, kitchen_id) => {
    let data = [];
    products.map((item) => {
      data.push(item.product_id);
    });
    this.setState({ selectedProducts: data, kitchen_id: kitchen_id });
  };
  render() {
    return (
      <>
        <Helmet>
          <title>Kitchen Management</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Kitchens List</h4>
                </div>
                <div className="page-btn">
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                  >
                    Add New Kitchen
                  </a>
                </div>
              </div>

              <Topnav array="setup" />

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
                              <th>Kitchens</th>
                              <th>Products</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.category.map((item, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.kitchen_name}</td>
                                <td>
                                  <p
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      this.setproducts(
                                        item.kitchen_product,
                                        item.id
                                      );
                                      this.setState({
                                        productsKitchenModal: true,
                                      });
                                    }}
                                  >
                                    Products
                                  </p>
                                </td>
                                <td>
                                  <a
                                    className="me-3"
                                    onClick={() => {
                                      this.setState({
                                        openedit: true,
                                        category_id: item.id,
                                        new_category_name: item.kitchen_name,
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
                                          'Are you sure you want to delete this Kitchen?',
                                        text: "You won't be able to revert this!",
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
                      <h4>No Pickup point Found</h4>
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
                <h4>Add New Kitchen </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Kitchen Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ kitchen_name: e.target.value });
                    }}
                  />
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
                <h4>Edit Kitchen </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Kitchen Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                    value={this.state.new_category_name}
                  />
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
                    Update Kitchen
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          focusTrapped={false}
          open={this.state.productsKitchenModal}
          onClose={() => this.setState({ productsKitchenModal: false })}
          center
          classNames={{
            modal: 'customModalBig',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Kitchen Products</h4>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="row">
                    {this.state.data.map((item, index) => {
                      if (item.products.length > 0) {
                        return (
                          <div className="col-md-4">
                            <div className="card">
                              <div className="card-header p-2 d-flex align-items-center">
                                <label
                                  className="form-check-label"
                                  for={item.id}
                                  style={{ fontSize: '1.2rem' }}
                                >
                                  {item.name}
                                </label>
                              </div>
                              <div className="card-body p-2">
                                <div className="row">
                                  {item.products.map((product, index) => {
                                    return (
                                      <div className="col-md-6 mb-2">
                                        <div className="form-check">
                                          <input
                                            className="form-check-input me-2"
                                            type="checkbox"
                                            value={product.name}
                                            id={product.id}
                                            onChange={(product) => {
                                              this.productCheckbox(
                                                product,
                                                index
                                              );
                                            }}
                                            defaultChecked={this.state.selectedProducts.includes(
                                              product.id
                                            )}
                                          />
                                          <label
                                            className="form-check-label"
                                            for={product.id}
                                          >
                                            {product.product_name}
                                          </label>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
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
                          this.update_kitchen_products();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Update Kitchen Product
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Kitchens;

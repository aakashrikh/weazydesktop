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

export class Suppliers extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      new_category_name: '',
      is_buttonloding: false,
      name: '',
      email: '',
      contact: '',
      address: '',
      gstin: '',
      suplier_id: '',
      productsKitchenModal: false,
      products:[],
      selectedProducts: [],
      supplier_id:0
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
    this.fetchProducts(0, 1);
  }

  fetchCategories = () => {
    fetch(api + 'fetch_supplier', {
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
    let gstRegex = new RegExp(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    );
    let number = /^[0]?[6789]\d{9}$/;
    if (this.state.name == '') {
      toast.error('Please enter name');
      return;
    }
    if (this.state.contact == '') {
      toast.error('Please enter contact');
      return;
    }
    if (!number.test(this.state.contact)) {
      toast.error('Please enter valid contact');
      return;
    }
    if (!gstRegex.test(this.state.gstin) && this.state.gstin != '') {
      toast.error('Please enter valid GSTIN');
      return;
    } else {
      this.setState({ is_buttonloding: true });
      fetch(api + 'add_supplier', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          supplier_name: this.state.name,
          supplier_email: this.state.email,
          supplier_contact: this.state.contact,
          supplier_address: this.state.address,
          supplier_gstin: this.state.gstin,
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
    }
  };

  edit = () => {
    let gstRegex = new RegExp(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    );
    let number = /^[0]?[6789]\d{9}$/;
    if (this.state.name == '') {
      toast.error('Please enter name');
      return;
    }
    if (this.state.contact == '') {
      toast.error('Please enter contact');
      return;
    }
    if (!number.test(this.state.contact)) {
      toast.error('Please enter valid contact');
      return;
    }
    if (!gstRegex.test(this.state.gstin) && this.state.gstin != null) {
      toast.error('Please enter valid GSTIN');
      return;
    } else {
      this.setState({ is_buttonloding: true });
      fetch(api + 'edit_supplier', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          supplier_id: this.state.suplier_id,
          supplier_name: this.state.name,
          supplier_email: this.state.email,
          supplier_contact: this.state.contact,
          supplier_address: this.state.address,
          supplier_gstin: this.state.gstin,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.errors[0];
            toast.error(msg);
          } else {
            this.setState({ openedit: false, name: '' });
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
    }
  };

  delete = (id, name) => {
    fetch(api + 'delete_supplier', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        suplier_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
          toast.success('Supplier Deleted Successfully');
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


  fetchProducts = (id, page) => {
    fetch(api + 'fetch_inventory_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
        inventory_category_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page == 1) {
            this.setState({ products: [] });
          }
        } else {

          if (json.all.data.length > 0) {
            this.setState({ products: json.data.data });
          } else {
            this.setState({ products: [] });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loding: false });
      });
  };
  
  setproducts = (products, supllier_id) => {
    
    let data = [];
    products.map((item) => {
      data.push(item.id);
    });
    this.setState({ selectedProducts: data,supplier_id: supllier_id });
  };

  update_inventory_products = ()=>
    {
      fetch(api + 'update_supplier_products', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
         products: this.state.selectedProducts,
         supplier_id: this.state.supplier_id
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.status) {
            toast.success(json.msg);
            this.setState({ productsKitchenModal: false });
            this.fetchCategories();
            // this.setState({ category: json.data, is_loding: false });
          } else {
            // this.setState({ is_loding: false, category: [] });
          }
          return json;
        })
        .catch((error) => console.error(error))
        .finally(() => {});
    }
  

  render() {
    return (
      <>
        <Helmet>
          <title>Suppliers</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Suppliers </h4>
                </div>
                <div className="page-btn">
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                  >
                    Add New Supplier
                  </a>
                </div>
              </div>

              <Topnav array="finance" />

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
                              <th>Supplier Name</th>
                              <th>Gstin</th>
                              <th>Contact</th>
                              <th>Email</th>
                              <th>Products</th>
                              <th>Orders</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.category.map((item, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.supplier_name}</td>
                                <td>
                                  {item.supplier_gstin == null
                                    ? 'N/A'
                                    : item.supplier_gstin}
                                </td>
                                <td>{item.supplier_contact}</td>
                                <td>{item.supplier_email}</td>
                                <td>
                                <p
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      this.setproducts(
                                        item.products,
                                        item.id
                                      );
                                      this.setState({
                                        productsKitchenModal: true,
                                      });
                                    }}
                                  >

                                  {
                                    item.products.length
                                  }
                                  </p>
                                </td>
                                <td>{item.orders_count}</td>
                                <td>
                                  <a
                                    className="me-3"
                                    onClick={() => {
                                      this.setState({
                                        openedit: true,
                                        suplier_id: item.id,
                                        name: item.supplier_name,
                                        email: item.supplier_email,
                                        contact: item.supplier_contact,
                                        address: item.supplier_address,
                                        gstin: item.supplier_gstin,
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
                                          'Are you sure you want to delete this Supplier?',
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
                      <h4>
                        {' '}
                        Sorry, we couldn't find any records at this moment.{' '}
                      </h4>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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
                <h4>Inventory Products</h4>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>S.no</th>
                                <th>Stock Name</th>
                                <th>HSN Code</th>
                                <th>Purchase Unit</th>
                                <th>Purchase Sub Unit Quantity</th>
                                <th>Purchase Sub Unit</th>
                                <th>Category</th>
                              </tr>
                            </thead>
                            <tbody>
                  

                 
                    {this.state.products.map((item, index) => {
                        return (
                          
                          <tr
                          onClick={() => {
                            const select = [...this.state.selectedProducts];
                            if (select.includes(item.id)) {
                              const index = select.indexOf(item.id);
                              select.splice(index, 1);
                            } else {
                              select.push(item.id);
                            }
                            this.setState({ selectedProducts: select });
                          }}
                          key={index}
                          >
                          <td style={{
                            backgroundColor: this.state.selectedProducts.includes(item.id) ? 'green' : 'red'
                          }}>
                            {index + 1}
                          </td>
                          <td>{item.inventory_product_name}</td>
                          <td>{item.hsn_code == null ? 'N/A' : item.hsn_code}</td>
                          <td>{item.purchase_unit}</td>
                          <td>{item.purchase_subunit_quantity}</td>
                          <td>{item.purchase_sub_unit}</td>
                          <td>{item.category.category_name}</td>
                        </tr>
                        );
                      
                    })}
                  </tbody>
                </table>
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
                          this.update_inventory_products();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Update Supplier Product
                      </a>
                    )}
                  </div>
                </div>
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
                <h4>Add New Supplier </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Name<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Contact<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ contact: e.target.value });
                    }}
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Supplier Email</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ email: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Supplier GSTIN</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({
                        gstin: e.target.value.toUpperCase(),
                      });
                    }}
                    style={{
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Supplier Address</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ address: e.target.value });
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
                    Adding...
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add Supplier
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
                <h4>Edit Supplier </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Name<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                    value={this.state.name}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Contact<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ contact: e.target.value });
                    }}
                    maxLength="10"
                    value={this.state.contact}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Supplier Email</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ email: e.target.value });
                    }}
                    value={this.state.email}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Supplier GSTIN</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ gstin: e.target.value });
                    }}
                    value={this.state.gstin}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Supplier Address</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ address: e.target.value });
                    }}
                    value={this.state.address}
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

export default Suppliers;

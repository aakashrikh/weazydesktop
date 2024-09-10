import MenuIcon from '@mui/icons-material/Menu';
import SpeedDial from '@mui/material/SpeedDial';
import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Drawer } from 'rsuite';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import eye_icon from '../assets/images/icons/eye.svg';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

class Inventoryproducts extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      category: [],
      products: [],
      active_cat: 0,
      is_loding: true,
      is_button_loading_add: false,
      category_loding: true,
      opencategory: false,
      open: false,
      is_buttonloding: false,
      openedit: false,
      new_category_name: '',
      category_id: '',
      inventory_product_add_name: '',
      invenroty_product_add_category_id: '',
      inventory_prodduct_add_model: '',
      inventory_add_purchase_unit: '',
      inventory_add_purchase_subunit_quantity: '',
      inventory_add_purchase_sub_unit: '',
      inventory_prodduct_add_hsn: '',
      inventory_add_status: 'active',
      openCategoryModal: false,
      inventory_product_id: '',
      view_inventory_product_id: '',
      openDrawer: false,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
    this.fetchProducts(0, 1);
  }

  active_cat = (id) => {
    this.setState({
      active_cat: id,
      product_loding: true,
      is_loding: true,
      openCategoryModal: false,
    });
    this.fetchProducts(id, 1);
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
            this.setState({ products: json.all.data });
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
        } else {
          this.setState({ category: [] });
        }

        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ category_loding: false });
      });
  };

  delete_product = (id) => {
    fetch(api + 'delete_inventory_product', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.success(msg);
        } else {
          toast.success('Product Deleted Successfully');
          this.fetchProducts(this.state.active_cat, 1);
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

  addCategory = () => {
    if (
      this.state.new_category_name != '' ||
      this.state.parent_category_id != ''
    ) {
      this.setState({ is_button_loading_add: true });
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
            this.setState({ opencategory: false, new_category_name: '' });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false, is_button_loading_add: false });
        });
    } else {
      toast.error('Please fill all required fields!');
    }
  };

  add_product = () => {
    this.setState({ is_button_loading_add: true });
    if (
      this.state.inventory_product_add_name != '' ||
      this.state.invenroty_product_add_category_id != '' ||
      this.state.inventory_prodduct_add_model != '' ||
      this.state.inventory_add_purchase_unit != '' ||
      this.state.inventory_add_purchase_subunit_quantity != '' ||
      this.state.inventory_add_purchase_sub_unit != ''
    ) {
      this.setState({ is_button_loading_add: true });
      fetch(api + 'add_inventory_product', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          inventory_product_name: this.state.inventory_product_add_name,
          inventory_category_id: this.state.invenroty_product_add_category_id,
          model: this.state.inventory_prodduct_add_model,
          purchase_unit: this.state.inventory_add_purchase_unit,
          purchase_subunit_quantity:
            this.state.inventory_add_purchase_subunit_quantity,
          purchase_sub_unit: this.state.inventory_add_purchase_sub_unit,
          status: 'active',
          hsn_code: this.state.inventory_prodduct_add_hsn,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.errors;
            toast.error(msg[0]);
          } else {
            this.setState({
              open: false,
              inventory_product_add_name: '',
              invenroty_product_add_category_id: '',
              inventory_prodduct_add_model: '',
              inventory_add_purchase_unit: '',
              inventory_add_purchase_subunit_quantity: '',
              inventory_add_purchase_sub_unit: '',
              inventory_add_status: '',
            });
            toast.success(json.msg);
            this.fetchProducts(this.state.active_cat, 1);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ is_button_loading_add: false });
        });
    } else {
      toast.error('Please fill all required fields!');
      this.setState({ is_button_loading_add: false });
    }
  };

  edit_product = () => {
    if (
      this.state.inventory_product_add_name != '' ||
      this.state.invenroty_product_add_category_id != '' ||
      this.state.inventory_prodduct_add_model != '' ||
      this.state.inventory_add_purchase_unit != '' ||
      this.state.inventory_add_purchase_subunit_quantity != '' ||
      this.state.inventory_add_purchase_sub_unit != ''
    ) {
      this.setState({ is_buttonloding: true });
      fetch(api + 'update_inventory_product', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          inventory_product_name: this.state.inventory_product_add_name,
          inventory_category_id: this.state.invenroty_product_add_category_id,
          model: this.state.inventory_prodduct_add_model,
          purchase_unit: this.state.inventory_add_purchase_unit,
          purchase_subunit_quantity:
            this.state.inventory_add_purchase_subunit_quantity,
          purchase_sub_unit: this.state.inventory_add_purchase_sub_unit,
          status: 'active',
          product_id: this.state.inventory_product_id,
          hsn_code: this.state.inventory_prodduct_add_hsn,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({
              openedit: false,
              inventory_product_add_name: '',
              invenroty_product_add_category_id: '',
              inventory_prodduct_add_model: '',
              inventory_add_purchase_unit: '',
              inventory_add_purchase_subunit_quantity: '',
              inventory_add_purchase_sub_unit: '',
              inventory_add_status: '',
            });
            toast.success(json.msg);
            this.fetchProducts(this.state.active_cat, 1);
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ is_buttonloding: false });
        });
    } else {
      toast.error('Please fill all required fields!');
      this.setState({ is_buttonloding: false });
    }
  };

  inventory_sync = () => {
    fetch(api + 'inventory_sync_master', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ opencategory: false, new_category_name: '' });
          toast.success(json.msg);
          this.fetchProducts(0, 1);
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false, is_button_loading_add: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Inventory Products</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Inventory Stocks</h4>
                </div>
                

                <div className="page-btn d-flex align-items-center">
                {
                    this.context.user.parent_id != 0 &&
                    <a
                    className="btn btn-added"
                    onClick={() => {
                      confirm('Are you sure you want to sync from master?')
                        ? this.inventory_sync()
                        : '';

                    }}
                  >
                   Sync From Company
                  </a>
                  }
                  &nbsp;&nbsp;
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({
                        open: true,
                        inventory_product_add_name: '',
                        invenroty_product_add_category_id: '',
                        inventory_prodduct_add_model: '',
                        inventory_add_purchase_unit: '',
                        inventory_add_purchase_subunit_quantity: '',
                        inventory_add_purchase_sub_unit: '',
                        inventory_add_status: '',
                      });
                    }}
                  >
                    Add New Product
                  </a>
                </div>

              </div>

              <Topnav array="inventory" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <>
                  {this.state.products.length > 0 ? (
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>S.no</th>
                                <th>Stock Name</th>
                                <th>HSN Code</th>
                                <th>Alert Quantity</th>
                                <th>Stock</th>
                                <th>Purchase Unit</th>
                                <th>Purchase Sub Unit Quantity</th>
                                <th>Purchase Sub Unit</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'end' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.products.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.inventory_product_name}</td>
                                    <td>{item.hsn_code == null ? 'N/A' : item.hsn_code}</td>
                                    <td>{item.alert_quantity}</td>
                                    <td>
                                      {item.current_stock === 0 ||
                                      item.current_stock === null ? (
                                        <p style={{ color: 'red' }}>
                                          Out of Stock
                                        </p>
                                      ) : (
                                        parseFloat(item.current_stock).toFixed(
                                          2
                                        ) +
                                        ' ' +
                                        item.purchase_unit
                                      )}
                                    </td>
                                    <td>{item.purchase_unit}</td>
                                    <td>{item.purchase_subunit_quantity}</td>
                                    <td>{item.purchase_sub_unit}</td>
                                    <td>{item.category.category_name}</td>
                                    <td style={{ textAlign: 'end' }}>
                                      <img
                                        src={eye_icon}
                                        alt="img"
                                        className="mx-2 cursor_pointer"
                                        onClick={() => {
                                          this.setState({
                                            openDrawer: true,
                                            view_inventory_product_id: item.id,
                                          });
                                        }}
                                      />
                                      <img
                                        src={edit_icon}
                                        alt="img"
                                        className="mx-2 cursor_pointer"
                                        onClick={() => {
                                          this.setState({
                                            openedit: true,
                                            inventory_add_purchase_sub_unit:
                                              item.purchase_sub_unit,
                                            inventory_add_purchase_subunit_quantity:
                                              item.purchase_subunit_quantity,
                                            inventory_add_purchase_unit:
                                              item.purchase_unit,
                                            inventory_add_status: item.status,
                                            inventory_prodduct_add_hsn:
                                              item.hsn_code,
                                            inventory_prodduct_add_model:
                                              item.alert_quantity,
                                            invenroty_product_add_category_id:
                                              item.inventory_category_id,
                                            inventory_product_add_name:
                                              item.inventory_product_name,
                                            inventory_product_id: item.id,

                                          });
                                        }}
                                      />
                                      <img
                                        src={delete_icon}
                                        alt="img"
                                        onClick={() =>
                                          Swal.fire({
                                            title:
                                              'Are you sure you want to delete this product?',
                                            text: "You won't be able to revert this!",
                                            showCancelButton: true,
                                            confirmButtonColor: '#0066b2',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText:
                                              'Yes, delete it!',
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              this.delete_product(item.id);
                                            }
                                          })
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
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
                          height: '400px',
                        }}
                      />
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
        {this.state.category.length > 0 && (
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'fixed', bottom: 70, right: 7 }}
            icon={<MenuIcon />}
            direction="up"
            onClick={() => {
              this.setState({
                openCategoryModal: !this.state.openCategoryModal,
              });
            }}
          ></SpeedDial>
        )}

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
                <h4>Add Stock in Inventory</h4>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Stock Name<span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          inventory_product_add_name: e.target.value,
                        });
                      }}
                      value={this.state.inventory_product_add_name}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Category<span className="text-danger"> *</span>
                    </label>
                    <div className="row">
                      <div className="col-10">
                        <select
                          onChange={(e) => {
                            this.setState({
                              invenroty_product_add_category_id: e.target.value,
                            });
                          }}
                          className="select-container"
                        >
                          <option selected disabled>
                            Please Choose Category
                          </option>
                          {this.state.category.length > 0 &&
                            this.state.category.map((item, index) => (
                              <option id={index} value={item.id} key={index}>
                                {item.category_name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ height: '35px' }}
                          onClick={() => {
                            this.setState({ opencategory: true });
                          }}
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      HSN/SKU
                      {/* <span className="text-danger"> *</span> */}
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          inventory_prodduct_add_hsn: e.target.value,
                        });
                      }}
                      value={this.state.inventory_prodduct_add_hsn}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Alert me when quantity is
                      <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          inventory_prodduct_add_model: e.target.value,
                        });
                      }}
                      value={this.state.inventory_prodduct_add_model}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Purchase Unit<span className="text-danger"> *</span>
                    </label>
                    <select
                      onChange={(e) => {
                        this.setState({
                          inventory_add_purchase_unit: e.target.value,
                        });
                      }}
                      className="select-container"
                    >
                      <option selected disabled>
                        Please Choose Unit
                      </option>
                      <option value="kg">KG</option>
                      <option value="gm">GM</option>
                      <option value="ltr">LTR</option>
                      <option value="ml">ML</option>
                      <option value="pcs">PCS</option>
                      <option value="bori">Bori</option>
                      <option value="dozen">Dozen</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                      <option value="bundle">Bundle</option>
                      <option value="bag">Bag</option>
                      <option value="bottle">Bottle</option>
                      <option value="carton">Carton</option>
                      <option value="coil">Coil</option>
                      <option value="drum">Drum</option>
                      <option value="pair">Pair</option>
                      <option value="ream">Ream</option>
                      <option value="roll">Roll</option>
                      <option value="set">Set</option>
                      <option value="tube">Tube</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Purchase Sub-Unit<span className="text-danger"> *</span>
                    </label>
                    <select
                      onChange={(e) => {
                        this.setState({
                          inventory_add_purchase_sub_unit: e.target.value,
                        });
                      }}
                      className="select-container"
                    >
                      <option selected disabled>
                        Please Choose Sub-Unit
                      </option>
                      <option value="kg">KG</option>
                      <option value="gm">GM</option>
                      <option value="ltr">LTR</option>
                      <option value="ml">ML</option>
                      <option value="pcs">PCS</option>
                      <option value="bori">Bori</option>
                      <option value="dozen">Dozen</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                      <option value="bundle">Bundle</option>
                      <option value="bag">Bag</option>
                      <option value="bottle">Bottle</option>
                      <option value="carton">Carton</option>
                      <option value="coil">Coil</option>
                      <option value="drum">Drum</option>
                      <option value="pair">Pair</option>
                      <option value="ream">Ream</option>
                      <option value="roll">Roll</option>
                      <option value="set">Set</option>
                      <option value="tube">Tube</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Purchase Sub-Unit Quantity
                      <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          inventory_add_purchase_subunit_quantity:
                            e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-12 d-flex justify-content-end align-items-center">
                  {this.state.is_button_loading_add ? (
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
                        this.add_product();
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Add Stock
                    </a>
                  )}
                </div>
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
                <h4>Edit Stock</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Stock Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({
                        inventory_product_add_name: e.target.value,
                      });
                    }}
                    value={this.state.inventory_product_add_name}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Category<span className="text-danger"> *</span>
                  </label>
                  <div className="row">
                    <div className="col-10">
                      <select
                        onChange={(e) => {
                          this.setState({
                            invenroty_product_add_category_id: e.target.value,
                          });
                        }}
                        value={this.state.invenroty_product_add_category_id}
                        className="select-container"
                      >
                        <option>Please Choose Category</option>
                        {this.state.category.length > 0 &&
                          this.state.category.map((item, index) => (
                            <option id={index} value={item.id} key={index}>
                              {item.category_name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: '35px' }}
                        onClick={() => {
                          this.setState({ opencategory: true });
                        }}
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Alert me when quantity is</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({
                        inventory_prodduct_add_model: e.target.value,
                      });
                    }}
                    value={this.state.inventory_prodduct_add_model}
                  />
                </div>
              </div>


              <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      HSN/SKU
                      {/* <span className="text-danger"> *</span> */}
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          inventory_prodduct_add_hsn: e.target.value,
                        });
                      }}
                      value={this.state.inventory_prodduct_add_hsn}
                    />
                  </div>
                </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Purchase Unit</label>
                  <select
                    onChange={(e) => {
                      this.setState({
                        inventory_add_purchase_unit: e.target.value,
                      });
                    }}
                    className="select-container"
                    value={this.state.inventory_add_purchase_unit}
                  >
                    <option>Please Choose Unit</option>
                    <option value="kg">KG</option>
                    <option value="gm">GM</option>
                    <option value="ltr">LTR</option>
                    <option value="ml">ML</option>
                    <option value="pcs">PCS</option>
                    <option value="bori">Bori</option>
                    <option value="dozen">Dozen</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="bundle">Bundle</option>
                    <option value="bag">Bag</option>
                    <option value="bottle">Bottle</option>
                    <option value="carton">Carton</option>
                    <option value="coil">Coil</option>
                    <option value="drum">Drum</option>
                    <option value="pair">Pair</option>
                    <option value="ream">Ream</option>
                    <option value="roll">Roll</option>
                    <option value="set">Set</option>
                    <option value="tube">Tube</option>
                    <option value="unit">Unit</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Purchase Sub-Unit</label>
                  <select
                    onChange={(e) => {
                      this.setState({
                        inventory_add_purchase_sub_unit: e.target.value,
                      });
                    }}
                    className="select-container"
                    value={this.state.inventory_add_purchase_sub_unit}
                  >
                    <option>Please Choose Sub-Unit</option>
                    <option value="kg">KG</option>
                    <option value="gm">GM</option>
                    <option value="ltr">LTR</option>
                    <option value="ml">ML</option>
                    <option value="pcs">PCS</option>
                    <option value="bori">Bori</option>
                    <option value="dozen">Dozen</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="bundle">Bundle</option>
                    <option value="bag">Bag</option>
                    <option value="bottle">Bottle</option>
                    <option value="carton">Carton</option>
                    <option value="coil">Coil</option>
                    <option value="drum">Drum</option>
                    <option value="pair">Pair</option>
                    <option value="ream">Ream</option>
                    <option value="roll">Roll</option>
                    <option value="set">Set</option>
                    <option value="tube">Tube</option>
                    <option value="unit">Unit</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Purchase SubUnit Quantity</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({
                        inventory_add_purchase_subunit_quantity: e.target.value,
                      });
                    }}
                    value={this.state.inventory_add_purchase_subunit_quantity}
                  />
                </div>
              </div>

              <div className="col-lg-12 d-flex justify-content-end align-items-center">
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
                    Editing...
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.edit_product();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Edit Stock
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.opencategory}
          onClose={() => this.setState({ opencategory: false })}
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
                    <option selected disabled>
                      Choose Parent Category
                    </option>
                    <option value={0}>None</option>
                    {this.state.category.length > 0 &&
                      this.state.category.map((item, index) => (
                        <option key={index} value={item.id}>
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
                      this.addCategory();
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
          open={this.state.openCategoryModal}
          onClose={() => this.setState({ openCategoryModal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Categories</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4">
                <button
                  className={
                    'btn btn-secondary me-3 my-2 w-100' +
                    (this.state.active_cat === 0 ? ' active' : '')
                  }
                  onClick={() => {
                    this.active_cat(0);
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '400',
                  }}
                >
                  All
                </button>
              </div>

              {this.state.category.map((item, index) => {
                return (
                  <div className="col-lg-4" key={index}>
                    <button
                      className={
                        'btn btn-secondary me-3 my-2 w-100' +
                        (this.state.active_cat === item.id ? ' active' : '')
                      }
                      onClick={() => {
                        this.active_cat(item.id);
                      }}
                      style={{
                        fontSize: '11px',
                        fontWeight: '400',
                      }}
                    >
                      {item.category_name}({item.products_count})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
        <InventoryLedger
          openDrawer={this.state.openDrawer}
          onClose={() => {
            this.setState({ openDrawer: false });
          }}
          id={this.state.view_inventory_product_id}
        />
      </>
    );
  }
}

export class InventoryLedger extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      type: 'all',
      page: 1,
      is_loding: true,
      product_details: [],
    };
  }

  fetchRecords = (page, type) => {
    fetch(api + 'fetch_material_records', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        type: type,
        material_id: this.props.id,
        page: page,
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
          this.setState({
            next_page: json.data.next_page_url,
            product_details: json.product,
          });
          if (page == 1) {
            this.setState({ products: json.data.data });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    products: [...this.state.products, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    products: json.data.data,
                  });
            }
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

  render() {
    return (
      <Drawer
        open={this.props.openDrawer}
        onClose={() => this.props.onClose()}
        placement="right"
        size="full"
        onOpen={() => {
          this.setState({ is_loding: true });
          this.fetchRecords(1, this.state.type);
        }}
      >
        <Drawer.Header>
          <Drawer.Title>
            <h4>Inventory Ledger</h4>
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="content">
            {this.state.is_loding ? (
              <Loader />
            ) : (
              <>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          this.state.product_details.inventory_product_name
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Current Stock</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          this.state.product_details.current_stock === null
                            ? 0
                            : this.state.product_details.current_stock.toFixed(
                                2
                              ) +
                              ' ' +
                              this.state.product_details.purchase_unit
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Filter</label>
                      <RadioGroup
                        value={this.state.type}
                        onChange={(e) => {
                          this.setState({ type: e });
                          this.fetchRecords(1, e);
                        }}
                        horizontal={true}
                      >
                        <RadioButton
                          value="all"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          All
                        </RadioButton>
                        <RadioButton
                          value="add"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          Add
                        </RadioButton>
                        <RadioButton
                          value="remove"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          Release
                        </RadioButton>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                {this.state.products.length > 0 ? (
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Quantity</th>
                              {/* <th>Quantity Unit</th> */}
                              <th>Type</th>
                              <th>Date Time</th>
                              <th>Comment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.products.map((item, index) => {
                              return (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    {item.quantity} {item.quantity_unit}
                                  </td>
                                  {/* <td>{item.quantity_unit}</td> */}
                                  <td>
                                    {item.record_type === 'add' ? (
                                      <span style={{ color: 'green' }}>
                                        Add
                                      </span>
                                    ) : (
                                      <span style={{ color: 'red' }}>
                                        Release
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {moment(item.created_at).format('llll')}
                                  </td>
                                  <td>{item.comment}</td>
                                </tr>
                              );
                            })}
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
                    <h4>No Record Found</h4>
                  </div>
                )}
              </>
            )}
          </div>
        </Drawer.Body>
      </Drawer>
    );
  }
}

export default Inventoryproducts;

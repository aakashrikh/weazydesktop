import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../othercomponent/Header';
import Topnav from '../othercomponent/Topnav';
import Modal from 'react-responsive-modal';
import { Drawer } from 'rsuite';

export class CustomerCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      showRedemption: false,
      category_name: '',
      discount: '',
      min_billing_amount: '',
      max_discount_amount: '',
      openEdit: false,
      edit_category_name: '',
      edit_discount: '',
      edit_min_billing_amount: '',
      edit_max_discount_amount: '',
      search: '',
      is_button_loading_add: false,
      selectCustomers: false,
    };
  }
  render() {
    return (
      <>
        <Helmet>
          <title>Customers Category - Weazy </title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Customers Category</h4>
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
              {/* <Topnav array="customers" /> */}
              <div className="row mb-4 d-flex align-items-center">
                <div className="col-md-12">
                  {/* create a search */}
                  <div className="search-box">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Search Customers By Name, Email or Phone"
                        value={this.state.search}
                        onChange={(e) => {
                          this.setState({ search: e.target.value });
                          // if (e.target.value.length > 0) {
                          //   this.search_customer(1, e.target.value);
                          // } else {
                          //   this.fetch_order(1, '');
                          // }
                        }}
                        if
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table  datanew">
                      <thead>
                        <tr>
                          <th>S.no</th>
                          <th>Category Name</th>
                          <th>Discount %</th>
                          <th>Minimum Billing Amount</th>
                          <th>Maximum Discount Amount</th>
                          <th>Total Redemption</th>
                          <th>Total Customers</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>
                            <p
                              onClick={() => {
                                this.setState({ openEdit: true });
                              }}
                            >
                              John Doe
                            </p>
                          </td>
                          <td>12</td>
                          <td>2000</td>
                          <td>500</td>
                          <td>
                            <p
                              onClick={() => {
                                this.setState({ showRedemption: true });
                              }}
                            >
                              100
                            </p>
                          </td>
                          <td>
                            <p
                              onClick={() => {
                                this.setState({ selectCustomers: true });
                              }}
                            >
                              100
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* modal to add */}
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
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Category Name
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Category Name"
                      value={this.state.category_name}
                      onChange={(e) => {
                        this.setState({ category_name: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Discount %<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Discount %"
                      value={this.state.discount}
                      onChange={(e) => {
                        this.setState({ discount: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Minimum Billing Amount
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Minimum Billing Amount"
                      value={this.state.min_billing_amount}
                      onChange={(e) => {
                        this.setState({ min_billing_amount: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Maximum Discount Amount
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Maximum Discount Amount"
                      value={this.state.max_discount_amount}
                      onChange={(e) => {
                        this.setState({ max_discount_amount: e.target.value });
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
                      Please Wait...
                    </button>
                  ) : (
                    <a
                      href="javascript:void(0);"
                      onClick={() => {
                        this.add_product();
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Add Category
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* modal to edit */}
        <Modal
          focusTrapped={false}
          open={this.state.openEdit}
          onClose={() => this.setState({ openEdit: false })}
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
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Category Name
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Category Name"
                      value={this.state.edit_category_name}
                      onChange={(e) => {
                        this.setState({ edit_category_name: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Discount %<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Discount %"
                      value={this.state.edit_discount}
                      onChange={(e) => {
                        this.setState({ edit_discount: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Minimum Billing Amount
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Minimum Billing Amount"
                      value={this.state.edit_min_billing_amount}
                      onChange={(e) => {
                        this.setState({
                          edit_min_billing_amount: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Maximum Discount Amount
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Maximum Discount Amount"
                      value={this.state.edit_max_discount_amount}
                      onChange={(e) => {
                        this.setState({
                          edit_max_discount_amount: e.target.value,
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
                      Please Wait...
                    </button>
                  ) : (
                    <a
                      href="javascript:void(0);"
                      onClick={() => {
                        this.add_product();
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Edit Category
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* drawer for total redemption */}
        <Drawer
          open={this.state.showRedemption}
          onClose={() => this.setState({ showRedemption: false })}
          size="full"
          onOpen={() => {
            // this.getOrderDetails(this.props.drawerOrderId);
            // this.orderDetails(this.props.drawerOrderId);
          }}
          placement="right"
        >
          <Drawer.Header>
            <Drawer.Title>Redemption Details</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <div className="table-responsive">
              <table className="table  datanew">
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Order Code</th>
                    <th>Order Date</th>
                    <th>Customer Name</th>
                    <th>Order Amount</th>
                    <th>Discount</th>
                    <th>Value After Discount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>WD-2138479</td>
                    <td>12/12/2222</td>
                    <td>John Doe</td>
                    <td>500</td>
                    <td>100</td>
                    <td>100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Drawer.Body>
        </Drawer>
        {/* drawer for selecting customers */}
        <Drawer
          open={this.state.selectCustomers}
          onClose={() => this.setState({ selectCustomers: false })}
          size="full"
          onOpen={() => {
            // this.getOrderDetails(this.props.drawerOrderId);
            // this.orderDetails(this.props.drawerOrderId);
          }}
          placement="right"
        >
          <Drawer.Header>
            <Drawer.Title>Select Customers</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <div className="table-responsive">
              <table className="table  datanew">
                {/* table with checkboxes */}
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>S.no</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Redemption</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>jogn@sef.sf</td>
                    <td>1234567890</td>
                    <td>
                      <p
                        onClick={() => {
                          this.setState({ showRedemption: true });
                        }}
                      >
                        100
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Drawer.Body>
        </Drawer>
      </>
    );
  }
}

export default CustomerCategory;

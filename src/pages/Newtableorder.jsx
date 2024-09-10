import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';

export class Newtableorder extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_user_modal: false,
      all_data: [],
      tableData: [],
      data: [],
      cart: [],
      user: [],
      table_data: [],
      isLoading: true,
      additional_note: '',
      generateBillModal: false,
      total_amount: '',
      order_code: '',
      bill: [],
      payment: 'UPI',
      generate_order_buttonLoading: false,
      mark_complete_buttonLoading: false,
      split_bill_amount_other: '',
      split_bill_amount_cash: '',
      is_buttonloding: false,
      splitModal: false,
      modalVisible: false,
      swap_table_buttonLoading: false,
      clear_table_buttonLoading: false,
      edit_quantity_modal: false,
      update_product_quantity_buttonLoading: false,
      edit_quantity_name: '',
      edit_quantity_initial: '',
      edit_cart_id: '',
      split_payment: [
        { amount: 0, method: 'Cash' },
        { amount: 0, method: 'Card' },
        { amount: 0, method: 'UPI' },
      ],
      split_total: 0,
      percentageDiscount: true,
      price_loading: false,
      discountAmount: '',
      discount_on_order: false,
      kot: 0,
    };

    this.componentRef = React.createRef([]);
    this.componentRef = [];
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.orderDetails(this.props.id);
    this.fetch_table_vendors();
  }

  orderDetails = (id) => {
    fetch(api + 'fetch_ongoing_order_for_table', {
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
          this.setState({ isLoading: false, data: [] });
          // this.props.navigate('/pos/' + this.props.id, { replace: true });
        } else {
          this.setState({
            all_data: json.data,
            data: json.data[0],
            cart: json.data[0].cart,
            user: json.data[0].user,
            isLoading: false,
            table_data: json.data[0].table,
            total_amount: json.data[0].total_amount,
            order_code: json.data[0].order_code,
            discountAmount: json.data[0].discount,
          });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  genrate_bill = (discount, type) => {
    this.setState({ generate_order_buttonLoading: true, price_loading: true });
    fetch(api + 'generate_bill_by_table', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: this.props.id,
        order_id: this.state.order_code,
        discount_type: type ? 'percentage' : 'fixed',
        discount: discount,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({
              bill: json.data,
              total_amount: json.data[0].total_amount,
              data: json.data[0],
            });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({
          generate_order_buttonLoading: false,
          price_loading: false,
        });
      });
  };

  genrate_bill_without_discount = () => {
    this.setState({ generate_order_buttonLoading: true, price_loading: true });
    fetch(api + 'generate_bill_by_table', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: this.props.id,
        order_id: this.state.order_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({
              bill: json.data,
              total_amount: json.data[0].total_amount,
              data: json.data[0],
              generateBillModal: true,
            });
            // this.setState({ cart: json.data.cart });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({
          generate_order_buttonLoading: false,
          price_loading: false,
        });
      });
  };

  mark_complete = () => {
    this.setState({ mark_complete_buttonLoading: true });

    fetch(api + 'update_order_status_by_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.bill[0].id,
        payment_method: this.state.payment,
        order_status: 'completed',
        split_payment: this.state.split_payment,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ modalVisible: false });
          this.props.navigate(-1);
          toast.success('Order Completed');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ mark_complete_buttonLoading: false });
      });
  };

  add_split_amount = (amount, index) => {
    if (amount == '') {
      amount = 0;
    }
    var split = this.state.split_payment;

    var tt = 0;
    split.map((item, i) => {
      if (i != index) {
        tt = parseFloat(tt) + parseFloat(item.amount);
      } else {
        tt = parseFloat(tt) + parseFloat(amount);
      }
    });

    split[index].amount = amount;
    this.setState({ split_payment: split, split_total: tt });
  };

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
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({ tableData: json.data });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  swap_table = (id) => {
    this.setState({ swap_table_buttonLoading: true });

    fetch(api + 'swapp_table_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
        current_table_id: this.props.id,
        new_table_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ swap_table_modalVisible: false });
          this.props.navigate(-1);
          toast.success('Table Swapped');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ swap_table_buttonLoading: false });
      });
  };

  clear_table_order = () => {
    this.setState({ clear_table_buttonLoading: true });

    fetch(api + 'clear_table', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
        table_id: this.props.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.props.navigate(-1);
          toast.success('Table Cleared');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ clear_table_buttonLoading: false });
      });
  };

  sendUrlToPrint = (url) => {
    var beforeUrl = 'intent:';
    var afterUrl = '#Intent;';
    // Intent call with component
    afterUrl +=
      'component=ru.a402d.rawbtprinter.activity.PrintDownloadActivity;';
    afterUrl += 'package=ru.a402d.rawbtprinter;end;';
    document.location = beforeUrl + encodeURI(url) + afterUrl;
    return false;
  };

  update_product_quantity = (quantity) => {
    this.setState({ update_product_quantity_buttonLoading: true });
    fetch(api + 'update_order_items_pos', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        item_id: this.state.edit_cart_id,
        quantity: quantity,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ edit_quantity_modal: false });
          this.orderDetails(this.props.id);
          toast.success('Product Quantity Updated');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ update_product_quantity_buttonLoading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Table Order</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>
                    Table Order{' '}
                    <span className="text-secondary">
                      {this.state.data.order_code}
                    </span>
                  </h4>
                </div>
                <div className="d-flex align-items-center">
                  {this.state.swap_table_buttonLoading ? (
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
                      Order Swap
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => {
                        this.setState({ modalVisible: true });
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-arrow-left mr-2"></i>
                      Order Swap
                    </button>
                  )}

                  <Link
                    className="btn btn-secondary btn-sm me-2"
                    to={'/pos/' + this.props.id}
                  >
                    <i className="fa-solid fa-plus mr-2"></i>Add More Item
                  </Link>
                  {this.state.clear_table_buttonLoading ? (
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
                      Clearing Table
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => {
                        Swal.fire({
                          title: 'Are you sure',
                          text: 'You want to clear this table order?',
                          showCancelButton: true,
                          confirmButtonColor: '#0066b2',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, clear it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.clear_table_order();
                          }
                        });
                      }}
                    >
                      <i className="fa-solid fa-circle-xmark mr-2"></i>
                      Clear Table Order
                    </button>
                  )}
                  <a
                    href="javascript:void(0);"
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Generate Bill
                  </a>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="card-sales-split">
                    <h2>
                      Table Number :{' '}
                      <span className="text-secondary font-weight-normal">
                        {this.state.table_data.table_name}
                      </span>
                    </h2>
                    <h2>
                      Date :{' '}
                      <span className="text-secondary font-weight-normal">
                        {moment(this.state.data.created_at).format('llll')}
                      </span>
                    </h2>
                    <h2>
                      Customer Name :{' '}
                      <span className="text-secondary font-weight-normal">
                        {this.state.user.name}
                      </span>
                    </h2>
                    <h2>
                      Customer Number :{' '}
                      <span className="text-secondary font-weight-normal">
                        {this.state.user.contact}
                      </span>
                    </h2>
                  </div>
                  <div className="row">
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Discount Type</label>
                        <ul className="nav nav-pills mt-3">
                          <li className="nav-item me-2">
                            <a
                              className={
                                'nav-link ' +
                                (this.state.discount_mode == 'fixed'
                                  ? 'active'
                                  : '')
                              }
                              onClick={() => {
                                this.setState({
                                  discount_mode: 'fixed',
                                });
                              }}
                            >
                              Fixed
                            </a>
                          </li>
                          <li className="nav-item me-2">
                            <a
                              className={
                                'nav-link ' +
                                (this.state.discount_mode != 'fixed'
                                  ? 'active'
                                  : '')
                              }
                              onClick={() => {
                                this.setState({
                                  discount_mode: 'percentage',
                                });
                              }}
                            >
                              Percentage
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Discount</label>
                        <input type="text" />
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Status</label>
                        <select className="select-container">
                          <option>Choose Status</option>
                          <option>Completed</option>
                          <option>Inprogress</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-12 d-flex align-items-center justify-content-end">
                      <div className="form-group">
                        <button className="btn btn-danger btn-sm mt-4">
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <section
                        className="item-section"
                        style={{
                          padding: '20px 0 0!important',
                        }}
                      >
                        <div className="item_row">
                          <div className="sno_column_heading">No.</div>
                          <div className="item_name_column_heading">Item</div>
                          <div className="price_column_heading">Price</div>
                          <div className="qty_column_heading">Qty.</div>
                          <div className="amount_column_heading">Amt.</div>
                        </div>
                        {this.state.cart.map((item, index) => {
                          return (
                            <div className="single_item_row">
                              <div className="sno_column">{index + 1}</div>
                              <div className="item_name_column">
                                <span
                                  style={{
                                    fontWeight: '600px',
                                    marginRight: '10px',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    this.setState({
                                      edit_quantity_modal: true,
                                      edit_quantity_name:
                                        item.product.product_name,
                                      edit_quantity_initial:
                                        item.product_quantity,
                                      edit_cart_id: item.id,
                                    });
                                  }}
                                >
                                  {item.product.product_name}
                                </span>

                                {item.variant != null && (
                                  <span>
                                    <strong>Variant</strong> -{' '}
                                    {item.variant.variants_name}
                                  </span>
                                )}

                                <div className="media-body-cart">
                                  {item.addons.length > 0 && (
                                    <>
                                      <strong>AddOns: </strong>
                                      {item.addons.map((items) => {
                                        return (
                                          <span className="addon_text_order">
                                            {items.addon_name}
                                          </span>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="price_column">
                                {item.product_price / item.product_quantity}
                              </div>
                              <div className="qty_column">
                                x {item.product_quantity}
                              </div>
                              <div className="amount_column">
                                {item.product_price}
                              </div>
                            </div>
                          );
                        })}
                      </section>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 ">
                      <div className="total-order w-100 max-widthauto m-auto mb-4">
                        <ul>
                          <li>
                            <h4>Items Total</h4>
                            <h5>$ 0.00 (0.00%)</h5>
                          </li>
                          <li>
                            <h4 className="text-success">
                              Taxes and Other Charges{' '}
                            </h4>
                            <h5>$ 0.00</h5>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-6 ">
                      <div className="total-order w-100 max-widthauto m-auto mb-4">
                        <ul>
                          <li>
                            <h4 className="text-danger">Discount</h4>
                            <h5>$ 0.00</h5>
                          </li>
                          <li className="total">
                            <h4>Grand Total</h4>
                            <h5>$ 0.00</h5>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-12 d-flex justify-content-end">
                      <a
                        href="javascript:void(0);"
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Generate Bill
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal
            focusTrapped={false}
            open={this.state.modalVisible}
            onClose={() => this.setState({ modalVisible: false })}
            center
            styles={{
              modal: {
                width: '100%',
                maxWidth: '70vw',
              },
            }}
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0">
                <div className="page-title">
                  <h4>Tables - Order Swap</h4>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row" style={{ marginTop: 10 }}>
                    <>
                      {this.state.tableData.length > 0 ? (
                        <>
                          <h4
                            style={{
                              marginBottom: '10px',
                            }}
                          >
                            Dine-In
                          </h4>
                          {this.state.tableData.map((item, index) => {
                            return (
                              <>
                                {item.table_status == 'active' ? (
                                  <div
                                    key={index}
                                    className="col-lg-2 col-sm-6 col-12"
                                  >
                                    <div
                                      className=" d-flex w-100"
                                      onClick={() => {
                                        Swal.fire({
                                          title: 'Are you sure',
                                          text: 'You want to swap the order?',
                                          showCancelButton: true,
                                          confirmButtonColor: '#0066b2',
                                          cancelButtonColor: '#d33',
                                          confirmButtonText: 'Yes, swap it!',
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            this.swap_table(item.table_uu_id);
                                          }
                                        });
                                      }}
                                    >
                                      <div className="dash-count1 cursor_pointer">
                                        <h4>{item.table_name}</h4>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <> </>
                                )}
                              </>
                            );
                          })}
                        </>
                      ) : (
                        <></>
                      )}
                    </>
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
              <div className="page-header m-0">
                <div className="page-title">
                  <h4>Add Notes</h4>
                  <p className="text-danger text-muted m-0">
                    Max characters 100*
                  </p>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <textarea
                          rows={2}
                          className="form-control"
                          placeholder="Enter Notes"
                          onChange={(e) =>
                            this.setState({ additional_note: e.target.value })
                          }
                          value={this.state.additional_note}
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-lg-12 d-flex justify-content-end">
                      <a
                        href="javascript:void(0);"
                        className="btn btn-sm btn-submit me-2"
                      >
                        Add
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            focusTrapped={false}
            open={this.state.generateBillModal}
            onClose={() => this.setState({ generateBillModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h4>Generating Bill</h4>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row">
                    <div className="col-lg-12">
                      <RadioGroup
                        onChange={(value) => {
                          this.setState({ payment: value });
                        }}
                        value={this.state.payment}
                      >
                        <RadioButton
                          value="UPI"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Google Pay/Paytm/UPI
                        </RadioButton>
                        <RadioButton
                          value="Card"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Credit/Debit Card
                        </RadioButton>
                        <RadioButton
                          value="Cash"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Cash
                        </RadioButton>
                        <RadioButton
                          value="split"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Split Payment
                        </RadioButton>
                      </RadioGroup>
                    </div>
                    <div className="col-md-6 d-flex justify-content-start align-items-center">
                      <div className="row w-100">
                        <div className="col-md-6 grand_total">Grand Total</div>
                        <div className="col-md-6 d-flex align-items-start justify-content-end">
                          <div className="d-flex align-items-center grand_total">
                            ₹{this.state.data.total_amount}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 d-flex justify-content-end align-items-center mt-2">
                      {this.state.mark_complete_buttonLoading ? (
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
                          Please wait
                        </button>
                      ) : this.state.payment == 'split' ? (
                        <a
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            this.setState({
                              splitModal: true,
                              generateBillModal: false,
                            });
                          }}
                        >
                          Complete Order
                        </a>
                      ) : (
                        <a
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            this.mark_complete();
                          }}
                        >
                          Complete Order
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
            open={this.state.splitModal}
            onClose={() => this.setState({ splitModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h4>Split Bill Amount</h4>
                  <p>Total Bill Amount - ₹ {this.state.total_amount}</p>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row">
                    {this.state.split_payment.map((item, index) => {
                      var tt = item.amount;
                      return (
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label>{item.method} </label>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="form-group">
                              <input
                                className="form-control"
                                type="number"
                                onChange={(e) => {
                                  this.add_split_amount(e.target.value, index);
                                }}
                                value={this.state[item.amount]}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <h5>Split Total - {this.state.split_total} </h5>

                    <div className="col-lg-12 d-flex justify-content-end">
                      {this.state.mark_complete_buttonLoading ? (
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
                          Please wait
                        </button>
                      ) : (
                        this.state.split_total == this.state.total_amount && (
                          <a
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              this.mark_complete();
                            }}
                          >
                            Complete Order
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            focusTrapped={false}
            open={this.state.edit_quantity_modal}
            onClose={() => this.setState({ edit_quantity_modal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h5>
                    Edit Quantity of :{' '}
                    <span
                      style={{
                        textDecoration: 'underline',
                      }}
                    >
                      {this.state.edit_quantity_name}
                    </span>
                  </h5>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 d-flex justify-content-between align-items-center py-4">
                        <div className="row w-100">
                          <div className="col-md-4">
                            {this.state.edit_quantity_initial == 1 ? (
                              <a
                                className="btn btn-secondary mx-2 w-100"
                                style={{
                                  pointerEvents: 'none',
                                  opacity: '0.8',
                                }}
                                onClick={() => {
                                  this.setState({
                                    edit_quantity_initial:
                                      this.state.edit_quantity_initial - 1,
                                  });
                                }}
                              >
                                <i className="fa-solid fa-minus"></i>
                              </a>
                            ) : (
                              <a
                                className="btn btn-secondary mx-2 w-100"
                                onClick={() => {
                                  this.setState({
                                    edit_quantity_initial:
                                      this.state.edit_quantity_initial - 1,
                                  });
                                }}
                              >
                                <i className="fa-solid fa-minus"></i>
                              </a>
                            )}
                          </div>
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="text-center mx-2 form-control w-100"
                              onChange={(e) => {
                                this.setState({
                                  edit_quantity_initial: e.target.value,
                                });
                              }}
                              value={this.state.edit_quantity_initial}
                              readOnly
                            />
                          </div>
                          <div className="col-md-4">
                            <a
                              className="btn btn-secondary mx-2 w-100"
                              onClick={() => {
                                this.setState({
                                  edit_quantity_initial:
                                    this.state.edit_quantity_initial + 1,
                                });
                              }}
                            >
                              <i className="fa-solid fa-add"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12 d-flex justify-content-between align-items-center mt-2">
                        {this.state.update_product_quantity_buttonLoading ? (
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
                            Please wait
                          </button>
                        ) : (
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => {
                              Swal.fire({
                                title: 'Are you sure',
                                text: 'You want to clear this item from order?',
                                showCancelButton: true,
                                confirmButtonColor: '#0066b2',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, clear it!',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  this.update_product_quantity(0);
                                }
                              });
                            }}
                          >
                            Clear {this.state.edit_quantity_name} from Order
                          </button>
                        )}
                        {this.state.update_product_quantity_buttonLoading ? (
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
                            Please wait
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              this.update_product_quantity(
                                this.state.edit_quantity_initial
                              );
                            }}
                          >
                            Update Quantity Of {this.state.edit_quantity_name}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Newtableorder
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;

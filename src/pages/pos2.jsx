import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { toast } from 'sonner';
import { api } from '../../config';
import { os } from '../../os';
import { AuthContext } from '../AuthContextProvider';
import {
  default as no_img,
  default as no_product,
} from '../assets/images/no_products_found.png';
import no_cart from '../assets/images/nocart.webp';
import success_gif from '../assets/images/order_success.gif';
import PrintKot from '../component/PrintKot';
import PrintReceipt from '../component/PrintReceipt';
import Loader from '../othercomponent/Loader';
import PosHeader from '../othercomponent/PosHeader';
import Skeletonloader from '../othercomponent/Skeletonloader';

class Pos extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      category: [],
      products: [],
      active_cat: 0,
      isloading: true,
      cart: [],
      load_item: true,
      grandTotal: 0,
      subTotal: 0,
      taxes: 0,
      isModalOpen: false,
      is_buttonloding: false,
      contact: '',
      user_id: '',
      name: '',
      payment_step: 0,
      order_method: 'TakeAway',
      show_table: false,
      table_no: 0,
      type: 'product',
      split: false,
      split_payment: [
        { amount: 0, method: 'Cash' },
        { amount: 0, method: 'Card' },
        { amount: 0, method: 'UPI' },
      ],
      split_total: 0,
      product_show: false,
      posOrderComplete: false,
      order_code: '',
      if_table_order: false,
      order: [],
      bill_show: false,
      order_table_no: '',
      kot_id: '',
      offers: [],
      percentageDiscount: true,
      discount: 0,
      discount_type: '',
      notes: '',
      coupon_code: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    if (this.props.table_id != undefined) {
      this.setState({ table_no: this.props.table_id, order_method: 'DineIn' });
      this.orderDetails(this.props.table_id);
    }
    this.fetchCategories();
    this.fetch_current_offers_vendor();
  }

  active_cat = (id, product) => {
    this.setState({ active_cat: id });
    this.fetchProducts(id, product, this.state.type, 1);
  };

  onCloseModal = () => {
    this.setState({ product_show: false });
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

  fetchProducts = (category_id, products, type, page) => {
    this.setState({ load_item: true, product_show: true });
    if (products.length == 0) {
      fetch(api + 'vendor_get_vendor_product', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          vendor_category_id: category_id,
          product_type: type,
          page: page,
          status: 'active',
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
            if (json.data.data.length > 0) {
              this.setState({ products: json.data.data });
            }
          }
          this.setState({ load_item: false, isloading: false });
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {});
    } else {
      this.setState({ products: products });
    }
  };

  fetchCategories = () => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({ category: json.data });
          // this.fetchProducts(0, this.state.type, 1);
        }
        this.setState({ load_item: false, isloading: false });
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        // this.setState({ isloading: false });
      });
  };

  add_to_cart = (product, vv_id, addons) => {
    let final_price = 0;
    toast.success(product.product_name + ' added to cart');
    var bb = [];
    addons.map((item, index) => {
      bb.push(item);
    });

    var match = false;
    var key = 0;
    var breaknow = false;

    for (var i = 0; i < this.state.cart.length; i++) {
      var item = this.state.cart[i];
      if (item.product.id == product.id && item.variant_id == vv_id) {
        if (bb.length == 0 && item.cart_addon.length == 0) {
          key = i;
          match = true;
          break;
        } else {
          if (bb.length == item.cart_addon.length) {
            for (var j = 0; j < bb.length; j++) {
              var item1 = bb[j];
              if (item.cart_addon.includes(item1)) {
                key = i;
                match = true;
              } else {
                match = false;
                break;
              }
            }
          }
        }

        if (breaknow) {
          break;
        }
      }
    }

    var cart = this.state.cart;

    this.state.cart.map((item, index) => {
      final_price = parseFloat(final_price) + parseFloat(item.price);
    });

    if (match) {
      var quantity = cart[key].quantity + 1;
      var price = cart[key].price / cart[key].quantity;
      final_price =
        parseFloat(final_price) -
        parseFloat(cart[key].price) +
        parseFloat(price) * parseFloat(quantity);
      cart[key].quantity = quantity;

      cart[key].price = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
      this.setState({ cart: cart });
    } else {
      let total = parseFloat(product.our_price);
      product.variants.map((item, index) => {
        if (item.id == vv_id) {
          total = item.variants_discounted_price;
        }
      });

      product.addon_map.map((item, index) => {
        if (addons.includes(item.id)) {
          total = total + item.addon_price;
        }
      });

      if (
        this.context.user.gstin != null &&
        this.context.user.gst_type == 'inclusive'
      ) {
        total = parseFloat(total / 1.05);
      }
      var cart2 = {
        product_id: product.id,
        product: product,
        variant_id: vv_id,
        cart_addon: bb,
        quantity: 1,
        price: total.toFixed(2),
      };

      final_price = parseFloat(final_price) + parseFloat(total);
      this.setState({ cart: [...this.state.cart, cart2] });
    }

    this.calculateTotal(final_price, this.state.discount);
  };

  calculateTotal = (finalPrice, discount) => {
    var subtotal = finalPrice - discount;
    if (this.context.user.gstin != null) {
      let gst = parseFloat(subtotal * 5) / 100;
      let total = parseFloat(subtotal) + parseFloat(gst);

      this.setState({
        subTotal: parseFloat(finalPrice).toFixed(2),
        taxes: gst.toFixed(2),
        grandTotal: Math.floor(total),
      });
    } else {
      this.setState({
        subTotal: finalPrice,
        taxes: 0,
        grandTotal: subtotal,
      });
    }
  };

  update_cart = (key_id, quantity) => {
    var final_price = this.state.subTotal;

    if (quantity == 0) {
      var cart = this.state.cart;
      final_price = final_price - cart[key_id].price;

      cart.splice(key_id, 1);
      this.setState({ cart: cart });
    } else {
      var cart = this.state.cart;
      var price = (cart[key_id].price / cart[key_id].quantity).toFixed(2);
      final_price = final_price - cart[key_id].price + price * quantity;

      cart[key_id].quantity = quantity;
      cart[key_id].price = (price * quantity).toFixed(2);
      this.setState({ cart: cart });
    }

    this.calculateTotal(final_price, this.state.discount);
  };

  clear_cart = () => {
    this.setState({ cart: [] });
  };

  search = (e) => {
    if (e.target.value.length >= 3) {
      fetch(api + 'search_product', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          search_query: e.target.value,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          this.setState({ products: json.data });
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false });
        });
    } else {
    }
  };

  verifyCustomer = () => {
    this.setState({ is_buttonloding: true });
    var phoneNumber = this.state.contact;
    let rjx = /^[0]?[6789]\d{9}$/;
    let isValid = rjx.test(phoneNumber);
    if (!isValid) {
      toast.error('Please enter valid mobile number');
      this.setState({ is_buttonloding: false });
    } else {
      fetch(api + 'verify_contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          contact: this.state.contact,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({ user_id: json.data.id });
            if (json.data.name == null || json.data.name == '') {
              this.setState({ payment_step: 1 });
            } else {
              this.setState({ name: json.data.name, payment_step: 2 });
            }
            toast.success('done');
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ is_buttonloding: false });
        });
    }
  };

  updateCustomer = () => {
    this.setState({ is_buttonloding: true });
    if (this.state.name == '') {
      toast.error('Please Enter Customer Name');
      this.setState({ is_buttonloding: false });
      return;
    }

    fetch(api + 'update_customer_name', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        contact: this.state.contact,
        name: this.state.name,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(json.errors);
        } else {
          this.setState({ payment_step: 2 });

          toast.success('done');
        }
        this.setState({ is_buttonloding: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // this.setState({ isloading: false });
      });
  };

  update_order_method = (method) => {
    if (method == 'DineIn') {
      this.setState({
        order_method: method,
        show_table: true,
        if_table_order: true,
      });
    } else {
      this.setState({
        order_method: method,
        show_table: false,
        if_table_order: false,
      });
    }
  };

  next_step = () => {
    if (
      this.state.contact != null &&
      this.state.contact != '' &&
      this.state.order_method == 'DineIn'
    ) {
      this.setState({ payment_step: 2 });
    } else {
      this.setState({ user_id: '', contact: '', name: '' });
    }

    this.setState({ isModalOpen: true });
  };

  place_order = (payment_method) => {
    this.setState({ is_buttonloding: true });

    var order_method = this.state.order_method;
    if (
      this.state.order_method != 'TakeAway' &&
      this.state.order_method != 'Delivery'
    ) {
      var order_method = this.state.table_no;
    }
    fetch(api + 'place_pos_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        user_id: this.state.user_id,
        cart: this.state.cart,
        method: order_method,
        payment_method: payment_method,
        split_payment: this.state.split_payment,
        discount: this.state.discount,
        discount_type: this.state.discount_type,
        instruction: this.state.notes,
        coupon_code: this.state.coupon_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({
            payment_step: 0,
            isModalOpen: false,
            cart: [],
            subTotal: 0,
            taxes: 0,
            grandTotal: 0,
            posOrderComplete: true,
            order_code: json.data[0].order_code,
            order: json.data,
            kot_id: json.data[0].kot,
            discount: 0,
            notes: '',
          });
          this.clear_notes();
          if (
            json.data[0].order_type != 'TakeAway' ||
            json.data[0].order_type != 'Delivery'
          ) {
            this.setState({
              order_table_no: json.data[0].table.table_uu_id,
              if_table_order: true,
            });
          }
          toast.success('Order Placed');
        }
        this.setState({ is_buttonloding: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_buttonloding: false });
      });
  };

  update_order_type = (table_uu_id) => {
    this.orderDetails(table_uu_id);
    this.setState({
      order_method: 'DineIn',
      table_no: table_uu_id,
      show_table: false,
    });
  };

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
        } else {
          this.setState({
            name: json.data[0].user.name,
            user_id: json.data[0].user.id,
            contact: json.data[0].user.contact,
          });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  guest = () => {
    this.setState({ user_id: '1', contact: '0000000000', name: 'Guest' });
    this.setState({ payment_step: 2 });
    this.setState({ isModalOpen: true });
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

  fetch_current_offers_vendor = () => {
    fetch(api + 'fetch_current_offers_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: this.context.user.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ offers: [] });
        } else {
          this.setState({ offers: json.data });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  apply_discount = (discount_type, discount, coupon_code) => {
    if (discount_type == 'percentage') {
      var discount_amount = Math.round((this.state.subTotal * discount) / 100);
    } else {
      var discount_amount = Math.round(discount);
    }
    this.setState({
      discount: discount_amount.toFixed(2),
    });

    this.setState({
      coupon_code: coupon_code,
    });
    this.calculateTotal(this.state.subTotal, discount_amount);
  };

  add_notes = (notes) => {
    this.setState({ notes: notes });
  };

  clear_notes = () => {
    this.setState({ notes: '' });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>POS</title>
        </Helmet>
        <div className="main-wrappers">
          {this.state.isloading ? (
            <Loader />
          ) : (
            <div
              className="page-wrapper p-0"
              id="sidebar"
              style={{
                margin: '0 0 0 20px',
              }}
            >
              <div className="content">
                <div className="row">
                  {this.state.show_table ? (
                    <div className="col-lg-9 col-sm-12 pe-4">
                      <PosHeader
                        order_method={this.state.order_method}
                        update_order_method={this.update_order_method}
                      />
                      <Tables update_order_type={this.update_order_type} />
                    </div>
                  ) : (
                    <div className="col-lg-9 col-sm-12 pe-4">
                      <>
                        <PosHeader
                          order_method={this.state.order_method}
                          update_order_method={this.update_order_method}
                        />

                        <div className="row">
                          {this.state.category.length > 0 ? (
                            <Category
                              active_cat={this.state.active_cat}
                              category={this.state.category}
                              fetch_product={this.active_cat}
                            />
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
                                Sorry, we couldn't find any records at this
                                moment.{' '}
                              </h4>
                            </div>
                          )}
                        </div>

                        <Modal
                          focusTrapped={false}
                          open={this.state.product_show}
                          onClose={() => this.onCloseModal()}
                          center
                          showCloseIcon={true}
                          styles={{
                            modal: {
                              width: '100%',
                              maxWidth: '60vw',
                            },
                          }}
                          classNames={{
                            modal: 'new_modal_styling new_modal_styling2',
                          }}
                        >
                          <div className="w-100">
                            <h5
                              className="mb-2 fw-600 font-md"
                              style={{
                                paddingLeft: '10px',
                                paddingBottom: '10px',
                                borderBottom: '1px solid #e0e0e0',
                              }}
                            >
                              Select The Product To Add
                            </h5>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <input
                                    type="text"
                                    id="pos_search_bar"
                                    className="form-control"
                                    placeholder="Search"
                                    value={this.state.search}
                                    onChange={(e) => this.search(e)}
                                    autoFocus={false}
                                    ref={this.inputRef}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row pos_divs_row">
                              {this.state.products.length > 0 ? (
                                this.state.products.map((item, index) => {
                                  return (
                                    <Products
                                      key={index}
                                      data={item}
                                      product_show={this.state.product_show}
                                      cart={this.add_to_cart}
                                    />
                                  );
                                })
                              ) : (
                                <div className="d-flex align-items-center justify-content-center flex-column">
                                  <img
                                    src={no_product}
                                    alt="img"
                                    style={{
                                      height: '300px',
                                      paddingBottom: '20px',
                                    }}
                                  />
                                  <p>No Product Found.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Modal>
                      </>
                    </div>
                  )}
                  <div
                    className="col-lg-3 col-sm-12 sidebar_scroll"
                    style={{
                      position: 'fixed',
                      zIndex: 99,
                      right: '10px',
                      overflowY: 'hidden',
                      boxShadow: '0px 0px 11px 1px rgba(0,0,0,0.24)',
                      borderRadius: '10px',
                    }}
                  >
                    <PosAdd
                      next_step={this.next_step}
                      clear={this.clear_cart}
                      cart={this.state.cart}
                      update_cart={this.update_cart}
                      subTotal={this.state.subTotal}
                      grandTotal={this.state.grandTotal}
                      taxes={this.state.taxes}
                      offers={this.state.offers}
                      discount={this.state.discount}
                      apply_discount={this.apply_discount}
                      add_notes={this.add_notes}
                      notes={this.state.notes}
                      clear_notes={this.clear_notes}
                      check_coupon={this.check_coupon}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Modal
            focusTrapped={false}
            open={this.state.isModalOpen}
            onClose={() => this.setState({ isModalOpen: false, split: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Place POS Order</h4>
                </div>
              </div>
              {this.state.payment_step == 0 ? (
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Customer Contact</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({ contact: e.target.value });
                        }}
                        value={this.state.contact}
                        maxLength="10"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 d-flex justify-content-start">
                    <a
                      // href="javascript:void(0);"
                      onClick={() => {
                        this.guest();
                      }}
                      className="btn  btn-danger btn-sm me-2"
                    >
                      Skip
                    </a>
                  </div>
                  <div className="col-lg-6 d-flex justify-content-end">
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
                        // href="javascript:void(0);"
                        onClick={() => {
                          this.verifyCustomer();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Verify Customer
                      </a>
                    )}
                  </div>
                </div>
              ) : this.state.payment_step == 1 ? (
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Customer Contact</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({ contact: e.target.value });
                        }}
                        value={this.state.contact}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Customer Name</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({ name: e.target.value });
                        }}
                        value={this.state.name}
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
                        // href="javascript:void(0);"
                        onClick={() => {
                          this.updateCustomer();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Update Customer
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <h4 className="mb-2">
                        Hello,{' '}
                        <span
                          style={{
                            textTransform: 'capitalize',
                          }}
                        >
                          {this.state.name}
                        </span>
                      </h4>
                      <h6>
                        Total Payable Amount -{' '}
                        <strong>₹{this.state.grandTotal}</strong>
                      </h6>
                      {this.state.order_method != 'DineIn' ? (
                        <label style={{ marginTop: '20px' }}>
                          Select Payment Method
                        </label>
                      ) : (
                        <label style={{ marginTop: '20px' }}>
                          Confirm Order{' '}
                        </label>
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
                        <div className="setvaluecash">
                          {this.state.order_method != 'DineIn' ? (
                            !this.state.split ? (
                              <ul>
                                <li>
                                  <a
                                    onClick={() => {
                                      this.place_order('Cash');
                                    }}
                                    href="javascript:void(0);"
                                    className="paymentmethod"
                                  >
                                    <i className="fa-solid fa-money-bill"></i>
                                    Cash
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="javascript:void(0);"
                                    onClick={() => {
                                      this.place_order('Card');
                                    }}
                                    className="paymentmethod"
                                  >
                                    <i className="fa-solid fa-credit-card"></i>
                                    Card
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="javascript:void(0);"
                                    onClick={() => {
                                      this.place_order('UPI');
                                    }}
                                    className="paymentmethod"
                                  >
                                    <i className="fa-solid fa-qrcode"></i>
                                    Scan
                                  </a>
                                </li>

                                <li>
                                  <a
                                    href="javascript:void(0);"
                                    onClick={() => {
                                      this.setState({ split: true });
                                      // this.place_order("offline-UPI");
                                    }}
                                    className="paymentmethod"
                                  >
                                    <i className="fa-solid fa-arrows-turn-to-dots"></i>
                                    Split
                                  </a>
                                </li>
                              </ul>
                            ) : (
                              <>
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
                                            type="number"
                                            className="form-control w-100"
                                            onChange={(e) => {
                                              this.add_split_amount(
                                                e.target.value,
                                                index
                                              );
                                            }}
                                            value={this.state[item.amount]}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                                <h5>Total - {this.state.split_total} </h5>
                                {this.state.split_total ==
                                  this.state.grandTotal && (
                                  <div
                                    className="btn btn-secondary btn-sm"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                      this.place_order('split');
                                    }}
                                  >
                                    <h5>Place Order</h5>
                                  </div>
                                )}
                              </>
                            )
                          ) : (
                            <ul style={{ justifyContent: 'center' }}>
                              <li>
                                <a
                                  onClick={() => {
                                    this.place_order('offline-cash');
                                  }}
                                  href="javascript:void(0);"
                                  className="paymentmethod"
                                >
                                  <i className="fa-solid fa-check-double"></i>
                                  Confirm Order
                                </a>
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            open={this.state.posOrderComplete}
            onClose={() =>
              this.setState({ posOrderComplete: false, order_code: '' })
            }
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title w-100">
                  <h4 className="text-center">Order Complete</h4>
                  <p className="text-center">
                    Order No. <strong>{this.state.order_code}</strong> has been
                    placed successfully.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="d-flex justify-content-center align-items-center">
                  <img src={success_gif} alt="img" style={{ width: '150px' }} />
                </div>
              </div>
              <div className="row my-4">
                <div className="col-lg-8 d-flex align-items-center justify-content-center pr-0">
                  {os != 'Windows' && os != 'Mac OS' ? (
                    <>
                      {this.state.if_table_order ? (
                        <></>
                      ) : (
                        <a
                          className="btn btn-secondary me-2 d-flex align-items-center justify-content-center"
                          onClick={() => {
                            if (os == 'Windows' || os == 'Mac OS') {
                              window.open(
                                api + this.state.order_code + '/bill.pdf',
                                'PRINT',
                                'height=400,width=600'
                              );
                            } else {
                              this.sendUrlToPrint(
                                api + this.state.order_code + '/bill.pdf'
                              );
                            }
                          }}
                        >
                          <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                          <p>Print Receipt</p>
                        </a>
                      )}
                      <a
                        className="btn btn-secondary w-50 d-flex align-items-center justify-content-center"
                        onClick={() => {
                          if (os == 'Windows' || os == 'Mac OS') {
                            window.open(
                              api + this.state.order_code + '/kot.pdf',
                              'PRINT',
                              'height=400,width=600'
                            );
                          } else {
                            this.sendUrlToPrint(
                              api + this.state.order_code + '/kot.pdf'
                            );
                          }
                        }}
                      >
                        <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                        <p>Print KOT</p>
                      </a>
                    </>
                  ) : (
                    <div className="row  w-100">
                      {this.state.if_table_order ? (
                        <></>
                      ) : (
                        <div className="col-md-6  d-flex align-items-center justify-content-center">
                          <ReactToPrint
                            onBeforeGetContent={() => {
                              this.setState({ bill_show: true });
                            }}
                            trigger={() => (
                              <a className="btn btn-secondary w-100 me-2 d-flex align-items-center justify-content-center">
                                <p>Print Receipt</p>
                              </a>
                            )}
                            content={() => this.componentRef2}
                          />
                        </div>
                      )}
                      <div className="col-md-6  d-flex align-items-center justify-content-center">
                        <ReactToPrint
                          onBeforeGetContent={() => {
                            this.setState({ bill_show: true });
                          }}
                          trigger={() => (
                            <a className="btn btn-secondary w-100 d-flex align-items-center justify-content-center">
                              <p>Print KOT</p>
                            </a>
                          )}
                          content={() => {
                            return this.componentRef;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {this.state.if_table_order ? (
                  <div className="col-lg-4 d-flex align-items-center justify-content-center pl-0">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        this.props.navigate(
                          '/viewtableorder/' + this.state.order_table_no
                        );
                      }}
                    >
                      View Table Order
                    </button>
                  </div>
                ) : (
                  <div className="col-lg-4 d-flex align-items-center justify-content-center pl-0">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        this.props.navigate(
                          '/orderdetails/' + this.state.order_code
                        );
                      }}
                    >
                      View Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Modal>
          {this.state.order.length > 0 && (
            <div
              style={{
                display: 'none',
              }}
            >
              <PrintKot
                ref={(el) => (this.componentRef = el)}
                order={this.state.order[0]}
                kot={this.state.kot_id}
              />
              <PrintReceipt
                ref={(el2) => (this.componentRef2 = el2)}
                order={this.state.order[0]}
              />
            </div>
          )}
        </div>
      </>
    );
  }
}

class PosAdd extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: true,
      offersModal: false,
      offers: this.props.offers,
      notesModal: false,
      notes: '',
      coupon: '',
    };
  }

  check_coupon = (coupon_code) => {
    fetch(api + 'verify_coupon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offer_code: coupon_code,
        vendor_uu_id: this.context.user.vendor_uu_id,
        order_value: this.props.subTotal,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
          this.setState({ coupon: '' });
          this.props.apply_discount('', 0, '');
        } else {
          toast.success(json.msg);
          this.setState({ coupon: json.data, offersModal: false });
          this.props.apply_discount(
            json.discount_type,
            json.discount,
            coupon_code
          );
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  render() {
    return (
      <>
        <div className="card card-order h-100 shadow-none p-0">
          {this.props.cart.length > 0 ? (
            <>
              <div className="card-body p-0">
                <div className="totalitem mb-1">
                  {/* {this.props.offers.length > 0 && (
                    <a
                      style={{
                        cursor: 'pointer',
                        color: '#619DD1',
                      }}
                      onClick={() => {
                        this.setState({ offersModal: true });
                      }}
                    >
                      Offers
                    </a>
                  )} */}

                  <h4>Total items : {this.props.cart.length}</h4>
                  <a
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: 'red',
                    }}
                    onClick={() => {
                      this.props.clear();
                    }}
                  >
                    Remove all
                  </a>
                </div>
                <div className="product-table w-100">
                  {this.props.cart.map((item, index) => {
                    return (
                      <ul key={index} className="product-lists pos_add_div">
                        <li style={{ width: '75%' }}>
                          <div className="productimg">
                            <div className="productcontet w-100">
                              <h4 className="text-start">
                                {item.product.product_name}
                                {item.product.variants.map((i, index) => {
                                  if (i.id == item.variant_id) {
                                    return (
                                      <p key={index}> - {i.variants_name}</p>
                                    );
                                  }
                                })}
                              </h4>
                              <div className="productlinkset">
                                {item.product.addon_map.map((i, key) => {
                                  if (item.cart_addon.includes(i.id)) {
                                    return <h5 key={key}>{i.addon_name}</h5>;
                                  }
                                })}
                              </div>
                              <div className="col-md-12">
                                <div className="row">
                                  <div className="col-6">
                                    <AddDelete
                                      key_id={index}
                                      quantity={item.quantity}
                                      update_cart={this.props.update_cart}
                                    />
                                  </div>
                                  <div
                                    className="col-6"
                                    style={{
                                      margin: '0px',
                                      display: 'flex',
                                      alignItems: 'end',
                                    }}
                                  >
                                    <p>
                                      X{' '}
                                      {(item.price / item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li
                          className="d-flex align-items-end flex-column justify-content-between"
                          style={{ width: '25%' }}
                        >
                          <a className="confirm-text">
                            <i
                              className="fa-solid fa-trash-can"
                              aria-hidden="true"
                              style={{
                                cursor: 'pointer',
                                color: 'red',
                              }}
                              onClick={() => {
                                this.props.update_cart(index, 0);
                              }}
                            ></i>
                          </a>
                          <p style={{ marginTop: '10px' }}>₹ {item.price}</p>
                        </li>
                      </ul>
                    );
                  })}
                </div>
              </div>
              <div className="card-footer py-0 px-2 pb-2">
                <div className="setvalue">
                  <ul>
                    <li>
                      <h5>Subtotal</h5>
                      <h6>₹ {this.props.subTotal}</h6>
                    </li>
                    <li>
                      <h5>Tax</h5>
                      <h6
                        style={{
                          color: 'green',
                        }}
                      >
                        ₹ {this.props.taxes}
                      </h6>
                    </li>
                    {this.props.order_method != 'DineIn' && (
                      <li>
                        <h5 className="d-flex align-items-center">
                          Discount{' '}
                          <span
                            className="btn btn-sm btn-secondary me-2"
                            style={{
                              lineHeight: '12px',
                              paddingTop: '4px',
                              marginLeft: '5px',
                              height: '20px',
                            }}
                            onClick={() => {
                              this.setState({ offersModal: true });
                            }}
                          >
                            +
                          </span>
                        </h5>
                        <h6
                          style={{
                            color: 'red',
                          }}
                        >
                          ₹ {this.props.discount}
                        </h6>
                      </li>
                    )}
                    <li className="total-value">
                      <h5>Total</h5>
                      <h6>₹ {this.props.grandTotal}</h6>
                    </li>
                  </ul>
                </div>
                <div className="w-100 d-flex align-items-center justify-content-between">
                  <div
                    className="btn btn-danger btn-sm"
                    style={{
                      width: '20%',
                      height: 'auto',
                    }}
                    onClick={() => {
                      this.setState({ notesModal: true });
                    }}
                  >
                    Notes
                  </div>
                  <div
                    className="btn btn-secondary btn-sm"
                    style={{ width: '75%' }}
                    onClick={() => {
                      this.props.next_step();
                    }}
                  >
                    Place Order
                  </div>
                </div>

                {/* <div
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    this.props.put_on_hold();
                  }}
                >
                  <h5>Put on Hold</h5>
                </div> */}
              </div>
            </>
          ) : (
            <div className="card-body p-0 d-flex align-items-center justify-content-center flex-column mt-5">
              <img src={no_cart} alt="img" style={{ width: '500px' }} />
              <h5>{/* <b>Cart is Empty</b> */}</h5>
            </div>
          )}
        </div>
        <Modal
          focusTrapped={false}
          open={this.state.offersModal}
          // open={true}
          onClose={() => {
            this.setState({ offersModal: false });
          }}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <h5
            className="mb-2 fw-600 font-md"
            style={{
              paddingLeft: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            Discount & Offers
          </h5>
          <div className="mx-2">
            <h5 className="my-2">Discount</h5>
            <div className="row d-flex align-items-center mb-2">
              <div className="col-lg-6">
                <div className="row">
                  <div className="col-lg-6">
                    <button
                      className={
                        this.state.percentageDiscount
                          ? 'btn btn-secondary btn-sm w-100'
                          : 'btn btn-outline btn-sm w-100'
                      }
                      onClick={() => {
                        this.setState({
                          percentageDiscount: !this.state.percentageDiscount,
                          discount_on_order: true,
                        });
                        // if (this.state.discountAmount > 0) {
                        //   this.genrate_bill(this.state.discountAmount, true);
                        // }
                      }}
                    >
                      Percentage
                    </button>
                  </div>
                  <div className="col-lg-6">
                    <button
                      className={
                        this.state.percentageDiscount
                          ? 'btn btn-outline btn-sm w-100'
                          : 'btn btn-secondary btn-sm w-100'
                      }
                      onClick={() => {
                        this.setState({
                          percentageDiscount: !this.state.percentageDiscount,
                          discount_on_order: true,
                        });
                        // if (this.state.discountAmount > 0) {
                        //   this.genrate_bill(this.state.discountAmount, false);
                        // }
                      }}
                    >
                      Fixed
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form-group m-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Value"
                    onChange={(e) => {
                      this.setState({
                        discountAmount: e.target.value,
                        discount_on_order: true,
                      });
                    }}
                    value={this.state.discountAmount}
                  />
                </div>
              </div>
            </div>
            {/* {this.state.offers.length > 0 && (
              <>
                <h5 className="my-2">Offers</h5>
                <div className="row d-flex align-items-center mb-2">
                  <div className="col-md-12">
                    <select className="form-control">
                      <option value="0">Select Offer</option>
                      <option value="1">Offer 1</option>
                      <option value="2">Offer 2</option>
                      <option value="3">Offer 3</option>
                    </select>
                  </div>
                </div>
              </>
            )} */}

            <div className="row">
              <div className="col-md-12 d-flex justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (this.state.percentageDiscount) {
                      var discount_type = 'percentage';
                    } else {
                      var discount_type = 'fixed';
                    }

                    this.props.apply_discount(
                      discount_type,
                      this.state.discountAmount,
                      ''
                    );
                    this.setState({ offersModal: false });
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          <div className="mx-2">
            <h5 className="my-2">Coupon Code</h5>
            <div className="row d-flex align-items-center mb-2">
              <div className="col-lg-8">
                <div className="form-group m-0">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Coupon Code"
                    onChange={(e) => {
                      this.setState({
                        coupon: e.target.value,
                      });
                    }}
                    value={this.state.coupon}
                  />
                </div>
              </div>

              <div className="col-lg-4 d-flex justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    this.check_coupon(this.state.coupon);
                  }}
                >
                  Check & Apply
                </button>
              </div>
            </div>
            {/* {this.state.offers.length > 0 && (
              <>
                <h5 className="my-2">Offers</h5>
                <div className="row d-flex align-items-center mb-2">
                  <div className="col-md-12">
                    <select className="form-control">
                      <option value="0">Select Offer</option>
                      <option value="1">Offer 1</option>
                      <option value="2">Offer 2</option>
                      <option value="3">Offer 3</option>
                    </select>
                  </div>
                </div>
              </>
            )} */}
          </div>
        </Modal>
        <Modal
          focusTrapped={false}
          open={this.state.notesModal}
          onClose={() => {
            this.setState({ notesModal: false });
          }}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <h5
            className="mb-2 fw-600 font-md"
            style={{
              paddingLeft: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            Notes
          </h5>
          <div className="mx-2">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group m-0">
                  <textarea
                    className="form-control"
                    placeholder="Add Notes"
                    onChange={(e) => {
                      this.setState({ notes: e.target.value });
                    }}
                    value={this.state.notes}
                  />
                </div>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-12 d-flex justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    this.props.add_notes(this.state.notes);
                    this.setState({ notesModal: false });
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

class AddDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      quantity: this.props.quantity,
    };
  }
  render() {
    return (
      <div className="increment-decrement">
        <div className="input-groups">
          <input
            type="button"
            defaultValue="-"
            className="button-minus dec button"
            onClick={() => {
              this.props.update_cart(
                this.props.key_id,
                this.props.quantity - 1
              );
              // this.setState({ count: this.state.count - 1 });
            }}
          />
          <div style={{ marginLeft: '10px', marginRight: '10px' }}>
            {this.props.quantity}
          </div>

          <input
            type="button"
            defaultValue="+"
            className="button-plus inc button"
            onClick={() => {
              this.props.update_cart(
                this.props.key_id,
                this.props.quantity + 1
              );
              // this.setState({ count: this.state.count + 1 });
            }}
          />
        </div>
      </div>
    );
  }
}

class Category extends Component {
  render() {
    return (
      <>
        <div
          className="col-pos-div d-flex"
          onClick={() => {
            this.props.fetch_product(0, []);
          }}
          style={{ padding: '10px' }}
        >
          <div className="productset flex-fill">
            {/* <div className="productsetimg"></div> */}
            <div className="productsetcontent">
              <div>
                <h4>Search</h4>
              </div>
            </div>
          </div>
        </div>
        <div
          className="col-pos-div d-flex"
          onClick={() => {
            this.props.fetch_product(0, []);
          }}
          style={{ padding: '10px' }}
        >
          <div className="productset flex-fill">
            {/* <div className="productsetimg"></div> */}
            <div className="productsetcontent">
              <div>
                <h4>All</h4>
              </div>
            </div>
          </div>
        </div>

        {this.props.category.length > 0 ? (
          this.props.category.map((item, index) => (
            <div
              className="col-pos-div d-flex"
              onClick={() => {
                this.props.fetch_product(item.id, item.products);
              }}
              style={{ padding: '10px' }}
            >
              <div className="productset flex-fill">
                {/* <div className="productsetimg"></div> */}
                <div className="productsetcontent">
                  <div>
                    <h4>
                      {item.name} ({item.products_count}){' '}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-danger">No Category Found</div>
          </div>
        )}
      </>
      // <div className='col-4'>
      // {/* <ul className="tabs ">
      //   <li
      //     onClick={() => {
      //       this.props.fetch_product(0);
      //     }}
      //   > */}
      //     <div
      //       className={
      //         'product-details' +
      //         (this.props.active_cat == 0 ? ' active' : '')
      //       }
      //     >
      //       <h6>All</h6>
      //     </div>
      //   {/* </li> */}

      //   {this.props.category.length > 0 ? (
      //     this.props.category.map((item, index) => {
      //       return (
      //         // <li
      //         //   key={index}
      //         //   onClick={() => {
      //         //     this.props.fetch_product(item.id);
      //         //   }}
      //         // >
      //           <div
      //             className={
      //               'product-details' +
      //               (this.props.active_cat == item.id ? ' active' : '')
      //             }
      //           >
      //             <h6>
      //               {item.name} ({item.products_count})
      //             </h6>
      //           </div>
      //         // </li>
      //       );
      //     })
      //   ) : (
      //     <></>
      //   )}

      // {/* </ul> */}
      // </div>
    );
  }
}

class Products extends Component {
  constructor(props) {
    super(props);
    if (this.props.data.variants.length > 0) {
      var vv = this.props.data.variants[0].id;
    } else {
      var vv = 0;
    }

    this.state = {
      openModal: false,
      variants_id: vv,
      addon: [],
    };
  }

  add_cart(product) {
    if (product.addon_map.length > 0 || product.variants.length > 0) {
      this.setState({ openModal: true });
    } else {
      this.props.cart(product, this.state.variants_id, this.state.addon);
    }
  }

  select_addon = (id) => {
    if (this.state.addon.includes(id)) {
      var index = this.state.addon.indexOf(id);
      if (index > -1) {
        this.state.addon.splice(index, 1);
      }
    } else {
      this.state.addon.push(id);
    }
    this.setState({ addon: this.state.addon });
  };

  onCloseModal = () => {
    this.setState({ openModal: false });
  };

  render() {
    return (
      <div className="col-md-3">
        <div
          className=" d-flex"
          onClick={() => {
            this.add_cart(this.props.data);
          }}
        >
          <div
            className="productset flex-fill"
            style={{ paddingBottom: '10px', marginBottom: '15px' }}
          >
            <div className="productsetcontent">
              <div className="row">
                <div className="col-12">
                  <h4>{this.props.data.product_name}</h4>
                  <h6>₹{this.props.data.our_price}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          focusTrapped={false}
          open={this.state.openModal}
          onClose={() => this.onCloseModal()}
          center
          showCloseIcon={true}
          classNames={{
            modal: 'customModal',
          }}
        >
          <h5
            className="mb-2 fw-600 font-md"
            style={{
              paddingLeft: '10px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            Customise as per your taste
          </h5>
          <div className="mx-2">
            {this.props.data.variants.length > 0 ? (
              <>
                <h5 className="title-color font-sm fw-600 text-align-center mt-3 mb-3">
                  Variant
                </h5>
                <RadioGroup
                  value={this.state.variants_id.toString()}
                  onChange={(value) => {
                    this.setState({ variants_id: value, count: 0 });
                  }}
                >
                  {this.props.data.variants.map((values, key) => {
                    return (
                      <RadioButton
                        value={values.id.toString()}
                        pointColor="#619DD1"
                        iconSize={20}
                        rootColor="#37474f"
                        iconInnerSize={10}
                        padding={10}
                        props={{
                          className: 'radio-button',
                        }}
                        key={key}
                      >
                        <div className="d-flex justify-content-between align-items-center radio_button_text">
                          <p className="m-0">{values.variants_name}</p>
                          <div className="d-flex">
                            <p className="m-0 mx-3">
                              ₹ {values.variants_discounted_price}
                            </p>
                          </div>
                        </div>
                      </RadioButton>
                    );
                  })}
                </RadioGroup>
              </>
            ) : (
              <></>
            )}
            {this.props.data.addon_map.length > 0 ? (
              <>
                <h5 className="title-color font-sm fw-600 text-align-center mt-3 mb-3">
                  Addon
                </h5>
                {this.props.data.addon_map.map((values, index) => {
                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center single_checkbox new_checkbox w-100 my-3"
                    >
                      <input
                        type="checkbox"
                        id={values.id}
                        name={values.id}
                        value={values.id}
                        className="checkbox"
                        checked={this.state.addon.includes(values.id)}
                        onChange={() => {
                          this.select_addon(values.id);
                        }}
                      />
                      <label
                        htmlFor={values.id}
                        className="checkbox_text d-flex justify-content-between align-items-center"
                      >
                        <p className="m-0 mx-3">{values.addon_name}</p>
                        <p className="m-0 mx-3">₹ {values.addon_price}</p>
                      </label>
                    </div>
                  );
                })}
              </>
            ) : (
              <></>
            )}

            <div className="d-flex align-items-center justify-content-end">
              <a
                onClick={() => {
                  this.setState({ openModal: false });
                  this.props.cart(
                    this.props.data,
                    this.state.variants_id,
                    this.state.addon
                  );
                }}
                className="btn btn-secondary"
              >
                Add Item
              </a>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

class Tables extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      is_loading: true,
    };
  }

  componentDidMount() {
    this.fetch_table_vendors();
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
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({ data: json.data });
          }
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  render() {
    return (
      <>
        <h4>Dine-In</h4>
        <div className="row" style={{ marginTop: 10 }}>
          {this.state.is_loading ? (
            <Skeletonloader count={1} height={100} />
          ) : (
            <>
              {this.state.data.length > 0 ? (
                this.state.data.map((item, index) => {
                  return (
                    <div key={index} className="col-lg-3">
                      <a
                        onClick={() => {
                          this.props.update_order_type(item.table_uu_id);
                        }}
                        // to={"/viewtableorder/" + item.table_uu_id}
                        className=" d-flex w-100"
                      >
                        <div
                          className={
                            item.table_status == 'active'
                              ? 'dash-count1'
                              : 'dash-count'
                          }
                        >
                          <div className="dash-counts">
                            <h5>{item.table_name}</h5>
                            <p
                              style={{
                                textTransform: 'capitalize',
                              }}
                            >
                              {item.table_status}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Pos {...props} {...useParams()} navigate={abcd} location={location} />
  );
}

export default (props) => <Navigate {...props} />;

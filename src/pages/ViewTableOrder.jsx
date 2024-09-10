import moment from 'moment';
import React, { Component,createRef } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { DatePicker, SelectPicker, Timeline } from 'rsuite';

import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { os } from '../../os';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no_orders.webp';
import PrintKot from '../component/PrintKot';
import PrintReceipt from '../component/PrintReceipt';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import edit_icon from '../assets/images/icons/edit.svg';

const cancellation_reasons = [
  { reason: 'Items out of stock' },
  { reason: 'Nearing closing time' },
  { reason: 'Kitchen is Full' },
  { reason: 'Customer not happy' },
  { reason: 'Customer changed the order and placed a new one' },
  { reason: 'Customer changed his mind and cancelled the order' },
  { reason: 'Double Order Punched' },
  { reason: 'Other' },
];

export class ViewTableOrder extends Component {
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
      print_receipt: '',
      coupon: '',
      modaloffer: false,
      discountModel: false,
      coupon_button_loader: false,
      customerModal: false,
      add_customer_buttonLoading: false,
      add_customer_name: '',
      add_customer_contact: '',
      openEditModal: false,
      editCustomerName: '',
      editCustomerEmail: '',
      editCustomerContact: '',
      editCustomerBirthday: new Date(),
      editCustomerAnniversary: new Date(),
      is_button_loading_add: false,
      cancelModal: false,
      cancellation_reason: '',
      payment_options: [
        { label: 'Swiggy Dine In', value: 'Swiggy Dine In' },
        { label: 'Zomato Dine In', value: 'Zomato Dine In' },
        { label: 'Eazy Diner', value: 'Eazy Diner' },
        { label: 'Paytm', value: 'Paytm' },
        { label: 'MagicPin', value: 'MagicPin' },
        { label: 'DotPe', value: 'Dotpe' },
        { label: 'Dunzo', value: 'Dunzo' },
      ],
      payment_option: '',
      showOther:false
    };

    this.componentRef = React.createRef([]);
    this.componentRef = [];
    this.PrintRecipt= createRef();
    this.kotprints =[];
    // this.kotprints = createRef();
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.orderDetails(this.props.id);
    this.fetch_table_vendors();
  }

  print = ()=>
  {
    const contentToPrint = this.PrintRecipt.current.innerHTML;
    window.electron.send('print', contentToPrint);

    this.handlePrintClick('receipt');
  }

  printkot = (index)=>
  {

    const contentToPrint = this.kotprints[index].innerHTML;
   
    window.electron.send('print', contentToPrint);
    this.handlePrintClick('kot');
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
          this.props.navigate('/pos/' + this.props.id, { replace: true });
        } else {
          if (json.data[0].discount_type === 'percentage') {
            var discount = (
              (json.data[0].order_discount / json.data[0].order_amount) *
              100
            ).toFixed(2);
            this.setState({ discount_on_order: true });
          } else if (json.data[0].discount_type === 'fixed') {
            var discount = json.data[0].order_discount;
            this.setState({ discount_on_order: true });
          } else {
            var discount = 0;
            this.setState({ discount_on_order: false });
          }
          this.setState({
            all_data: json.data,
            data: json.data[0],
            cart: json.data[0].cart,
            user: json.data[0].user,
            print_receipt: json.data[0].order_for,
            isLoading: false,
            table_data: json.data[0].table,
            total_amount: json.data[0].total_amount,
            order_code: json.data[0].order_code,
            discountAmount: discount,
            percentageDiscount:
              json.data[0].discount_type === 'percentage' ? true : false,
          });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  addDiscount = (discount, type) => {

    if (
      this.state.print_receipt == 'gen_receipt' &&
      this.context.role.staff_role != 'admin' &&
      this.context.role.staff_role != 'owner'
    ) {
      toast.error(
        'You can not update item once receipt has been generated. Please contact Admin.'
      );
      return;
    }
    
    // regex to check number and decimal point only
    const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!regex.test(discount)) {
      toast.error('Please enter valid discount amount');
      return;
    }

    this.setState({ generate_order_buttonLoading: true, price_loading: true });
    fetch(api + 'add_discount_on_order', {
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
         
          if (json.data[0].discount_type === 'percentage') {
            var discount = (
              (json.data[0].order_discount / json.data[0].order_amount) *
              100
            ).toFixed(2);
            this.setState({ discount_on_order: true });
          } else if (json.data[0].discount_type === 'fixed') {
            var discount = json.data[0].order_discount;
            this.setState({ discount_on_order: true });
          } else {
            var discount = 0;
            this.setState({ discount_on_order: false });
          }
          this.setState({
            all_data: json.data,
            data: json.data[0],
            cart: json.data[0].cart,
            user: json.data[0].user,
            print_receipt: json.data[0].order_for,
            isLoading: false,
            table_data: json.data[0].table,
            total_amount: json.data[0].total_amount,
            order_code: json.data[0].order_code,
            discountAmount: discount,
            percentageDiscount:
              json.data[0].discount_type === 'percentage' ? true : false,
          });
          
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
    if (this.state.payment == 'other') {
      if (this.state.payment_option == '') {
        toast.error('Please Select Payment Method');
        return;
      } else {
        var payment_method = this.state.payment_option;
      }
    } else {
      var payment_method = this.state.payment;
    }

    this.setState({ mark_complete_buttonLoading: true });
    fetch(api + 'update_order_status_by_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.order_code,
        payment_method: payment_method,
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


    change_order_status = (status) => {
      var cancellation_reason = '';
      if (status == 'cancelled') {
        if (
          this.state.print_receipt == 'gen_receipt' &&
          this.context.role.staff_role != 'admin' &&
          this.context.role.staff_role != 'owner'
        ) {
          toast.error(
            'You can not Cancel Order once receipt has been generated. Please contact Admin.'
          );
          return;
        }
        if (this.state.cancellation_reason == 'Other') {
          cancellation_reason = this.state.other_reason;
        } else {
          cancellation_reason = this.state.cancellation_reason;
        }
      }
      this.setState({ clear_table_buttonLoading: true });
      fetch(api + 'update_order_status', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          order_id: this.state.data.order_code,
          status: status,
          cancellation_reason: cancellation_reason,
          prepare_time: this.state.time,
          rider_id: this.state.rider_id,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.props.navigate('/');
          
            toast.success('Order  Updated Successfully');
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
    if (
      this.state.print_receipt == 'gen_receipt' &&
      this.context.role.staff_role != 'admin' &&
      this.context.role.staff_role != 'owner'
    ) {
      toast.error(
        'You can not update item once receipt has been generated. Please contact Admin.'
      );
      return;
    }

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

  genrate_receipt = () => {
    this.setState({ genrate_receipt_buttonLoading: true });
    fetch(api + 'generate_receipt', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ receipt_modalVisible: false });
          this.orderDetails(this.props.id);
          toast.success('Receipt Generated');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ genrate_receipt_buttonLoading: false });
      });
  };

  check_coupon = (coupon_code) => {
    if (coupon_code == '') {
      toast.error('Please enter coupon code');
      return;
    }
    this.setState({ coupon_button_loader: true });
    fetch(api + 'apply_coupon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        offer_code: coupon_code,
        order_code: this.state.data.order_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
          this.setState({ coupon: '' });
        } else {
          var order = this.state.data;
          order.order_amount = json.data[0].order_amount;
          order.discount = json.data[0].discount;
          order.sgst = json.data[0].sgst;
          order.cgst = json.data[0].cgst;
          order.total_amount = json.data[0].total_amount;
          this.setState({ data: order });
          this.orderDetails(this.props.id);
          toast.success(json.data[0].msg);
          this.setState({
            coupon: coupon_code,
            discountModel: false,
          });
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ coupon_button_loader: false });
      });
  };

  update_customer_on_order = () => {
    if (this.state.add_customer_contact === '') {
      toast.error('Please enter customer contact');
      return;
    }
    this.setState({ add_customer_buttonLoading: true });
    fetch(api + 'update_customer_on_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
        user_contact: this.state.add_customer_contact,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          if (json.data.name == '') {
            this.setState({
              openEditModal: true,
            });
          }

          this.setState({
            customerModal: false,
            editCustomerName: json.data.name,
            editCustomerEmail: json.data.email,
            editCustomerContact: json.data.contact,
            editCustomerBirthday: new Date(json.data.dob),
            editCustomerAnniversary: new Date(json.data.anniversary),
          });
          this.orderDetails(this.props.id);
          toast.success('Customer added successfully');
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ add_customer_buttonLoading: false });
      });
  };

  update_customer_name = () => {
    if (
      this.state.editCustomerName == '' ||
      this.state.editCustomerContact == ''
    ) {
      toast.error('Customer Name and Contact is required.');
      return;
    }

    const contactRegex = /^[0-9]+$/;

    const nameRegex = /^[a-zA-Z]+$/;

    if (!contactRegex.test(this.state.editCustomerContact)) {
      toast.error('Contact should be a number.');
      return;
    }

    if (!nameRegex.test(this.state.editCustomerName)) {
      toast.error('Name should be a string.');
      return;
    }

    if (this.state.editCustomerContact.length < 10) {
      toast.error('Contact should be of 10 digit.');
      return;
    }

    this.setState({ is_button_loading_add: true });
    fetch(api + 'update_customer_name', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        name: this.state.editCustomerName,
        email: this.state.editCustomerEmail,
        contact: this.state.editCustomerContact,
        dob: moment(this.state.editCustomerBirthday).format('YYYY-MM-DD'),
        anniversary: moment(this.state.editCustomerAnniversary).format(
          'YYYY-MM-DD'
        ),
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ is_button_loading_add: false });
          toast.error(json.errors[0]);
        } else {
          this.setState({ is_button_loading_add: false });
          this.setState({ openEditModal: false });
          this.fetch_order(1, '');
          toast.success('Customer updated successfully.');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_button_loading_add: false });
      });
  };

  handleChange = (e) => {
    if (e.target.value === '') {
      this.setState({
        discountAmount: 0,
        discount_on_order: false,
        generate_order_buttonLoading: true,
      });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.genrate_bill(0, this.state.percentageDiscount);
      }, 500);
      return;
    }
    const value = e.target.value;
    this.setState({
      discountAmount: value,
      discount_on_order: true,
      generate_order_buttonLoading: true,
    });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.genrate_bill(value, this.state.percentageDiscount);
    }, 500);
  };

  handlePrintClick = (type) => {
    var data = this.state.data;

    if(type == 'receipt'){
      data.print_receipt_count = data.print_receipt_count - 1;
      }
  
      if(type== 'kot')
      {
        data.print_kot_count = data.print_kot_count - 1;
     
      }
      
    this.setState({ data: data });
    fetch(api + 'update_recipt_print_count', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
        type: type,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
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
        <Helmet>
          <title>View Table Order</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              {this.state.isLoading ? (
                <Loader />
              ) : (
                <>
                  {this.state.all_data.length > 0 ? (
                    <>
                      <div className="page-header">
                        <div className="page-title">
                          <h4>
                            Order Details-{' '}
                            <span
                              style={{
                                color: '#0066b2',
                              }}
                            >
                              {this.state.table_data.table_name}
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
                              Please Wait
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

{
      (this.state.print_receipt == 'gen_receipt' &&
      this.context.role.staff_role != 'admin' &&
      this.context.role.staff_role != 'owner') ?
      <></>
      :
  <>
                          <Link
                            className="btn btn-secondary btn-sm me-2"
                            to={"/pos/new/" + this.state.data.order_code}
                          >
                            <i className="fa-solid fa-plus mr-2"></i>Add More
                            Item
                          </Link>

                          <Link
                            className="btn btn-secondary btn-sm me-2"
                            onClick={() => {
                              this.setState({ discountModel: true });
                            }}
                          >
                            <i className="iconly-Discount me-2"></i>Apply Coupon
                          </Link>
                          </>
  }

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
                                this.setState({ cancelModal: true });
                                // Swal.fire({
                                //   title: 'Are you sure',
                                //   text: 'You want to clear this table order?',
                                //   showCancelButton: true,
                                //   confirmButtonColor: '#0066b2',
                                //   cancelButtonColor: '#d33',
                                //   confirmButtonText: 'Yes, clear it!',
                                // }).then((result) => {
                                //   if (result.isConfirmed) {
                                //     this.clear_table_order();
                                //   }
                                // });
                              }}
                            >
                              <i className="fa-solid fa-circle-xmark mr-2"></i>
                              Clear Table Order
                            </button>
                          )}
                        </div>
                      </div>
                      <section className="comp-section comp-cards">
                        <div className="row">
                          <div className="col-8">
                            {/* order details */}
                            <div className="card flex-fill bg-white">
                              <div
                                className="card-header order_details"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  <h5>
                                    Order ID: {this.state.data.bill_no}
                                  </h5>
                                  <h6 className="order_date mt-2">
                                    {moment(this.state.data.created_at).format(
                                      'llll'
                                    )}
                                  </h6>
                                </div>
                              </div>
                              <div className="card-body">
                                <h5 className="card-title">
                                  {this.state.cart.length}{' '}
                                  {this.state.cart.length > 1
                                    ? 'Items'
                                    : 'Item'}
                                </h5>
                                <div className="row">
                                  <div className="col-md-12">
                                    <section
                                      className="item-section"
                                      style={{
                                        padding: '20px 0 0!important',
                                      }}
                                    >
                                      <div className="item_row">
                                        <div className="sno_column_heading">
                                          No.
                                        </div>
                                        <div className="item_name_column_heading">
                                          Item
                                        </div>
                                        <div className="price_column_table_heading">
                                          Price
                                        </div>
                                        <div className="qty_column_heading">
                                          Qty.
                                        </div>
                                        <div className="amount_column_table_heading">
                                          Amt.
                                        </div>
                                        <div className="action_column_heading"></div>
                                      </div>
                                      {this.state.cart.map((item, index) => {
                                        return (
                                          <div
                                            style={{
                                              cursor: 'pointer',
                                            }}
                                            className="single_item_row"
                                            onClick={() => {
                                                   this.context.role.staff_role != 'staff' && 
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
                                            <div className="sno_column">
                                              {index + 1}
                                            </div>
                                            <div className="item_name_column">
                                              <span
                                                style={{
                                                  fontWeight: '800px',
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
                                                    <strong>Add-Ons: </strong>
                                                    {item.addons.map(
                                                      (items) => {
                                                        return (
                                                          <span className="addon_text_order">
                                                            {items.addon_name}
                                                          </span>
                                                        );
                                                      }
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div className="price_column_table">
                                              {(
                                                item.product_price /
                                                item.product_quantity
                                              ).toFixed(2)}
                                            </div>
                                            <div className="qty_column">
                                              x {item.product_quantity}
                                            </div>
                                            <div className="amount_column_table">
                                              {item.product_price.toFixed(2)}
                                            </div>
                                            <div className="action_column">
                                              {
                                                  this.context.role.staff_role != 'staff'
                                                  &&
                                                  <img src={edit_icon} alt="" />
                                                  
                                              }
                                             
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </section>
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer text-muted">
                                <div className="row">
                                  <div className="col-md-6">Item Total</div>
                                  <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                    <div className="d-flex align-items-center">
                                      ₹{this.state.data.order_amount.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                {this.state.data.order_discount > 0 && (
                                  <div className="row">
                                    <div className="col-md-9 text-danger mt-2">
                                      Discount
                                      {this.state.data.offer.length > 0 && (
                                        <span>
                                          {' [' +
                                            this.state.data.offer[0]
                                              .offer_code +
                                            ' : ' +
                                            this.state.data.offer[0]
                                              .offer_name +
                                            ']'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="col-md-3 d-flex align-items-start justify-content-end item_total">
                                      <div className="d-flex align-items-center text-danger mt-2">
                                        ₹{' '}
                                        {this.state.data.order_discount.toFixed(
                                          2
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {this.state.data.convenience_fee > 0 && (
                                  <div className="row">
                                    <div className="col-md-6 text-success mt-2">
                                      Convenience Fee
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                      <div className="d-flex align-items-center text-success mt-2">
                                        ₹ {this.state.data.convenience_fee}
                                      </div>
                                    </div>
                                  </div>
                                )}

{this.state.data.charges.length > 0 && (
                              <div className="row">
                                {this.state.data.charges.map((item, index) => (
                                  <React.Fragment key={index}>
                                    <div className="col-md-6 text-success mt-2">
                                      {item.charge_name}
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                      <div className="d-flex align-items-center  mt-2">
                                        ₹ {item.charge_amount}
                                      </div>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}


                                {this.state.data.cgst > 0 ||
                                this.state.data.sgst > 0 ? (
                                  <div className="row">
                                    <div className="col-md-6 text-success mt-2">
                                      Taxes and other Charges
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                      <div className="d-flex align-items-center text-success mt-2">
                                        ₹{' '}
                                        {(
                                          this.state.data.cgst +
                                          this.state.data.sgst
                                        ).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}

                                <div className="row">
                                  <div className="col-md-6 grand_total">
                                    Grand Total
                                  </div>
                                  <div className="col-md-6 d-flex align-items-start justify-content-end">
                                    <div className="d-flex align-items-center grand_total">
                                      ₹{' '}
                                      {this.state.data.total_amount.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              
                            </div>
                            {this.state.generate_order_buttonLoading ? (
                                    <button
                                      className="btn btn-secondary btn-sm w-100"
                                      disabled
                                    >
                                      <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                      ></span>
                                      Generating Bill
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-secondary btn-sm w-100"
                                      onClick={() => {
                                        this.setState({
                                          generateBillModal: true,
                                        });
                                      }}
                                    >
                                      <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                      Settle Order
                                    </button>
                                  )}

<br/><br/>

{this.state.data.logs.length > 0 && (
                          <Timeline className="custom-timeline">
                            {this.state.data.logs.map((itm, i) => (
                              <Timeline.Item key={i}>
                                <div className="d-flex align-items-center">
                                  <p className="timeline-date m-0">
                                    {moment(itm.created_at).format('lll')}
                                  </p>
                                  <p className="timeline-text ms-2">
                                    {itm.action} By {itm.staff.staff_name}
                                  </p>
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        )}

                            {/* user details */}
                          </div>
                          <div className="col-4">
                            <div className="card flex-fill bg-white">
                              <div className="card-header order_details">
                              {
                                      this.context.role.staff_role === 'staff'  &&  this.context.user.max_discount == 0?
                                      <></>
                               : 
                                <h5>Discount</h5>
                              }
                              </div>
                              <div className="card-body">
                              {
                                      this.context.role.staff_role === 'staff' &&  this.context.user.max_discount == 0?
                                      <></>
                               : 
                               <div className="row d-flex align-items-center mb-3">
                                  
                                  <div className="col-lg-8">
                                   
                                    <div className="row">
                                      <div className="col-lg-6 d-flex align-items-center">
                                        <button
                                          className={
                                            this.state.percentageDiscount
                                              ? 'btn btn-secondary w-100 active'
                                              : 'btn btn-secondary w-100'
                                          }
                                          style={{
                                            fontSize: '12px',
                                          }}
                                          onClick={() => {
                                            this.setState({
                                              percentageDiscount:
                                                !this.state.percentageDiscount,
                                              discount_on_order: true,
                                            });
                                          
                                          }}
                                        >
                                          Percentage
                                        </button>
                                      </div>
                                      <div className="col-lg-6 d-flex align-items-center">
                                        <button
                                          className={
                                            this.state.percentageDiscount
                                              ? 'btn btn-secondary w-100'
                                              : 'btn btn-secondary w-100 active'
                                          }
                                          style={{
                                            fontSize: '12px',
                                          }}
                                          onClick={() => {
                                            this.setState({
                                              percentageDiscount:
                                                !this.state.percentageDiscount,
                                              discount_on_order: true,
                                            });
                                            
                                          }}
                                        >
                                          Fixed
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-4">
                                    <div className="form-group m-0">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Value"
                                        onChange={(e) => {
                                          this.setState({
                                            discountAmount: e.target.value,
                                          });
                                        }}
                                        value={
                                          this.state.discountAmount === 0
                                            ? ''
                                            : this.state.discountAmount
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
  }
                                <div className="d-flex align-items-center justify-content-end">
                                  
                                  {
                                    this.state.adding_discount_buttonLoading ? (
                                      <button
                                        className="btn btn-secondary btn-sm w-100"
                                        disabled
                                      >
                                        <span
                                          className="spinner-border spinner-border-sm me-2"
                                          role="status"
                                        ></span>
                                        Adding Discount
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn-secondary btn-sm w-100"
                                        onClick={() => {
                                          this.addDiscount(this.state.discountAmount, this.state.percentageDiscount);
                                        }}
                                      >
                                        Add Discount
                                      </button>
                                    )
                                  }

                                 
                                </div>
                              </div>
                            </div>
                            {this.state.user.contact === '0000000000' ? (
                              <div className="card flex-fill bg-white border-none">
                                <div className="d-flex align-items-center justify-content-center">
                                  <button
                                    className="btn btn-secondary w-50"
                                    onClick={() => {
                                      this.setState({ customerModal: true });
                                    }}
                                  >
                                    Add Customer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="card flex-fill bg-white">
                                <div className="card-header order_details">
                                  <h5>Customer details</h5>
                                </div>
                                <div className="card-body">
                                  <div className="row">
                                    <div className="col-lg-6">
                                      <div className="form-group m-0">
                                        <label>Mobile</label>
                                        <input
                                          type="text"
                                          value={this.state.user.contact}
                                          className="form-control"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-lg-6">
                                      <div className="form-group m-0">
                                        <label>Name</label>
                                        <input
                                          type="text"
                                          value={this.state.user.name}
                                          className="form-control"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {this.state.data.instruction !== ' ' &&
                            this.state.data.instruction !== '' &&
                            this.state.data.instruction !== null ? (
                              <div className="card flex-fill bg-white">
                                <div className="card-header order_details">
                                  <h5>Notes</h5>
                                </div>
                                <div className="card-body">
                                  <p className="m-0">
                                    {this.state.data.instruction}
                                  </p>
                                </div>
                              </div>
                            ) : null}


                            {this.state.data.order_status !== 'cancelled' && (
                              <div className="d-flex align-items-center justify-content-center flex-wrap">
                                {/* {os !== 'Windows' && os !== 'Mac OS' ? (
                                  <>
                                    {this.state.print_receipt ==
                                    'gen_receipt' ? (
                                      <a
                                        className="btn btn-secondary me-2 w-50 d-flex align-items-center justify-content-center "
                                        onClick={() => {
                                          if (
                                            os == 'Windows' ||
                                            os == 'Mac OS'
                                          ) {
                                            window.open(
                                              api +
                                                this.state.data.order_code +
                                                '/bill.pdf',
                                              'PRINT',
                                              'height=400,width=600'
                                            );
                                          } else {
                                            this.sendUrlToPrint(
                                              api +
                                                this.state.data.order_code +
                                                '/bill.pdf'
                                            );
                                          }
                                        }}
                                      >
                                        <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                        <p>Print Receipt</p>
                                      </a>
                                    ) : (
                                      <a
                                        className="btn btn-secondary me-2 w-45 d-flex align-items-center justify-content-center "
                                        onClick={() => {
                                          Swal.fire({
                                            title: 'Are you sure',
                                            text: 'You want to generate receipt, you will not be able to edit the order after this',
                                            showCancelButton: true,
                                            confirmButtonColor: '#0066b2',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText:
                                              'Yes, generate it!',
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              this.genrate_receipt();
                                            }
                                          });
                                        }}
                                      >
                                        Generate Receipt
                                      </a>
                                    )}

                                    {this.state.data.order_status !=
                                      'completed' && (
                                      <a
                                        className="btn btn-secondary w-50 d-flex align-items-center justify-content-center"
                                        onClick={() => {
                                          if (
                                            os == 'Windows' ||
                                            os == 'Mac OS'
                                          ) {
                                            window.open(
                                              api +
                                                this.state.data.order_code +
                                                '/kot.pdf',
                                              'PRINT',
                                              'height=400,width=600'
                                            );
                                          } else {
                                            this.sendUrlToPrint(
                                              api +
                                                this.state.data.order_code +
                                                '/kot.pdf'
                                            );
                                          }
                                        }}
                                      >
                                        <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                        <p>Print KOT</p>
                                      </a>
                                    )}
                                  </>
                                ) : ( */}
                                  <>
                                    {this.state.print_receipt ==
                                    'gen_receipt' ? (
                                      ((this.context.role.staff_role == 'staff' && this.state.data.print_receipt_count >0) || this.context.role.staff_role != 'staff') &&
                                      <>
                                                                        
                                                                        {
                                      this.context.isElectron()?
                               
                                            <button onClick={()=>{this.print()}} className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color">
                                              <i className="fa-solid fa-file-invoice print-receipt-icon"></i>
                                              <p>Print Receipt</p>
                                            </button>
                                          
                                      :
                                        
                                      <a
                                        onClick={() => {
                                          this.handlePrintClick('receipt');
                                        }}
                                      >
                                        <ReactToPrint
                                       
                                          trigger={() => (
                                            <button className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color">
                                              <i className="fa-solid fa-file-invoice print-receipt-icon"></i>
                                              <p>Print Receipt</p>
                                            </button>
                                          )}
                                          content={() => this.componentRef2}
                                        />
                                      </a>

                                    }
                                      </>
                                    ) : (
                                      <a
                                        className="btn btn-secondary me-2 w-45 d-flex align-items-center justify-content-center "
                                        onClick={() => {
                                          Swal.fire({
                                            title: 'Are you sure',
                                            text: 'You want to generate receipt, you will not be able to edit the order after this',
                                            showCancelButton: true,
                                            confirmButtonColor: '#0066b2',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText:
                                              'Yes, generate it!',
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              this.genrate_receipt();
                                            }
                                          });
                                        }}
                                      >
                                        Generate Receipt
                                      </a>
                                    )}


{this.state.data.request != null ? (
                          this.state.data.request.map((item, index) => (
                            <div
                              className="card flex-fill bg-white"
                              key={index}
                            >
                              <div className="card-header order_details">
                                <h5>Request</h5>
                              </div>
                              <div className="card-body">
                                <p className="m-0">
                                  {item.action} - <span></span>
                                  <b style={{ fontWeight: 'bold' }}>
                                    {item.status.charAt(0).toUpperCase() +
                                      item.status.slice(1).toLowerCase()}
                                  </b>
                                </p>
                                {item.status != 'pending' ? (
                                  <p className="m-0">
                                    By{' '}
                                    <span style={{ fontWeight: 'bold' }}>
                                      {item.approve_staff.staff_name}{' '}
                                    </span>
                                    at {moment(item.updated_at).format('lll')}
                                  </p>
                                ) : null}
                                {item.status == 'reject' ||
                                item.status == 'approved' ? (
                                  <p className="m-0">
                                    <span style={{ fontWeight: 'bold' }}>
                                      Reason-
                                    </span>{' '}
                                    {item.comment}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <></>
                        )}

                                    {/* {
                                
                              }
                                <ReactToPrint
                                  trigger={() => (
                                    <a className="btn btn-secondary w-45 d-flex align-items-center justify-content-center button-secondary-color">
                                      <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>

                                      <p>
                                        Print KOT
                                        {this.state.data.kot.length > 1 && (
                                          <span> - All</span>
                                        )}
                                      </p>
                                    </a>
                                  )}
                                  content={() => this.componentRef['all']}
                                /> */}
                                
                                    { this.state.data.order_status !=
                                      'completed' &&
                                      this.state.data.kot.length > 0 &&
                                      this.state.data.kot.map((kot, index) => (
                                        ((this.context.role.staff_role == 'staff' && this.state.data.print_kot_count >0) || this.context.role.staff_role != 'staff') &&
                                  <>
                                          <br />
                                          {
                                             this.context.isElectron()?
                                            <button onClick={()=>{this.printkot(index)}} className="btn btn-secondary w-45 d-flex align-items-center justify-content-center">
                                              <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                              <p>Print KOT - {kot.kot}</p>
                                            </button>
                                          :
                                          <ReactToPrint
                                          trigger={() => (
                                            <a className="btn btn-secondary w-45 d-flex align-items-center justify-content-center">
                                              <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                              <p>Print KOT - {kot.kot}</p>
                                            </a>
                                          )}
                                          content={() => {
                                            return this.componentRef[index];
                                          }}
                                          key={index}
                                        />
                                          }
                                          
                                        </>
                                      ))}
                                  </>
                                {/* )} */}
                              </div>
                            )}
                            <div
                              style={{
                                display: 'none',
                              }}
                            >
                              <PrintKot
                                ref={(el) => (this.componentRef['all'] = el)}
                                order={this.state.data}
                                kot={'all'}
                              />

                              {this.state.data.kot.length > 0 &&
                          
                                this.state.data.kot.map((kot, index) => (
                                  <div  key={index} ref={(el) => (this.kotprints[index] = el)}>
                                  <PrintKot
                                    ref={(el) =>
                                      (this.componentRef[index] = el)
                                    }
                                    id={index}
                                    order={this.state.data}
                                    kot={kot.kot}
                                  />
                                       </div>
                                ))}
                           

<div ref={this.PrintRecipt}>
                              <PrintReceipt
                                ref={(el2) => (this.componentRef2 = el2)}
                                order={this.state.data}
                              />
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  ) : (
                    <div
                      style={{
                        height: '92vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <img src={no_order} alt="img" />
                      <h3>No Order Found</h3>

                      <Link
                        className="btn btn-submit me-2"
                        to={'/pos/' + this.props.id}
                      >
                        Create a new order
                      </Link>
                    </div>
                  )}
                </>
              )}
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
              <div className="page-header">
                <div className="page-title">
                  <h4>Tables - Order Swap</h4>
                </div>
              </div>
              <div className="dashboard-status-card m-0">
                <div className="row w-100">
                  {this.state.tableData.length > 0 ? (
                    this.state.tableData.map((category, index) => (
                      <>
                        <div className="page-header">
                          <div className="page-title">
                            {category.table_category == null ? (
                              <h4>Dine In</h4>
                            ) : (
                              <h4>{category.table_category}</h4>
                            )}
                          </div>
                        </div>
                        {category.tables.map((item, index) => (
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
                              <></>
                            )}
                          </>
                        ))}
                      </>
                    ))
                  ) : (
                    <></>
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
            // open={true}

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
              <div className=" border-none">
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
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#619DD1"
                          iconInnerSize={10}
                          padding={10}
                        >
                       UPI
                        </RadioButton>
                        <RadioButton
                          value="Card"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#619DD1"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Credit/Debit Card
                        </RadioButton>
                        <RadioButton
                          value="Cash"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#619DD1"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Cash
                        </RadioButton>
                        <RadioButton
                          value="split"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#619DD1"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Split Payment
                        </RadioButton>

                        <RadioButton
                          value="other"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#619DD1"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Other
                        </RadioButton>
                      </RadioGroup>

                      {this.state.payment == 'other' ? (
                        <div className="col-md-6 mt-3">
                          <SelectPicker
                            style={{ width: '100%' }}
                            data={this.state.payment_options}
                            onChange={(value) => {
                              this.setState({ payment_option: value });
                            }}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
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
            open={this.state.discountModel}
            onClose={() => this.setState({ discountModel: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header text-center">
                <div className="page-title text-center">
                  <h4>Coupon Code</h4>
                </div>
              </div>
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
                <div className="col-lg-4">
                  {this.state.coupon_button_loader ? (
                    <button
                      className="btn btn-secondary btn-sm w-100"
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
                      className="btn btn-secondary btn-sm w-100"
                      onClick={() => {
                        this.check_coupon(this.state.coupon);
                      }}
                    >
                      Check & Apply
                    </button>
                  )}
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
                  <p>Total Bill Amount - ₹ {this.state.data.total_amount}</p>
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
                        this.state.split_total ==
                          this.state.data.total_amount && (
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
          <Modal
            focusTrapped={false}
            open={this.state.customerModal}
            onClose={() => this.setState({ customerModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h4>Add Customer</h4>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label>Customer Contact</label>
                        <input
                          type="text"
                          maxLength={10}
                          className="form-control"
                          placeholder="Enter Mobile Number"
                          onChange={(e) => {
                            this.setState({
                              add_customer_contact: e.target.value,
                            });
                          }}
                          value={this.state.add_customer_contact}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12 d-flex justify-content-end">
                      {this.state.add_customer_buttonLoading ? (
                        <button
                          className="btn btn-secondary btn-sm w-100"
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
                          className="btn btn-secondary btn-sm w-100"
                          onClick={() => {
                            this.update_customer_on_order();
                          }}
                        >
                          Add Customer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          {/* edit customer */}
          <Modal
            focusTrapped={false}
            open={this.state.openEditModal}
            onClose={() => this.setState({ openEditModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Update Customer</h4>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Customer Name<span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({
                            editCustomerName: e.target.value,
                          });
                        }}
                        value={this.state.editCustomerName}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Customer contact<span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({
                            editCustomerContact: e.target.value,
                          });
                        }}
                        disabled
                        readOnly
                        value={this.state.editCustomerContact}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Customer Email</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({
                            editCustomerEmail: e.target.value,
                          });
                        }}
                        value={this.state.editCustomerEmail}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Customer Birthday</label>
                      <DatePicker
                        onChange={(e) => {
                          this.setState({
                            editCustomerBirthday: e,
                          });
                        }}
                        value={this.state.editCustomerBirthday}
                        style={{ width: '100%' }}
                        format="dd-MM-yyyy"
                        placement="auto"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Customer Anniversary</label>
                      <DatePicker
                        onChange={(e) => {
                          this.setState({
                            editCustomerAnniversary: e,
                          });
                        }}
                        value={this.state.editCustomerAnniversary}
                        style={{ width: '100%' }}
                        format="dd-MM-yyyy"
                        placement="auto"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => {
                        this.setState({ openEditModal: false });
                      }}
                    >
                      Skip
                    </button>
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
                        Please wait...
                      </button>
                    ) : (
                      <a
                        href="javascript:void(0);"
                        onClick={() => {
                          this.update_customer_name();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Update Customer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            // open={true}
            open={this.state.cancelModal}
            onClose={() => this.setState({ cancelModal: false })}
            center
            showCloseIcon={true}
            classNames={{
              modal: 'customModal',
            }}
            styles={{
              modal: {
                height: '600px',
                zIndex: '11002 !important',
              },
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Select the Reason for Cancellation </h4>
                </div>
              </div>
              <hr />
              <div className="mx-2">
                <RadioGroup
                  // value={cancellation_reasons[0].reason}
                  onChange={(value, event) => {
                    if(value == 'Other'){
                      this.setState({ cancellation_reason: "" });
                      this.setState({ showOther: true })
                    }else{
                      this.setState({ showOther: false })
                      this.setState({ cancellation_reason: value });
                    }
                    
                  }}
                >
                  {cancellation_reasons.map((reason, index) => (
                    <RadioButton
                      value={reason.reason}
                      pointColor="#619DD1"
                      iconSize={20}
                      rootColor="#37474f"
                      iconInnerSize={10}
                      padding={10}
                      props={{
                        className: 'radio-button',
                      }}
                      key={index}
                    >
                      <div className="d-flex justify-content-between align-items-center radio_button_text">
                        <p className="m-0">{reason.reason}</p>
                        <div className="d-flex"></div>
                      </div>
                    </RadioButton>
                  ))}
                </RadioGroup>
              </div>
              {
                this.state.showOther && (
                  <div className="mx-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter other reason"
                      value={this.state.cancellation_reason}
                      onChange={(e) => {
                        this.setState({ cancellation_reason: e.target.value });
                      }}
                    />
                  </div>
                )
              }

              <div className="d-flex justify-content-end mt-3">
                {this.state.clear_table_buttonLoading ? (
                  <button className="btn btn-secondary" disabled>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Please Wait...</span>
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (this.state.cancellation_reason != '') {
                        Swal.fire({
                          title: 'Are you sure',
                          text: 'You want to clear this table order?',
                          showCancelButton: true,
                          confirmButtonColor: '#0066b2',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, clear it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                         this.change_order_status('cancelled');
                          }
                        });
                      } else {
                        toast.error('Please select the cancellation reason');
                      }
                    }}
                  >
                    Cancel this Order
                  </button>
                )}
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
    <ViewTableOrder
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;

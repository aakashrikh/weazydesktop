import moment from 'moment';
import React, { Component,createRef } from 'react';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import ReactToPrint from 'react-to-print';
import { Drawer } from 'rsuite';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { os } from '../../os';
import { AuthContext } from '../AuthContextProvider';
import PrintKot from '../component/PrintKot';
import PrintReceipt from '../component/PrintReceipt';
import Loader from '../othercomponent/Loader';
import edit_icon from '../assets/images/icons/edit.svg';
import { Link } from 'react-router-dom';
import { Timeline, SelectPicker } from 'rsuite';
import Select from 'react-select';

const cancellation_reasons = [
  { reason: 'Items are out of stock' },
  { reason: 'Nearing closing time' },
  { reason: 'Kitchen is Full' },
  { reason: 'Customer not happy' },
  { reason: 'Customer changed the order and placed a new one' },
  { reason: 'Customer changed his mind and cancelled the order' },
  { reason: 'Double Order Punched' },
  { reason: 'Other' },
];

export class OrderDetailsDrawer extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      edit_user_modal: false,
      data: [],
      delivery: null,
      cart: [],
      user: [],
      isLoading: true,
      additional_note: '',
      generateBillModal: false,
      generate_order_buttonLoading: false,
      bill: [],
      cart_new: [],
      payment: 'UPI',
      time: 5,
      total_amount: '',
      split_bill_amount_other: '',
      split_bill_amount_cash: '',
      is_buttonloding: false,
      splitModal: false,
      vendor_details: [],
      user_details: [],
      cart_details: [],
      transaction_details: [],
      split_payment: [
        { amount: 0, method: 'Cash' },
        { amount: 0, method: 'Card' },
        { amount: 0, method: 'UPI' },
      ],
      print_receipt: '',
      cancelModal: false,
      cancellation_reason: '',
      other_reason: '',
      settle: false,
      edit_quantity_modal: false,
      edit_quantity_name: 0,
      edit_quantity_initial: 0,
      edit_cart_id: 0,
      update_product_quantity_buttonLoading: false,
      showOther: false,
      discountModel: false,
      remarkModel: false,
      order_remark: '',
      rider_load: false,
      rider_model: false,
      riders: [],
      rider_id: 0,
      payment_options: [
        { label: 'Swiggy Dine In', value: 'Swiggy Dine In' },
        { label: 'Zomato Dine In', value: 'Zomato Dine In' },
        { label: 'Eazy Diner', value: 'Eazy Diner' },
        { label: 'Paytm', value: 'Paytm' },
        { label: 'PhonePe', value: 'PhonePe' },
        { label: 'Gpay', value: 'Gpay' },
        { label: 'BharatPe', value: 'BharatPe' },
        { label: 'MagicPin', value: 'MagicPin' },
        { label: 'DotPe', value: 'Dotpe' },
        { label: 'Dunzo', value: 'Dunzo' },
      ],
      payment_option: '',
      extendprint: false,
      discountAmount: 0,
      percentageDiscount: 0,
      discountComment: '',

    };

    this.PrintRecipt= createRef();
    this.componentRef = React.createRef([]);
    this.componentRef = [];
    this.kotprints =[];

this.printkot = createRef();
    this.printRef = createRef(); // Correctly create a ref
    this.print = this.print.bind(this);
  }
  print = ()=>
    {
      const contentToPrint = this.PrintRecipt.current.innerHTML;
      window.electron.send('print', contentToPrint);
  
      this.handlePrintClick('receipt');
    }


    printhandlekot = (index)=>
      {
    
        const contentToPrint = this.kotprints[index].innerHTML;
       
        window.electron.send('print', contentToPrint);
        this.handlePrintClick('kot');
      }

      
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
    this.setState({ mark_complete_buttonLoading: true });
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
          this.setState({
            open: false,
          });
          this.getOrderDetails(this.props.drawerOrderId);
          this.setState({
            cancelModal: false,
            rider_model: false,
          });
          toast.success('Order Status Updated Successfully');
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

  fetch_rider = () => {
    this.setState({ rider_load: true });
    this.setState({ rider_model: true });
    fetch(api + 'fetch_staff', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        staff_type: 'delivery_partner',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          const data = json.data.map((item, index) => ({
            label: item.staff_name + ' - ' + item.staff_contact,
            value: item.staff_id,
          }));

          this.setState({ riders: data });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
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
          this.getOrderDetails(this.state.data.order_code);
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

  genrate_bill = (id) => {
    this.setState({ generate_order_buttonLoading: true });
    fetch(api + 'generate_bill_by_table', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: this.state.data.table.table_uu_id,
        order_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({
              total_amount: Math.round(json.data[0].total_amount),
              bill: json.data[0],
            });
            this.setState({ cart_new: json.data[0].cart });
          }
          this.setState({ generateBillModal: true });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ generate_order_buttonLoading: false });
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
        order_id: this.state.bill.id,
        payment_method: this.state.payment,
        split_payment: this.state.split_payment,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.getOrderDetails(this.props.drawerOrderId);
          this.setState({ modalVisible: false, splitModal: false });
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

  getOrderDetails = (id) => {
    this.setState({ isLoading: true });
    fetch(api + 'get_orders_details_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({
            data: json.data[0],
            order_remark: json.data[0].order_remark,
            vendor_details: json.data[0].vendor,
            user: json.data[0].user,
            cart: json.data[0].cart,
            transaction_details: json.data[0].transactions,
            isLoading: false,

            print_receipt: json.data[0].order_for,
          });

          if (json.data[0].delivery != null) {
            this.setState({
              delivery: JSON.parse(
                json.data[0].delivery.shipping_address,
                null,
                2
              ),
            });
          }
          // var content = document.getElementById("divcontents");
          // var pri = document.getElementById("invoice-POS").contentWindow;
          // pri.document.open();
          // pri.document.write(content.innerHTML);
          // pri.document.close();
          // pri.focus();
          // pri.print();
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
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
          this.getOrderDetails(this.props.drawerOrderId);
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

  settlebill = (settle_type) => {
    this.setState({ mark_complete_buttonLoading: true });

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


    fetch(api + 'settle_bill_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.data.order_code,
        payment_method: payment_method,
        order_status: 'completed',
        split_payment: this.state.split_payment,
        settle_type: settle_type,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.getOrderDetails(this.props.drawerOrderId);
          var sp = [
            { amount: 0, method: 'Cash' },
            { amount: 0, method: 'Card' },
            { amount: 0, method: 'UPI' },
          ];
          this.setState({
            split_payment: sp,
            split_total: 0,
            splitModal: false,
          });
          this.setState({
            settle: false,
            modalVisible: false,
            splitModal: false,
          });
          toast.success(json.msg);
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

  update_order_remark = () => {
    if (this.state.order_remark == '') {
      toast.error('Please enter order remark');
      return;
    }
    this.setState({ coupon_button_loader: true });
    fetch(api + 'update_order_remark', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        remark: this.state.order_remark,
        order_id: this.state.data.order_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          this.setState({ remarkModel: false });
          toast.success(json.msg);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ coupon_button_loader: false });
      });
  };


  extend_print_limit = () => {
    this.setState({ coupon_button_loader: true });
    fetch(api + 'extend_receipt_count', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.data.order_code,
        kot:this.state.data.print_kot_count,
        receipt:this.state.data.print_receipt_count
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {

          this.setState({extendprint:false})
          toast.success(json.msg);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ coupon_button_loader: false });
      });
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

    if(this.state.transaction_details.length > 0){
      toast.error('You can not update discount once transaction has been generated. Please contact Admin.');
      return;
    }
    
    // regex to check number and decimal point only
    const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!regex.test(discount)) {
      toast.error('Please enter valid discount amount');
      return;
    }
    this.setState({adding_discount_buttonLoading: true});

    fetch(api + 'add_discount_on_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.data.order_code,
        discount_type: type ? 'percentage' : 'fixed',
        discount: discount,
        discount_comment: this.state.discountComment
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
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
            data: json.data[0],
            order_remark: json.data[0].order_remark,
            vendor_details: json.data[0].vendor,
            user: json.data[0].user,
            cart: json.data[0].cart,
            transaction_details: json.data[0].transactions,
            adding_discount_buttonLoading: false,
            discountModel: false,
            print_receipt: json.data[0].order_for,
          });

          if (json.data[0].delivery != null) {
            this.setState({
              delivery: JSON.parse(
                json.data[0].delivery.shipping_address,
                null,
                2
              ),
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



  render() {
    return (
      <>
        <Drawer
          open={this.props.open}
          onClose={() => this.props.onClose()}
          size="full"
          enforceFocus={false}
          autoFocus={false}
          onOpen={() => {
            this.getOrderDetails(this.props.drawerOrderId);
            //this.orderDetails(this.props.drawerOrderId);
          }}
          placement="right"
        >
          {this.state.isLoading ? (
            <Loader />
          ) : (
            <>
              <Drawer.Header>
                <Drawer.Title>
                  Order Details for Order ID:{' '}
                  <strong>{this.state.data.bill_no}</strong>
                  {this.state.data.order_type != 'TakeAway' &&
                  this.state.data.order_type != 'Delivery' ? (
                    <span
                      style={{
                        color: '#0066b2',
                      }}
                    >
                      {' '}
                      Dine-In{' '}
                      {this.state.data.table == null ? (
                        <>
                          {this.state.data.order_comment != null
                            ? ' - ' + this.state.data.order_comment
                            : ''}
                        </>
                      ) : (
                        <span>{this.state.data.table.table_name}</span>
                      )}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#0066b2',
                        fontWeight: 'bold',
                      }}
                    >
                      {' '}
                      {this.state.data.order_type}
                      {this.state.data.order_comment != null
                        ? ' - ' + this.state.data.order_comment
                        : ''}
                    </span>
                  )}
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <div className="content">
                  <div className="page-header">
                    <div className="page-title">
                      <h4>Order Details</h4>
                    </div>

                    <div className="d-flex align-items-center">
                      {this.state.data.order_status == 'cancelled' ? (
                        <></>
                      ) : (
                        <>
                         {
                          this.context.role.staff_role != 'staff' &&
                         <button
                            className="btn btn-secondary btn-sm me-2"
                           
                            onClick={() => {
                              this.setState({ extendprint: true });
                            }}
                          >
                            Extends Prints
                          </button>
                          }
                         

                        {
                          this.state.data.order_type == 'Delivery' &&
                         <Link
                            className="btn btn-secondary btn-sm me-2"
                            to={'/pos/new/' + this.state.data.order_code}
                          >
                            <i className="fa-solid fa-plus mr-2"></i>Add More
                            Item
                          </Link>
                          }
                         

                          <Link
                            className="btn btn-secondary btn-sm me-2"
                            onClick={() => {
                              this.setState({ discountModel: true });
                            }}
                          >
                            <i className="iconly-Discount me-2"></i>Apply
                            Discount
                          </Link>
                        </>
                      )}

                      <Link
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => {
                          this.setState({ remarkModel: true });
                        }}
                      >
                        <i className="iconly-Document me-2"></i>Add Remark
                      </Link>
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
                              <h6 className="order_date mt-2">
                                {moment(this.state.data.created_at).format(
                                  'llll'
                                )}{' '}
                                <span
                                  style={{
                                    color:
                                      this.state.data.order_status == 'pending'
                                        ? 'red'
                                        : this.state.data.order_status ==
                                          'confirmed'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'cancelled'
                                        ? 'red'
                                        : this.state.data.order_status ==
                                          'in_process'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'processed'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'completed'
                                        ? 'green'
                                        : '',
                                    textTransform: 'capitalize',
                                    fontSize: '17px',
                                  }}
                                >
                                  (Order Status:{' '}
                                  <strong>
                                    {this.state.data.order_status
                                      .split('_')
                                      .join(' ')}
                                  </strong>
                                  )

                                  
                                </span>
                                {
                                    this.state.data.channel == 'POS' &&
                                    <p>Cashier: {this.state.data.staff.staff_name}</p>
                                  }
                                {this.state.delivery != null && (
                                  <>
                                    <p>
                                      Delivery Address: {' '}
                                      {this.state.delivery.address}
                                      <br />
                                      {this.state.data.delivery.rider_contact !=
                                        null && (
                                        <>
                                          {' '}
                                          Rider Contact:-{' '}
                                          {
                                            this.state.data.delivery.rider_name
                                          }{' '}
                                          ,{' '}
                                          {
                                            this.state.data.delivery
                                              .rider_contact
                                          }{' '}
                                          &nbsp;{' '}
                                          <span
                                            onClick={() => this.fetch_rider()}
                                            style={{
                                              cursor: 'pointer',
                                              color: 'blue',
                                            }}
                                          >
                                            Change Rider
                                          </span>{' '}
                                        </>
                                      )}
                                    </p>
                                  </>
                                )}
                                {this.state.data.order_status == 'cancelled' ? (
                                  <>
                                    <br />
                                    <span
                                      style={{
                                        color: 'red',
                                        fontSize: '17px',
                                      }}
                                    >
                                      Reason:{' '}
                                      {this.state.data.cancellation_reason}
                                    </span>
                                  </>
                                ) : null}
                              </h6>
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">
                              {this.state.cart.length}{' '}
                              {this.state.cart.length > 1 ? 'Items' : 'Item'}
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
                                    <div className="price_column_heading">
                                      Price
                                    </div>
                                    <div className="qty_column_heading">
                                      Qty.
                                    </div>
                                    <div className="amount_column_heading">
                                      Amt.
                                    </div>
                                    <div className="action_column_heading"></div>
                                  </div>
                                  {this.state.cart.map((item, index) => {
                                    return (
                                      <div className="single_item_row">
                                        <div className="sno_column">
                                          {index + 1}
                                        </div>
                                        <div className="item_name_column">
                                          <span
                                            style={{
                                              fontWeight: '600px',
                                              marginRight: '10px',
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
                                                <strong>Addons: </strong>
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
                                          {(
                                            item.product_price /
                                            item.product_quantity
                                          ).toFixed(2)}
                                        </div>
                                        <div className="qty_column">
                                          x {item.product_quantity}
                                        </div>
                                        <div className="amount_column">
                                          {item.product_price}
                                        </div>
                                        {this.state.data.order_status !=
                                          'cancelled' &&
                                          this.state.data.order_status !=
                                            'completed' && (
                                            <div
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
                                              className="action_column"
                                            >
                                              <img src={edit_icon} alt="" />
                                            </div>
                                          )}
                                      </div>
                                    );
                                  })}
                                </section>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer text-muted">
                            <div className="row">
                              <div className="col-md-6">Sub Total</div>
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
                                        this.state.data.offer[0].offer_code +
                                        ' : ' +
                                        this.state.data.offer[0].offer_name +
                                        ']'}
                                    </span>
                                  )}
                                </div>
                                <div className="col-md-3 d-flex align-items-start justify-content-end item_total">
                                  <div className="d-flex align-items-center text-danger mt-2">
                                    ₹{' '}
                                    {this.state.data.order_discount.toFixed(2)}
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
                                  ₹ {this.state.data.total_amount.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {this.state.data.order_status != 'cancelled' &&
                              this.state.data.settled_amount <
                                this.state.data.total_amount.toFixed(2) && (
                                <>
                                  <div className="row">
                                    <div className="col-md-6 text-warning mt-2">
                                      Settle Amount
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end">
                                      <div className="d-flex align-items-center  text-warning mt-2">
                                        ₹{' '}
                                        {this.state.data.settled_amount.toFixed(
                                          2
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-md-6 grand_total">
                                      Balance Amount
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end">
                                      <div className="d-flex align-items-center grand_total">
                                        ₹{' '}
                                        {(
                                          this.state.data.total_amount.toFixed(
                                            2
                                          ) -
                                          this.state.data.settled_amount.toFixed(
                                            2
                                          )
                                        ).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                  <br /> <br />
                                  {/* {this.state.data.table == null && ( */}
                                    <button
                                      onClick={() => {
                                        this.setState({ settle: true });
                                      }}
                                      className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color"
                                    >
                                      <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                      <p>Settle Bill</p>
                                    </button>
                                  {/* )} */}
                                </>
                              )}

                            {this.state.data.settled_amount >=
                              this.state.data.total_amount.toFixed(2) && (
                              <>
                                <br />
                                {
                                   this.context.role.staff_role != 'staff' &&
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Are you sure?',
                                      text: "You won't be able to revert this!",
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonColor: '#3085d6',
                                      cancelButtonColor: '#d33',
                                      confirmButtonText: 'Yes, Unsettle it!',
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        this.settlebill('unsettle');
                                      }
                                    });
                                  }}
                                  className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color"
                                >
                                  <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                  <p>Unsettle Bill</p>
                                </button>
                                 } 
                              </>
                            )}

                            {this.state.transaction_details.length == 0 ? (
                              <></>
                            ) : (
                              <p className="order_date mt-2">
                                Payment Method:
                                {this.state.transaction_details.length == 1 ? (
                                  <span>
                                    {'  '}
                                    {
                                      this.state.transaction_details[0]
                                        .txn_method
                                    }{' '}
                                    - ₹{' '}
                                    {
                                      this.state.transaction_details[0]
                                        .txn_amount
                                    }{' '}
                                    {this.state.transaction_details[0]
                                      .txn_status == 'success' ? (
                                      <span style={{ color: 'green' }}>
                                        Success
                                      </span>
                                    ) : (
                                      <span style={{ color: 'red' }}>
                                        Failed
                                      </span>
                                    )}
                                    <br />
                                    Date:{' '}
                                    {moment(
                                      this.state.transaction_details[0]
                                        .created_at
                                    ).format('llll')}
                                  </span>
                                ) : (
                                  <>
                                    <strong>{'  '}Split </strong>
                                    {this.state.transaction_details.map(
                                      (item, i) => {
                                        return (
                                          <>
                                            <br />
                                            <span key={i}>
                                              {' '}
                                              {item.txn_method} - ₹{' '}
                                              {item.txn_amount}{' '}
                                              <span
                                                style={{
                                                  fontWeight: 'bold',
                                                }}
                                              >
                                                Date
                                              </span>
                                              :
                                              {moment(item.created_at).format(
                                                'llll'
                                              )}{' '}
                                              {item.txn_status == 'success' ? (
                                                <span
                                                  style={{ color: 'green' }}
                                                >
                                                  Success
                                                </span>
                                              ) : (
                                                <span style={{ color: 'red' }}>
                                                  Failed
                                                </span>
                                              )}
                                            </span>
                                          </>
                                        );
                                      }
                                    )}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
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
                        {this.state.mark_complete_buttonLoading ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a className="btn btn-danger w-100 me-2" disabled>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              disabled
                            >
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'placed' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => {
                                this.change_order_status('confirmed');
                              }}
                            >
                              <p>Accept Order</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'confirmed' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => this.setState({ open: true })}
                            >
                              <p>Order In-Process</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'in_process' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => {
                                this.change_order_status('processed');
                              }}
                            >
                              <p>Order Processed</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'processed' ? (
                          this.state.data.order_type == 'Delivery' ? (
                            <div className="d-flex align-items-center justify-content-around mb-3">
                              <a
                                className="btn btn-danger w-100 me-2"
                                onClick={() => {
                                  this.setState({ cancelModal: true });
                                }}
                              >
                                Cancel Order
                              </a>
                              <a
                                className="btn btn-secondary w-100 ms-2"
                                onClick={() => {
                                  this.fetch_rider();
                                  // this.change_order_status('picked_up');
                                }}
                              >
                                <p>Picked Up</p>
                              </a>
                            </div>
                          ) : (
                            this.state.data.order_type == 'TakeAway' && (
                              <div className="d-flex align-items-center justify-content-around mb-3">
                                 <a
                                className="btn btn-danger w-100 me-2"
                                onClick={() => {
                                  this.setState({ cancelModal: true });
                                }}
                              >
                                Cancel Order
                              </a>
                                <a
                                  className="btn btn-secondary w-100"
                                  onClick={() => {
                                    this.change_order_status('completed');
                                  }}
                                >
                                  <p>Completed</p>
                                </a>
                              </div>
                            )
                          )
                        ) : this.state.data.order_status == 'picked_up' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              href="javascript:void(0);"
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => {
                                this.change_order_status('completed');
                              }}
                            >
                              <p>Completed</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'completed' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                          </div>
                        ) : (
                          <></>
                        )}
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

                        {this.state.order_remark !== ' ' &&
                        this.state.order_remark !== '' &&
                        this.state.order_remark !== null ? (
                          <div className="card flex-fill bg-white">
                            <div className="card-header order_details">
                              <h5>Remark</h5>
                            </div>
                            <div className="card-body">
                              <p className="m-0">{this.state.order_remark}</p>
                            </div>
                          </div>
                        ) : null}

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

                        {
                          
                        this.state.data.order_status != 'cancelled' && (
                          <div className="d-flex align-items-center justify-content-center flex-wrap">
                            
                            <>
                              {this.state.data.order_type !== 'TakeAway' ? (
                                this.state.print_receipt == 'gen_receipt' ? (
                                  ((this.context.role.staff_role == 'staff' && this.state.data.print_receipt_count >0) || this.context.role.staff_role != 'staff') &&
                                  <>
                                  
                                  {this.context.isElectron()?
                               
                                            <button onClick={()=>{this.print()}} className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color">
                                              <i className="fa-solid fa-file-invoice print-receipt-icon"></i>
                                              <p>Print Receipt</p>
                                            </button>
                                          
                                      :
                                  <a onClick={() => {}}>
                                    <ReactToPrint
                                      trigger={() => (
                                        <a className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color">
                                          <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                          <p>Print Receipt</p>
                                        </a>
                                      )}
                                      // print={true}
                                      content={() => this.componentRef2}
                                      documentTitle="AwesomeFileName"
                                      onAfterPrint={() => {
                                        this.handlePrintClick('receipt');
                                      }}
                                      // onBeforeGetContent={handleOnBeforeGetContent}
                                      // onBeforePrint={handleBeforePrint}
                                      // print={(iframe) => {
                                      //   return new Promise((resolve) => {
                                      //     console.log("Custom printing, 1.5 second mock delay...");
                                      //     setTimeout(() => {
                                      //       console.log("Mock custom print of iframe complete", iframe);
                                      //       resolve();
                                      //     }, 1500);
                                      //   });
                                      // }}
                                      removeAfterPrint
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
                                        text: 'You want to generate receipt, you will not be able to edit the order after this?',
                                        showCancelButton: true,
                                        confirmButtonColor: '#0066b2',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Yes, generate it!',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          this.genrate_receipt();
                                        }
                                      });
                                    }}
                                  >
                                    Generate Receipt
                                  </a>
                                )
                              ) : (

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
                                   // this.handlePrint()
                                    this.handlePrintClick('receipt');
                                  }}
                                >
                                  
                                  <ReactToPrint
                                    trigger={() => (
                                      <a className="btn btn-secondary w-90 d-flex align-items-center justify-content-center button-secondary-color">
                                        <i className="fa-solid fa-file-invoice  print-receipt-icon"></i>
                                        <p>Print Receipt</p>
                                      </a>
                                    )}
                                    content={() => this.componentRef2}
                                  />
                                </a>
  }
</>
                              
                              )}

                              {/* <ReactToPrint
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
                              {this.state.data.order_status != 'cancelled' &&
                              this.state.data.kot.length > 0 ? (
                                this.state.data.kot.map((kot, index) => (
                                  ((this.context.role.staff_role == 'staff' && this.state.data.print_kot_count >0) || this.context.role.staff_role != 'staff') &&
                                  <>
                                    <br />
                                    {
                                             this.context.isElectron()?
                                            <button onClick={()=>{this.printhandlekot(index)}} className="btn btn-secondary w-45 d-flex align-items-center justify-content-center">
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
                                
                                ))
                              ) : (
                                <></>
                              )}
                            </>
                            {/* )} */}
                          </div>
                        )}
                        <div
                         
                         style={{display:'none'}}
                          
                        >
                          {this.state.data.kot.length > 0 ? (
                            <div ref={this.printkot}>
                            <PrintKot
                              ref={(el) => (this.componentRef['all'] = el)}
                              order={this.state.data}
                              kot={this.state.data.kot[0].kot}
                            />
                            </div>
                          ) : null}

                          {this.state.data.kot.length > 0 ? (
                            this.state.data.kot.map((kot, index) => (
                              <div  key={index} ref={(el) => (this.kotprints[index] = el)}>
                              <PrintKot
                                ref={(el) => (this.componentRef[index] = el)}
                                id={index}
                                order={this.state.data}
                                kot={kot.kot}
                              />
                              </div>
                            ))
                          ) : (
                            <></>
                          )}

                          <div ref={this.PrintRecipt} >
                          <PrintReceipt
                            ref={(el2) => (this.componentRef2 = el2)}
                            order={this.state.data}
                          />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
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
                      height: '700px',
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
                        onChange={(value, event) => {
                          if (value == 'Other') {
                            this.setState({ cancellation_reason: '' });
                            this.setState({ showOther: true });
                          } else {
                            this.setState({ showOther: false });
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
                            </div>
                          </RadioButton>
                        ))}
                      </RadioGroup>
                    </div>
                    {this.state.showOther && (
                      <div className="mx-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter other reason"
                          value={this.state.cancellation_reason}
                          onChange={(e) => {
                            this.setState({
                              cancellation_reason: e.target.value,
                            });
                          }}
                        />
                      </div>
                    )}
                    <div className="d-flex justify-content-end mt-3">
                      {this.state.mark_complete_buttonLoading ? (
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
                                text: 'You want to cancel this order?',
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
                              toast.error(
                                'Please select the cancellation reason'
                              );
                            }
                          }}
                        >
                          Cancel this Order
                        </button>
                      )}
                    </div>
                  </div>
                </Modal>

                <Modal
                  focusTrapped={false}
                  // open={true}
                  open={this.state.rider_model}
                  onClose={() => this.setState({ rider_model: false })}
                  center
                  showCloseIcon={true}
                  classNames={{
                    modal: 'customModal',
                  }}
                  styles={{
                    modal: {
                      height: '700px',
                      zIndex: '11002 !important',
                    },
                  }}
                >
                  <div className="content">
                    <div className="page-header">
                      <div className="page-title">
                        <h4>Select the Rider </h4>
                      </div>
                    </div>
                    <hr />

                    <div className="form-group">
                      <div className="d-flex align-items-center justify-content-between">
                        <label>Select Rider*</label>
                      </div>
                      <div className="row">
                        <div className="col-10 pe-0">
                          <br />

                          <Select
                            className="basic-single"
                            classNamePrefix="Choose Rider"
                            defaultValue={this.state.rider_id}
                            // isDisabled={isDisabled}
                            isLoading={this.state.rider_loading}
                            // isClearable={isClearable}
                            isRtl={false}
                            isSearchable={true}
                            name="rider_id"
                            onChange={(e) => {
                              this.setState({ rider_id: e.value });
                            }}
                            options={this.state.riders}
                          />

                          {/* <SelectPicker
                                data={this.state.riders}
                                placeholder="Choose Rider"
                                onChange={(e) => {
                                  this.setState({ rider_id: e });
                                }}
                                loading={this.state.rider_loading}
                                style={{
                                  width: '100%',
                                  borderColor: 'rgba(145, 158, 171, 0.32)',
                                }}
                                value={this.state.rider_id}
                              /> */}
                        </div>
                        <div className="col-2"></div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end mt-3">
                      {this.state.mark_complete_buttonLoading ? (
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
                            if (this.state.rider_id != 0) {
                              Swal.fire({
                                title: 'Are you sure',
                                text: 'You want to assign rider to this order?',
                                showCancelButton: true,
                                confirmButtonColor: '#0066b2',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, assign it!',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  this.change_order_status('picked_up');
                                }
                              });
                            } else {
                              toast.error('Please select the rider');
                            }
                          }}
                        >
                          Assign Rider
                        </button>
                      )}
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
                                            this.state.edit_quantity_initial -
                                            1,
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
                                            this.state.edit_quantity_initial -
                                            1,
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
                              {this.state
                                .update_product_quantity_buttonLoading ? (
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
                                  Clear {this.state.edit_quantity_name} from
                                  Order
                                </button>
                              )}
                              {this.state
                                .update_product_quantity_buttonLoading ? (
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
                                  Update Quantity Of{' '}
                                  {this.state.edit_quantity_name}
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
                  open={this.state.extendprint}
                  onClose={() => this.setState({ extendprint: false })}
                  center
                  classNames={{
                    modal: 'customModal',
                  }}
                >
                  <div className="content">
                    <div className="page-header m-0 text-center">
                      <div className="page-title text-center">
                        <h5>
                          Extends Prints
                          <span
                            style={{
                              textDecoration: 'underline',
                            }}
                          >
                           
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
                                <div className='col-md-6'>
                                  <label
                                    className="form-label"
                                    htmlFor="basic-default-fullname"
                                  >
                                    Extend Receipt Limit
                                  </label>
                                </div>
                                <div className='col-md-6'>
                                  <input
                                    type="number"
                                    className="form-control"
                                    onChange={(e) => {
                        
                                      var data = this.state.data;
                                      data.print_receipt_count = e.target.value;
                                      
                                      this.setState({ data: data });
                                    }}
                                    
                                  />
                                </div>


                              </div>
                              </div>
                              <div className="col-lg-12 d-flex justify-content-between align-items-center py-4">
                              <div className="row w-100">
                                <div className='col-md-6'>
                                  <label
                                    className="form-label"
                                    htmlFor="basic-default-fullname"
                                  >
                                    Extend KOT Limit
                                  </label>
                                </div>
                                <div className='col-md-6'>
                                  <input
                                    type="number"
                                    className="form-control"
                                    onChange={(e) => {
                                      var data = this.state.data;
                                      data.print_kot_count = e.target.value;
                                      
                                      this.setState({ data: data });
                                    }}
                                  
                                  />
                                </div>


                              </div>

                            </div>
                            <div className="col-lg-12 d-flex justify-content-between align-items-right mt-2">
                              
                              {this.state
                                .coupon_button_loader ? (
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
                                    Swal.fire({
                                      title: 'Are you sure',
                                      text: 'You want to update limit?',
                                      showCancelButton: true,
                                      confirmButtonColor: '#0066b2',
                                      cancelButtonColor: '#d33',
                                      confirmButtonText: 'Yes, update it!',
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        this.extend_print_limit();
                                      }
                                    });
                                  }}
                                >
                                  Update Limit
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
                        <h4>Edit Order Status</h4>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <label>Time to prepare the order.</label>
                          <div className="d-flex align-items-center">
                            {this.state.time <= 5 ? (
                              <a className="btn btn-secondary disabled">
                                <i className="fa-solid fa-minus"></i>
                              </a>
                            ) : (
                              <a
                                className="btn btn-secondary"
                                onClick={() => {
                                  this.setState({ time: this.state.time - 1 });
                                }}
                              >
                                <i className="fa-solid fa-minus"></i>
                              </a>
                            )}
                            <input
                              type="text"
                              className="text-center"
                              onChange={(e) => {
                                this.setState({
                                  time: e.target.value,
                                });
                              }}
                              value={this.state.time}
                              readOnly
                            />
                            <h6>Minutes</h6>
                            <a
                              className="btn btn-secondary"
                              onClick={() => {
                                this.setState({
                                  time: this.state.time + 1,
                                });
                              }}
                            >
                              <i className="fa-solid fa-add"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12 d-flex justify-content-end">
                        {this.state.mark_complete_buttonLoading ? (
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
                            onClick={() => {
                              this.change_order_status('in_process');
                            }}
                            className="btn btn-secondary btn-sm me-2"
                          >
                            Update Status
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Modal>

                <Modal
                  focusTrapped={false}
                  open={this.state.settle}
                  onClose={() => this.setState({ settle: false })}
                  center
                  classNames={{
                    modal: 'customModal',
                  }}
                >
                  <div className="content">
                    <div className="page-header m-0 text-center">
                      <div className="page-title text-center">
                        <h4>Settle Bill</h4>
                        <br />
                        <h6>
                          Total Bill Amount - ₹{' '}
                          {(
                            this.state.data.total_amount.toFixed(2) -
                            this.state.data.settled_amount.toFixed(2)
                          ).toFixed(2)}
                        </h6>
                        <br />{' '}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          {/* <label>VEG/NON-VEG</label> */}
                          <div>
                            <RadioGroup
                              onChange={(value) => {
                                this.setState({ payment: value });
                              }}
                              value={this.state.payment}
                            >
                              <RadioButton
                                value="Upi"
                                pointColor="#0066b2"
                                iconSize={20}
                                rootColor="#f3c783"
                                iconInnerSize={10}
                                padding={10}
                              >
                                Google Pay/Paytm/UPI
                              </RadioButton>
                              <RadioButton
                                value="Card"
                                pointColor="#0066b2"
                                iconSize={20}
                                rootColor="#f3c783"
                                iconInnerSize={10}
                                padding={10}
                              >
                                Credit/Debit Card
                              </RadioButton>
                              <RadioButton
                                value="Cash"
                                pointColor="#0066b2"
                                iconSize={20}
                                rootColor="#f3c783"
                                iconInnerSize={10}
                                padding={10}
                              >
                                Cash
                              </RadioButton>
                              <RadioButton
                                value="split"
                                pointColor="#0066b2"
                                iconSize={20}
                                rootColor="#f3c783"
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

<Select
                            className="basic-single"
                            classNamePrefix="Choose Method"
                            // isDisabled={isDisabled}
                            // isLoading={this.state.rider_loading}
                            // isClearable={isClearable}
                            isRtl={false}
                            isSearchable={true}
                            // name="rider_id"
                            onChange={(e) => {
                              this.setState({  payment_option: e.value });
                            }}
                            options={this.state.payment_options}
                          />

                          {/* <SelectPicker
                            style={{ width: '100%' }}
                            data={this.state.payment_options}
                            onChange={(value) => {
                              this.setState({ payment_option: value });
                            }}
                          /> */}
                        </div>
                      ) : (
                        <></>
                      )}
                          </div>
                        </div>
                      </div>
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
                            Settle Bill
                          </a>
                        ) : (
                          <a
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              Swal.fire({
                                title: 'Are you sure',
                                text: 'You want to settle this order, please check payment method!',
                                showCancelButton: true,
                                confirmButtonColor: '#0066b2',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, Settle it!',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  this.settlebill('settle');
                                }
                              });
                            }}
                          >
                            Settle Bill Now
                          </a>
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
                        <br />
                        <p>
                          Total Bill Amount - ₹{' '}
                          {(
                            this.state.data.total_amount.toFixed(2) -
                            this.state.data.settled_amount.toFixed(2)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="card border-none">
                      <div className="card-body p-0 pt-4">
                        <div className="row">
                          {this.state.split_payment.map((item, index) => {
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
                                        this.add_split_amount(
                                          e.target.value,
                                          index
                                        );
                                      }}
                                      // value={item.amount}
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
                              this.state.split_total <=
                                this.state.data.total_amount -
                                  this.state.data.settled_amount && (
                                <a
                                  Bill
                                  Amount
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Are you sure',
                                      text: 'You want to settle this order, please check payment method!',
                                      showCancelButton: true,
                                      confirmButtonColor: '#0066b2',
                                      cancelButtonColor: '#d33',
                                      confirmButtonText: 'Yes, Settle it!',
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        this.settlebill('settle');
                                      }
                                    });
                                  }}
                                >
                                  Settle Bill Now
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
                        <h4>Add Discount</h4>
                      </div>
                    </div>

                    
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
                                  <div className="col-lg-6">

                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Order Comment"
                                          onChange={(e) => {
                                            this.setState({
                                              discountComment: e.target.value,
                                            });
                                          }}
                                         
                                        />

                                  </div>
                                  <div className="col-lg-6">
                                  <div className="d-flex align-items-center justify-content-end" style={{marginTop:'20px'}}>
                              
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
                                          Swal.fire({
                                            title: 'Are you sure',
                                            text: 'You want to add discount!',
                                            showCancelButton: true,
                                            confirmButtonColor: '#0066b2',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Yes, Add it!',
                                          }).then((result) => {
                                            if (result.isConfirmed) {
                                              this.addDiscount(this.state.discountAmount, this.state.percentageDiscount);
                                            }
                                          });
                                        }}
                                        >
                                          
                                        Add Discount
                                      </button>
                                    )
                                  }

                                 
                                </div>
                                </div>

                                </div>

                                
  }
<br/><br/>
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
                  open={this.state.remarkModel}
                  onClose={() => this.setState({ remarkModel: false })}
                  center
                  classNames={{
                    modal: 'customModal',
                  }}
                >
                  <div className="content">
                    <div className="page-header text-center">
                      <div className="page-title text-center">
                        <h4>Order Remark</h4>
                      </div>
                    </div>
                    <div className="row d-flex align-items-center mb-2">
                      <div className="col-lg-12">
                        <div className="form-group m-0">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Update Order Remark"
                            onChange={(e) => {
                              this.setState({
                                order_remark: e.target.value,
                              });
                            }}
                            value={this.state.order_remark}
                          />
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <br />
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
                              this.update_order_remark();
                            }}
                          >
                            Update Remark
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Modal>
              </Drawer.Body>
            </>
          )}
        </Drawer>
      </>
    );
  }
}

export default OrderDetailsDrawer;

import moment from 'moment';
import React, { Component,createRef } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import logo_black_full from '../assets/images/logos/main_logo_black.png';
import {
  default as no_img,
  default as no_product,
} from '../assets/images/no_products_found.png';
import no_cart from '../assets/images/nocart.webp';
import success_gif from '../assets/images/order_success.gif';
import nonveg from '../assets/non-veg.svg';
import veg from '../assets/veg.svg';
import PrintKot from '../component/PrintKot';
import PrintReceipt from '../component/PrintReceipt';
import Loader from '../othercomponent/Loader';
import PosHeader from '../othercomponent/PosHeader';
import Skeletonloader from '../othercomponent/Skeletonloader';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import PageIcon from '@rsuite/icons/Page';
import PlusIcon from '@rsuite/icons/Plus';
import isBefore from 'date-fns/isBefore';
import { DatePicker, Dropdown, IconButton, SelectPicker } from 'rsuite';

const renderIconButton = (props, ref) => {
  return (
    <IconButton
      {...props}
      ref={ref}
      icon={<PlusIcon />}
      circle
      color="blue"
      appearance="primary"
    />
  );
};

class Pos extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      category: [],
      products: [],
      active_cat: 0,
      isloading: false,
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
      user: null,
      payment_step: 0,
      order_method: 'TakeAway',
      show_table: false,
      table_no: 0,
      type: 'all',
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
      discount_amount: 0,
      discount_remark: '',
      notes: '',
      coupon_code: [],
      postheme: 1,
      sort_by: 'sort_order',
      pickuppoints: [],
      pickuppoint: '',
      all_products: [],
      tables: [],
      customermodel: false,
      addressModal: false,
      house: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      address_type: 'home',
      address: '',
      shipping_address: 0,
      futureModal: false,
      futureDate: null,
      billing_disable: 0,
      charges: [],
      cart_charges: [],
      product_tax: 0,

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
      showOther:false

    };

    this.printkot = createRef();
    this.PrintRecipt= createRef();
  }

  update_pickup_point = (e) => {
    this.setState({ pickuppoint: e });
  };

  handlePrint = (type) => {

    if(type == 'receipt' || type == 'both')
    {
      const contentToPrint = this.PrintRecipt.current.innerHTML;
      window.electron.send('print', contentToPrint);
    }

    if(type == 'kot' || type == 'both')
      {
        const contentToPrint = this.printkot.current.innerHTML;
        window.electron.send('print', contentToPrint);
      }
    
    // const contentToPrint2 = this.printkot.current.innerHTML;
    
    // alert(contentToPrint);
    // Send the captured HTML content to the main process for printing
   
    

    // Use the exposed API from preload.js
    // window.electron.send('print');
  }


  componentDidMount() {
    if (!this.context.user.is_billing_enable) {
      if (
        this.context.role.staff_role != 'owner' &&
        this.context.role.staff_role != 'admin'
      ) {
        this.setState({ billing_disable: true });
        Swal.fire({
          title: 'Billing Disabled',
          text: 'Billing is disabled for your account. Please contact support.',
          showCancelButton: false,
          confirmButtonColor: '#0066b2',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Go to Dashboard',
        }).then((result) => {
          if (result.isConfirmed) {
            this.props.navigate('/');
          }
        });
      }
    }

    this.setState({
      customermodel: this.context.user.user_before_order,
      charges: this.context.user.charges,
    });
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    if (this.props.table_id != undefined) {
      this.setState({ table_no: this.props.table_id, order_method: 'DineIn' });
    }

    if (this.props.order_code != undefined) {
      this.setState({
        order_code: this.props.order_code,
        customermodel: false,
      });
      this.getOrderDetails(this.props.order_code);
    }

    // this.fetchCategories('sort_order');
    this.fetch_current_offers_vendor();

    if (this.context.products.length > 0) {
      this.setState({
        products: this.context.products,
        all_products: this.context.products,
      });
    } else {
      this.fetchProducts(0, [], this.state.type, 1);
    }

    if (this.context.products.length > 0) {
      this.setState({
        category: this.context.category,
      });
    } else {
      this.fetchCategories('sort_order');
    }

    this.setState({
      postheme: this.context.user.pos_theme_id,
    });

    if (this.state.postheme == 1) {
      // this.fetchProducts(0, [], this.state.type, 1);
    }

    this.fetchpickuppoint();
    this.fetch_table_vendors();
  }

  fetchProducts = (category_id, products, type, page) => {
    this.setState({ load_item: true });
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
        sort_by: this.state.sort_by,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page == 1) {
            this.setState({ products: [], all_products: [] });
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
  };

  fetchCategories = (sort_by) => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        sort_by: sort_by,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({ category: json.data });

          // json.data.map.call(json.data, (item, index) => {
          //   if (item.id == this.state.active_cat) {
          //     this.active_cat(this.state.active_cat,item.products );
          //   }
          // });
        }
        this.setState({ load_item: false, isloading: false });
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        // this.setState({ isloading: false });
      });
  };

  active_cat = (id, product) => {
    this.setState({ active_cat: id });
    if (this.state.postheme != 1) {
      this.setState({
        product_show: true,
      });
    }

    if (product.length == 0) {
      this.setState({
        products: this.state.all_products,
      });
    } else {
      this.setState({
        products: product,
      });
    }
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

  fetchpickuppoint = () => {
    fetch(api + 'fetch_pickup_point', {
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
            pickuppoints: json.data,
            pickuppoint: json.data[0].pickuppoint_name,
          });
        } else {
          this.setState({ pickuppoints: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  add_to_cart = (product, vv_id, addons, quantity) => {
    let final_price = this.state.grandTotal;
    let tax = this.state.product_tax;
    let subTotal = this.state.subTotal;
    toast.success(product.product_name + ' added to cart');
    var bb = [];
    addons.map((item, index) => {
      bb.push(item);
    });

    var match = false;
    var key = 0;
    var breaknow = false;

    var cart = this.state.cart;

    //check product is in the cart or not
    for (var i = 0; i < cart.length; i++) {
      var item = this.state.cart[i];
      //compare product id and variant id
      if (item.product.id == product.id && item.variant_id == vv_id) {
        if (bb.length == 0 && item.cart_addon.length == 0) {
          key = i;
          match = true;
          break;
        } else {
          //compare addons
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
    let ads = [];

    if (match) {
      var quantity = cart[key].quantity + quantity;
      //calculate price of one
      var price = cart[key].price / cart[key].quantity;
      var tax_on_one = cart[key].tax / cart[key].quantity;

      tax =
        parseFloat(tax) -
        parseFloat(cart[key].tax) +
        parseFloat(tax_on_one) * parseFloat(quantity);
      subTotal =
        parseFloat(subTotal) -
        parseFloat(cart[key].price) +
        parseFloat(price) * parseFloat(quantity);

      final_price = tax + subTotal;

      cart[key].quantity = quantity;

      cart[key].price = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
      cart[key].tax = (parseFloat(tax_on_one) * parseFloat(quantity)).toFixed(
        2
      );

      this.setState({
        cart: cart,
      });

      var full_cart = cart;
    } else {
      let total = parseFloat(product.our_price);
      let product_tax = 0;

      product.variants.map((item, index) => {
        if (item.id == vv_id) {
          total = item.variants_discounted_price;

          //find the group of addons
          item.addons.map((item2, index) => {
            //find the all addons of group
            item2.addons.map((item3, index) => {
              if (addons.includes(item3.id)) {
                total = total + item3.addon_price;
                // alert(item3.addon_price);
                ads.push(item3);
              }
              //  var pro = item3.find(addon => addon.addon_name === item3.addon_name);
              //  console.log(foundObject);
              // console.log(addons);
              // var pro = addons.find(addon => addon.addon_name === item3.addon_name);

              // console.log(pro);
            });
          });
        }
      });

      if (this.context.user.gstin != null) {
        if (this.context.user.gst_type == 'inclusive') {
          total = parseFloat(parseFloat(total) / (1 + product.tax / 100));
        }
        product_tax = parseFloat(parseFloat(total) * (product.tax / 100));
      }

      //alert(product_tax.toFixed(2));
      var cart2 = {
        product_id: product.id,
        product: product,
        variant_id: vv_id,
        cart_addon: bb,
        quantity: quantity,
        price: total.toFixed(2),
        tax: product_tax.toFixed(2),
        product_discount_price: total.toFixed(2),
        addons: ads,
      };

      // subTotal = parseFloat(subTotal) + parseFloat(total);

      // tax = parseFloat(tax) + parseFloat(product_tax);

      // final_price =
      //   parseFloat(final_price) + parseFloat(total) + parseFloat(product_tax);

      this.setState({
        cart: [...this.state.cart, cart2],
      });

      var full_cart = [...this.state.cart, cart2];
    }
    this.apply_discount(
      full_cart,
      this.state.discount_type,
      this.state.discount,
      this.state.coupon_code,
      this.state.discount_remark
    );
  };

  update_cart = (key, quantity) => {
    var final_price = this.state.grandTotal;
    var tax = this.state.taxes;
    var subTotal = this.state.subTotal;

    if (quantity == 0) {
      var cart = this.state.cart;
      final_price = final_price - cart[key].price - cart[key].tax;
      subTotal = subTotal - cart[key].price;
      tax = tax - cart[key].tax;
      cart.splice(key, 1);
    } else {
      var cart = this.state.cart;
      //calculate price of one
      var price = cart[key].price / cart[key].quantity;
      var tax_on_one = cart[key].tax / cart[key].quantity;

      tax =
        parseFloat(tax) -
        parseFloat(cart[key].tax) +
        parseFloat(tax_on_one) * parseFloat(quantity);

      final_price =
        parseFloat(final_price) -
        parseFloat(cart[key].price) -
        parseFloat(cart[key].tax) +
        parseFloat(price) * parseFloat(quantity) +
        tax;

      subTotal =
        parseFloat(subTotal) -
        parseFloat(cart[key].price) +
        parseFloat(price) * parseFloat(quantity);

      cart[key].quantity = quantity;

      cart[key].price = (parseFloat(price) * parseFloat(quantity)).toFixed(2);
      cart[key].tax = (parseFloat(tax_on_one) * parseFloat(quantity)).toFixed(
        2
      );
    }

    this.setState({
      cart: cart,
    });

    if (cart.length == 0) {
      this.clear_cart();
    } else {
      this.apply_discount(
        cart,
        this.state.discount_type,
        this.state.discount,
        this.state.coupon_code,
        this.state.discount_remark
      );
    }
  };

  clear_cart = () => {
    this.setState({
      cart: [],
      grandTotal: 0,
      subTotal: 0,
      taxes: 0,
      discount: 0,
      discount_amount: 0,
      discount_type: '',
      coupon_code: [],
    });
  };

  search = (e) => {
    if (e.target.value.length >= 1) {
      var search = e.target.value;
      var products = this.state.all_products;

      var filteredProducts = products.filter((product) => {
        const nameMatches = product.product_name
          .toLowerCase()
          .includes(search.toLowerCase());
        const shortCodeMatches = product.product_code
          ? product.product_code.toLowerCase().includes(search.toLowerCase())
          : false;
        return nameMatches || shortCodeMatches;
      });
      this.setState({
        products: filteredProducts,
      });
    } else {
      this.setState({
        products: this.state.all_products,
      });
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
          vendor_uu_id: this.context.user.vendor_uu_id,
          order_value: this.state.subTotal,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({ user_id: json.data.id, user: json.data });

            if (json.offer != null && json.offer.status === true) {
              var discount_type = json.offer.discount_type;
              var discount = json.offer.discount;

              this.apply_discount(
                this.state.cart,
                discount_type,
                discount,
                json.offer,
                this.state.discount_remark
              );
            }

            // if (this.state.cart.length == 0) {
            //   alert('user calling');
            // } else {
            if (json.data.name == null || json.data.name == '') {
              this.setState({ payment_step: 1 });
            } else {
              this.setState({ name: json.data.name, payment_step: 2 });
              // }
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
        this.setState({ is_buttonloding: false, customermodel: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // this.setState({ isloading: false });
      });
  };

  update_order_method = async (method) => {
    if (method == 'DineIn' && this.state.table_no != 0) {
      if (this.state.tables.length > 0) {
        this.setState({
          order_method: method,
          show_table: true,
          if_table_order: true,
        });
      } else {
        this.setState({
          order_method: method,
          table_no: 0,
        });
      }
    } else {
      this.setState({
        order_method: method,
        show_table: false,
        if_table_order: false,
      });
    }

    var charges = await this.apply_charges(
      method,
      this.state.subTotal,
      this.state.discount_amount
    );

    var sum_charges = charges['sum_charges'];
    var charges_tax = charges['charges_tax'];

    var taxes = (
      parseFloat(this.state.product_tax) + parseFloat(charges_tax)
    ).toFixed(2);

    var grandTotal =
      parseFloat(this.state.subTotal) -
      parseFloat(this.state.discount_amount) +
      parseFloat(taxes) +
      parseFloat(sum_charges);

    this.setState({ grandTotal: Math.round(grandTotal), taxes: taxes });
  };

  next_step = () => {
    if (
      this.state.contact != null &&
      this.state.contact != '' &&
      this.state.order_method == 'DineIn'
    ) {
      this.setState({ payment_step: 2 });
    } else {
      // this.setState({ contact: '', name: '' });
    }

    this.setState({ isModalOpen: true });
  };

  place_order = (payment_method) => {
    var order_method = this.state.order_method;
    if (
      this.state.order_method != 'TakeAway' &&
      this.state.order_method != 'Delivery'
    ) {
      var order_method = this.state.table_no;
    } else {
      var order_comment = this.state.pickuppoint;
    }

    if (
      this.state.order_method == 'Delivery' &&
      this.state.shipping_address == 0
    ) {
      toast.error('Please Select Delivery Address');
      return false;
    }

    this.setState({ is_buttonloding: true });
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
        coupon_code: this.state.coupon_code.coupon_code,
        order_comment: order_comment,
        discount_amount: this.state.discount_amount,
        tax: this.state.taxes,
        shipping_address: this.state.shipping_address,
        future_date: this.state.futureDate,
        order_code: this.state.order_code,
        cart_charges: this.state.cart_charges,
        discount_remark: this.state.discount_remark,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.clear_cart();
          this.setState({
            payment_step: 0,
            isModalOpen: false,
            posOrderComplete: true,
            order_code: json.data[0].order_code,
            order: json.data,
            kot_id: json.data[0].kot,
            discount: 0,
            notes: '',
            user_id: '',
            name: '',
            user: null,
            contact: '',
            table_no: 0,
            order_method: 'TakeAway',

            split_payment: [
              { amount: 0, method: 'Cash' },
              { amount: 0, method: 'Card' },
              { amount: 0, method: 'UPI' },
            ],
            split_total: 0,
            split: false,
            discount_type: '',
            instruction: '',
            coupon_code: [],
            order_comment: '',
            discount_amount: 0,
          },()=>{

            if(this.context.isElectron())
            {
              if(json.data[0].table == null)
                {
                  this.handlePrint("both");
                }
                else
                {
                  this.handlePrint("kot");
                }
            }            
          });
          if (
            json.data[0].table != null &&
            json.data[0].table.table_uu_id != null
          ) {
            this.setState({
              order_table_no: json.data[0].table.table_uu_id,
              if_table_order: true,
            });
          } else {
            this.setState({
              order_table_no: 0,
              if_table_order: false,
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
          if (json.data[0].user != null) {
            if (json.data[0].user.contact != '0000000000') {
              this.setState({ name: json.data[0].user.name, payment_step: 2 });
              this.setState({
                name: json.data[0].user.name,
                user_id: json.data[0].user.id,
                contact: json.data[0].user.contact,
              });
            }
          }

          if (json.data[0].table != null) {
            this.setState({
              table_no: json.data[0].table.table_uu_id,
              order_method: 'DineIn',
            });
          }

          // }
        }

        // var content = document.getElementById("divcontents");
        // var pri = document.getElementById("invoice-POS").contentWindow;
        // pri.document.open();
        // pri.document.write(content.innerHTML);
        // pri.document.close();
        // pri.focus();
        // pri.print();
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  guest = () => {
    if (this.state.cart.length > 0) {
      this.setState({ user_id: '1', contact: '0000000000', name: 'Guest' });
      this.setState({ payment_step: 2 });
      this.setState({ isModalOpen: true });
    } else {
      this.setState({ user_id: '1', contact: '0000000000', name: 'Guest' });
      this.setState({ payment_step: 2 });
      this.setState({ isModalOpen: true });
    }
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

  apply_discount = (
    cart,
    discount_type,
    discount,
    coupon_code,
    discount_remark
  ) => {
    if (discount == undefined) {
      discount = 0;
    }

    var cart_total = 0;
    var discount_amount = 0;
    var discount_total = 0;

    cart.map((item) => {
      if (
        item.product.discount_applicable ||
        (discount_type == 'percentage' && discount == 100)
      ) {
        discount_total = parseFloat(discount_total) + parseFloat(item.price);
      }
      cart_total = parseFloat(cart_total) + parseFloat(item.price);
    });
    var tax_amount = 0;

    // alert(cart_total);
    // var tax_percentage = (tax * 100) / order_amount;

    if (coupon_code.discount == undefined) {
      if (discount_type != 'percentage') {
        if (discount > 0) {
          discount = parseFloat((discount / discount_total) * 100).toFixed(4);
        }
      }

      cart.map((item, index) => {
        if (
          item.product.discount_applicable ||
          (discount_type == 'percentage' && discount == 100)
        ) {
          discount_amount =
            parseFloat(discount_amount) +
            parseFloat(item.price) * (discount / 100);
          cart[index].product_discount_price =
            parseFloat(item.price) - parseFloat(item.price) * (discount / 100);

          cart[index].tax =
            cart[index].product_discount_price * (item.product.tax / 100);
          // cart[index].tax=parseFloat(cart[index].tax) - (parseFloat(cart[index].tax)*((discount)/100));
        }

        tax_amount = parseFloat(tax_amount) + parseFloat(cart[index].tax);
      });
    } else {
      var discount_amount = coupon_code.discount_amount;
      var discount_percentage = parseFloat(
        (discount_amount / discount_total) * 100
      ).toFixed(4);

      cart.map((item, index) => {
        if (
          item.product.discount_applicable ||
          (discount_type == 'percentage' && discount == 100)
        ) {
          discount_amount =
            parseFloat(discount_amount) +
            parseFloat(item.price) * (discount / 100);
          cart[index].product_discount_price =
            parseFloat(item.price) - parseFloat(item.price) * (discount / 100);

          cart[index].tax =
            cart[index].product_discount_price *
            (item.product.tax / 100).toFixed(2);
          // cart[index].tax=parseFloat(cart[index].tax) - (parseFloat(cart[index].tax)*((discount)/100));
        }

        tax_amount = parseFloat(tax_amount) + parseFloat(cart[index].tax);
      });

      var coupon = coupon_code;
      var discount_amount = Math.round(coupon.discount_amount);
      var discount_type = 'percentage';
      var discount = coupon.discount;
    }

    this.setState({ cart: cart });
    if (discount_amount > cart_total) {
      toast.error('Discount amount should not be greater than order amount');
      return false;
    }

    //apply other charges vendor

    var charges = this.apply_charges(
      this.state.order_method,
      cart_total,
      discount_amount
    );

    var sum_charges = charges['sum_charges'];
    var charges_tax = charges['charges_tax'];

    var product_tax = tax_amount;

    tax_amount = tax_amount + charges_tax;

    var grandTotal =
      parseFloat(cart_total) -
      parseFloat(discount_amount) +
      parseFloat(tax_amount) +
      parseFloat(sum_charges);

    this.setState({
      discount_amount: discount_amount.toFixed(2),
      discount_type: discount_type,
      discount: discount,
      subTotal: parseFloat(cart_total).toFixed(2),
      product_tax: parseFloat(product_tax).toFixed(2),
      taxes: parseFloat(tax_amount).toFixed(2),
      grandTotal: Math.round(grandTotal),
      discount_remark: discount_remark,
    });

    this.setState({
      coupon_code: coupon_code,
    });
    // this.calculateTotal(order_amount, discount_amount);
  };

  add_notes = (notes) => {
    this.setState({ notes: notes });
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
            this.setState({ tables: json.data });
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

  add_user_address = () => {
    // if (this.state.house == '') {
    //   toast.error('Please enter house number');
    //   return false;
    // }


    fetch(api + 'add_user_address_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        user_id: this.state.user.user_uu_id,
        house: this.state.house,
        landmark: this.state.landmark,
        pincode: this.state.pincode,
        city: this.state.city,
        state: this.state.state,
        address: this.state.address,
        type: this.state.address_type,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          var oj = this.state.user;
          oj.address = json.data;
          this.setState({ user: oj, addressModal: false });
          toast.success(json.msg);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  add_cart_order = async (item) => {
    await this.clear_cart();
    var all_products = this.state.all_products;
    for (let item2 of item) {
      var product_id = item2.product_id;
      var pro = all_products.find((product) => product.id === product_id);

      var product_addon = [];
      item2.addons.map((item3, index) => {
        product_addon.push(parseInt(item3.addon_id));
      });

      await this.add_to_cart(
        pro,
        item2.variant_id,
        product_addon,
        item2.product_quantity
      );
    }

    this.setState({
      customermodel: false,
    });
  };

  set_future_date = (date) => {
    this.setState({ futureDate: date });
  };

  remove_charges = (index) => {
    var confirm = window.confirm(
      'Are you sure you want to remove this charge ?'
    );

    if (confirm) {
      var cart_charges = this.state.cart_charges;
      var amount = cart_charges[index].charge_amount;

      var grandTotal = this.state.grandTotal;
      grandTotal = grandTotal - amount;
      this.setState({ grandTotal: grandTotal });

      cart_charges.splice(index, 1);
      this.setState({ cart_charges: cart_charges });
    }
  };

  apply_charges = (order_method, cart_total, discount) => {
    cart_total = cart_total - discount;

    var charges = this.state.charges;
    var sum_charges = 0;
    var sum_tax = 0;
    var cart_charges = [];

    if (charges.length > 0) {
      charges.map((item) => {
        var area = item.area;
        var charge_type = item.charge_type;
        var charge_value = item.charge_value;
        var charge_name = item.charge_name;

        var charge_tax = item.charge_tax;
        var charge_tax_type = item.charge_tax_type;
        if (area.includes(order_method)) {
          if (charge_type == 'percentage') {
            var charge_amount = parseFloat(
              (charge_value / 100) * cart_total
            ).toFixed(2);
            //calculate charge amount tax
          } else {
            if (this.state.order_code != '') {
              var charge_amount = 0;
            } else {
              if (cart_total == 0) {
                var charge_amount = 0;
              } else {
                var charge_amount = parseFloat(charge_value).toFixed(2);
              }
            }
          }

          //calculate charge amount tax
          if (charge_tax_type == 'inclusive') {
            charge_amount = parseFloat(
              parseFloat(charge_amount) / (1 + charge_tax / 100)
            ).toFixed(2);
            var charge_tax_amount = (
              (charge_amount * charge_tax) /
              100
            ).toFixed(2);
          } else {
            var charge_tax_amount = parseFloat(
              (charge_amount * charge_tax) / 100
            ).toFixed(2);
          }

          sum_charges = parseFloat(sum_charges) + parseFloat(charge_amount);
          sum_tax = parseFloat(sum_tax) + parseFloat(charge_tax_amount);
          if (charge_amount != 0) {
            cart_charges.push({
              charge_type: charge_type,
              charge_value: charge_value,
              charge_name: charge_name,
              charge_amount: charge_amount,
              charge_tax: charge_tax_amount,
              is_required: item.is_required,
            });
          }
        } else {
          // alert(order_method);
        }
      });
    }
    this.setState({
      cart_charges: cart_charges,
    });

    var response = {};
    response['sum_charges'] = sum_charges;
    response['charges_tax'] = sum_tax;
    return response;
  };
  render() {
    return (
      <>
        <Helmet>
          <title>POS</title>
        </Helmet>
        <div
          className="main-wrappers"
          style={{ backgroundColor: '#fff', minHeight: '100vh' }}
        >
          {this.state.isloading ? (
            <Loader />
          ) : (
            <div className="page-wrapper p-0 m-0" id="sidebar">
              <div
                className="content"
                style={{ paddingTop: '0px', paddingLeft: '0px' }}
              >
                <div className="row">
                  {this.state.show_table ? (
                    <div className="col-lg-9 col-sm-12 pe-4 ">
                      <PosHeader
                        order_method={this.state.order_method}
                        update_order_method={this.update_order_method}
                      />
                      <div className="p-4">
                        <Tables
                          tables={this.state.tables}
                          update_order_type={this.update_order_type}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="col-lg-9 col-sm-12 pe-4">
                      {this.state.postheme == 1 ? (
                        <>
                          <div className="row p-2 pe-3">
                            <div className="col-lg-3 col-sm-12 d-flex justify-content-start align-items-center">
                              <div className="logo">
                                {this.context.user.shop_name === null ||
                                this.context.user.shop_name === '' ? (
                                  <Link to="/">
                                    <img
                                      src={logo_black_full}
                                      alt="img"
                                      style={{
                                        width: '200px',
                                      }}
                                    />
                                  </Link>
                                ) : (
                                  <Link to="/">
                                    <img
                                      src={logo_black_full}
                                      alt="img"
                                      style={{ width: '110px' }}
                                    />
                                  </Link>
                                )}
                              </div>
                            </div>
                            <div className="col-lg-4 col-sm-12 nav user-menu d-flex justify-content-end align-items-center">
                              <li className="nav-item dropdown">
                                <Link to="/">
                                  <i className="iconly-Home icli sidebar_icons"></i>
                                </Link>
                              </li>

                              <li className="nav-item">
                                <a
                                  className=" nav-link"
                                  onClick={() => {
                                    document.documentElement.requestFullscreen()
                                      ? document.exitFullscreen()
                                      : document.documentElement.requestFullscreen();
                                  }}
                                >
                                  <i className="fa-solid fa-expand"></i>
                                </a>
                              </li>

                              {this.state.pickuppoints.length > 0 ? (
                                <li className="nav-item">
                                  <select
                                    className="form-select"
                                    aria-label="Default select example"
                                    onChange={(e) => {
                                      this.update_pickup_point(e.target.value);
                                    }}
                                  >
                                    {this.state.pickuppoints.map(
                                      (pickuppoint) => (
                                        <option
                                          value={pickuppoint.pickuppoint_name}
                                          key={pickuppoint.id}
                                        >
                                          {pickuppoint.pickuppoint_name}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </li>
                              ) : (
                                <div></div>
                              )}
                            </div>
                            <div className="col-lg-5 col-sm-12  d-flex justify-content-end align-items-center p-0">
                              <RadioGroup
                                value={this.state.order_method}
                                // value={this.state.is_veg}
                                // onChange={(e) => {
                                // this.props.update_order_method(e.target.value);
                                // }}

                                // value={this.state.is_veg}
                                onChange={(e) => {
                                  this.update_order_method(e);
                                }}
                                horizontal
                              >
                                <RadioButton
                                  value="TakeAway"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#619DD1"
                                  iconInnerSize={10}
                                  padding={5}
                                >
                                  TakeAway
                                </RadioButton>

                                <RadioButton
                                  value="Delivery"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#619DD1"
                                  iconInnerSize={10}
                                  padding={5}
                                >
                                  Delivery
                                </RadioButton>

                                <RadioButton
                                  value="DineIn"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#619DD1"
                                  iconInnerSize={10}
                                  padding={5}
                                >
                                  DineIn
                                </RadioButton>
                              </RadioGroup>
                            </div>
                          </div>

                          <div className="row" style={{ padding: '10px' }}>
                            <div className="col-lg-3 col-sm-2">
                              <div
                                style={{
                                  maxHeight: '80vh',
                                  overflowY: 'scroll',
                                  // boxShadow: "rgba(0, 0, 0, 0.24) 0px 0px 11px 1px",
                                  borderRadius: '10px',
                                  paddingTop: '10px',
                                  paddingBottom: '10px',
                                  paddingLeft: '10px',
                                  position: 'sticky',
                                  top: '0',
                                }}
                              >
                                {this.state.category.length > 0 ? (
                                  <Category
                                    active_cat={this.state.active_cat}
                                    category={this.state.category}
                                    fetch_product={this.active_cat}
                                    grid={true}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div className="col-lg-9 col-sm-10">
                              <div
                                className="row"
                                style={{
                                  marginBottom: '50px',
                                }}
                              >
                                <div className="col-lg-8">
                                  <div className="form-group">
                                    <input
                                      type="text"
                                      id="pos_search_bar"
                                      className="form-control search-input"
                                      placeholder="Search your product here..."
                                      value={this.state.search}
                                      onChange={(e) => this.search(e)}
                                      autoFocus={false}
                                      ref={this.inputRef}
                                      style={{
                                        height: '40px !important',
                                        borderColor: '#5d5d5d !important',
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-4">
                                  <button
                                    className="btn btn-secondary btn-sm  me-2"
                                    style={{
                                      height: '40px',
                                      width: '100%',
                                      borderRadius: '10px',
                                    }}
                                    onClick={() => {
                                      this.setState({
                                        customermodel: true,
                                      });
                                    }}
                                  >
                                    {this.state.user_id == 1 ||
                                    this.state.user_id == '' ? (
                                      <p>Add Customer </p>
                                    ) : (
                                      <>{this.state.name}</>
                                    )}
                                  </button>

                                  {/* <select
                                    className="form-select"
                                    style={{
                                      minHeight: '100px !important',
                                      borderColor: '#5d5d5d !important',
                                    }}
                                    onChange={(e) =>
                                      this.fetchCategories(e.target.value)
                                    }
                                  >
                                    <option value="">Auto Generated</option>
                                    <option value="asc">By Name</option>
                                    <option value="sort_order">
                                      By Sort Order
                                    </option>
                                  </select> */}
                                </div>

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
                                        height: '90px',
                                      }}
                                    />
                                    <h4>
                                      {' '}
                                      Sorry, we couldn't find any records at
                                      this moment.{' '}
                                    </h4>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <PosHeader
                            order_method={this.state.order_method}
                            update_order_method={this.update_order_method}
                          />

                          <div className="row p-4">
                            {this.state.category.length > 0 ? (
                              <Category
                                active_cat={this.state.active_cat}
                                category={this.state.category}
                                fetch_product={this.active_cat}
                                grid={false}
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
                      )}
                    </div>
                  )}
                  <div
                    className="col-lg-3 col-sm-12 sidebar_scroll"
                    style={{
                      position: 'fixed',
                      zIndex: 99,
                      right: '10px',
                      overflowY: 'hidden',
                      background: '#fff',
                      // boxShadow: "0px 0px 11px 1px rgba(0,0,0,0.24)",
                      borderRadius: '10px',
                    }}
                  >
                    <PosAdd
                      next_step={this.next_step}
                      clear={this.clear_cart}
                      cart={this.state.cart}
                      update_cart={this.update_cart}
                      subTotal={this.state.subTotal}
                      cart_charges={this.state.cart_charges}
                      remove_charges={this.remove_charges}
                      grandTotal={this.state.grandTotal}
                      taxes={this.state.taxes}
                      offers={this.state.offers}
                      discount={this.state.discount}
                      discount_amount={this.state.discount_amount}
                      apply_discount={this.apply_discount}
                      order_method={this.state.order_method}
                      add_notes={this.add_notes}
                      set_future_date={this.set_future_date}
                      notes={this.state.notes}
                      check_coupon={this.check_coupon}
                      table_no={this.state.table_no}
                      tables={this.state.tables}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Modal
            focusTrapped={false}
            open={this.state.customermodel}
            // open={true}
            onClose={() =>
              this.setState({ customermodel: false, split: false })
            }
            // showCloseIcon={false}
            center
            classNames={{
              modal: 'customModal',
            }}
            styles={{
              modal: {
                width: '100%',
                height: '90vh',
              },
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Customer</h4>
                </div>
              </div>
              {this.state.payment_step == 0 ? (
                <div className="row">
                  <div className="col-lg-12">
                    <br />
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
                    {/* {this.context.user.user_skip_button ? (
                      <a
                        onClick={() => {
                          this.setState({ customermodel: false});
                        }}
                        className="btn  btn-danger btn-sm me-2"
                      >
                        Skip
                      </a>
                    ) : (
                      <></>
                    )} */}
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
                      <div className="row">
                        <div className="col-lg-6">
                          <h5
                            onClick={() => {
                              this.setState({ payment_step: 0 });
                            }}
                            className="mb-2 fw-bold"
                          >
                            Hello,{' '}
                            <span
                              style={{
                                textTransform: 'capitalize',
                              }}
                            >
                              {this.state.name}
                            </span>
                          </h5>
                        </div>
                        <div className="col-lg-6 d-flex justify-content-end">
                          <a
                            // href="javascript:void(0);"
                            onClick={() => {
                              this.setState({
                                customermodel: false,
                              });
                            }}
                            className="btn btn-secondary btn-sm me-2"
                          >
                            Next
                          </a>
                        </div>
                      </div>

                      <div className="row">
                        {this.state.user &&
                          this.state.user.last_five_order &&
                          this.state.user.last_five_order.length > 0 &&
                          this.state.user.last_five_order.map((item, index) => {
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  this.add_cart_order(item.product);
                                }}
                                className="col-md-6 mt-3"
                              >
                                <div className="productset flex-fill d-flex align-items-center productmainset">
                                  <div className="productsetcontent">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <h3>{item.order_code} </h3>
                                      <h4>
                                        {moment(item.created_at).fromNow()}
                                      </h4>
                                    </div>
                                    <div className="d-flex   mt-2">
                                      <p>
                                        {item.product.map((item2, index) => {
                                          return (
                                            <div key={index}>
                                              {' '}
                                              <strong>
                                                {item2.product_quantity}
                                              </strong>{' '}
                                              X {item2.product.product_name}
                                              {item2.variant != null ? (
                                                <span>
                                                  {' '}
                                                  {'- '}
                                                  {item2.variant.variants_name}
                                                </span>
                                              ) : (
                                                <></>
                                              )}
                                              {item2.addons != null &&
                                                item2.addons.map(
                                                  (item3, index) => {
                                                    return (
                                                      <span key={index}>
                                                        {' '}
                                                        {'+'} {item3.addon_name}
                                                      </span>
                                                    );
                                                  }
                                                )}
                                              {', '}
                                            </div>
                                          );
                                        })}
                                      </p>

                                      <div className="d-flex align-items-center justify-content-between">
                                        <h3>
                                          Total Amount:-{item.total_amount}{' '}
                                        </h3>
                                        {/* <h4>{moment(item.created_at).fromNow()}</h4> */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            open={this.state.isModalOpen}
            // open={true}
            onClose={() => this.setState({ isModalOpen: false, split: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
            styles={{
              modal: {
                width: '100%',
              },
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
                      <label>Customer Contact </label>
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
                    {this.context.user.user_skip_button == 1 &&
                    this.state.order_method != 'Delivery' ? (
                      <a
                        onClick={() => {
                          this.guest();
                        }}
                        className="btn  btn-danger btn-sm me-2"
                      >
                        Skip
                      </a>
                    ) : (
                      <></>
                    )}
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
                      <h5 className="mb-2 fw-bold">
                        Hello,{' '}
                        <span
                          style={{
                            textTransform: 'capitalize',
                          }}
                        >
                          {this.state.name}
                        </span>
                      </h5>
                      <h6>
                        Total Payable Amount -{' '}
                        <strong className="text-danger">
                          ₹{this.state.grandTotal}
                        </strong>
                      </h6>
                      {this.state.order_method == 'Delivery' &&
                      this.state.user != null ? (
                        this.state.user.address.length > 0 ? (
                          <>
                            <div className="row">
                              <div className="col-lg-8">
                                <br />
                                <h5 className="mb-2 fw-bold">
                                  Select Delivery Address
                                </h5>
                              </div>
                              <div className="col-lg-4 d-flex justify-content-end">
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    this.setState({ addressModal: true });
                                  }}
                                >
                                  Add Address
                                </button>
                              </div>
                            </div>
                            <br />
                            <RadioGroup
                              // value={this.state.variants_id.toString()}
                              onChange={(value, event) => {
                                this.setState({ shipping_address: value });
                              }}
                            >
                              {this.state.user.address.map((values, key) => {
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
                                      <p className="m-0">
                                        {values.address_type}
                                      </p>
                                      <div className="d-flex">
                                        <p className="m-0 mx-3">
                                          {values.address}
                                        </p>
                                      </div>
                                    </div>
                                  </RadioButton>
                                );
                              })}
                            </RadioGroup>
                          </>
                        ) : (
                          <>
                            <br />
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                this.setState({ addressModal: true });
                              }}
                            >
                              Add Address
                            </button>
                          </>
                        )
                      ) : (
                        <></>
                      )}

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
                        <div className="setvaluecash">
                          <ul style={{ justifyContent: 'center' }}>
                            <li>
                              <a
                                onClick={() => {
                                  // this.place_order('offline-cash');
                                }}
                                href="javascript:void(0);"
                                className="paymentmethod"
                              >
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Please Wait...
                              </a>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <div className="setvaluecash">
                          {this.state.order_method != 'DineIn' ||
                          this.state.table_no == 0 ? (
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

                                <li>
                                  <a
                                    onClick={() => {
                                      this.place_order('paylater');
                                    }}
                                    href="javascript:void(0);"
                                    className="paymentmethod"
                                  >
                                    <i className="fa-solid fa-refresh"></i>
                                    Pay Later
                                  </a>
                                </li>

                                <li>

                          <SelectPicker
                            style={{ width: '100%' }}
                            data={this.state.payment_options}
                            onChange={(value) => {
                              alert(value);
                              this.place_order(value);
                            }}
                          />
                        
                                </li>
                              </ul>
                            ) : (
                              <>
                                {this.state.split_payment.map((item, index) => {
                                  var tt = item.amount;
                                  return (
                                    <div key={index} className="row">
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
                                {this.state.split_total <=
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
                                    this.place_order('paylater');
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
              this.setState({
                posOrderComplete: false,
                order_code: '',
                customermodel: this.context.user.user_before_order,
              })
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
                    Order ID.{' '}
                    <strong>
                      {this.state.order.length > 0
                        ? this.state.order[0].bill_no
                        : ''}
                    </strong>{' '}
                    has been placed successfully.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="d-flex justify-content-center align-items-center">
                  <img src={success_gif} alt="img" style={{ width: '250px' }} />
                </div>
              </div>
              <div className="row my-4">
                <div className="col-lg-8 d-flex align-items-center justify-content-center pr-0">
                  {/* {os != 'Windows' && os != 'Mac OS' ? (
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
                  ) : ( */}

                  {
                     !this.context.isElectron() &&
                   <div className="row  w-100">
                    {this.state.if_table_order ? (
                      <></>
                    ) : (
                      <div
                        onClick={() => {
                          this.handlePrintClick();
                        }}
                        className="col-md-6  d-flex align-items-center justify-content-center"
                      >
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
  } 
                  {/* )}*/}
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

          <Modal
            focusTrapped={false}
            open={this.state.addressModal}
            // open={true}
            onClose={() =>
              this.setState({ addressModal: false, order_code: '' })
            }
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title w-100">
                  <h4 className="">Add New Address</h4>
                </div>
              </div>

              {/* <label>House/Flat/Floor No*</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => {
                  this.setState({ house: e.target.value });
                }}
              />
              <br />
              <label>Apartment/Road/Area (optional)</label>
              <input
                type="text"
                className="form-control"
                value={this.state.landmark}
                onChange={(e) => {
                  this.setState({ landmark: e.target.value });
                }}
              />
              <br /> */}
              <label>Address*</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => {
                  this.setState({ address: e.target.value });
                }}
              />
             

              <br />
              <label>Save as</label>
              <select
                className="form-control"
                value={this.state.type}
                onChange={(e) => {
                  this.setState({ address_type: e.target.value });
                }}
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>

              <div className="row my-4">
                <div className="col-lg-4 d-flex align-items-center justify-content-center pl-0">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure',
                        text: 'You want to add this address?',
                        showCancelButton: true,
                        confirmButtonColor: '#0066b2',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, add it!',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          this.add_user_address();
                        }
                      });
                    }}
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          </Modal>
{/* <div ref={this.PrintRecipt}>
  <h1>Hllo Aakash This is test</h1>
</div> */}
          {this.state.order.length > 0 && (
            <div
              style={{
                display: 'none',
              }}
            >
              <div ref={this.printkot}>
              <PrintKot
                ref={(el) => (this.componentRef = el)}
                order={this.state.order[0]}
                kot={this.state.kot_id}
              />
              </div>
              <div ref={this.PrintRecipt}>
              <PrintReceipt
                ref={(el2) => (this.componentRef2 = el2)}
                order={this.state.order[0]}
              />
              </div>
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
      notes: this.props.notes,
      coupon: '',
      coupon_button_loader: false,
      discount_remark: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.notes !== this.props.notes) {
      this.setState({ notes: this.props.notes });
    }
  }

  check_coupon = (coupon_code) => {
    if (coupon_code == '') {
      toast.error('Please enter a coupon code');
      return false;
    }
    this.setState({ coupon_button_loader: true });
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

          this.props.apply_discount(
            this.props.cart,
            '',
            0,
            {},
            this.state.discount_remark
          );
        } else {
          toast.success(json.msg);
          this.setState({ coupon: json.coupon_code, offersModal: false });

          var discount_type = json.discount_type;
          var discount = json.discount;

          this.props.apply_discount(
            this.props.cart,
            discount_type,
            discount,
            json,
            this.state.discount_remark
          );
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ coupon_button_loader: false });
      });
  };

  render() {
    return (
      <>
        <div className="card card-order h-100 shadow-none p-0">
          {this.props.cart.length > 0 ? (
            <>
              <div className="card-body p-0">
                <div className="totalitem">
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
                                {item.addons.map((i, key) => {
                                  return <h5 key={key}>{i.addon_name}</h5>;
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
                          <p style={{ marginTop: '15px' }}>₹ {item.price}</p>
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

                    {this.props.order_method != 'DineIn' ||
                    this.props.tables.length == 0 ? (
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
                          ₹ {this.props.discount_amount}
                        </h6>
                      </li>
                    ) : null}

                    {this.props.cart_charges.length > 0 &&
                      this.props.cart_charges.map((item2, index) => {
                        return (
                          <li key={index}>
                            <h5>
                              {item2.charge_name} ({item2.charge_value}
                              {item2.charge_type == 'percentage' ? '%' : '₹'})
                              {item2.is_required == 1 ? (
                                <span className="text-danger">*</span>
                              ) : (
                                <span
                                  onClick={() =>
                                    this.props.remove_charges(index)
                                  }
                                  className="text-danger"
                                >
                                  {' '}
                                  X
                                </span>
                              )}
                            </h5>
                            <h6>₹ {item2.charge_amount}</h6>
                          </li>
                        );
                      })}

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
                    <li className="total-value">
                      <h5>Total</h5>
                      <h6>₹ {this.props.grandTotal}</h6>
                    </li>
                  </ul>
                </div>
                <div className="w-100 d-flex align-items-center justify-content-between">
                  <Dropdown
                    renderToggle={renderIconButton}
                    placement="topStart"
                  >
                    <Dropdown.Item
                      onClick={() => {
                        this.setState({ notesModal: true });
                      }}
                      icon={<PageIcon />}
                    >
                      {' '}
                      Notes
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        this.setState({ futureModal: true });
                      }}
                      icon={<FolderFillIcon />}
                    >
                      Future Order
                    </Dropdown.Item>
                  </Dropdown>

                  <div
                    className="btn btn-secondary btn-sm"
                    style={{ width: '75%' }}
                    onClick={() => {
                      this.props.set_future_date(null);
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
            </div>
          )}
        </div>
        <Modal
          focusTrapped={false}
          open={this.state.offersModal}
          onClose={() => {
            this.setState({ offersModal: false });
          }}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Discount & Offers</h4>
              </div>
            </div>
            {this.context.role.staff_role === 'staff' &&
            this.context.user.max_discount == 0 ? (
              <></>
            ) : (
              <div className="mx-2">
                <h4>Discount</h4>
                <div className="row d-flex align-items-center mb-2">
                  <div className="col-lg-6">
                    <div className="row">
                      <div className="col-lg-6 d-flex align-items-center">
                        <button
                          className={
                            this.state.percentageDiscount
                              ? 'btn btn-secondary w-100 active'
                              : 'btn btn-secondary w-100'
                          }
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
                  <div className="col-lg-6">
                    <div className="form-group m-0">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Value"
                        onChange={(e) => {
                          if (isNaN(e.target.value)) {
                            return;
                          }
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
                  <div className="col-lg-6">
                    <div className="form-group m-0">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Discount Remark"
                        onChange={(e) => {
                          this.setState({
                            discount_remark: e.target.value,
                          });
                        }}
                        value={this.state.discount_remark}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 d-flex justify-content-end">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (this.state.percentageDiscount) {
                          var discount_type = 'percentage';
                        } else {
                          var discount_type = 'fixed';
                        }

                        if (this.state.discount_remark == '') {
                          toast.error('Please Enter Discount Remark');
                          return;
                        }

                        this.props.apply_discount(
                          this.props.cart,
                          discount_type,
                          this.state.discountAmount,
                          {},
                          this.state.discount_remark
                        );
                        this.setState({ offersModal: false });
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mx-2">
              <br />
              <h4>Coupon Code</h4>
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
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        this.check_coupon(this.state.coupon);
                      }}
                    >
                      Check & Apply
                    </button>
                  )}
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
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add Notes</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Add Notes"
                    rows={2}
                    onChange={(e) => {
                      this.setState({ notes: e.target.value });
                    }}
                    value={this.state.notes}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  />
                </div>
              </div>
              <div className="col-md-12 d-flex justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    this.props.add_notes(this.state.notes);
                    this.setState({ notesModal: false });
                  }}
                >
                  Add Notes
                </button>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.futureModal}
          // open={true}
          onClose={() => {
            this.setState({ futureModal: false });
          }}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Create a Future Order</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  {this.state.futureDate}
                  <DatePicker
                    format="dd/MM/yyyy hh:mm aa"
                    onChange={(date, event) => {
                      this.props.set_future_date(
                        moment(date).format('MM/DD/yyyy hh:mm a')
                      );
                    }}
                    defaultValue={new Date()}
                    shouldDisableDate={(date) => isBefore(date, new Date())}
                    showMeridian
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Add Notes"
                    rows={2}
                    onChange={(e) => {
                      this.setState({ notes: e.target.value });
                    }}
                    value={this.state.notes}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  />
                </div>
              </div>
              <div className="col-md-12 d-flex justify-content-end">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    this.props.add_notes(this.state.notes);
                    this.setState({ futureModal: false });
                    this.props.next_step();
                  }}
                >
                  Create a Future Order
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
  constructor(props) {
    super(props);
    this.state = {
      category: [],
      show_child: false,
    };
  }
  componentDidMount = () => {
    this.setState({
      category: this.props.category,
    });
  };
  show_child = (child) => {
    this.setState({ show_child: true });
    this.setState({ category: child });
  };

  hide_child = () => {
    this.setState({ show_child: false });
    this.setState({ category: this.props.category });
  };

  render() {
    return (
      <>
        {this.state.show_child ? (
          <h2 onClick={() => this.hide_child()}>
            <span className="fa fa-arrow-left"></span>
          </h2>
        ) : (
          <></>
        )}
        <div
          className=" col-md-3 d-flex"
          onClick={() => {
            this.props.fetch_product(0, []);
          }}
          style={
            this.props.grid
              ? { paddingBottom: '10px', width: '100%' }
              : { paddingBottom: '10px' }
          }
        >
          <div
            className="productset flex-fill"
            style={
              this.props.active_cat == 0
                ? {
                    padding: '10px',
                    width: '100%',
                    border: '1px solid #0066b2',
                  }
                : { padding: '10px', width: '100%', backgroundColor: '#fff' }
            }
          >
            <div className="productsetcontent">
              <h4>All</h4>
            </div>
          </div>
        </div>

        {this.state.category.length > 0 ? (
          this.state.category.map((item, index) =>
            (this.state.show_child === true && item.products.length > 0) ||
            (this.state.show_child === false && item.parent_id == 0) ? (
              <div
                className={'col-md-3 d-flex'}
                onClick={() => {
                  if (item.child != undefined) {
                    if (item.child.length > 0) {
                      this.show_child(item.child);
                    } else {
                      this.props.fetch_product(item.id, item.products);
                    }
                  } else {
                    this.props.fetch_product(item.id, item.products);
                  }
                }}
                style={
                  this.props.grid
                    ? { paddingBottom: '10px', width: '100%' }
                    : { paddingBottom: '10px' }
                }
              >
                <div
                  className="productset flex-fill"
                  style={
                    this.props.active_cat == item.id
                      ? {
                          padding: '10px',
                          width: '100%',
                          border: '1px solid #0066b2',
                        }
                      : {
                          padding: '10px',
                          width: '100%',
                          backgroundColor: '#fff',
                        }
                  }
                >
                  {/* <div className="productsetimg"></div> */}
                  <div className="productsetcontent">
                    <h4>{item.name} </h4>
                  </div>
                </div>
              </div>
            ) : null
          )
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
    this.state = {
      openModal: false,
      variants_id: 0,
      addon: [],
      addons: [],
      addon_groups: [],
    };
  }

  item_validate = () => {
    var addons = this.state.addons;
    var flag = true;

    var addon = [];
    addons.map((item, index) => {
      if (item.selected.length < item.min_selection) {
        flag = false;
        toast.error(
          'Please select min ' +
            item.min_selection +
            ' ' +
            item.group_display_name
        );
      }

      item.selected.map((item2, index) => {
        addon.push(item2);
      });
    });

    if (flag) {
      this.setState({ openModal: false, addons: [] });

      this.props.cart(this.props.data, this.state.variants_id, addon, 1);
    }
  };

  add_cart(product) {
    if (product.addon_map.length > 0 || product.variants.length > 0) {
      if (product.variants.length > 0) {
        var vv = product.variants[0].id;
        this.setState({ variants_id: vv });
        this.show_addons(vv);
      }
      this.setState({ openModal: true });
      this.setState({
        addon: [],
      });
    } else {
      this.setState({
        addon: [],
      });
      this.props.cart(product, this.state.variants_id, this.state.addon, 1);
    }
  }

  select_addon = (id, key) => {
    var addons = this.state.addons;
    var selected = addons[key].selected;
    if (selected.includes(id)) {
      var index = selected.indexOf(id);
      if (index > -1) {
        selected.splice(index, 1);
      }
    } else {
      selected.push(id);
    }
    addons[key].selected = selected;
    this.setState({ addons: addons });
  };

  show_addons = (variant_id) => {
    var variant = this.props.data.variants.filter((item) => {
      return item.id == variant_id;
    });

    var addons = variant[0].addons;
    //add select index of every addon
    addons.map((addon) => {
      addon.selected = [];
    });
    this.setState({ addons: addons });
  };

  onCloseModal = () => {
    this.setState({ openModal: false });
  };

  render() {
    return (
      <div className="col-md-4">
        <div
          className=" d-flex"
          onClick={() => {
            this.add_cart(this.props.data);
          }}
        >
          <div
            className="productset flex-fill d-flex align-items-center productmainset"
            style={{ marginBottom: '15px', backgroundColor: '#fff' }}
          >
            {this.props.data.is_veg ? (
              <div className="veg">
                <img
                  src={veg}
                  style={{
                    width: '16px',
                    position: 'absolute',
                    zIndex: '10',
                    top: '4px',
                    right: '4px',
                    borderRadius: '2px',
                  }}
                />
              </div>
            ) : (
              <div className="nonveg">
                <img
                  src={nonveg}
                  style={{
                    width: '16px',
                    position: 'absolute',
                    zIndex: '10',
                    top: '4px',
                    right: '4px',
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}

            <img
              src={this.props.data.product_img}
              className="productsetimg"
              // style={{ width: "100%", height: "120px" }}
            />

            <div className="productsetcontent">
              <h4>{this.props.data.product_name}</h4>
              <h6>₹{this.props.data.our_price}</h6>
            </div>
          </div>
        </div>

        <Modal
          focusTrapped={false}
          // open={true}
          open={this.state.openModal}
          onClose={() => this.onCloseModal()}
          center
          showCloseIcon={true}
          classNames={{
            modal: 'customModal',
          }}
          styles={{
            modal: {
              height: '600px',
            },
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Customise as per your taste</h4>
              </div>
            </div>
          </div>
          <div className="mx-2">
            {this.props.data.variants.length > 0 ? (
              <>
                <h5 className="title-color font-sm fw-600 text-align-center mt-3 mb-3">
                  Variant
                </h5>
                <RadioGroup
                  value={this.state.variants_id.toString()}
                  onChange={(value, event) => {
                    this.show_addons(value);
                    this.setState({ variants_id: value, count: 0 });
                  }}
                >
                  {this.props.data.variants.map((values, key) => {
                    return (
                      <RadioButton
                        value={values.id.toString()}
                        addons={values.addon_map}
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
            {this.state.addons.length > 0 ? (
              <>
                {this.state.addons.map((item, key) => (
                  <>
                    <h6 className="title-color font-sm fw-600 text-align-center mt-3 mb-3">
                      {item.group_display_name}
                    </h6>

                    {item.addons.map((values, index) => {
                      return (
                        <div className="col-md-6" key={index}>
                          <div className="d-flex align-items-center single_checkbox new_checkbox new_checkbox_pos w-100 my-2">
                            <input
                              type="checkbox"
                              id={values.id}
                              name={values.id}
                              value={values.id}
                              className="checkbox"
                              checked={
                                this.state.addons[key].selected.includes(
                                  values.id
                                )
                                  ? true
                                  : false
                              }
                              disabled={
                                this.state.addons[key].selected.length >=
                                  item.max_selection && item.max_selection != 0
                                  ? this.state.addons[key].selected.includes(
                                      values.id
                                    )
                                    ? false
                                    : true
                                  : false
                              }
                              // checked={this.state.addon.includes(values.id)}
                              onChange={() => {
                                this.select_addon(values.id, key);
                              }}
                            />
                            <label
                              htmlFor={values.id}
                              className="checkbox_text d-flex justify-content-between align-items-center"
                            >
                              <p className="m-0 ms-3">{values.addon_name}</p>
                              <p className="m-0 me-3">
                                + ₹ {values.addon_price}
                              </p>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                    {/* </RadioGroup> */}
                  </>
                ))}
              </>
            ) : (
              <></>
            )}

            <div className="d-flex align-items-center justify-content-end">
              <a
                onClick={() => {
                  this.item_validate();
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
      is_loading: false,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <>
        <div className="row" style={{ marginTop: 10 }}>
          {this.state.is_loading ? (
            <Skeletonloader count={1} height={100} />
          ) : (
            <>
              {this.props.tables.length > 0 ? (
                this.props.tables.map((category, index) => (
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

                    {category.tables.map((item, index) => {
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
                              style={{
                                border: '1px solid #0066b2',
                              }}
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
                    })}
                  </>
                ))
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

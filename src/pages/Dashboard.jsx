import moment from 'moment';
import React, { Component,createRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider.js';
import Header from '../othercomponent/Header';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer.jsx';
import SetupAccount from '../othercomponent/SetupAccount';
import Skeletonloader from '../othercomponent/Skeletonloader';
import { Modal } from 'react-responsive-modal';
import Loader from '../othercomponent/Loader';
import { Button, DateRangePicker } from 'rsuite';
import no_img from '../assets/images/no_product.webp';
import Swal from 'sweetalert2';
// const { ipcRenderer } = window.require('electron');
const options = {
  margin: 30,
  responsiveClass: true,
  nav: true,
  autoplay: true,
  smartSpeed: 1500,
  loop: true,
  responsive: {
    0: {
      items: 1,
    },
    400: {
      items: 1,
    },
    600: {
      items: 2,
    },
    700: {
      items: 2,
    },
    1000: {
      items: 2,
    },
  },
};

export class Dashboard extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isloading: true,
      orders: [],
      isOpen: false,
      from: new Date(),
      to: new Date(),
      shop_status: 1,
      range: 'today',
      explosion: true,
      open: false,
      drawerOrderId: '',
    };

    this.printRef = createRef(); // Correctly create a ref
    this.handlePrint = this.handlePrint.bind(this);
  }

  static orderupdate(data) {
 
    Tables.orderupdate();
    OngoingOrders.orderupdate(1)

}

handlePrint = () => {
  const contentToPrint = this.printRef.current.innerHTML;
  // Send the captured HTML content to the main process for printing
  window.electron.send('print', contentToPrint);

  // Use the exposed API from preload.js
  // window.electron.send('print');
}

  componentDidMount() {
    this.setState({ shop_status: this.context.user.shop_open });
    this.get_vendor_data(this.state.range, this.state.from, this.state.to);

    this.timerID = setInterval(() => {
      this.get_vendor_data(this.state.range, this.state.from, this.state.to);
    }, 10 * 1000);


    window.electron.receive('fromMain', (message) => {
      console.log(message); // Should log "Print command received"
    });

  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  loader = (value) => {
    this.setState({ isloading: value });
  };

  onSelect = (value, states) => {
    this.setState({ value, states });
  };

  get_vendor_data = (range) => {
    fetch(api + 'get_order_inside', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: range,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ item: json.data });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  update_shop_status = () => {
    fetch(api + 'update_shop_status', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        shop_status: 1,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.context.get_vendor_profile(this.context.token);
          toast.success('You are now open for business!');
        } else {
          toast.error(json.msg);
          this.setState({ shop_status: this.context.user.shop_open });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  render() {
    const { item, activeStep, steps } = this.state;
    return (
      <>
      
        <Helmet>
          {this.context.user.shop_name === null ||
          this.context.user.shop_name === '' ? (
            <title>Dashboard</title>
          ) : (
            <title>{`${this.context.user.shop_name} - Dashboard`}</title>
          )}
        </Helmet>
        <>
        <div className="main-wrappers">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {this.context.step === 'steps' ? (
              <SetupAccount />
            ) : (
              <div className="content">
                {/* {document.cookie.indexOf('hide_banner=1') === -1 && (
                  <div className="dashboard-status-card-slider">
                    <div className="banner-slider-close-button">
                      <button
                        className="close-button"
                        onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: 'You want to hide the banners? We will be back in a couple of days.',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, Hide it!',
                            cancelButtonText: 'No, keep it',
                            confirmButtonColor: '#0066b2',
                            cancelButtonColor: '#d33',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              var d = new Date();
                              d.setTime(d.getTime() + 2 * 24 * 60 * 60 * 1000);
                              var expires = 'expires=' + d.toUTCString();
                              document.cookie =
                                'hide_banner=1;' + expires + ';path=/';
                              document.querySelector(
                                '.dashboard-status-card-slider'
                              ).style.display = 'none';
                            }
                          });
                        }}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                    <OwlCarousel className="owl-theme" {...options}>
                      <div className="dashboard_items_single">
                        <a
                          href="https://webixun.com/contact-us.html"
                          target="_blank"
                        >
                          <img src={img1} alt="img" />
                        </a>
                      </div>
                      <div className="dashboard_items_single">
                        <a
                          href="https://webixun.com/contact-us.html"
                          target="_blank"
                        >
                          <img src={img2} alt="img" />
                        </a>
                      </div>
                      <div className="dashboard_items_single">
                        <a
                          href="https://webixun.com/contact-us.html"
                          target="_blank"
                        >
                          <img src={img3} alt="img" />
                        </a>
                      </div>
                      <div className="dashboard_items_single">
                        <a
                          href="https://webixun.com/contact-us.html"
                          target="_blank"
                        >
                          <img src={img4} alt="img" />
                        </a>
                      </div>
                    </OwlCarousel>
                  </div>
                )} */}

                <div className="dashboard-status-card">
                  <div className="row w-100">
                    <>
                      <div className="page-header">
                        <div className="page-title">
                          <h4>Orders Overviews</h4>
      
                        </div>

                        <div className="page-btn">
                          <select
                            className="form-control ml-3"
                            value={this.state.range}
                            style={{ width: '150px' }}
                            onChange={(e) => {
                              this.setState({ range: e.target.value });
                              this.get_vendor_data(e.target.value);
                            }}
                          >
                            {/* <option value="today">Today</option> */}
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-3 col-12">
                        <Link to="/orderlist/all">
                          <div className="dash-widget">
                            <div className="dash-widgetimg">
                              <span>
                                <h3>
                                  {this.state.isloading ? (
                                    <Skeletonloader height={23} count={1} />
                                  ) : (
                                    <span className="counters">
                                      {
                                        item.total != undefined
                                          ? item.total
                                          : 0
                                      }
                                    </span>
                                  )}
                                </h3>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h6>Total Orders</h6>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="col-lg-3 col-sm-3 col-12">
                        <Link to={'/orderlist/in_process'}>
                          <div className="dash-widget dash1">
                            <div className="dash-widgetimg">
                              <span>
                                <h3>
                                  {this.state.isloading ? (
                                    <Skeletonloader height={23} count={1} />
                                  ) : (
                                    <span className="counters">
                                      {item.process}
                                    </span>
                                  )}
                                </h3>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h6>Cooking</h6>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="col-lg-3 col-sm-3 col-12">
                        <Link to={'/orderlist/processed'}>
                          <div className="dash-widget dash2">
                            <div className="dash-widgetimg">
                              <span>
                                <h3>
                                  {this.state.isloading ? (
                                    <Skeletonloader height={23} count={1} />
                                  ) : (
                                    <span className="counters">
                                      {item.processed}
                                    </span>
                                  )}
                                </h3>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h6>Cooked</h6>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="col-lg-3 col-sm-3 col-12">
                        <Link to={'/orderlist/completed'}>
                          <div className="dash-widget dash4">
                            <div className="dash-widgetimg">
                              <span>
                                <h3>
                                  {this.state.isloading ? (
                                    <Skeletonloader height={23} count={1} />
                                  ) : (
                                    <span className="counters">
                                      {item.completed}
                                    </span>
                                  )}
                                </h3>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h6>Completed</h6>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </>
                  </div>
                </div>
                <OngoingOrders isloading={this.loader} />
                <Tables isloading={this.loader} />

                   

                {/* <ProductReport /> */}
              </div>
            )}
          </div>
        </div>
        {this.context.user.shop_open === 0 && (
          <div className="header-offline-container">
            <div className="header-offline-badge">
              <span>Your store is offline.</span>
              <span
                className="go-online"
                onClick={() => {
                  this.update_shop_status();
                }}
              >
                Go online
              </span>
            </div>
          </div>
        )}
     <Insights />
        </>
      </>
    );
  }
}


class OngoingOrders extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      request:[],
      open_request:[],
      open:false,
      comment:'',
      requestModel:false,
    };
  }

  componentDidMount() {
    this.fetch_order(1);

    if (['admin', 'owner'].includes(this.context.role.staff_role)) {
    this.fetch_request();
    }
    this.timerID = setInterval(() => {
      this.fetch_order(1);
      if (['admin', 'owner'].includes(this.context.role.staff_role)) {
        this.fetch_request();
        }
    }, 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  static orderupdate()
  {
    const instance = new OngoingOrders();
        // Call the normal method
        instance.fetch_order(1);
  }

  fetch_request = () => {
    fetch(api + 'fetch_approval_request', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        request_status: 'pending',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ request: [] });
        } else {
          this.setState({ request: json.data});
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };


   fetch_order = (page_id) => {
    fetch(api + 'get_orders_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        status: 'placed',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ orders: [] });
        } else {
          this.setState({ orders: json.data.data });
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };


  action_request = (type) =>
  {
    if(this.state.type == 'reject')
    {
      if(this.state.comment == '')
      {
        toast.error("Please add comment")
        return
      }
    }
    
    this.setState({request_loading:true})
    fetch(api + 'action_approval_request', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        request_id: this.state.open_request.id,
        request_status: type,
        comment: this.state.comment
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          toast.success(json.msg);
          this.setState({requestModel:false,comment:''});
          this.fetch_request();
  
        }
        this.setState({request_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  }
  render() {
    return (
      <>
      {
      this.state.orders.length > 0 && (
        <div className="dashboard-status-card">
          <div className="row mb-4 w-100">
            <div className="col-md-12">
              {this.state.orders.length > 0 ? (
                <>
                  <div className="page-header">
                    <div className="page-title">
                      <h4>Pending Orders</h4>
                    </div>
                  </div>
                  <div className="table-responsive dataview">
                    <table className="table datatable ">
                      <thead>
                        <tr>
                          <th>Sno</th>
                          <th>Order ID</th>
                          <th>Order Type</th>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Time</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.orders.length > 0 &&
                          this.state.orders.map((values, index) => {
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td
                                  className="cursor-pointer"
                                  onClick={() => {
                                    this.setState({
                                      open: true,
                                      drawerOrderId: values.order_code,
                                    });
                                  }}
                                >
                                  {/* <Link
                                    to={'/orderdetails/' + values.order_code}
                                  > */}
                                  {values.bill_no}
                                  {/* </Link> */}
                                </td>
                                <td
                                  style={{
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {values.order_type == 'TakeAway' ||
                                  values.order_type == 'Delivery' ? (
                                    <span>{values.order_type}</span>
                                  ) : (
                                    <>Dine-In</>
                                  )}
                                </td>
                                <td>
                                  {values.user.name === 'null'
                                    ? 'N/A'
                                    : values.user.name}
                                </td>
                                <td>{values.user.contact}</td>
                                <td>
                                  {moment(values.updated_at).format('llll')}
                                </td>
                                <td>₹ {values.total_amount}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <OrderDetailsDrawer
                    drawerOrderId={this.state.drawerOrderId}
                    open={this.state.open}
                    onClose={() => this.setState({ open: false })}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      )
    }

{
      this.state.request.length > 0 && (
        <div className="dashboard-status-card">
          <div className="row mb-4 w-100">
            <div className="col-md-12">
              {this.state.request.length > 0 ? (
                <>
                  <div className="page-header">
                    <div className="page-title">
                      <h4>Pending Request</h4>
                    </div>
                  </div>
                  <div className="table-responsive dataview">
                    <table className="table datatable ">
                      <thead>
                        <tr>
                          <th>Sno</th>
                          <th>Request</th>
                          <th>Date</th>
                          <th>action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.request.length > 0 &&
                          this.state.request.map((rr, index) => {
                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{rr.action}

                                {
  rr.action === "Request for Discount" && (
    <p>{rr.related.discount_type} of Rs {rr.related.order_discount}</p>
  )
}


                                </td>
                                <td>
                                  {
                                    moment(rr.created_at).format('llll')
                                  }
                                </td>
                                <td>
                                  <Button
                                    onClick={() => {
                                      this.setState({
                                        requestModel: true,
                                        open_request: rr,
                                      });
                                    }}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  
                </>
              ) : null}
            </div>
          </div>

          <Modal
          focusTrapped={false}
          open={this.state.requestModel}
          onClose={() => this.setState({ requestModel: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h6>Approval Request- {this.state.open_request.id}</h6>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Request</label>
                  <p>
                    {this.state.open_request.action}
                  </p>
                </div>
              
              {
                this.state.open_request.related_type == 'expenses' &&
                <>
                <div className="row">
                <div className="col-lg-6">
                <div className="form-group"></div>
                <label>Expense Name</label>
                <p>
                {this.state.open_request.related.expense_name	}
                 
                </p>
                </div>

                <div className="col-lg-6">
                <div className="form-group"></div>
                <label>Amount</label>
                <p>
                {this.state.open_request.related.expense_amount	}
                </p>
                </div>

                <div className="col-lg-6">
                <div className="form-group"></div>
                <label>Transaction Type</label>
                <p>
                {this.state.open_request.related.expense_type	}
                </p>
                </div>

                <div className="col-lg-6">
                <div className="form-group"></div>
                <label>Discription </label>
                <p>
                {this.state.open_request.related.description}
                </p>
                </div>

                {
                  this.state.open_request.related.document != "" &&
                  <div className="col-lg-6">
                  <div className="form-group"></div>
                  <label>Document</label>
                  <p>
                  <Link to={this.state.open_request.related.document} target="_blank" >View Document</Link>
                  </p>
                  </div>
                }
</div>
                </>
              }
                {
                  this.state.open_request.action=="Order Cancellation"&&
                  <div className="col-lg-12">
                  <div className="form-group">
                  <label>Reason</label>
                  <p>
                    {this.state.open_request.related.cancellation_reason}
                  </p>
                  </div>
                  </div>
  
                  }

                {
                  this.state.open_request.related_type == 'orders' &&
                  <>
                   <div className="col-lg-6">
                  <div className="form-group"></div>
                  <label>Order</label>
                  <p>
                   <Link target="_blank" to={'/orderdetails/' +this.state.open_request.related.order_code} >{this.state.open_request.related.bill_no}
                   </Link>
                  </p>
                  </div>
                  {this.state.open_request.related.order_discount>0&&
                  <>
                  <div className="col-lg-6">
                  <div className="form-group"></div>
                  <label>Cart Amount</label>
                  <p>
                    {this.state.open_request.related.order_amount}
                  </p>
                  </div>
                  
                  <div className="col-lg-6">
                  <div className="form-group"></div>
                  <label>Discount</label>
                  <p>
                  {this.state.open_request.related.discount_type}  of Rs {this.state.open_request.related.order_discount} 
                  </p>
                  </div>
                  </>
  }

                  <div className="col-lg-6">
                  <div className="form-group"></div>
                  <label>Payble Amount</label>
                  <p>
                    {this.state.open_request.related.total_amount}
                  </p>
                  </div>

                


                

                
                   </>
                }

                
              </div>
              <div className="col-lg-12">
                  <div className="form-group"></div>
                  <label>Comment</label>
                  <textarea
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          comment: e.target.value,
                        });
                      }}
                      className="form-control"
                      value={this.state.comment}
                    />
                  </div>
              <div className="col-lg-6">
                <br/>
                <div className="form-group">
                  {
                    this.state.request_loading ?
                    <Loader />:
                 <Button
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Reject it!',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          this.action_request('reject');
                        }
                      });
                    }}
                    
                    
                    className='btn btn-danger btn-sm  me-2'
                  >
                    Reject
                  </Button>
                  }
                </div>
              </div>

              <div className="col-lg-6">
              <br/>
                <div className="form-group">
                {
                    this.state.request_loading ?
                    <Loader />:
                 <Button
                      onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, Approve it!',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              this.action_request('approved');
                            }
                          });
                        }}

                     className='btn btn-success btn-sm  me-2'
                  >
                    Approve
                  </Button>
                  }
                </div>
              </div>
              

      
            </div>
          </div>
        </Modal>

        </div>

        
      )
    }
    
      </>
      
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

    this.timerID = setInterval(() => {
      this.fetch_table_vendors();
    }, 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  static orderupdate()
  {
    const instance = new Tables();
        // Call the normal method
        instance.fetch_table_vendors();
 
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
          //toast.error(json.msg);
          this.setState({ data: [] });
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
      this.state.data.length > 0 && (
        <div className="dashboard-status-card">
          <div className="row w-100">
            {this.state.is_loading ? (
              <Skeletonloader count={1} height={100} />
            ) : (
              <>
                {this.state.data.length > 0 ? (
                  this.state.data.map((category, index) => (
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
                          <div key={index} className="col-lg-2 col-sm-6 col-12">
                            <Link
                              to={
                                item.ongoing_order == null 
                                  ? '/pos/' + item.table_uu_id
                                  : '/viewtableorder/' + item.table_uu_id
                              }
                                
                              className=" d-flex w-100"
                            >
                              <div
                                className={
                                  item.ongoing_order == null 
                                    ? 'dash-count1'
                                    : 'dash-count'
                                }
                              >
                                <h4>{item.table_name}</h4>
                                
                                <div className="d-flex align-items-center">

                                {
                                  item.ongoing_order != null &&
                                    <div className="d-flex align-items-center">
                                      ₹
                                       {item.ongoing_order.total_amount}
                                    </div>
                                }
                                &nbsp;&nbsp;
                                  <i className="iconly-User3 icli sidebar_icons me-1"></i>
                                  {item.capacity}

                                </div>
                              </div>
                            </Link>
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
        </div>
      )
    );
  }
}



class Insights extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total:0,
        discount:0,
        tax:0,
        unsettle:0,
        unsettle_order:0,
        order:{
          total:0,
          completed:0,
          cancelled:0,
          in_process:0,
        },
      isloading: true,
      item: {
        total_earnning: 0,
        orders: 0,
        shop_visit: 0,
        customer: 0,
        cashsale: 0,
        online: 0,
        weazypay: 0,
        discount: 0,
      },
      orders: [],
      isOpen: false,
      from: new Date(),
      to: new Date(),
      shop_status: 1,
      range: 'daily',
      overviewRange: 'today',
      is_veg: 'all',
      itemsPerPage: 50,
      downloaded_data: [],
      inventory: [],
      products: [],
      productsLoading: true,
      inventoryLoading: true,
      chartOptions1: {
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
          difference: 100,
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            type: 'areaspline',
            data: [],
            name: 'Revenue Graph',
            showInLegend: false,
            color: '#2f7ed8',
            lineWidth: 2,
            pointWidth: 20,
            shadow: true,
            shadowOffsetX: 10,
            anchor: {
              width: 10,
              height: 10,
              radius: 10,
            },
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions2: {
        title: {
          text: '',
          margin: 20,
        },

        xAxis: {
          categories: [],
          maxRange: 2,
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            type: 'areaspline',
            data: [],
            name: 'No Of Bills',
            showInLegend: false,
            color: '#619DD1',
            lineWidth: 2,
            pointWidth: 20,
            shadow: true,
            shadowOffsetX: 10,
            anchor: {
              width: 10,
              height: 10,
              radius: 10,
            },
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions3: {
        chart: {
          type: 'column',
        },
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            data: [],
            name: 'Avg. Basket',
            showInLegend: false,
            color: '#0066b2',
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions4: {
        chart: {
          type: 'column',
        },
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            data: [],
            name: 'Top Selling Products',
            showInLegend: false,
            color: '#92A8CD',
            fillOpacity: 0.1,
          },
        ],
        
      },
    };
  }

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_product('custom', this.state.from, this.state.to);
    this.fetch_inventory();
    this.fetch_order(1,this.state.from, this.state.to);
    this.get_vendor_data(this.state.range, this.state.from, this.state.to);
  }

  

  fetch_order = (page_id,from,to) => {
    fetch(api + 'fetch_order_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        
        start_date: from,
        end_date: to,
        range: 'custom',
        type: 'all',
        channel: 'all',
        discount_filter: 'all',
        page_length: 1,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              discount: 0,
              tax: 0,
              unsettle: 0,
              unsettle_order:0,
              order:{
                total:0,
                completed:0,
                cancelled:0,
                in_process:0,
              }
            });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page_id == 1) {
            this.setState({
              data: json.data.data,
              total: json.total,
              discount: json.total_discount,
              tax: json.tax,
              unsettle: json.unsattle,
              unsettle_order: json.unsattle_order,
              order: json.order,
            });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    data: [...this.state.data, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    data: json.data.data,
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
        this.setState({ is_loading: false });
      });
  };

  get_vendor_data = (range, from, to) => {
    fetch(api + 'get_vendor_data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: range,
        from: from,
        to: to,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ item: json.data });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  fetch_product = (e, from, to) => {
    this.setState({ productsLoading: true });
    fetch(api + 'fetch_product_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        start_date: from,
        end_date: to,
        range: e,
        is_veg: this.state.is_veg,
        page_length: 6,
        sort: 'desc',
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          // products: responseJson.data.data,
          isloading: false,
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ productsLoading: false });
      });
  };

  fetch_inventory = () => {
    this.setState({ inventoryLoading: true });
    fetch(api + 'fetch_inventory_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        page_length: 6,
        sort: 'desc',
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status) {
          this.setState({
            inventory: responseJson.data.data,
            isloading: false,
          });
        } else {
          this.setState({
            inventory: [],
            isloading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ inventoryLoading: false });
      });
  };

  render() {
    let { item, chartOptions1, chartOptions2, chartOptions3, chartOptions4 } =
      this.state;
    return (
      <>
       
        <div className="main-wrappers" style={{marginTop:'-100px'}}>
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              {this.state.isloading ? (
                <Loader />
              ) : (
                <>
                  <div className="dashboard-status-card flex-column">
                    <div className="row">
                      {this.context.role.staff_role !== 'staff' && (
                        <>
                          <div className="page-header">
                            <div className="page-title">
                              <h4>Overview</h4>
                            </div>
                            <div
                              className="page-btn d-flex align-items-center"
                              style={{
                                width: '50%',
                              }}
                            >
                              <DateRangePicker
                                onChange={(e) => {
                                  this.setDate(e);
                                  this.get_vendor_data('custom', e[0], e[1]);
                                  this.fetch_product('custom', e[0], e[1]);
                                  this.fetch_inventory();
                                  this.fetch_order(1,e[0], e[1]);
                                }}
                                cleanable={false}
                                className="w-100"
                                ranges={[
                                  {
                                    label: 'Today',
                                    value: [
                                      moment().toDate(),
                                      moment().toDate(),
                                    ],
                                  },
                                  {
                                    label: 'Yesterday',
                                    value: [
                                      moment().subtract(1, 'days').toDate(),
                                      moment().subtract(1, 'days').toDate(),
                                    ],
                                  },
                                  {
                                    label: 'This Week',
                                    value: [
                                      moment().startOf('week').toDate(),
                                      moment().endOf('week').toDate(),
                                    ],
                                  },
                                  {
                                    label: 'Last Week',
                                    value: [
                                      moment()
                                        .subtract(1, 'week')
                                        .startOf('week')
                                        .toDate(),
                                      moment()
                                        .subtract(1, 'week')
                                        .endOf('week')
                                        .toDate(),
                                    ],
                                  },
                                  {
                                    label: 'This Month',
                                    value: [
                                      moment().startOf('month').toDate(),
                                      moment().endOf('month').toDate(),
                                    ],
                                  },
                                  {
                                    label: 'Last Month',
                                    value: [
                                      moment()
                                        .subtract(1, 'month')
                                        .startOf('month')
                                        .toDate(),
                                      moment()
                                        .subtract(1, 'month')
                                        .endOf('month')
                                        .toDate(),
                                    ],
                                  },
                                  {
                                    label: 'Life-Time',
                                    value: [
                                      moment(
                                        this.context.user.created_at
                                      ).toDate(),
                                      moment().toDate(),
                                    ],
                                  },
                                ]}
                              />
                            </div>
                          </div>
                          
                          <div className="col-lg-3 col-sm-3 col-12">
                            <div className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                  ₹
                                  <span className="counters">
                                    {this.state.total.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Order Sales</h6>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <div className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                  ₹
                                  <span className="counters">
                                    {this.state.discount.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Discount</h6>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <div className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                  ₹
                                  <span className="counters">
                                    {this.state.tax.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Tax</h6>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to={'orderlist/unsettled'} className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                 {this.state.unsettle_order}/₹ 
                                  <span className="counters">
                                    {this.state.unsettle.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Unsettled</h6>
                              </div>
                            </Link>
                          </div>


                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/all/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash1">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.total_earnning.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/cash/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash2">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Cash Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.cashsale.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/upi/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash4">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>UPI Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.online.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/online/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash2">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Weazy Pay</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.weazypay.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to="/salesreport">
                              <div className="dash-widget">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Bag icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Orders</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {item.orders}
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to="/salesreport">
                              <div className="dash-widget dash1">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Discount icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Discount</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.discount.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to={'/customers'}>
                              <div className="dash-widget dash4">
                                <div className="dash-widgetimg">
                                  <span>
                                    <span className="ps-menu-icon css-5rih0l">
                                      <i className="iconly-User3 icli sidebar_icons"></i>
                                    </span>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Customers</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {item.customer}
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to={'/customerfeedback'}>
                              <div className="dash-widget dash">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Heart icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>User Feedback</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        <span className="counters">
                                          {item.feedback}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="row mt-3">
                      <div className="col-lg-6 col-md-12">
                        <div
                          className=" card"
                          style={{
                            borderRadius: '15px',
                            minHeight: '300px',
                            height: 'auto',
                            padding: '10px',
                          }}
                        >
                          {this.state.productsLoading ? (
                            <Loader />
                          ) : (
                            <div className="row p-2">
                              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                <div className="page-header">
                                  <div className="page-title">
                                    <h4>Trending Dishes</h4>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="col-lg-6 col-md-6 col-sm-6 col-12"
                                style={{ textAlign: 'right' }}
                              >
                                <Link to="/productreport">
                                  {this.context.role.staff_role != 'staff' && (
                                    <h6 style={{ fontSize: '16px' }}>
                                      View All{' '}
                                      <i className="fa fa-arrow-right "></i>
                                    </h6>
                                  )}
                                </Link>
                              </div>
                              <div className="col-12 mt-4">
                                {!this.state.isloading ? (
                                  this.state.products.length > 0 ? (
                                    <div className="row">
                                      {this.state.products.map(
                                        (item, index) => {
                                          return (
                                            <div
                                              className="col-lg-6 col-md-6 col-sm-6 col-12"
                                              key={index}
                                            >
                                              <div
                                                className="dash-widget p-0"
                                                style={{ boxShadow: 'none' }}
                                              >
                                                <div className="dash-widgetimg">
                                                  <span>
                                                    <h3>
                                                      <span className="counters">
                                                        <Link
                                                          className="product-img d-flex align-items-center justify-content-center"
                                                          to={
                                                            '/productdetails/' +
                                                            item.id
                                                          }
                                                        >
                                                          <img
                                                            src={
                                                              item.product_img
                                                            }
                                                            alt="P"
                                                            className="product-img"
                                                            style={{
                                                              width: '40px',
                                                              height: '40px',
                                                              borderRadius:
                                                                '50%',
                                                              display: 'flex',
                                                              alignItems:
                                                                'center',
                                                              justifyContent:
                                                                'center',
                                                            }}
                                                          />
                                                        </Link>
                                                      </span>
                                                    </h3>
                                                  </span>
                                                </div>
                                                <div className="dash-widgetcontent">
                                                  <h6>
                                                    {item.product_name}
                                                    {item.variants_name !=
                                                    null ? (
                                                      <span style={{}}>
                                                        - {item.variants_name}
                                                      </span>
                                                    ) : (
                                                      <></>
                                                    )}
                                                  </h6>
                                                  <p className="m-0">
                                                    Order :{' '}
                                                    <span
                                                      style={{
                                                        color: '#ea5455',
                                                      }}
                                                    >
                                                      {item.sales_count}
                                                    </span>{' '}
                                                  </p>
                                                  {item.sales_amount !==
                                                    undefined && (
                                                    <p className="m-0">
                                                      Sales :{' '}
                                                      <span
                                                        style={{
                                                          color: '#ea5455',
                                                        }}
                                                      >
                                                        ₹
                                                        {item.sales_amount.toFixed(
                                                          2
                                                        )}
                                                      </span>
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column">
                                      <img
                                        src={no_img}
                                        alt="img"
                                        style={{
                                          height: '180px',
                                        }}
                                      />
                                      <h6>
                                        {' '}
                                        Sorry, we couldn't find any records at
                                        this moment.{' '}
                                      </h6>
                                    </div>
                                  )
                                ) : (
                                  <Loader />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12">
                        <div
                          className=" card"
                          style={{
                            borderRadius: '15px',
                            minHeight: '300px',
                            height: '350px',
                            padding: '10px',
                          }}
                        >
                          {this.state.inventoryLoading ? (
                            <Loader />
                          ) : (
                            <div className="row p-2">
                              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                <div className="page-header">
                                  <div className="page-title">
                                    <h4>Inventory</h4>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="col-lg-6 col-md-6 col-sm-6 col-12"
                                style={{ textAlign: 'right' }}
                              >
                                <Link to={'/inventoryproducts'}>
                                  {this.context.role.staff_role != 'staff' && (
                                    <h6 style={{ fontSize: '16px' }}>
                                      View All{' '}
                                      <i className="fa fa-arrow-right "></i>
                                    </h6>
                                  )}
                                </Link>
                              </div>
                              <div className="col-12 mt-4">
                                {!this.state.isloading ? (
                                  this.state.inventory.length > 0 ? (
                                    <div className="row">
                                      {this.state.inventory.map(
                                        (item, index) => {
                                          return (
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                              <div
                                                className="dash-widget p-0"
                                                style={{ boxShadow: 'none' }}
                                              >
                                                <div className="dash-widgetimg">
                                                  <span>
                                                    <h3>
                                                      {this.state.isloading ? (
                                                        <Skeletonloader
                                                          height={23}
                                                          count={1}
                                                        />
                                                      ) : (
                                                        <>
                                                          <span className="counters">
                                                            <i className="iconly-Bag icli sidebar_icons"></i>
                                                          </span>
                                                        </>
                                                      )}
                                                    </h3>
                                                  </span>
                                                </div>
                                                <div className="dash-widgetcontent">
                                                  <h6>
                                                    {' '}
                                                    {
                                                      item.inventory_product_name
                                                    }{' '}
                                                  </h6>
                                                  <p>
                                                    {item.current_stock == 0 ? (
                                                      <span
                                                        style={{
                                                          color: '#ea5455',
                                                        }}
                                                      >
                                                        Out of Stock
                                                      </span>
                                                    ) : (
                                                      <span>
                                                        {' '}
                                                        Stock :{' '}
                                                        <span
                                                          style={{
                                                            color: '#ea5455',
                                                          }}
                                                        >
                                                          {parseInt(
                                                            item.current_stock
                                                          ).toFixed(2) +
                                                            ' ' +
                                                            item.purchase_unit}{' '}
                                                        </span>
                                                      </span>
                                                    )}
                                                    {/* {item.current_stock.toFixed(1)} */}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column">
                                      <img
                                        src={no_img}
                                        alt="img"
                                        style={{
                                          height: '180px',
                                        }}
                                      />
                                      <h6>
                                        {' '}
                                        Sorry, we couldn't find any records at
                                        this moment.{' '}
                                      </h6>
                                    </div>
                                  )
                                ) : (
                                  <Loader />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <ProductReport /> */}

                 
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Dashboard;

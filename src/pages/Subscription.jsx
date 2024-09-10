import { Component } from 'react';
import { Helmet } from 'react-helmet';
import Modal from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TabPanel, Tabs } from 'react-tabs';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import tick from '../assets/images/icons/tick.svg';

export class Subscription extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      gstChecked: false,
      is_loading: false,
      data: [],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_subscription();
  }

  fetch_subscription = () => {
    fetch(api + 'fetch_subscription', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

  logOut = () => {
    fetch(api + 'logout_vendor', {
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
        this.context.logout();
        this.props.navigate('/login', { replace: true });

        // this.props.navigate("/loginpassword", { replace: true });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  goback = () => {
    this.props.navigate('/dashboard', { replace: true });
  };

  buy_plan = (plan_id) => {
    this.setState({ buy_credit_loader: true });
    fetch(api + 'buy_subscription_initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        plan_id: plan_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({
            inVoiceModal: true,
            transaction_id: json.txn_id,
            transaction_amount: json.txn_amount,
            tax_amount: json.tax,
            order_amount: json.order_amount,
            vendor_name: json.customer.name,
            vendor_email: json.customer.email,
            vendor_contact: json.customer.contact,
            payment_id: json.payment_id,
            order_id: json.order_id,
          });
        } else {
          toast.error(json.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({ buy_credit_loader: false });
      });
  };

  openPaymentGateway = () => {
    this.setState({ payment_loading: true });
    var obj = this;
    var options = {
      key: this.state.payment_id,
      amount: this.state.transaction_amount,
      currency: 'INR',
      description: 'Weazy Billing',
      image: 'https://weazydine.com/assets/favicon_io/apple-touch-icon.png',
      order_id: this.state.order_id,
      redirect: false,
      handler: function (response) {
        obj.verify_payment(response.razorpay_payment_id);
      },
      prefill: {
        name: this.context.user.shop_name,
        contact: this.context.user.contact,
        email: this.context.user.email,
      },
      modal: {
        ondismiss: function () {
          obj.setState({ payment_loading: false, inVoiceModal: false });
          toast.error('Payment Cancelled, Please try again', {
            toastId: 'paymentdeclined',
          });
        },
      },
      theme: {
        color: '#619DD1',
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  verify_payment = (payment_id) => {
    fetch(api + 'verify_subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        txn_id: this.state.transaction_id,
        payment_id: payment_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Payment Successful', {
            toastId: 'paymentdeclined',
          });
          this.setState({
            inVoiceModal: false,
          });
          this.context.get_vendor_profile(this.context.token);
          // this.props.navigate('/');
          Swal.fire({
            title: 'Payment Successful',
            text: 'Your payment has been successfully completed!',
            confirmButtonText: 'Go To Dashboard',
          }).then((result) => {
            if (result.isConfirmed) {
              this.props.navigate('/', { replace: true });
            }
          });
        } else {
          toast.error(json.message, {
            toastId: 'paymentdeclined',
          });
          console.log(json);
        }
        this.setState({ payment_loading: false });
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        // this.setState({ payment_loading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Subscriptions</title>
        </Helmet>

        <Modal
          focusTrapped={false}
          open={this.state.inVoiceModal}
          center
          showCloseIcon={true}
          classNames={{ modal: 'customModal' }}
          onClose={() => this.setState({ inVoiceModal: false })}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h3 className="my-4">Order Details</h3>
            <div className="row my-2 w-100">
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                <h5>Order Id</h5>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-start">
                <h5>{this.state.transaction_id}</h5>
              </div>
            </div>
            <div className="row my-2 w-100">
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                <h5>Order Amount</h5>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-start">
                <h5>₹ {this.state.order_amount}</h5>
              </div>
            </div>
            <div className="row my-2 w-100">
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                <h5>
                  G.S.T (<span className="text-muted">18%</span>)
                </h5>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-start">
                <h5>₹ {this.state.tax_amount}</h5>
              </div>
            </div>
            <hr className="w-100" />
            <div className="row my-2 w-100">
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                <h5>Final Amount</h5>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-start">
                <h5>₹ {this.state.transaction_amount}</h5>
              </div>
            </div>
            <hr className="w-100" />
            <div className="d-flex align-items-center justify-content-center my-2 w-100">
              {this.state.payment_loading ? (
                <button
                  className="btn btn-secondary btn-sm w-75"
                  style={{
                    pointerEvents: 'none',
                    opacity: '0.8',
                  }}
                  disabled
                >
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Please Wait...
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm w-75"
                  onClick={() => {
                    this.openPaymentGateway();
                  }}
                >
                  Initiate Transaction
                </button>
              )}
            </div>
          </div>
        </Modal>

        <div className="main-wrapper">
          <div className="page-wrapper full-page m-0 background-gradient">
            {this.context.user.subscription_expire == 0 ? (
              <div className="row subscription-expired-bar">
                <h5 style={{ color: '#fff', textAlign: 'center' }}>
                  Your subscription has expired!
                </h5>
                <button
                  className="btn btn-sm btn-danger logout-button-subscription"
                  onClick={() => {
                    this.logOut();
                  }}
                  style={{ marginRight: '10px' }}
                >
                  Logout Account
                </button>
              </div>
            ) : (
              <div
                className=" subscription-expired-bar"
                style={{
                  backgroundColor: 'transparent',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <svg
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    this.props.navigate(-1, { replace: true });
                  }}
                  width="28"
                  height="28"
                  viewBox="0 0 36 36"
                  data-testid="close-icon"
                >
                  <path d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38l2.12 2.12L18 20.12l8.38 8.38 2.12-2.12L20.12 18z"></path>
                </svg>
              </div>
            )}

            <div className="container subscription-container">
              <Tabs>
                <TabPanel>
                  <h3
                    style={{
                      textAlign: 'center',
                      marginTop: 20,
                      marginBottom: 10,
                    }}
                  >
                    Select a plan for your business starting as low as ₹19/day.
                  </h3>
                  <br />
                  <div className="row">
                    {this.state.data.map((item, index) => (
                      <div className="col-md-4">
                        <div className="plan-card">
                          <div>
                            <h3>{item.plan_name}</h3>
                            <p>{item.discription}</p>
                            <h4 style={{ marginTop: -20 }}>
                              ₹{item.plan_price}{' '}
                              <span>/ {item.validity} months </span>
                            </h4>
                            {/* <h6>No More Sur</h6> */}
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>QR Code Scan & Ordering</p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>Waiter / Captain Ordering App</p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>
                                POS Software
                                <br />
                                (Windows / Mac / Android)
                              </p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>Inventory management</p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>Kitchen Display System</p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>
                                Marketing and Promotions (Whatsapp, SMS, Email,
                                etc.)
                              </p>
                            </div>
                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>Staff Management</p>
                            </div>

                            <div className="features">
                              <img src={tick} alt="tick" />
                              <p>Overall Reports</p>
                            </div>
                          </div>
                          {item.savings != '' ? (
                            <div className="currPlanText">
                              <p>{item.savings}</p>
                            </div>
                          ) : null}
                          {this.state.buy_credit_loader ? (
                            // create a loader button
                            <button
                              className="btn btn-secondary w-100"
                              type="button"
                              disabled
                            >
                              Please Wait...
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                this.buy_plan(item.id);
                              }}
                              className="btn btn-secondary w-100"
                            >
                              Buy Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className="billing-info">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="name">Company Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder="Enter name"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="address">Registered Address</label>
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            placeholder="Enter Address"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="country">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            placeholder="Enter Country"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="state">State</label>
                          <input
                            type="text"
                            className="form-control"
                            id="state"
                            placeholder="Enter State"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="city">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            placeholder="Enter City"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="pincode">Pincode</label>
                          <input
                            type="text"
                            className="form-control"
                            id="pincode"
                            placeholder="Enter Pincode"
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="form-group gtscheckbox">
                          <input
                            type="checkbox"
                            name=""
                            id="gtscheckbox"
                            onChange={() => {
                              this.setState({
                                gstChecked: !this.state.gstChecked,
                              });
                            }}
                          />
                          <label htmlFor="gtscheckbox">
                            I am registered with GSTIN
                          </label>
                        </div>
                      </div>
                      {this.state.gstChecked ? (
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="gstin">GSTIN</label>
                            <input
                              type="text"
                              className="form-control"
                              id="gstin"
                              placeholder="Enter GSTIN"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="col-md-12 d-flex align-items-center justify-content-end">
                      <button className="btn btn-secondary btn-sm">Save</button>
                    </div>
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </div>
        </div>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Subscription
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;

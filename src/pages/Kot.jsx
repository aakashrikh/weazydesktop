import moment from 'moment';
import Multiselect from 'multiselect-react-dropdown';
import React, { Component } from 'react';
import Countdown from 'react-countdown';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Loader from '../othercomponent/Loader';

export class Kot extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      order_length: -1,
      is_loading: true,
      load_data: false,
      page: 1,
      status: 'all',
      kitchens: [],
      selectedValue: [0],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(
      this.state.page,
      this.state.status,
      this.state.selectedValue
    );
    this.fetchKitchens();

    this.timerID = setInterval(() => {
      this.fetch_order(
        this.state.page,
        this.state.status,
        this.state.selectedValue
      );
    }, 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  clearkot = () => {
    var conf = window.confirm("Are you sure you want to clear all KOT's ?");
    if (conf) {
      fetch(api + 'clear_kot', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          status: this.state.status,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            toast.error(json.msg);
          } else {
            toast.success(json.msg);
            this.fetch_order(1, this.state.status);
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {});
    }
  };

  fetch_order = (page_id, status, selectedValue) => {
    fetch(api + 'fetch_kot_orders', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        status: status,
        page: page_id,
        kitchen_id: selectedValue,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ is_loading: false, data: [], order_length: 0 });
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page_id == 1) {
            this.setState({ data: json.data.data });
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
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  fetchKitchens = () => {
    fetch(api + 'fetch_kitchens', {
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
            const_kitchens: json.data,
            kitchens: [{ id: 0, kitchen_name: 'All' }, ...json.data],
          });
        } else {
          this.setState({ kitchens: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  onSelect = (selectedList) => {
    var arr = [];
    selectedList.map((item) => {
      arr.push(item.id);
    });
    this.setState({ selectedValue: arr });
    this.fetch_order(1, this.state.status, arr);
  };

  onRemove = (selectedList) => {
    this.state.selectedValue.map((item, index) => {
      if (item.id == selectedList.id) {
        this.state.selectedValue.splice(index, 1);
      }
    });
    this.fetch_order(1, this.state.status, this.state.selectedValue);
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Kitchen Display System</title>
        </Helmet>
        <div className="main-wrapper">
          {/* <Header sidebar={false} /> */}
          <div
            className="page-wrapper"
            style={{
              margin: '0',
              padding: '0',
            }}
          >
            <div className="container-fluid">
              <div className="row d-flex justify-content-between align-items-center my-2">
                <div className="col-md-2">
                  <div className="page-header m-0">
                    <div className="page-title">
                      <h4>Weazy KDS </h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                    <li className="nav-item">
                      <a
                        className="nav-link active text-center"
                        href="#solid-rounded-justified-tab1"
                        data-bs-toggle="tab"
                        onClick={() => {
                          this.setState({ is_loading: true, status: 'all' });
                          this.fetch_order(1, 'all');
                        }}
                      >
                        All
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link text-center"
                        href="#solid-rounded-justified-tab1"
                        data-bs-toggle="tab"
                        onClick={() => {
                          this.setState({
                            is_loading: true,
                            status: 'pending',
                          });
                          this.fetch_order(1, 'pending');
                        }}
                      >
                        Pending
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link text-center"
                        href="#solid-rounded-justified-tab1"
                        data-bs-toggle="tab"
                        onClick={() => {
                          this.setState({
                            is_loading: true,
                            status: 'in_process',
                          });
                          this.fetch_order(1, 'in_process');
                        }}
                      >
                        In-Process
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-4">
                  {this.state.kitchens.length > 0 ? (
                    <Multiselect
                      options={this.state.kitchens}
                      // selectedValues={this.state.selectedValue}
                      onSelect={this.onSelect}
                      onRemove={this.onRemove}
                      displayValue="kitchen_name"
                      placeholder="Select Kitchen"
                      closeIcon="cancel"
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <div className="col-md-3 d-flex justify-content-end align-items-start">
                  <button
                    onClick={() => this.clearkot()}
                    className="btn btn-danger btn-sm"
                  >
                    Clear KOT's
                  </button>
                  &nbsp;&nbsp;
                  <Link to="/">
                    <button className="btn btn-secondary btn-sm">
                      <i className="fa-solid fa-arrow-left me-2"></i>Back to
                      Home
                    </button>
                  </Link>
                </div>
              </div>
              <div className="comp-sec-wrapper">
                <section className="comp-section">
                  <div className="row pb-4"></div>
                </section>
              </div>
              {!this.state.is_loading ? (
                <>
                  {this.state.data.length > 0 ? (
                    <div className="row">
                      <Order
                        dat={this.state.data}
                        fetch_order={this.fetch_order}
                        status={this.state.status}
                      />
                    </div>
                  ) : (
                    <div
                      className="content"
                      style={{
                        height: '60vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        margin: '40px 0',
                      }}
                    >
                      <img src={no_order} alt="img" />
                      <h4>
                        {' '}
                        Sorry, we couldn't find any records at this moment.{' '}
                      </h4>
                    </div>
                  )}
                </>
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

class Order extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      is_buttonloding: false,
      data: props.dat,
      open: false,
      openupdate: false,
      time: 5,
      id: '',
      single_product_id: '',
      opensingle: false,
      kot_id: '',
      opensingleupdate: false,
      is_delay: false,
    };
  }

  change_order_status = (kot_id, id, status) => {
    this.setState({ is_buttonloding: true });
    fetch(api + 'update_kot_status', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        kot_id: kot_id,
        order_id: id,
        status: status,
        prepare_time: this.state.time,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ open: false, openupdate: false });
          toast.success('Order Status Updated Successfully');
          this.props.fetch_order(1, this.props.status);
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_buttonloding: false });
      });
  };

  changesingleproductStatus = (id, status) => {
    toast.success('Order Status Updated Successfully');
    this.setState({ is_buttonloding: true });
    fetch(api + 'update_item_for_cooking', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        item_id: id,
        item_status: status,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          this.setState({ opensingle: false, opensingleupdate: false });
          this.props.fetch_order(1, this.props.status);
        } else {
          toast.error(json.message);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.setState({ is_buttonloding: false });
      });
  };

  handleClick = (event, values, index) => {
    switch (event.detail) {
      case 1: {
        break;
      }
      case 2: {
        values.order_product_status == 'in_process' ? (
          this.changesingleproductStatus(values.id, 'processed')
        ) : !this.context.user.kot_time_status ? (
          this.setState({
            opensingle: true,
            single_product_id: values.id,
          })
        ) : (
          <></>
        );

        break;
      }
      case 3: {
        break;
      }
      default: {
        break;
      }
    }
  };

  render() {
    return (
      <>
        {this.props.dat.map((values, kotindex) => {
          return (
            <div className="col-md-3">
              <div className="card flex-fill bg-white">
                <div
                  className="card-header order_details cursor_pointer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderBottom: '1px solid #0066b2',
                    padding: '10px 15px',
                    backgroundColor:
                      values.kot_status == 'in_process'
                        ? '#0066b2'
                        : values.kot_status == 'pending'
                        ? '#fff'
                        : '#009000',
                    color:
                      values.kot_status == 'in_process'
                        ? '#fff'
                        : values.kot_status == 'pending'
                        ? '#000'
                        : '#fff',
                  }}
                  onClick={() =>
                    values.kot_status == 'in_process'
                      ? this.setState({
                          openupdate: true,
                          id: values.order.order_code,
                          kot_id: values.kot,
                        })
                      : this.setState({
                          open: true,
                          id: values.order.order_code,
                          kot_id: values.kot,
                        })
                  }
                >
                  <div className="row">
                    {values.order.order_status === 'in_process' && (
                      <h6 className=" d-flex align-items-end justify-content-end">
                        {(this.context.user.kot_time_status || this.context.user.estimated_preparation_time>0) ? (
                          <Countdown
                            date={ values.order.estimate_prepare_time}
                            zeroPadDays={0}
                            zeroPadHours={0}
                            zeroPadMinutes={2}
                            zeroPadSeconds={2}
                            overtime={true}
                            renderer={(props) => {
                  
                              if (props.completed) {
                                if(!this.state.is_delay)
                                  {
                                    this.setState({ is_delay: true })
                                  }
                               
                                return <span className="text-danger" >Delay</span>
                                ;
                              }
                              else
                              {
                                return <span>{props.minutes} : {props.seconds}</span>;
                              }
                            }}

                            //  onComplete={() => {alert("call")}}
                         />
                        ) : (
                          <></>
                        )}
                      </h6>
                    )}
                  </div>
                  <div>
                    <h6
                      style={{
                        fontSize: '15px',
                      }}
                    >
                      <div className="d-flex aligmn-items-center justify-content-between">
                        <h6
                          className="d-flex flex-column"
                          style={{
                            fontSize: '14px',
                            width: 'max-content',
                          }}
                        >
                          KOT: {values.kot} &nbsp; &nbsp;&nbsp;
                          {values.order.order_type !== 'TakeAway' &&
                          values.order.order_type !== 'Delivery' ? (
                            <span>
                              Dine-In
                              {values.order.table != null && (
                                <span>({values.order.table.table_name})</span>
                              )}
                            </span>
                          ) : (
                            <span>{values.order.order_type}</span>
                          )}
                        </h6>
                        <h6
                          style={{
                            fontSize: '14px',
                            width: 'max-content',
                          }}
                        >
                          {moment(values.created_at).fromNow()}{' '}
                          <span
                            style={{
                              textTransform: 'capitalize',
                              fontSize: '14px',
                            }}
                          ></span>
                        </h6>
                      </div>
                    </h6>

                    {values.order.instruction !== null && (
                      <h6
                        className="mt-2"
                        style={{
                          fontSize: '14px',
                        }}
                      >
                        Instructions: {values.order.instruction}
                      </h6>
                    )}
                  </div>
                </div>
                <div className="card-body p-0">
                  <section
                    className="item-section"
                    style={{
                      padding: '20px 0 0!important',
                    }}
                  >
                    <div className="item_row">
                      <div
                        className="sno_column_heading"
                        style={{
                          width: '15%',
                        }}
                      >
                        No.
                      </div>
                      <div
                        className="item_name_column_heading"
                        style={{
                          width: '70%',
                        }}
                      >
                        Item
                      </div>
                      <div
                        className="qty_column_heading"
                        style={{
                          width: '15%',
                          borderRight: 'none',
                        }}
                      >
                        Qty.
                      </div>
                    </div>
                    {values.product.map((values, index) => {
                      return (
                        <div
                          className="single_item_row cursor_pointer"
                          onClick={(e) => {
                            this.handleClick(e, values, index);
                          }}
                          //   values.order_product_status == 'in_process' ? (
                          //     this.setState({
                          //       opensingleupdate: true,
                          //       single_product_id: values.id,
                          //     })
                          //   ) : !this.context.user.kot_time_status ? (
                          //     this.setState({
                          //       opensingle: true,
                          //       single_product_id: values.id,
                          //     })
                          //   ) : (
                          //     <></>
                          //   )
                          // }

                          // ondblclick={alert
                          // }
                          style={{
                            backgroundColor:
                              values.order_product_status == 'in_process'
                                ? '#0066b2'
                                : values.order_product_status == 'pending'
                                ? '#fff'
                                : '#009000',
                            color:
                              values.order_product_status == 'in_process'
                                ? '#fff'
                                : values.order_product_status == 'pending'
                                ? '#000'
                                : '#fff',
                          }}
                        >
                          <div
                            className="sno_column"
                            style={{
                              width: '15%',
                            }}
                          >
                            {index + 1}
                          </div>
                          <div
                            className="item_name_column"
                            style={{
                              width: '70%',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: '600px',
                                marginRight: '10px',
                                fontSize: '16px',
                              }}
                            >
                              {values.product.product_name}
                            </span>

                            {values.variant != null && (
                              <span>
                                <strong>Variant</strong> -{' '}
                                {values.variant.variants_name}
                              </span>
                            )}

                            <div className="media-body-cart">
                              {values.addons.length > 0 && (
                                <>
                                  <strong>AddOns: </strong>
                                  {values.addons.map((items) => {
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
                          <div
                            className="qty_column"
                            style={{
                              width: '15%',
                              borderRight: 'none',
                            }}
                          >
                            x {values.product_quantity}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                </div>
              </div>
            </div>
          );
        })}
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
                  {this.context.user.kot_time_status ? (
                    <>
                      <label>Time to prepare the order.</label>
                      <div className="d-flex align-items-center">
                        {this.state.time <= 0 ? (
                          <a className="btn btn-secondary mx-2 disabled">
                            <i className="fa-solid fa-minus"></i>
                          </a>
                        ) : (
                          <a
                            className="btn btn-secondary mx-2"
                            onClick={() => {
                              this.setState({ time: this.state.time - 1 });
                            }}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </a>
                        )}
                        <input
                          type="text"
                          className="text-center mx-2"
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
                          className="btn btn-secondary mx-2"
                          onClick={() => {
                            this.setState({
                              time: this.state.time + 1,
                            });
                          }}
                        >
                          <i className="fa-solid fa-add"></i>
                        </a>
                      </div>
                    </>
                  ) : (
                    <h5>Start preparing the order</h5>
                  )}
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
                      this.change_order_status(
                        this.state.kot_id,
                        this.state.id,
                        'in_process'
                      );
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Start Preparing
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          focusTrapped={false}
          open={this.state.openupdate}
          onClose={() => this.setState({ openupdate: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Update Order Status</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Are you sure you want to change the status of this order.
                  </label>
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-between">
                <a
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => {
                    this.setState({ openupdate: false });
                  }}
                >
                  Close
                </a>
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
                      this.change_order_status(
                        this.state.kot_id,
                        this.state.id,
                        'processed'
                      );
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Mark as prepared
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

        {/* for singlw item */}

        <Modal
          focusTrapped={false}
          open={this.state.opensingle}
          onClose={() => this.setState({ opensingle: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Edit Single Product Status</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  {this.context.user.kot_time_status ? (
                    <>
                      <label>Time to prepare the order.</label>
                      <div className="d-flex align-items-center">
                        {this.state.time <= 0 ? (
                          <a className="btn btn-secondary mx-2 disabled">
                            <i className="fa-solid fa-minus"></i>
                          </a>
                        ) : (
                          <a
                            className="btn btn-secondary mx-2"
                            onClick={() => {
                              this.setState({ time: this.state.time - 1 });
                            }}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </a>
                        )}
                        <input
                          type="text"
                          className="text-center mx-2"
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
                          className="btn btn-secondary mx-2"
                          onClick={() => {
                            this.setState({
                              time: this.state.time + 1,
                            });
                          }}
                        >
                          <i className="fa-solid fa-add"></i>
                        </a>
                      </div>
                    </>
                  ) : (
                    <h5>Start preparing the order</h5>
                  )}
                </div>
              </div>
              {this.context.user.kot_time_status ? (
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
                        this.change_order_status(
                          this.state.kot_id,
                          this.state.id,
                          'in_process'
                        );
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Start Preparing
                    </a>
                  )}
                </div>
              ) : (
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
                        this.changesingleproductStatus(
                          this.state.single_product_id,
                          'in_process'
                        );
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Start Preparing
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
        <Modal
          focusTrapped={false}
          open={this.state.opensingleupdate}
          onClose={() => this.setState({ opensingleupdate: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Update Single Product Status</h4>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>
                        Are you sure you want to change the status of this
                        order.
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-12 d-flex justify-content-between">
                    <a
                      onClick={() => {
                        this.setState({ opensingleupdate: false });
                      }}
                      className="btn btn-danger btn-sm me-2"
                    >
                      Close
                    </a>
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
                          this.changesingleproductStatus(
                            this.state.single_product_id,
                            'processed'
                          );
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Mark as prepared
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Kot;

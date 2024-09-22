import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no_orders.webp';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import OrdersTable from '../othercomponent/OrdersTable';
import { CheckPicker } from 'rsuite';
class Orderlist extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      is_loading: true,
      load_data: false,
      page: 1,
      next_page: '',
      status: '',
      search: '',
      type: 'all',
      channel: 'all',
      store:[],
      bill:''
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    if (this.props.type != undefined) {
      if (this.props.type == 'all') {
        this.fetch_order(1, '');
        this.setState({ status: '' });
      } else {
        this.fetch_order(1, this.props.type);
        this.setState({ status: this.props.type });
      }
    } else {
      this.fetch_order(1, '');
    }
  }

  fetch_order = (page_id, status) => {
   
    fetch(api + 'get_orders_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        status: status,
        channel: this.state.channel,
        store:this.state.store,
        type: this.state.type,
        bill:this.state.bill
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({ data: [], is_loading: false });
          }
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

  search_order = (e, page_id) => {
    if (!e.target.value.length < 1) {
      this.setState({ data: [], is_loading: true, page_id: 1 });
      fetch(api + 'search_order', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          order_code: e.target.value,
          page: page_id,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            if (page_id == 1) {
              this.setState({ data: [], is_loading: false });
            }
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
    } else {
      this.setState({ is_loading: true, page_id: 1 });
      this.fetch_order(1, '');
    }
  };
  

  onSelect = (selectedList) => {
    {
      this.props.store_d !== undefined
        ? this.setState({ store: [] })
        : null;
    }
    const store = [];
    selectedList.map((item, index) => {
      store.push(item);
    });
    this.setState({ store: store });
  };

  onRemove = (selectedList) => {
    // remove from selectedList.
    const store = [];
    selectedList.map((item, index) => {
      store.push(item);
    });
    this.setState({ store: store });
  };

  
  render() {
    const data = this.context.role.stores.map((item, index) => (
      
      {
      label: item.shop_name == null ? 'N/A' : item.shop_name + '-' + item.area,
      value: item.vendor_uu_id,
    }));

    return (
      <>
        <Helmet>
          <title>Order List</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Orders</h4>
                </div>
                <div className="page-btn w-25">
                  <div className="form-group m-0">
                    {/* <input
                      type="text"
                      className="form-control"
                      placeholder="Search using order id"
                      onChange={(e) => {
                        this.search_order(e);
                      }}
                    /> */}
                  </div>
                </div>
              </div>

              
              <div className="comp-sec-wrapper">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-12">

                    <div className="col-md-12 d-flex align-items-center justify-content-between w-100">
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                      
                      <li className="nav-item">
                          <label>Bill No if Any</label>
                              <input
                          type="text"
                          className="form-control"
                          placeholder="Search using order id"
                          onChange={(e) => {
                           this.setState({
                             bill: e.target.value,
                           })
                          }}
                        />
                    
                        </li>

                        <li className="nav-item" style={{ marginLeft: '10px' }}>
                       <label>Select type</label>
                      <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                type: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={'TakeAway'}>TakeAway</option>
                            <option value={'Delivery'}>Delivery</option>
                            <option value={'DineIn'}>Dine-In</option>
                          </select>
                        </li>

                        


                        <li className="nav-item">
                          <label>Channel</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                channel: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={'pos'}>POS</option>
                            <option value={'website'}>QR Scan</option>
                            <option value={'online'}>Online</option>
                          </select>
                        </li>


                        <li className="nav-item">
                          <label>Order Status</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                status: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={''}>All</option>
                            <option value={'confirmed'}>Confirmed</option>
                            <option value={'in_process'}>Preparing</option>
                            <option value={'processed'}>Ready</option>
                            <option value={'picked_up'}>Picked Up</option>
                            <option value={'completed'}>Delivered</option>
                            <option value={'cancelled'}>Cancelled</option>
                            <option value={'unsettled'}>Unsettled</option>
                            <option value={'future'}>Future</option>
                          </select>
                        </li>
                   
                        <li>
                        {
                this.context.role.stores.length>1 && 
            <li className="nav-item">
                      
                         <label>Outlets</label>
                         <br/>
                          <CheckPicker
                            data={data}
                            style={{ width: '250px' }}
                            className="form-control border-none py-0 ps-0"
                            onChange={(e) => {
                              this.onSelect(e);
                            }}
                            onClean={() => {
                              this.onRemove('');
                            }}
                            defaultValue={this.state.category}
                            
                          />
                        </li>

          }
                        </li>
                        <li
                          className="nav-item"
                          style={{
                            paddingTop: '20px',
                          }}
                        >
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_order(1, this.state.status);
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                      
                    </div>

<br/>
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">

                        
                        <li className="nav-item">

                      


                          <a
                            className={
                              'nav-link' +
                              (this.state.status == '' ? ' active' : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: '',
                                page: 1,
                              });
                              this.fetch_order(1, '');
                            }}
                          >
                            All
                          </a>
                        </li>
                        {/* <li className="nav-item">
                          <a
                            className="nav-link"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'placed',
                                page: 1,
                              });
                              this.fetch_order(1, 'placed');
                            }}
                          >
                            Pending
                          </a>
                        </li> */}
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'confirmed'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'confirmed',
                                page: 1,
                              });
                              this.fetch_order(1, 'confirmed');
                            }}
                          >
                            Confirmed
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'in_process'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'in_process',
                                page: 1,
                              });
                              this.fetch_order(1, 'in_process');
                            }}
                          >
                            Preparing
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'processed'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'processed',
                                page: 1,
                              });
                              this.fetch_order(1, 'processed');
                            }}
                          >
                            Ready
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'picked_up'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'picked_up',
                                page: 1,
                              });
                              this.fetch_order(1, 'picked_up');
                            }}
                          >
                            Picked up
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'completed'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'completed',
                                page: 1,
                              });
                              this.fetch_order(1, 'completed');
                            }}
                          >
                            Delivered
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'cancelled'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'cancelled',
                                page: 1,
                              });
                              this.fetch_order(1, 'cancelled');
                            }}
                          >
                            Cancelled
                          </a>
                        </li>


                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'unsettle'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'unsettled',
                                page: 1,
                              });
                              this.fetch_order(1, 'unsettled');
                            }}
                          >
                            Unsettled
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            className={
                              'nav-link' +
                              (this.state.status == 'future'
                                ? ' active'
                                : '')
                            }
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loading: true,
                                status: 'future',
                                page: 1,
                              });
                              this.fetch_order(1, 'future');
                            }}
                          >
                            Future
                          </a>
                        </li>

                      </ul>
                    </div>
                  </div>
                </section>
              </div>
              {!this.state.is_loading ? (
                <>
                  {this.state.data.length > 0 ? (
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <OrdersTable
                            fetch_order={this.fetch_order}
                            next_page={this.state.next_page}
                            page={this.state.page}
                            status={this.state.status}
                            data={this.state.data}
                          />
                        </div>
                      </div>
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
                      {/* <video loading="lazy" muted="muted" src={no_order}  type="video/mp4" autoplay="autoplay" loop="loop"></video> */}
                      <img src={no_order} alt="img" />
                      <h4>Sorry, we couldn't find any order for you. </h4>
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

function Navigate(props) {
  const abcd = useNavigate();
  return <Orderlist {...props} {...useParams()} navigate={abcd} />;
}

export default Navigate;

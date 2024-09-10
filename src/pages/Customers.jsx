import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DatePicker, SelectPicker, Badge } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_customer from '../assets/images/no-customer.webp';
import Header from '../othercomponent/Header';
import ImportCustomers from '../othercomponent/ImportCustomers';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';
import Topnav from '../othercomponent/Topnav';
import PerUserOrder from './PerUserOrder';
import { toast } from 'sonner';
import Modal from 'react-responsive-modal';
class Customers extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      is_loading: true,
      load_data: false,
      page: 1,
      value: [new Date(), new Date()],
      start_date: new Date(),
      end_date: new Date(),
      search: '',
      next_page: '',
      loadMore: false,
      openModal: false,
      exportCustomers: false,
      total_customers: '',
      dataFromListOfUsersState: [],
      open: false,
      drawerOrderId: '',
      openPerUserOrder: false,
      user_id: '',
      openAddModal: false,
      addCustomerName: '',
      addCustomerEmail: '',
      addCustomerContact: '',
      addCustomerBirthday: new Date(),
      addCustomerAnniversary: new Date(),
      openEditModal: false,
      editCustomerName: '',
      editCustomerEmail: '',
      editCustomerContact: '',
      editCustomerBirthday: new Date(),
      editCustomerAnniversary: new Date(),
      is_button_loading_add: false,
      editoffer_segment: 0,
      offers_data: [],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, '');
    this.fetch_offers();
    this.generateCSVData();
  }

  fetch_offers = () => {
    fetch(api + 'fetch_offers', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        offer_segment: 'segment',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
          this.setState({ offers_data: [] });
        } else {
          this.setState({ offers_data: json.data });
        }
        this.setState({ is_loding: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  closeModal = () => {
    this.setState({ openModal: false });
  };

  search_customer = (page, search) => {
    fetch(api + 'search_customer', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        search: search,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ data: [], is_loading: false });
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page == 1) {
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

  fetch_order = (page) => {
    fetch(api + 'fetch_customer_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
        status: 'all',
        page_length: 50,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page == 1) {
            this.setState({ data: [], is_loading: false });
          }
        } else {
          this.setState({
            total_customers: json.total,
          });
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page == 1) {
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

  exportCustomers = () => {
    this.setState({ exportCustomers: true });
    fetch(api + 'fetch_customer_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        status: 'all',
        page_length: 1000000,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ dataFromListOfUsersState: [] });
        } else {
          this.setState(
            {
              dataFromListOfUsersState: json.data.data,
            },
            // Call the CSV data generation function after setting the state with the fetched data
            () => this.generateCSVData()
          );
        }
        this.setState({ exportCustomers: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  generateCSVData = () => {
    // Generate the CSV data based on the fetched user data
    const csvData = [
      [
        'Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'Zip',
        'Country',
        'Created At',
        'Updated At',
      ],
      ...this.state.dataFromListOfUsersState.map((item) => [
        item.name,
        item.email,
        item.phone,
        item.address,
        item.city,
        item.state,
        item.zip,
        item.country,
        moment(item.created_at).format('DD-MM-YYYY'),
        moment(item.updated_at).format('DD-MM-YYYY'),
      ]),
    ];

    // Update the state with the generated CSV data
    this.setState({
      dataFromListOfUsersState: csvData,
    });
  };

  register_customer = () => {
    if (
      this.state.addCustomerName == '' ||
      this.state.addCustomerContact == ''
    ) {
      toast.error('Customer Name and Contact is required.');
      return;
    }

    const contactRegex = /^[0-9]+$/;

    const nameRegex = /^[a-zA-Z]+$/;

    if (!contactRegex.test(this.state.addCustomerContact)) {
      toast.error('Contact should be a number.');
      return;
    }

    if (!nameRegex.test(this.state.addCustomerName)) {
      toast.error('Name should be a string.');
      return;
    }

    if (this.state.addCustomerContact.length < 10) {
      toast.error('Contact should be of 10 digit.');
      return;
    }

    this.setState({ is_button_loading_add: true });
    fetch(api + 'register_customer', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        customer_name: this.state.addCustomerName,
        email: this.state.addCustomerEmail,
        contact: this.state.addCustomerContact,
        dob: moment(this.state.addCustomerBirthday).format('YYYY-MM-DD'),
        anniversary: moment(this.state.addCustomerAnniversary).format(
          'YYYY-MM-DD'
        ),
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ is_button_loading_add: false });
        } else {
          this.setState({ is_button_loading_add: false });
          this.setState({ openAddModal: false });
          this.fetch_order(1, '');
          toast.success('Customer added successfully.');
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

  update_customer_name = () => {
    if (
      this.state.editCustomerName == '' ||
      this.state.editCustomerContact == ''
    ) {
      toast.error('Customer Name and Contact is required.');
      return;
    }

    const contactRegex = /^[0-9]+$/;

    const nameRegex = /^[a-zA-Zà-ÿÀ-Ÿ\s'-]+$/;

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
        offer_segment: this.state.editoffer_segment,
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

  render() {
    const { exportCustomers, dataFromListOfUsersState } = this.state;

    const new_offers_data = [
      {
        offer_code: 'Normal Customer',
        id: '0',
      },
      ...this.state.offers_data,
    ];

    const data = new_offers_data.map((item) => ({
      label: item.offer_code,
      value: item.id,
    }));

    return (
      <>
        <Helmet>
          <title>Customer List - Weazy </title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Customer List</h4>
                </div>
              </div>
              {/* <Topnav array="customers" /> */}
              <div className="row mb-4 d-flex align-items-center">
                <div className="col-md-6">
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
                          if (e.target.value.length > 0) {
                            this.search_customer(1, e.target.value);
                          } else {
                            this.fetch_order(1, '');
                          }
                        }}
                        if
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-secondary btn-sm w-100"
                    style={{
                      paddingTop: '7px',
                      paddingBottom: '7px',
                    }}
                    onClick={() => {
                      this.setState({ openModal: true });
                    }}
                  >
                    <i className="fa-solid fa-arrow-up mr-2"></i>
                    Import Customers
                  </button>
                </div>

                <div className="col-md-2">
                  {exportCustomers ? (
                    <button
                      className="btn btn-secondary btn-sm w-100"
                      style={{
                        paddingTop: '7px',
                        paddingBottom: '7px',
                      }}
                      disabled
                    >
                      <i className="fa-solid fa-arrow-down mr-2"></i>
                      Export Customers
                    </button>
                  ) : (
                    dataFromListOfUsersState.length > 0 && (
                      <CSVLink
                        data={dataFromListOfUsersState}
                        asyncOnClick={true}
                        onClick={() => {
                          this.exportCustomers();
                        }}
                        filename={
                          'Customer List(' +
                          moment().format('DD-MM-YYYY') +
                          ').csv'
                        }
                        className="btn btn-secondary btn-sm w-100"
                        style={{
                          paddingTop: '7px',
                          paddingBottom: '7px',
                        }}
                      >
                        <i className="fa-solid fa-arrow-down mr-2"></i>
                        Export Customers
                      </CSVLink>
                    )
                  )}
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-secondary btn-sm w-100"
                    style={{
                      paddingTop: '7px',
                      paddingBottom: '7px',
                    }}
                    onClick={() => {
                      this.setState({ openAddModal: true });
                    }}
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Customers
                  </button>
                </div>
              </div>
              {!this.state.is_loading ? (
                this.state.data.length > 0 ? (
                  <div className="card">
                    <div className="card-body">
                      <InfiniteScroll
                        hasChildren={true}
                        dataLength={this.state.data.length}
                        next={() => {
                          this.fetch_order(this.state.page + 1);
                          this.setState({
                            loadMore: true,
                          });
                        }}
                        hasMore={
                          this.state.next_page !== null &&
                          this.state.data.length > 0
                        }
                        loader={
                          <div className="flex-center-center w-full mt-xl">
                            <InfiniteLoader />
                          </div>
                        }
                      >
                        <h6>
                          <strong>
                            <u>Total Customers: {this.state.total_customers}</u>
                          </strong>
                        </h6>
                        <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>S.no</th>
                                <th>Customer Name</th>
                                <th>Contact </th>
                                <th>Email</th>
                                <th>Points</th>
                                <th>Avg. Order</th>
                                <th>Total Orders</th>
                                <th>Last Order</th>
                                <th>Date of Joining</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.data.map((item, index) => (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    <p
                                      onClick={() => {
                                        this.setState({
                                          openEditModal: true,
                                          editCustomerName: item.name,
                                          editCustomerEmail: item.email,
                                          editCustomerContact: item.contact,
                                          editCustomerBirthday: new Date(
                                            item.dob
                                          ),
                                          editCustomerAnniversary: new Date(
                                            item.anniversary
                                          ),
                                          editoffer_segment:
                                            item.offer_id,
                                        });
                                      }}
                                      className="cursor-pointer"
                                    >
                                      {
                                        item.offer_segment != null &&
                                      item.offer_segment != 0 ? (
                                        <>
                                          {item.name == null || item.name == ''
                                            ? 'N/A'
                                            : item.name}
                                          &nbsp;
                                          <Badge
                                            color="blue"
                                            content={
                                              item.offer_segment
                                            }
                                          />
                                        </>
                                      ) : item.name == null ||
                                        item.name == '' ? (
                                        'N/A'
                                      ) : (
                                        item.name
                                      )}
                                    </p>
                                  </td>
                                  <td>{item.contact}</td>
                                  <td>
                                    {item.email == null ? 'N/A' : item.email}
                                  </td>
                                  <td>
                                    {item.wallet_balance}
                                  </td>
                                  <td>
                                    {item.avg_order_value == null
                                      ? 'N/A'
                                      : item.avg_order_value}
                                  </td>
                                  <td
                                    onClick={() => {
                                      this.setState({
                                        openPerUserOrder: true,
                                        user_id: item.user_uu_id,
                                      });
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {item.total_orders == null || item.total_orders == 0
                                      ? 0
                                      : item.total_orders}
                                  </td>
                                  <td>
                                    
                                      <p
                                        onClick={() => {
                                          this.setState({
                                            openPerUserOrder: true,
                                            user_id: item.user_uu_id,
                                          });
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {item.last_order_date != null
                                          ? moment(
                                              item.last_order_date
                                            ).fromNow()
                                          : 'N/A'}
                                      </p>
                                  
                                  </td>
                                  <td>
                                    {item.created_at === null
                                      ? 'N/A'
                                      : moment(item.created_at).format(
                                          'DD-MMM-YYYY'
                                        )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </InfiniteScroll>
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
                    <img
                      src={no_customer}
                      alt="img"
                      style={{
                        width: '300px',
                      }}
                    />
                    <h5 className="mt-3">
                      Oops... No customer found at this moment.{' '}
                    </h5>
                  </div>
                )
              ) : (
                <Loader />
              )}
            </div>
            <ImportCustomers
              fetch_order={this.fetch_order}
              close={this.closeModal}
              open={this.state.openModal}
            />
          </div>
        </div>
        <OrderDetailsDrawer
          drawerOrderId={this.state.drawerOrderId}
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
        />

        <PerUserOrder
          openPerUserOrder={this.state.openPerUserOrder}
          onClose={() => this.setState({ openPerUserOrder: false })}
          id={this.state.user_id}
        />
        {/* add customer */}
        <Modal
          focusTrapped={false}
          open={this.state.openAddModal}
          onClose={() => this.setState({ openAddModal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add Customer</h4>
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
                          addCustomerName: e.target.value,
                        });
                      }}
                      value={this.state.addCustomerName}
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
                          addCustomerContact: e.target.value,
                        });
                      }}
                      value={this.state.addCustomerContact}
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
                          addCustomerEmail: e.target.value,
                        });
                      }}
                      value={this.state.addCustomerEmail}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>Customer Birthday</label>
                    <DatePicker
                      onChange={(e) => {
                        this.setState({
                          addCustomerBirthday: e,
                        });
                      }}
                      value={this.state.addCustomerBirthday}
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
                          addCustomerAnniversary: e,
                        });
                      }}
                      value={this.state.addCustomerAnniversary}
                      style={{ width: '100%' }}
                      format="dd-MM-yyyy"
                      placement="auto"
                    />
                  </div>
                </div>
                <div className="col-lg-6 d-flex justify-content-end align-items-center">
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
                        this.register_customer();
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Add Customer
                    </a>
                  )}
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
                      Customer Catgory<span className="text-danger"> *</span>
                    </label>
                    <SelectPicker
                      data={data}
                      onChange={(e) => {
                        this.setState({
                          editoffer_segment: e,
                        });
                      }}
                      value={this.state.editoffer_segment}
                      style={{ width: '100%' }}
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
                <div className="col-lg-6 d-flex justify-content-end align-items-center">
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
                      Edit Customer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default Customers;

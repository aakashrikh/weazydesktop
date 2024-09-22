import MenuIcon from '@mui/icons-material/Menu';
import SpeedDial from '@mui/material/SpeedDial';
import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Drawer } from 'rsuite';
import { DateRangePicker,DatePicker,CheckPicker  } from 'rsuite';
import { CSVLink } from 'react-csv';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import eye_icon from '../assets/images/icons/eye.svg';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import no_order from '../assets/images/no-transaction.webp';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
class Expense extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    from: new Date(),
    to: new Date(),
    range: this.props.range,
    type: 'all',
    last_page: 1,
    total: 0,
    online: 0,
    cash: 0,
    weazypay: 0,
    method: 'all',
    category:'all',
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    add_data: [],
    staff_id: 0,
    staff_sale: [],
    open: false,
    drawerOrderId: '',
    expense_amount: '',
    expense_type: '',
    expense_name: '',
    expense_desc: '',
    expense_date: new Date(),
    expense_document: '',
    view_expense:[],
    store:[],
    store_id:0,
    download_csv: false,
  };

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_expense(1,this.state.method,this.state.category);
    this.fetch_staff();
    // this.fetch_csv();
  }


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

  fetch_staff = () => {
    fetch(api + 'fetch_staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          this.setState({ add_data: data.data, is_loding: false });
        } else {
          this.setState({ is_loding: false });
        }
      })
      .catch((err) => {
        this.setState({ is_loding: false });
      });
  };

  fetch_expense =(page_id, method,category) => {

    fetch(api + 'fetch_expense', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        range: 'custom',
        start_date: this.state.from,
        end_date: this.state.to,
    
        category: category,
        page_length: this.state.itemsPerPage,
        type: method,
        staff_id: this.state.staff_id,
        store: this.state.store
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              online: 0,
              cash: 0,
            });
          }
        } else {
          if (json.staff != undefined) {
            this.setState({ staff_sale: json.staff });
          }
          this.setState({
            next_page: json.data.next_page_url,
             total: json.total,
             online: json.online,
             cash: json.cash,
            
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
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

  fetch_csv = () => {
    this.setState({ download_csv: true });
    fetch(api + 'fetch_expense', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page:1,
        range: 'custom',
        start_date: this.state.from,
        end_date: this.state.to,
    
        category: this.state.category,
        page_length:'all',
        type: this.state.method,
        staff_id: this.state.staff_id,
        store: this.state.store
      }),
    })
   .then((respose) => respose.blob())
   .then((blob) => {
     const url = window.URL.createObjectURL(new Blob([blob]));
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', 'expense_report.csv');
     document.body.appendChild(link);
     link.click();
     this.setState({download_csv: false});
   });
 };



  uploadImage = async (e) => {
    let image = this.state.expense_document;
    image.push(e.target.files[0]);
    this.setState({ expense_document: image });
  };

  add_expense = () => {
   
    if (
      this.state.expense_amount == '' ||
      this.state.expense_type == '' ||
      this.state.expense_name == '' ||
      this.state.expense_desc == '' ||
      this.state.expense_date == '' 
    ) {
      toast.error('Please fill all the fields');
      return;
    }

    this.setState({ is_button_loading_add: true });
      var form = new FormData();

      form.append('document', this.state.expense_document);

      form.append('expense_amount', this.state.expense_amount);

      form.append('expense_type', this.state.expense_type);

      form.append('expense_name', this.state.expense_name);

      form.append('expense_desc', this.state.expense_desc);

      form.append('expense_date',  moment(this.state.expense_date).format('YYYY-MM-DD hh:mm:ss'));

      if (this.state.expense_document.length > 0) {
        this.state.images.map((item, index) => {
          form.append('document', item);
        });
      }
      

      this.setState({ is_button_loading_add: true });
      fetch(api + 'add_expense', {
        method: 'POST',
        headers: {
          Authorization: this.context.token,
        },
        body: form,
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.errors;
            toast.error(msg[0]);
          } else {
            this.setState({
              open: false,
              expense_amount: '',
              expense_type: '',
              expense_name: '',
              expense_desc: '',
              expense_date: '',
            });
            toast.success(json.msg);
            this.fetch_expense(1, this.state.method, this.state.category);
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
    const data = this.context.role.stores.map((item, index) => (
      
      {
      label: item.shop_name == null ? 'N/A' : item.shop_name + '-' + item.area,
      value: item.vendor_uu_id,
    }));

    return (
      <>
        <Helmet>
          <title>Expenses</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Expenses</h4>
                </div>
                

                <div className="page-btn d-flex align-items-center">
                
                
                  <a
                    className="btn btn-added"
                    onClick={() => {
                      this.setState({
                        open: true,
                        inventory_product_add_name: '',
                        invenroty_product_add_category_id: '',
                        inventory_prodduct_add_model: '',
                        inventory_add_purchase_unit: '',
                        inventory_add_purchase_subunit_quantity: '',
                        inventory_add_purchase_sub_unit: '',
                        inventory_add_status: '',
                      });
                    }}
                  >
                    Add New Expense
                  </a>
                </div>

              </div>

              <Topnav array="finance" />

              <div className="comp-sec-wrapper mt-4">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-12 d-flex align-items-center justify-content-between w-100">
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                        <li className="nav-item">
                          <label>Time</label>
                          <DateRangePicker
                            onChange={(e) => {
                              this.setDate(e);
                            }}
                            cleanable={false}
                            className="form-control border-none py-0 ps-0"
                            style={{ height: '38px' }}
                            size="md"
                            ranges={[
                              {
                                label: 'Today',
                                value: [moment().toDate(), moment().toDate()],
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
                                  moment(this.context.user.created_at).toDate(),
                                  moment().toDate(),
                                ],
                              },
                            ]}
                          />
                        </li>

                        <li className="nav-item">
                          <label>Select Method</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                method: e.target.value,
                              });
                            }}
                            value={this.state.method}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value="all">All</option>
                            <option value="cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Net Banking">Net Banking</option>

                          </select>
                        </li>

                        <li className="nav-item">
                          <label>Select Category</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                category: e.target.value,
                              });
                            }}
                            value={this.state.category}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value="all">All</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Fuel">Fuel</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                            <option value="Salary">Salary</option>
                            <option value="Other Expense">Other Expense</option>
                          </select>
                        </li>
                          
                        {
                this.context.role.stores.length>1 && 
                
            <li className="nav-item">
                     <label>Select Outlet</label>
                         {/* <br/> */}
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
                            defaultValue={this.state.store}
                          />
                        </li>

          }

                        {this.state.add_data.length > 1 && (
                          <li className="nav-item">
                            <label>Select Employee</label>
                            <select
                              className="form-control"
                              onChange={(e) => {
                                this.setState({
                                  staff_id: e.target.value,
                                });
                              }}
                              value={this.state.staff_id}
                              style={{ width: '150px', marginRight: '10px' }}
                              // className="select-container"
                            >
                              <option value={0}>All</option>
                              {this.state.add_data.map((item, index) => {
                                return (
                                  <option value={item.staff_id}>
                                    {item.staff_name} - {item.staff_role}
                                  </option>
                                );
                              })}
                            </select>
                          </li>
                        )}

                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_expense(
                                1,
                                this.state.method,
                                this.state.category
                              );
                              // this.fetch_csv();
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                     

                      {
                        !this.state.download_csv ? <button
                          className="btn btn-secondary"
                          onClick={() => {
                            this.fetch_csv();
                          }}
                        >
                          {this.state.loading ? 'Loading csv...' : 'Download CSV'}
                        </button> : //show loading button
                        <button
                        className="btn btn-secondary btn-sm w-120"
                        disabled
                      >
                        <i
                          className="fa-regular fa-circle-down"
                          style={{
                            fontSize: 18,
                            marginRight: 10,
                          }}
                        ></i>
                        Downloading
                      </button>
                      }

                    </div>
                  </div>
                </section>
              </div>

              {!this.state.is_loading ? (
                <>
                 
                    <div className="dashboard-status-card">
                      <div className="row w-100">
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash">
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
                              <h6>Total Expense</h6>
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
                                  {this.state.online.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Online Expense</h6>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash2">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.cash.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Cash Expense</h6>
                            </div>
                          </div>
                        </div>

                       
                      </div>
                    </div>
                   

               

                  {this.state.data.length > 0 ? (
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <InfiniteScroll
                            hasChildren={true}
                            dataLength={this.state.data.length}
                            next={() => {
                              this.fetch_order(
                                this.state.page + 1,
                                this.state.range,
                                this.state.method
                              );
                              this.setState({
                                // page: this.state.page + 1,
                                loadMore: true,
                              });
                            }}
                            hasMore={
                              this.state.next_page !== null &&
                              this.state.data.length > 0
                            }
                            loader={
                              <div className="d-flex align-items-center justify-content-center w-full mt-xl">
                                <InfiniteLoader />
                              </div>
                            }
                          >
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>S.no</th>
                                  <th>Expense ID</th>
                                  <th>Amount</th>
                                  <th>Date</th>
                                  <th>Type</th>
                                  <th>Name</th>
                                  {
                                      this.context.role.stores.length>1 ? <th>Store</th>:null
                                    }
                                  <th>Staff Name</th>
                                  
                                  <th>Status</th>
                                  <th>Action</th>
                                  {/* <th>Payment TXN Id</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>

                                      <td
                                        className="cursor-pointer"
                                        onClick={() => {
                                          this.setState({
                                            open: true,
                                            
                                          });
                                        }}
                                      >
                                        {item.expense_id}
                                      </td>
                                      <td>
                                        {item.expense_amount}
                                      </td>
                                      <td>

                                        {moment(item.expense_date).format('lll')}
                                      </td>
                                      <td>
                                        {
                                          item.expense_type
                                        }
                                      
                                      </td>
                                      <td>
                                      {
                                          item.expense_name
                                        }
                                        </td>
                                        {
                                      this.context.role.stores.length>1 &&
                                        <td>
                                        {
                                          item.vendor != null ? item.vendor.shop_name:"N/A"
                                        }
                                        </td>
                                    }
                                        <td>
                                      {
                                         item.staff != null ? item.staff.staff_name:"N/A"
                                        }
                                        </td>
                                       
                                        <td>
                                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </td>
                                      <td>
                                        <a
                                          className="btn btn-primary"
                                          onClick={() => {
                                            this.setState({ openedit: true,
                                              view_expense: item
                                             });
                                          }}
                                        >
                                          View
                                        </a>
                                        {/* {item.txn_method === 'upi' ||
                                        item.txn_method === 'UPI'
                                          ? 'UPI'
                                          : item.txn_method === 'netbanking' ||
                                            item.txn_method === 'NB'
                                          ? 'Net Banking'
                                          : item.txn_method === 'Card'
                                          ? 'CARD'
                                          : item.txn_method === 'Cash'
                                          ? 'CASH'
                                          : item.txn_method === 'Weazy Pay'
                                          ? 'Weazy Pay'
                                          : item.txn_method === 'offline-cash'
                                          ? 'Offline Cash'
                                          : ''} */}
                                      </td>
                                      <td
                                        
                                      >
                                        {/* {item.txn_channel} */}
                                      </td>
                                      {/* <td>{item.payment_txn_id}</td> */}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </InfiniteScroll>
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
                      <img src={no_order} alt="img" />
                      <h4>
                        Sorry, we couldn't find any records for this date.
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
                <h4>Add New Expense</h4>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Expense Amount<span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          expense_amount: e.target.value,
                        });
                      }}
                      value={this.state.expense_amount}
                    />
                  </div>
                </div>
             
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                     Expense Name
                      {/* <span className="text-danger"> *</span> */}
                    </label>
                    <select
                      onChange={(e) => {
                        this.setState({
                          expense_name: e.target.value,
                        });
                      }}
                      className="select-container"
                    >
                      <option selected disabled>
                        Please Choose Category
                      </option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Fuel">Fuel</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                      <option value="Salary">Salary</option>
                  
                      <option value="Other Expense">Other Expense</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                     Expense Type
                      <span className="text-danger"> *</span>
                    </label>
                   <select
                      onChange={(e) => {
                        this.setState({
                          expense_type: e.target.value,
                        });
                      }}
                      className="select-container"
                    >
                      <option selected disabled>
                        Please Choose Type
                      </option>
                      <option value="cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                     Expense Date
                      <span className="text-danger"> *</span>
                    </label>
                    <DatePicker format="MM/dd/yyyy hh:mm aa" 
                    onChange={(e) => {
                      this.setState({
                        expense_date: e,
                      });
                    }}
                    value={this.state.expense_date}
                    showMeridian />
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <label>
                     Descripe Expense
                      <span className="text-danger"> *</span>
                    </label>
                    <textarea
                      type="text"
                      onChange={(e) => {
                        this.setState({
                          expense_desc: e.target.value,
                        });
                      }}
                      value={this.state.expense_desc}
                    />
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <label>
                      Upload Receipt
                      <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="file"
                       accept=".png, .jpg, .jpeg,.svg,.webp"
                      onChange={(e) => {
                        this.uploadImage(e);
                      }}
                      value={this.state.document}
                    />
                  </div>
                </div>

               
                <div className="col-lg-12 d-flex justify-content-end align-items-center">
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
                      Adding
                    </button>
                  ) : (
                    <a
                      href="javascript:void(0);"
                      onClick={() => {
                        Swal.fire({
                          title: 'Are you sure?',
                          text: "You want to add this Expense?",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, Add it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.add_expense();
                          }
                        });
                   
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Add Expense
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.openedit}
          onClose={() => this.setState({ openedit: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h6>Expense - {this.state.view_expense.expense_id}</h6>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Description</label>
                  <p>
                    {this.state.view_expense.description}
                  </p>
                </div>
              </div>
             
             {
               this.state.view_expense.request != null && this.state.view_expense.status != 'pending' ?
              <>
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Status</label>
                  <p>
                    {this.state.view_expense.request[0].status}
                  </p>
                </div>

              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Action By</label>
                  <p>
                  {this.state.view_expense.request[0].approve_staff.staff_name	} at { moment(this.state.view_expense.request[0].approve_staff.approved_at).format('lll') }	
                  </p>
                </div>

              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Comment</label>
                  <p>
                  {this.state.view_expense.request[0].comment}
                  </p>
                </div>

              </div>
              
              </>:''

             }
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.opencategory}
          onClose={() => this.setState({ opencategory: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add Category</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
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
                    Adding
                  </button>
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      this.addCategory();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add Category
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          focusTrapped={false}
          open={this.state.openCategoryModal}
          onClose={() => this.setState({ openCategoryModal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Categories</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4">
                <button
                  className={
                    'btn btn-secondary me-3 my-2 w-100' +
                    (this.state.active_cat === 0 ? ' active' : '')
                  }
                  onClick={() => {
                    this.active_cat(0);
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '400',
                  }}
                >
                  All
                </button>
              </div>

            
            </div>
          </div>
        </Modal>
        {/* <InventoryLedger
          // openDrawer={this.state.openDrawer}
          onClose={() => {
            this.setState({ openDrawer: false });
          }}
          id={this.state.view_inventory_product_id}
        /> */}
      </>
    );
  }
}

export class InventoryLedger extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      type: 'all',
      page: 1,
      is_loding: true,
      product_details: [],
    };
  }

  fetchRecords = (page, type) => {
    fetch(api + 'fetch_material_records', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        type: type,
        material_id: this.props.id,
        page: page,
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
          this.setState({
            next_page: json.data.next_page_url,
            product_details: json.product,
          });
          if (page == 1) {
            this.setState({ products: json.data.data });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    products: [...this.state.products, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    products: json.data.data,
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
        this.setState({ is_loding: false });
      });
  };

  render() {
    return (
      <Drawer
        open={this.props.openDrawer}
        onClose={() => this.props.onClose()}
        placement="right"
        size="full"
        onOpen={() => {
          this.setState({ is_loding: true });
          this.fetchRecords(1, this.state.type);
        }}
      >
        <Drawer.Header>
          <Drawer.Title>
            <h4>Inventory Ledger</h4>
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="content">
            {this.state.is_loding ? (
              <Loader />
            ) : (
              <>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          this.state.product_details.inventory_product_name
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Current Stock</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          this.state.product_details.current_stock === null
                            ? 0
                            : this.state.product_details.current_stock.toFixed(
                                2
                              ) +
                              ' ' +
                              this.state.product_details.purchase_unit
                        }
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Filter</label>
                      <RadioGroup
                        value={this.state.type}
                        onChange={(e) => {
                          this.setState({ type: e });
                          this.fetchRecords(1, e);
                        }}
                        horizontal={true}
                      >
                        <RadioButton
                          value="all"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          All
                        </RadioButton>
                        <RadioButton
                          value="add"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          Add
                        </RadioButton>
                        <RadioButton
                          value="remove"
                          pointColor="#619DD1"
                          iconSize={20}
                          rootColor="#37474f"
                          iconInnerSize={10}
                          padding={8}
                        >
                          Release
                        </RadioButton>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                {this.state.products.length > 0 ? (
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Quantity</th>
                              {/* <th>Quantity Unit</th> */}
                              <th>Type</th>
                              <th>Date Time</th>
                              <th>Comment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.products.map((item, index) => {
                              return (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    {item.quantity} {item.quantity_unit}
                                  </td>
                                  {/* <td>{item.quantity_unit}</td> */}
                                  <td>
                                    {item.record_type === 'add' ? (
                                      <span style={{ color: 'green' }}>
                                        Add
                                      </span>
                                    ) : (
                                      <span style={{ color: 'red' }}>
                                        Release
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {moment(item.created_at).format('llll')}
                                  </td>
                                  <td>{item.comment}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
                        height: '250px',
                      }}
                    />
                    <h4>No Record Found</h4>
                  </div>
                )}
              </>
            )}
          </div>
        </Drawer.Body>
      </Drawer>
    );
  }
}

export default (props) => <Expense {...useParams()} {...props} />;


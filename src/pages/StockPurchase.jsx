import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import view_icon from '../assets/images/icons/eye.svg';
import money_icon from '../assets/images/icons/money.svg';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

class StockPurchase extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      category: [],
      new_category_name: '',
      category_id: '',
      is_buttonloding: false,
      parent_category_id: '',
      category_status: 'active',
      parent_category_id_edit: '',
      remaining_amount: 0,
      payment_mode: 'cash',
      txn_amount: '',
      txn_note: 'kjh',
      txn_date: moment(new Date()).format('YYYY-MM-DD'),
      purchase_id: '',
      page: 1,
      loadMore: false,
      next_page: '',
      status: 'all'
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchData(this.state.page,'all');
  }

  fetchData = (page,status) => {
    var stat =[];
    stat.push(status);
    // this.setState({ is_loding: true });
    fetch(api + 'fetch_purchase_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: 'lifetime',
        page: page,
        status: stat
      }),
    })
      .then((response) => response.json())

      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page == 1) {
            this.setState({ category: [] });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page == 1) {
            this.setState({ category: json.data.data });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    category: [...this.state.category, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    category: json.data.data,
                  });
            }
          }
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ is_loding: false });
      });
  };

  addPayment = () => {
    if(this.state.txn_amount > this.state.remaining_amount){
      toast.error('Insufficient Amount');
      return;
    }
    this.setState({ is_buttonloding: true });
    fetch(api + 'add_payment_purchase_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        purchase_id: this.state.purchase_id,
        txn_amount: this.state.txn_amount,
        txn_method: this.state.payment_mode,
        txn_notes: this.state.txn_note,
        txn_date: this.state.txn_date,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success(json.msg);
          this.setState({ openedit: false,txn_amount:0,txn_note:'',txn_date:'',payment_mode:'cash' });
         ;
          this.fetchData(this.state.page,this.state.status);
        } else {
          toast.error(json.msg);
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ is_buttonloding: false });
      });
  };

  delete_order = (id,index) => {
    Swal.fire({
      title: 'Are you sure to delete this purchase order?',
      text: 'You will not be able to recover this imaginary file!',
      showCancelButton: true,
      confirmButtonColor: '#0066b2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(api + 'delete_purchase_order', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: this.context.token,
          },
          body: JSON.stringify({
            po_id: id,
          }),
        })
          .then((response) => response.json())
          .then((json) => {
            if (json.status) {
              toast.success(json.msg);
              // this.setState({
              //   is_loding: true,
              // });

            var arr = [...this.state.category];
            arr.splice(index, 1);
            this.setState({
              category: arr
            });
            } else {
              toast.error(json.msg);
            }
            return json;
          })
          .catch((error) => console.error(error))
          .finally(() => {});
      }
    });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Stock Purchase</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Purchase Orders</h4>
                </div>

                <div className="page-btn d-flex align-items-center">
                {
                  this.context.user.parent_id != 0 &&
                  <>
                  <Link to="/CompanyStockPurchase" className="btn btn-added">
                    Purchase from Company
                  </Link>
                  &nbsp;&nbsp;
                  </>
                }
                
                  <Link to="/addstockpurchase" className="btn btn-added">
                    Create Purchase Order
                  </Link>
                </div>
                
              </div>

              <Topnav array="finance" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">

                    <section className="comp-section">
                    <div className="row pb-4">
                                        <div className="col-md-12">
                                          <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                                            <li className="nav-item">
                                              <a
                                                className={
                                                  'nav-link' +
                                                  (this.state.status == 'all' ? ' active' : '')
                                                }
                                                href="#solid-rounded-justified-tab1"
                                                data-bs-toggle="tab"
                                                onClick={() => {
                                                  this.setState({
                                                    is_loading: true,
                                                    status: 'all',
                                                    page: 1,
                                                  });
                                                  this.fetchData(1, 'all');
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
                                                  this.fetchData(1, 'draft');
                                                }}
                                              >
                                              Draft
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
                                                  this.fetchData(1, 'issued');
                                                }}
                                              >
                                                Issued
                                              </a>
                                            </li>

                                            <li className="nav-item">
                                              <a
                                                className={
                                                  'nav-link' +
                                                  (this.state.status == 'transit'
                                                    ? ' active'
                                                    : '')
                                                }
                                                href="#solid-rounded-justified-tab1"
                                                data-bs-toggle="tab"
                                                onClick={() => {
                                                  this.setState({
                                                    is_loading: true,
                                                    status: 'transin',
                                                    page: 1,
                                                  });
                                                  this.fetchData(1, 'shipped');
                                                }}
                                              >
                                               Shipped
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
                                                  this.fetchData(1, 'completed');
                                                }}
                                              >
                                                Completed
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
                                                  this.fetchData(1, 'cancelled');
                                                }}
                                              >
                                                Cancelled
                                              </a>
                                            </li>
                                            
                                          </ul>
                                        </div>
                                      </div>
                    </section>
                  
                  {this.state.category.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <InfiniteScroll
                          hasChildren={true}
                          dataLength={this.state.category.length}
                          next={() => {
                            this.fetchData(this.state.page + 1, this.state.status);
                            this.setState({
                              loadMore: true,
                            });
                          }}
                          hasMore={
                            this.state.next_page !== null &&
                            this.state.category.length > 0
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
                                <th>Purchase Order#</th>
                                <th>Supplier </th>
                               
                                <th>Purchase date</th>
                                <th>Total</th>
                                <th>Paid Amount</th>
                                <th>Balance</th>
                                <th>Stock Added</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.category.map((item, index) => (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{item.po_no}</td>
                                  <td>
                                    {
                                      item.supplier == null
                                        ? 'Company Purchase'
                                        :
                                        item.supplier.supplier_name
                                    }
                                   
                                    
                                    </td>
                               
                                  <td>
                                    {moment(item.purchase_date).format(
                                      'DD-MM-YYYY'
                                    )}
                                  </td>
                                  <td>{item.total_price}</td>
                                  <td>
                                    {item.payment_sum_txn_amount == '' ||
                                    item.payment_sum_txn_amount == null
                                      ? 0
                                      : item.payment_sum_txn_amount}
                                  </td>
                                  <td>
                                    {item.payment_sum_txn_amount == '' ||
                                    item.payment_sum_txn_amount == null
                                      ? item.total_price
                                      : item.total_price -
                                        item.payment_sum_txn_amount}
                                  </td>
                                  <td>
                                    {item.stock_added == 1 ? (
                                      <span className="text-success">Yes</span>
                                    ) : (
                                      <span className="text-danger">No</span>
                                    )}
                                  </td>
                                  <td>
                                    {item.po_status}
                                  </td>
                                  <td>
                                  <Link
                                        className="me-3"
                                        to={'/viewstockpurchase/' + item.id}
                                      >
                                        <img src={view_icon} alt="img" />
                                      </Link>
                                  {
                                    (item.po_status != 'completed' )&&
                                    <>
                                    {
                                      (item.user_order_id == 0 || item.po_status == 'draft') &&
                                      <Link
                                      className="me-3 cursor-pointer"
                                      to={'/editstockpurchase/' + item.id}
                                    >
                                      <img src={edit_icon} alt="img" />
                                    </Link>

                                    }
                                    

                                      <img
                                        src={delete_icon}
                                        alt="img"
                                        onClick={() => {
                                          this.delete_order(item.id, index);
                                        }}
                                        className="me-3 cursor-pointer"
                                      />

                                    </>
                                  }
                                    { (item.is_paid == 0 && item.user_order_id == 0)  &&
                                      <>
                                          <img
                                          src={money_icon}
                                          alt="img"
                                          className="me-3 cursor-pointer"
                                          onClick={() => {
                                           
                                            this.setState({
                                              openedit: true,
                                              purchase_id: item.id,
                                              remaining_amount:item.payment_sum_txn_amount == '' ||
                                              item.payment_sum_txn_amount == null
                                                ? item.total_price
                                                : item.total_price -
                                                  item.payment_sum_txn_amount
                                            });
                                          }}
                                        />
                                      </>
                                    }
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </InfiniteScroll>
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
                          height: '400px',
                        }}
                      />
                      <h4>
                        {' '}
                        Sorry, we couldn't find any records at this moment.{' '}
                      </h4>
                    </div>
                  )}
                </div>
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
                <h4>Add Category</h4>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
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
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>
                        Choose Parent Categry{' '}
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        onChange={(e) => {
                          this.setState({ parent_category_id: e.target.value });
                          // alert(e.target.value);
                        }}
                        className="select-container"
                      >
                        <option>Choose Parent Category</option>
                        <option value={0}>None</option>
                        {this.state.category.length > 0 &&
                          this.state.category.map((item, index) => (
                            <option value={item.id}>
                              {item.category_name}
                            </option>
                          ))}
                      </select>
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
                          this.add();
                        }}
                        className="btn btn-secondary btn-sm me-2"
                      >
                        Add Category
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
                <h4>Pay Amount</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>
                    Remaing Amount - ₹ {this.state.remaining_amount}
                  </label>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Amount
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ txn_amount: e.target.value });
                    }}
                    value={this.state.txn_amount}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Payment Date
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ txn_date: e.target.value });
                    }}
                    value={moment(this.state.txn_date).format('DD-MM-YYYY')}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <div className="form-group">
                    <label> Payment mode</label>
                    <RadioGroup
                      value={this.state.payment_mode}
                      onChange={(e) => {
                        this.setState({ payment_mode: e });
                      }}
                      horizontal
                    >
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
                        value="Card"
                        pointColor="#0066b2"
                        iconSize={20}
                        rootColor="#619DD1"
                        iconInnerSize={10}
                        padding={10}
                      >
                        Card
                      </RadioButton>
                      <RadioButton
                        value="Cheque"
                        pointColor="#0066b2"
                        iconSize={20}
                        rootColor="#619DD1"
                        iconInnerSize={10}
                        padding={10}
                      >
                        Cheque
                      </RadioButton>
                      <RadioButton
                        value="Online"
                        pointColor="#0066b2"
                        iconSize={20}
                        rootColor="#619DD1"
                        iconInnerSize={10}
                        padding={10}
                      >
                        Online
                      </RadioButton>
                    </RadioGroup>
                  </div>
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
                    href="javascript:void(0);"
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Save it!',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          this.addPayment();
                        }
                      });
                      // this.addPayment();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Save Changes
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default StockPurchase;

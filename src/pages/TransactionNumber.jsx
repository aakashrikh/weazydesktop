import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no_orders.webp';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import OrdersTable from '../othercomponent/OrdersTable';
import Topnav from '../othercomponent/Topnav';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
class TransactionNumber extends Component {
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
      button_load: false,
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
    fetch(api + 'fetch_transaction_numbers', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          // this.setState({ data: [] });
        } else {
          this.setState({ data: json.data });
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  update_record = () => {
    this.setState({ button_load: true });
    fetch(api + 'update_transaction_numbers', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        transaction_numbers: this.state.data,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          toast.success(json.msg);
        }
        this.setState({ button_load: false });
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
          <title>Default Series</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Default Series</h4>
                </div>
                {this.state.button_load ? (
                  <Loader />
                ) : (
                  <a
                    href="javascript:void(0);"
                    onClick={() => {
                      Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, save it!',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          this.update_record();
                        }
                      });
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Save Series
                  </a>
                )}
              </div>
              <Topnav array="setup" />
              <div className="comp-sec-wrapper"></div>
              {!this.state.is_loading ? (
                <>
                  {this.state.data.length > 0 ? (
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>S.no</th>
                                <th>Module</th>
                                <th>Prefix </th>
                                <th>Starting Number</th>
                                <th>Preview</th>
                                {/* <th style={{ textAlign: 'end' }}>Action</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.data.length > 0 &&
                                this.state.data.map((data, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{data.module}</td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={data.prefix}
                                          onChange={(e) => {
                                            let arr = [...this.state.data];
                                            arr[index].prefix = e.target.value;
                                            this.setState({ data: arr });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={data.next_number}
                                          onChange={(e) => {
                                            let arr = [...this.state.data];
                                            arr[index].next_number =
                                              e.target.value;
                                            this.setState({ data: arr });
                                          }}
                                        />
                                      </td>
                                      <td>
                                        {data.prefix}
                                        {data.next_number}
                                      </td>
                                    </tr>
                                  );
                                })}
                              <tr></tr>
                            </tbody>
                          </table>
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
  return <TransactionNumber {...props} {...useParams()} navigate={abcd} />;
}

export default Navigate;

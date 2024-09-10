import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

class Inventoryledger extends Component {
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

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchRecords(this.state.page, this.state.type);
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
      <>
        <Helmet>
          <title>Inventory Ledger</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Inventory Ledger</h4>
                </div>
              </div>
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
    <Inventoryledger
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;

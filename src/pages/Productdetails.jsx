import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { Header } from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

export class Productdetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: [],
      is_loding: true,
    };
  }
  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.productDetails();
  }

  productDetails = () => {
    fetch(api + 'get_product_details?product_id=' + this.props.id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ product: json.data[0] });
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
          <title>Product Details</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              {this.state.is_loding ? (
                <Loader />
              ) : (
                <>
                  <div className="page-header">
                    <div className="page-title">
                      <h4>Product Details</h4>
                    </div>
                    <Link to={'/editproduct/' + this.props.id}>
                      <button className="btn btn-added">Edit Product</button>
                    </Link>
                  </div>
                  <div className="row">
                    <div className="col-lg-3 col-sm-12">
                      <div className="card d-flex justify-content-center align-items-center">
                        <div
                          className="card-body"
                          style={{
                            height: '200px',
                            width: '100%',
                          }}
                        >
                          <img
                            src={this.state.product.product_img}
                            alt="img"
                            style={{
                              height: '100%',
                              width: '100%',
                              borderRadius: '10px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-9 col-sm-12">
                      <div className="productdetails">
                        <ul className="product-bar">
                          <li>
                            <h4>Name</h4>
                            <h6>{this.state.product.product_name}</h6>
                          </li>
                          <li>
                            <h4>Discount Type</h4>
                            <h6>Percentage</h6>
                          </li>
                          <li>
                            <h4>VEG/NON-VEG</h4>
                            {this.state.product.is_veg == '1' ? (
                              <h6>VEG</h6>
                            ) : (
                              <h6>NON-VEG</h6>
                            )}
                          </li>
                          <li>
                            <h4>Our Price</h4>
                            <h6>₹ {this.state.product.our_price}</h6>
                          </li>
                          <li>
                            <h4>Status</h4>
                            <h6
                              style={{
                                color:
                                  this.state.product.status === 'active'
                                    ? 'green'
                                    : 'red',
                                textTransform: 'capitalize',
                              }}
                            >
                              {this.state.product.status}
                            </h6>
                          </li>
                          <li>
                            <h4>Description</h4>
                            <h6>{this.state.product.description}</h6>
                          </li>
                          {this.state.product.variants.length > 0 && (
                            <li>
                              <h4>Variants</h4>
                              <ul>
                                {this.state.product.variants.map((item, i) => {
                                  return (
                                    <li>
                                      <h6
                                        style={{
                                          width: '100%',
                                        }}
                                      >
                                        {item.variants_name}
                                        <span className="mx-2">
                                          ₹{item.variants_discounted_price}
                                        </span>
                                      </h6>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          )}
                          {this.state.product.addon_map.length > 0 && (
                            <li>
                              <h4>Addons</h4>
                              <ul>
                                {this.state.product.addon_map.map((item, i) => {
                                  return (
                                    <li>
                                      <h6
                                        style={{
                                          width: '100%',
                                        }}
                                      >
                                        {item.addon_name}
                                        <span className="mx-2">
                                          ₹{item.addon_price}
                                        </span>
                                      </h6>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default (props) => <Productdetails {...useParams()} {...props} />;

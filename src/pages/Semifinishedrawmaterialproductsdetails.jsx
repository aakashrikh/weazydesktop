import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import { Header } from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

export class Semifinishedrawmaterialproductsdetails extends Component {
  static contextType = AuthContext;
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
    fetch(api + 'fetch_semi_dishes_single', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        semi_dish_id: this.props.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ product: json.data });
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
          <title>Semi Finished Recipe Details</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          {this.state.is_loding ? (
            <Loader />
          ) : (
            <div className="page-wrapper">
              <div className="content">
                <div className="page-header">
                  <div className="page-title">
                    <h4>Details for Semi Finished Raw Material Product</h4>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 col-sm-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="productdetails">
                          <ul className="product-bar">
                            <li>
                              <h4>Name</h4>
                              <h6>{this.state.product.dish_name}</h6>
                            </li>
                            <li>
                              <h4>Expires In</h4>
                              <h6>
                                {this.state.product.dish_expiry}{' '}
                                {this.state.product.dish_expiry == 1
                                  ? 'Day'
                                  : 'Days'}
                              </h6>
                            </li>
                            <li>
                              <h4>Quantity</h4>
                              <h6>
                                {
                                  this.state.product
                                    .production_quantity_estimate
                                }{' '}
                                {this.state.product.recipe_quantity}
                              </h6>
                            </li>

                            {this.state.product.semi_dish_materials.length >
                              0 && (
                              <li>
                                <h4>Materials</h4>
                                <ul>
                                  {this.state.product.semi_dish_materials.map(
                                    (item, index) => {
                                      return (
                                        <li>
                                          <h6
                                            style={{
                                              width: '100%',
                                            }}
                                          >
                                            {
                                              item.materials
                                                .inventory_product_name
                                            }{' '}
                                            - {item.material_quantity}{' '}
                                            {item.material_unit}
                                          </h6>
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default (props) => (
  <Semifinishedrawmaterialproductsdetails {...useParams()} {...props} />
);

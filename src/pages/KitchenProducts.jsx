import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../othercomponent/Header';

export class KitchenProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          id: 1,
          category_name: 'Category 1',
          products: [
            {
              id: 1,
              name: 'Product 1',
            },
            {
              id: 2,
              name: 'Product 2',
            },
            {
              id: 3,
              name: 'Product 3',
            },
          ],
        },
        {
          id: 2,
          category_name: 'Category 2',
          products: [
            {
              id: 4,
              name: 'Product 1',
            },
            {
              id: 5,
              name: 'Product 2',
            },
            {
              id: 6,
              name: 'Product 3',
            },
          ],
        },
        {
          id: 3,
          category_name: 'Category 3',
          products: [
            {
              id: 7,
              name: 'Product 1',
            },
            {
              id: 8,
              name: 'Product 2',
            },
            {
              id: 9,
              name: 'Product 3',
            },
          ],
        },
        {
          id: 4,
          category_name: 'Category 4',
          products: [
            {
              id: 10,
              name: 'Product 1',
            },
            {
              id: 11,
              name: 'Product 2',
            },
            {
              id: 12,
              name: 'Product 3',
            },
            {
              id: 13,
              name: 'Product 4',
            },
            {
              id: 14,
              name: 'Product 5',
            },
            {
              id: 15,
              name: 'Product 6',
            },
          ],
        },
      ],
      selectedProducts: [],
    };
  }

  categoryCheckbox = (item, index) => {
    let data = this.state.data;
    let selectedProducts = this.state.selectedProducts;
    if (item.target.checked) {
      data[index].checked = true;
      data[index].products.map((product) => {
        product.checked = true;
        selectedProducts.push(product.id);
      });
    } else {
      data[index].checked = false;
      data[index].products.map((product) => {
        product.checked = false;
        selectedProducts = selectedProducts.filter(
          (selectedProduct) => selectedProduct !== product.id
        );
      });
    }
    data.map((item) => {
      let count = 0;
      item.products.map((itemProduct) => {
        if (itemProduct.checked) {
          count++;
        }
      });
      if (count === item.products.length) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
    this.setState({ data, selectedProducts });
  };

  productCheckbox = (product, index) => {
    let data = this.state.data;
    let selectedProducts = this.state.selectedProducts;
    if (product.target.checked) {
      data[index].checked = true;
      data[index].products.map((item) => {
        if (item.id === product.target.value) {
          item.checked = true;
          selectedProducts.push(item.id);
        }
      });
    } else {
      data[index].checked = false;
      data[index].products.map((item) => {
        if (item.id === product.target.value) {
          item.checked = false;
          selectedProducts = selectedProducts.filter(
            (selectedProduct) => selectedProduct !== item.id
          );
        }
      });
    }
    data.map((item) => {
      let count = 0;
      item.products.map((itemProduct) => {
        if (itemProduct.checked) {
          count++;
        }
      });
      if (count === item.products.length) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
    this.setState({ data, selectedProducts });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Kitchen Products</title>
        </Helmet>
        <div className="main-wrappers">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Kitchen Products</h4>
                </div>
              </div>
              <div className="row">
                {this.state.data.map((item, index) => {
                  return (
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header p-2 d-flex align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input me-2 mt-0"
                            value={item.category_name}
                            id={item.id}
                            onChange={(item) => {
                              this.categoryCheckbox(item, index);
                            }}
                            defaultChecked={item.checked}
                          />
                          <label
                            className="form-check-label"
                            for={item.id}
                            style={{ fontSize: '1.2rem' }}
                          >
                            {item.category_name}
                          </label>
                        </div>
                        <div className="card-body p-2">
                          <div className="row">
                            {item.products.map((product, index) => {
                              return (
                                <div className="col-md-6 mb-2">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input me-2"
                                      type="checkbox"
                                      value={product.name}
                                      id={product.id}
                                      onChange={(product) => {
                                        this.productCheckbox(
                                          product,
                                          index,
                                          item
                                        );
                                      }}
                                      defaultChecked={product.checked}
                                    />
                                    <label
                                      className="form-check-label"
                                      for={product.id}
                                    >
                                      {product.name}
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default KitchenProducts;

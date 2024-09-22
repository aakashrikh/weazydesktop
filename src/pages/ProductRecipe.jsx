import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Drawer, CheckPicker,Stack} from 'rsuite';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';


const data = [
  'DineIn',
  'TakeAway',
  'Delivery',
].map(item => ({ label: item, value: item }));


class ProductRecipe extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      data: [],
      new_category_name: '',
      category_id: '',
      is_buttonloding: false,
      parent_category_id: '',
      category_status: 'active',
      parent_category_id_edit: '',
      remaing_amount: 0,
      payment_mode: 'cash',
      txn_amount: '',
      txn_note: 'kjh',
      txn_date: moment(new Date()).format('YYYY-MM-DD'),
      purchase_id: '',
      page: 1,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchData(this.state.page);
  }

  fetchData = (page_id) => {
    fetch(api + 'fetch_recipe_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({ data: [] });
          }
        } else {
          this.setState({
            next_page: json.vendor_products.next_page_url,
          });
          if (page_id == 1) {
            this.setState({
              data: json.vendor_products.data,
            });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    data: [...this.state.data, ...json.vendor_products.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    data: json.vendor_products.data,
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

  search = (e) => {
    this.setState({ is_loding: true });
    fetch(api + 'fetch_recipe_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({ search: e.target.value }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          this.setState({ data: [] });
        } else {
          this.setState({
            data: json.vendor_products.data,
          });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ is_loding: false });
      });
  };

  live_inventory = (e) => {
    fetch(api + 'update_live_inventory_status', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        live_inventory_status: e.target.checked ? '1' : '0',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.context.get_vendor_profile(this.context.token);
          toast.success('Live inventory status updated successfully');
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Product Recipe</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Recipes for Products</h4>
                </div>

                {this.context.role.staff_role !== 'staff' ? (
                  <div className="page-btn d-flex align-items-center">
                    Live Inventory
                    <div className="status-toggle ml-3">
                      <input
                        type="checkbox"
                        id="live-inventory"
                        className="check"
                        checked={
                          this.context.user.live_inventory == '1' ? true : false
                        }
                        onChange={(e) => {
                          this.live_inventory(e);
                        }}
                      />
                      <label
                        htmlFor="live-inventory"
                        className="checktoggle"
                      ></label>
                    </div>
                  </div>
                ) : null}
              </div>

              <Topnav array="catalogue" />

              <div className="comp-sec-wrapper mt-4">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-12">
                      <input
                        type={'text'}
                        className={'form-control search-input'}
                        onChange={(e) => {
                          this.search(e);
                        }}
                        placeholder={'Search your products here...'}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  {this.state.data.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <InfiniteScroll
                          hasChildren={true}
                          dataLength={this.state.data.length}
                          next={() => {
                            this.fetchData(this.state.page + 1);
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
                                <th>Product Name</th>
                                <th>Product Variant</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.data.map((item, index) => (
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{item.product_name}</td>
                                  <td>{item.varient_name}</td>
                                  <td>
                                    {/* {item.recipe_status == '1' ? (
                                      <Link
                                        to={
                                          '/updateproductrecipe/' +
                                          item.id +
                                          '/' +
                                          item.varient_id
                                        }
                                        target="_blank"
                                      >
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          style={{
                                            height: '30px',
                                          }}
                                        >
                                          Update Recipe
                                        </button>
                                      </Link>
                                    ) : (
                                      <Link
                                        to={
                                          '/updateproductrecipe/' +
                                          item.id +
                                          '/' +
                                          item.varient_id
                                        }
                                        target="_blank"
                                      >
                                        <button
                                          className="btn btn-danger btn-sm"
                                          style={{
                                            height: '30px',
                                          }}
                                        >
                                          Create Recipe
                                        </button>
                                      </Link>
                                    )} */}
                                    <button
                                      className={
                                        item.recipe_status == '1'
                                          ? 'btn btn-secondary btn-sm'
                                          : 'btn btn-danger btn-sm'
                                      }
                                      style={{
                                        height: '30px',
                                      }}
                                      onClick={() => {
                                        this.setState({
                                          open: true,
                                          product_id: item.id,
                                          variant_id: item.varient_id,
                                        });
                                      }}
                                    >
                                      {item.recipe_status == '1'
                                        ? 'Update Recipe'
                                        : 'Create Recipe'}
                                    </button>
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
        <UpdateProductRecipe
          openDrawer={this.state.open}
          onClose={() => {
            this.setState({ open: false });
          }}
          product_id={this.state.product_id}
          variant_id={this.state.variant_id}
          fetchData={() => {
            this.fetchData(this.state.page);
          }}
        />
      </>
    );
  }
}

export class UpdateProductRecipe extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      is_loding: true,
      open: false,
      images: [],
      variants_addons_div: false,
      newaddon: false,
      new_category_name: '',
      category: [],
      products: [],
      semifinishedrecipe: [],
      rawmaterial: [],
      product_show: true,
      product_id: 0,
      name: '',
      c_id: '',
      market_price: '',
      our_price: '',
      description: '',
      type: 'product',
      is_veg: 1,
      save_and_continue: false,
      add_category_loading: false,
      is_save_button_loding: false,
      rowsRaw: [
      ],

      total: 0,
      product_name: '',
      variant_name: '',
      recepe_loding:true
    };
  }



  fetch_product_recipe = () => {

    fetch(api + 'fetch_product_recipe', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: this.props.product_id,
        varient_id: this.props.variant_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
          this.setState({ recepe_loding: false });
        } else {
            let vari = [];
            if(json.raw_materials.length > 0)
              {
              
                json.raw_materials.map((item, index) => {
                  var one = {
                    id: item.raw_product_id,
                    name: 'one',
                    quantity: item.raw_product_quantity,
                    unit: item.raw_product_unit,
                    material_id: item.raw_product_id,
                    area:item.area
                  };
                  vari.push(one);
                });

          
            // alert("Ccww");
          }
          else
          {
            vari = [{
              id: 0,
              name: 'one',
              quantity: '',
              unit: '',
              material_id: 0,
              area:['DineIn','Delivery','TakeAway']
            }];
          }
          
          this.setState({ rowsRaw: vari,product_name: json.product.product_name, }, () => {
            this.setState({ recepe_loding: false });
          });

          if (json.varient != null) {
            this.setState({ variant_name: json.varient.variants_name });
          }
          else
          {
            this.setState({ variant_name: '' });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {

      });
  };

  fetchRawMaterial = (id, page) => {
    fetch(api + 'fetch_inventory_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
        inventory_category_id: 0,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page == 1) {
            this.setState({ rawmaterial: [] });
          }
        } else {
          if (json.all.data.length > 0) {
            this.setState({ rawmaterial: json.all.data });
          } else {
            this.setState({ rawmaterial: [] });
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

  handleChangeRaw = (idx) => (e) => {
    const newRows = [...this.state.rowsRaw];
    if (e.target.name == 'material_id') {
      var index = e.target.selectedIndex;
      var optionElement = e.target.childNodes[index];
      var option = optionElement.getAttribute('unit');
      newRows[idx]['unit'] = option;
      newRows[idx][e.target.name] = parseInt(e.target.value);
    }

    newRows[idx][e.target.name] = e.target.value;

    this.setState({ rowsRaw: newRows });
  };

  handleAddRowRawMaterial = () => {
    const vari = [
      {
        id: 1,
        name: '',
        quantity: '',
        unit: '',
      },
    ];
    this.setState({ rowsRaw: [...this.state.rowsRaw, ...vari] });
  };

  handleRemoveSpecificRowRaw = (idx) => () => {
    const rowsRaw = [...this.state.rowsRaw];
    rowsRaw.splice(idx, 1);
    this.setState({ rowsRaw });
  };

  update_product_recipe = () => {
    this.setState({ is_save_button_loding: true });
    fetch(api + 'update_product_recipe', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: this.props.product_id,
        varient_id: this.props.variant_id,
        raw_materials: this.state.rowsRaw,
        semi_dishes: this.state.rowsSemi,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          this.setState({ is_save_button_loding: false });
          this.setState({ is_error: true, error_msg: msg });
        } else {
          toast.success(json.msg);
          this.setState({ is_save_button_loding: false });
          this.setState({ is_success: true, success_msg: json.msg });
          this.props.onClose();
          this.props.fetchData();
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_save_button_loding: false });
      });
  };


  onSelect = (selectedList,idx) => {
    
    const newRows = [...this.state.rowsRaw];
    const area=[];
    selectedList.map((item, index) => {
      area.push(item);
    });
    newRows[idx]['area'] = area;

    this.setState({ rowsRaw: newRows });

  }

  onRemove = (selectedList,index) => {

    const newRows = [...this.state.rowsRaw];
    newRows[index]['area'] = [];
    this.setState({ rowsRaw: newRows });
  };


  render() {
    return (
      <Drawer
        open={this.props.openDrawer}
        onClose={() => this.props.onClose()}
        placement="right"
        size="full"
        onOpen={() => {
          this.fetchRawMaterial();
          this.fetch_product_recipe();
        }}
      >
        <Drawer.Header>
          <Drawer.Title>
            <h4>Update Product Recipe</h4>
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          {this.state.recepe_loding ? (
            <Loader />
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Product Name : </label>
                      <span>{this.state.product_name}</span>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Variant Name : </label>
                      <span>
                        {this.state.variant_name != undefined
                          ? this.state.variant_name
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <h5>Select Raw Materials</h5>
                  {this.state.rowsRaw.length > 0 ? (
                    <div className="col-lg-12">
                      <br />
                      <table
                        className="table table-bordered table-hover"
                        id="tab_logic"
                        style={{
                          border: '1px solid #d9d9d9',
                        }}
                      >
                        <thead>
                          <tr>
                            <th className="text-center">#</th>
                            <th className="text-center">Name</th>
                            <th className="text-center">Unit</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-center">Area</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.rowsRaw.map((item, idx) => (
                            <tr id="addr0" key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <select
                                  onChange={this.handleChangeRaw(idx)}
                                  className="select-container"
                                  name="material_id"
                                  value={this.state.rowsRaw[idx].material_id}
                                >
                                   <option>Choose Material</option>
                                  {this.state.rawmaterial.length > 0 ? (
                                    this.state.rawmaterial.map(
                                      (item, index) => (
                                        <option
                                          value={item.id}
                                          unit={item.purchase_unit}
                                          current_quantity={item.current_stock}
                                        >
                                          {item.inventory_product_name}
                                        </option>
                                      )
                                    )
                                  ) : (
                                    <></>
                                  )}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="unit"
                                  value={this.state.rowsRaw[idx].unit}
                                  onChange={this.handleChangeRaw(idx)}
                                  className="form-control"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  name="quantity"
                                  value={this.state.rowsRaw[idx].quantity}
                                  onChange={this.handleChangeRaw(idx)}
                                  className="form-control"
                                />
                              </td>
                              <td>
                              <Stack spacing={10} direction="column" alignItems="flex-start">
                                <CheckPicker
                                  data={data}
                                  searchable={false}
                                  style={{ width: 224 }}
                                  placeholder="Select Area"
                                  onChange={(e) => {
                                      this.onSelect(e,idx);
                                  }}
                                  onClean={() => {
                                    this.onRemove('',idx);
                                  }}
                                  value={this.state.rowsRaw[idx].area}
                                />
                       
                                </Stack>
                              </td>

                              <td className="text-end">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={this.handleRemoveSpecificRowRaw(idx)}
                                >
                                  X
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'end',
                        }}
                      >
                        <button
                          onClick={this.handleAddRowRawMaterial}
                          className="btn btn-outline-secondary"
                          style={{
                            marginBottom: '20px',
                            marginTop: '10px',
                          }}
                        >
                          Add New
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={this.handleAddRowRawMaterial}
                        className="btn btn-sm btn-outline-secondary"
                        style={{
                          marginBottom: '20px',
                          marginTop: '10px',
                        }}
                      >
                        Add A Row
                      </button>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  {this.state.is_save_button_loding ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled
                      style={{
                        cursor: 'not-allowed',
                        opacity: '0.8',
                      }}
                    >
                      Saving...
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        this.update_product_recipe();
                      }}
                    >
                      Save Recipe
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Drawer.Body>
      </Drawer>
    );
  }
}

export default ProductRecipe;

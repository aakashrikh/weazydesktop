import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { json, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Drawer, Radio, RadioGroup, SelectPicker,Nav,TagPicker } from 'rsuite';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Skeletonloader from '../othercomponent/Skeletonloader';

const Navbar = ({ active, onSelect, ...props }) => {
  return (
    <Nav {...props} activeKey={active} onSelect={onSelect} style={{ marginBottom: 50 }}>
      <Nav.Item eventKey="overview">Overview</Nav.Item>
      <Nav.Item eventKey="variants">Variants</Nav.Item>
      <Nav.Item eventKey="addons">Addons</Nav.Item>
    </Nav>
  );
};
export class Addproduct extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      images: [],
      variants_addons_div: false,
      newaddon: false,
      new_category_name: '',
      category: [],
      product_show: true,
      product_id: 0,
      name: '',
      c_id: '',
      our_price: '',
      description: '',
      type: 'product',
      tax: 0,
      is_veg: 1,
      save_and_continue: false,
      add_category_loading: false,
      active:'overview',
      rows:[],
      addon:[],
      product_code:'',
      short_code:'',
      discount_applicable:1
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
    this.fetch_addon();
    this.setState({ tax: this.context.user.gst_percentage });
  }

  fetchCategories = () => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.data.length === 0) {
          this.setState({ open: true });
        }
        this.setState({ category: json.data });
        this.setState({ is_loding: false });
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  uploadImage = async (e) => {
    let image = this.state.images;
    image.push(e.target.files[0]);
    this.setState({ images: image });
  };

  add = () => {
    if (this.state.new_category_name === '') {
      toast.error('Please add Category first!');
    } else {
      this.setState({ add_category_loading: true });
      fetch(api + 'create_category_vendor', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          category_name: this.state.new_category_name,
          status: 'active',
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            this.setState({
              open: false,
              new_category_name: '',
            });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ add_category_loading: false });
        });
    }
  };

  create = () => {
    let numberValidation = /^[0-9]+(\.[0-9]+)?$/;
    let isnumValid = numberValidation.test(this.state.our_price);
    var taxValidation = /^[0-9]+$/;
    var isTaxValid = taxValidation.test(this.state.tax);

    this.state.rows.map((item) => {
      if(item.variants_name === ''){
        toast.error('Variant name is required !');
        return false;
      }
      if(item.variants_discounted_price === ''){
        toast.error('Variant price is required !');
        return false;
      }
      return true;
    })

    if (this.state.name === '') {
      toast.error('Name is required !');
    } else if (this.state.our_price === '') {
      toast.error('Price is required !');
    } else if (this.state.category === '') {
      toast.error('Select category first !');
    } else if (this.state.c_id === '') {
      toast.error('Category is required !');
    } else if (!isnumValid) {
      toast.error('Please Enter Valid Price!');
    } else if (!isTaxValid) {
      toast.error('Tax contains digits only!');
    }else {
      this.setState({ save_and_continue: true, isLoading: true });

      var form = new FormData();
      form.append('product_name', this.state.name);
      form.append('vendor_category_id', this.state.c_id);
      form.append('price', this.state.our_price);
      form.append('description', this.state.description);
      form.append('type', this.state.type);
      form.append('tax', this.state.tax);
      form.append('variants',JSON.stringify(this.state.rows));
      form.append('product_code',this.state.product_code);
      form.append('short_code',this.state.short_code);
      form.append('discount_applicable',this.state.discount_applicable);

      if (this.state.images.length > 0) {
        this.state.images.map((item, index) => {
          form.append('product_img', item);
        });
      }

      form.append('is_veg', this.state.is_veg);
      fetch(api + 'vendor_add_product', {
        method: 'POST',
        body: form,
        headers: {
          Authorization: this.context.token,
        },
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            toast.success(json.msg);
            this.props.navigate('/productlist');
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isLoading: false, save_and_continue: false });
        });
    }
  };


  fetch_addon = () => {
    fetch(api + 'fetch_product_addon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({ addon: json.data });
       

        const addon_object = json.data.map(
          item => ({ label: item.group_name, value: item.id })
        );
      
        this.setState({ nn: addon_object});

        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  };



  handleChange = (idx) => (e) => {
    const newRows = [...this.state.rows];
    newRows[idx][e.target.name] = e.target.value;

    this.setState({
      rows: newRows,
    });


  };
  handleAddRow = () => {
    const vari = [
      {
        id: 1,
        variants_name: '',
        variants_discounted_price: '',
        variants_code:'',
        addons: [],
      },
    ];
    this.setState({ rows: [...this.state.rows, ...vari] });
  };
  handleRemoveSpecificRow = (idx) => () => {
    const rows = [...this.state.rows];
    rows.splice(idx, 1);
    this.setState({ rows });
  };


  handleAddon = (e) => {
    const checkedValue = e.target.value;

    if (this.state.object[checkedValue]) {
      const object = this.state.object;
      object[checkedValue] = false;
      this.setState({ object });
    } else {
      const object = this.state.object;
      object[checkedValue] = true;
      this.setState({ object });
    }
  };
  

  updateAddon = (value,idx) => {
    const v_data=this.state.rows
    v_data[idx].addon=value
    this.setState({ rows: v_data });
  };

  render() {
    const data = this.state.category.map((item, index) => ({
      label: item.name,
      value: item.id,
    }));
    return (
      <>
        <Helmet>
          <title>Add Product</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {this.state.product_show ? (
              <div className="content">
                  
                  <div className='row'>
                    <div className='col-md-10'>
                    <div className="page-header">
                    <div className="page-title">
                      <h4>Add New Product</h4>
                    </div>
                  </div>
                    </div>
                    <div className='col-md-2'>

                    {this.state.save_and_continue ? (
                            <button
                              className="btn btn-secondary btn-sm  me-2"
                              style={{
                                pointerEvents: 'none',
                                opacity: '0.8',
                              }}
                            >
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Saving
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                this.create();
                              }}
                              className="btn btn-secondary btn-sm  me-2"
                            >
                             Save this Product
                            </button>
                          )}
                    </div>
                  </div>
                  <Navbar active={this.state.active}  appearance="subtle"  onSelect={(e) => 

                  this.setState({ active: e })}  />

                

                {
                this.state.active =='overview' ?

                
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Product Name*</label>
                          <input
                            type="text"
                            onChange={(e) => {
                              this.setState({ name: e.target.value });
                            }}
                            value={this.state.name}
                          />
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <div className="d-flex align-items-center justify-content-between">
                            <label>Category*</label>
                          </div>
                          <div className="row">
                            <div className="col-10 pe-0">
                              <SelectPicker
                                data={data}
                                placeholder="Choose Category"
                                onChange={(e) => {
                                  this.setState({ c_id: e });
                                }}
                                style={{
                                  width: '100%',
                                  borderColor: 'rgba(145, 158, 171, 0.32)',
                                }}
                                value={this.state.c_id}
                              />
                            </div>
                            <div className="col-2">
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ height: '35px' }}
                                onClick={() => {
                                  this.setState({ open: true });
                                }}
                              >
                                <i className="fa fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Price*</label>
                          <input
                            onChange={(e) => {
                              this.setState({ our_price: e.target.value });
                            }}
                            value={this.state.our_price}
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Veg/Non-Veg</label>
                          <RadioGroup
                            name="radioList"
                            inline={true}
                            onChange={(e) => {
                              this.setState({ is_veg: Number(e) });
                            }}
                            value={Number(this.state.is_veg)}
                          >
                            <Radio value={1}>VEG</Radio>
                            <Radio value={0}>NON-VEG</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                    

                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Short Code</label>
                          <input
                            type="text"
                            onChange={(e) => {
                              this.setState({ short_code: e.target.value });
                            }}
                            value={this.state.short_code}
                          />
                        </div>
                      </div>

                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Product Code</label>
                          <input
                            type="text"
                            onChange={(e) => {
                              this.setState({ product_code: e.target.value });
                            }}
                            value={this.state.product_code}
                          />
                        </div>
                      </div>

                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Discount Applicable</label>
                          <RadioGroup
                            name="radioList"
                            inline={true}
                            onChange={(e) => {
                              this.setState({ discount_applicable: Number(e) });
                            }}
                            value={Number(this.state.discount_applicable)}
                          >
                            <Radio value={1}>Yes</Radio>
                            <Radio value={0}>No</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                     
                      {this.context.user.gstin !== null && (
                        <div className="col-lg-3">
                          <div className="form-group">
                            <label>G.S.T (%)</label>
                            <select
                              onChange={(e) => {
                                this.setState({ tax: e.target.value });
                              }}
                              value={this.state.tax}
                              className="select-container"
                            >
                              <option value="0">0</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                            {/* <input
                              type="text"
                              onChange={(e) => {
                                this.setState({ tax: e.target.value });
                              }}
                              value={this.state.tax}
                              className="form-control"
                            /> */}
                          {/* </div> */}
                        </div>
                      )}

<div className="col-lg-6">
                        <div className="form-group">
                          <label>Description </label>
                          <input
                            type="text"
                            onChange={(e) => {
                              this.setState({ description: e.target.value });
                            }}
                            value={this.state.description}
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="form-group">
                          <label> Product Image</label>
                          <div
                            className="image-upload"
                            style={{
                              width: '200px',
                              height: '200px',
                            }}
                          >
                            {this.state.images.length > 0 ? (
                              <></>
                            ) : (
                              <input
                                type={'file'}
                                accept=".png, .jpg, .jpeg,.svg,.webp"
                                className="upload"
                                onChange={(e) => {
                                  this.uploadImage(e);
                                }}
                                style={{
                                  width: '200px',
                                  height: '200px',
                                }}
                              />
                            )}

                            {this.state.images.length > 0 &&
                              this.state.images.map((item, index) => {
                                return (
                                  <img
                                    id="target"
                                    src={URL.createObjectURL(item)}
                                    style={{
                                      width: '200px',
                                      height: '200px',
                                    }}
                                    alt="img"
                                  />
                                );
                              })}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
                :
                this.state.active === "variants" ?
                <Variants
              
                navigate={this.props.navigate}
                
                handleChange={this.handleChange}
                handleAddRow={this.handleAddRow}
                handleRemoveSpecificRow={this.handleRemoveSpecificRow}
                rows={this.state.rows}
              />
              :
              <div>
              <h6>Add-on groups like beverages, toppings can be added to individual or all variants of a dish</h6>
              <br/>
              
                {
                this.state.rows.length > 0 &&
                this.state.rows.map((item, index) => {
                  var oj = [];
                  if(item.addons.length > 0){
                    item.addons.map((i, index) => {
                      oj.push(parseInt(i.group_id) )
                    })
                  }
                  return (
                    <div className='row'>
                    <div className="col-lg-3" key={index}>
                      <div style={{ marginTop: "10px",marginBottom: "10px",backgroundColor:'#f2f2f2',padding:'10px',borderRadius:'5px' }}>
                        {item.variants_name}
                      </div>
                    </div>
                    <div className="col-lg-3" key={index}>
                    <div style={{ marginTop: "10px",marginBottom: "10px",backgroundColor:'#f2f2f2',padding:'10px',borderRadius:'5px' }}>
                    <TagPicker data={this.state.nn} style={{ width: 300 }} 
                    defaultValue={oj}
                     onChange={(value) => this.updateAddon(value, index)}
                    />
                    </div>
                  </div>
                    <hr/>
                  </div>
                  );
                })}
            
             
            </div>
                }

              </div>
            ) : (
              <Variants
                product_id={this.state.product_id}
                navigate={this.props.navigate}
              />
            )}
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
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.add_category_loading ? (
                  <button
                    className="btn btn-secondary btn-sm  me-2"
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
                  <button
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm  me-2"
                  >
                    Add Category
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

class Variants extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    
  }
  render() {
    return (
      <>
        <div className="content">
         
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 d-flex align-items-center justify-content-between">
                  <h3 className="variant_addon_name_heading">Variants</h3>
                  {this.props.rows.length === 0 && (
                    <button
                      onClick={this.props.handleAddRow}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Add New Variant
                    </button>
                  )}
                </div>
              </div>
            {this.props.rows.length > 0 && (
                <div className="row mt-2">
                  <div className="col-mg-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Variant Name</th>
                                <th>Variant Price</th>
                                <th>Variant Code</th>
                                <th style={{ textAlign: 'end' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.props.rows.map((item, idx) => (
                                <tr id="addr0" key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>
                                    <input
                                      type="text"
                                      name="variants_name"
                                      value={this.props.rows[idx].variants_name}
                                      onChange={this.props.handleChange(idx)}
                                      className="form-control"
                                      required
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="variants_discounted_price"
                                      value={
                                        this.props.rows[idx]
                                          .variants_discounted_price
                                      }
                                      onChange={this.props.handleChange(idx)}
                                      className="form-control"
                                      required
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      name="variants_code"
                                      value={
                                        this.props.rows[idx]
                                          .variants_code
                                      }
                                      onChange={this.props.handleChange(idx)}
                                      className="form-control"
                                      required
                                    />
                                  </td>
                                  
                                  <td className="text-end">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={this.props.handleRemoveSpecificRow(
                                        idx
                                      )}
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={this.props.handleAddRow}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Add New Variant
                      </button>
                    </div>
                  </div>
                </div>
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
    <Addproduct
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;

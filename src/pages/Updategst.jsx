import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioGroup, ReversedRadioButton } from 'react-radio-buttons';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import Swal from 'sweetalert2';
import { Drawer, CheckPicker,Stack} from 'rsuite';
import { Modal } from 'react-responsive-modal';
const data = [
  'DineIn',
  'TakeAway',
  'Delivery',
  'QR Scan',
].map(item => ({ label: item, value: item }));

export class Updategst extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      gst_status: false,
      service_charge_status: false,
      gst_type: 'inclusive',
      gst_number: '',
      gst_percentage: '',
      service_charge_percentage: '',
      legal_business_name:'',
      submit_buttonLoading: false,
      add_charges: false,
      charge_name: '',
      charge_type: 'percentage',
      charge_value: '',
      charge_required:true,
      charge_area: [],
      charges:[],
      charge_tax:"0",
      charge_tax_type:"inclusive",
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    this.fetch_charges();
    this.setState({
      gst_type: this.context.user.gst_type,
      gst_number: this.context.user.gstin,
      gst_percentage: this.context.user.gst_percentage,
      service_charge_percentage: this.context.user.service_charge,
      legal_business_name: this.context.user.legal_business_name,
    });
    if (
      this.context.user.gst_percentage !== '' &&
      this.context.user.gst_type !== '' &&
      this.context.user.gstin !== ''
    ) {
      this.setState({ gst_status: true });
    }
    if (this.context.user.service_charge !== 0) {
      this.setState({ service_charge_status: true });
    }
  }

  save = () => {
    var gst_service_per_regex = /^[0-9\b]+$/;
    var gst_number_regex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (
      this.state.service_charge_percentage !== '' &&
      !gst_service_per_regex.test(this.state.service_charge_percentage)
    ) {
      toast.error('Invalid Service Charge Percentage');
      return;
    }
    // if gst_status is false, clear all gst inputs
    if (this.state.gst_status === false) {
      this.setState({
        gst_number: '',
        gst_percentage: '',
      });
    } else {
      if (this.state.gst_percentage === '' && this.state.gst_number === '') {
        toast.error('GST Number and GST Percentage is required');
        return;
      }
      if (
        this.state.gst_percentage !== '' &&
        !gst_service_per_regex.test(this.state.gst_percentage)
      ) {
        toast.error('Invalid GST Percentage');
        return;
      }
      if (
        this.state.gst_number !== '' &&
        !gst_number_regex.test(this.state.gst_number)
      ) {
        toast.error('Invalid GST Number');
        return;
      }
    }
    // if service_charge_status is false, clear all service_charge inputs
    if (this.state.service_charge_percentage === '') {
      this.setState({
        service_charge_percentage: '',
      });
      return;
    }

    if (this.state.legal_business_name === '') {
      toast.error('Legal Business Name is required');
      return;
    }

    this.setState({ submit_buttonLoading: true });
    fetch(api + 'update_other_charges_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        gstin: this.state.gst_number,
        gst_percentage: this.state.gst_percentage,
        gst_type: this.state.gst_type,
        legal_business_name: this.state.legal_business_name,
        service_charge: this.state.service_charge_percentage,
        charges: this.state.charges
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          toast.success(json.msg);
          this.context.get_vendor_profile(this.context.token);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ submit_buttonLoading: false });
      });
  };


  fetch_charges = () => {
    fetch(api + 'fetch_vendor_charges', {
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
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          
          this.setState({ charges: json.data });

        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  add_charges = () => {

    if(this.state.charge_name === '' || this.state.charge_type === '' || this.state.charge_value === ''){
      toast.error('All fields are required');
      return;
    }
    
    this.setState({is_buttonloding: true});

    fetch(api + 'add_vendor_charges', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        name: this.state.charge_name,
        type: this.state.charge_type,
        value: this.state.charge_value,
        required: this.state.charge_required,
        area: this.state.charge_area,
        charge_tax: this.state.charge_tax,
        charge_tax_type: this.state.charge_tax_type
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          toast.success(json.msg);
          this.fetch_charges();
          this.setState({add_charges: false, charge_name: '', charge_type: '', charge_value: '', charge_required: '', charge_area: [] });
          
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ submit_buttonLoading: false });
      });
  };


  render() {
    return (
      <>
        <Helmet>
          <title>Tax</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Tax & Charges</h4>
                </div>

                <div className="page-btn">
                  {this.state.submit_buttonLoading ? (
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
                      Saving...
                    </button>
                  ) : (
                    <>
                    <div className='d-flex align-items-center'>
                    <a
                      onClick={() => {
                        this.setState({
                          add_charges: true
                        })
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                     Add New Charge 
                    </a>
                    <a
                      onClick={() => {
                        Swal.fire({
                          title: 'Are you sure?',
                          text: 'You want to save changes?',
                          showCancelButton: true,
                          confirmButtonColor: '#0066b2',
                          cancelButtonColor: '#d33',
                          confirmButtonText:
                            'Yes, save it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.save();
                          }
                        });

                      
                      }}
                      className="btn btn-danger btn-sm me-2"
                    >
                      Save Changes
                    </a>

                  
                    
                    </div>
                    </>
                  )}
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.is_loading ? (
                <Loader />
              ) : (
                <>
                  <div
                    className="dashboard-status-card flex-column"
                    style={{
                      padding: '30px',
                    }}
                  >
                    <div className="row">
                      <div className="col-lg-12 d-flex align-items-center justify-content-between">
                        <h5>
                          <strong>GST</strong>
                        </h5>
                        <div className="status-toggle">
                          <input
                            type="checkbox"
                            id="gst"
                            className="dropdown-toggle nav-link align-items-center d-flex check"
                            checked={
                              this.state.gst_status === false ? false : true
                            }
                            onChange={(e) => {
                              // this.setState({ gst_status: e.target.checked });
                              if (e.target.checked) {
                                this.setState({
                                  gst_status: true,
                                  gst_number: '',
                                  gst_percentage: '',
                                  gst_type: 'inclusive',
                                });
                              } else {
                                this.setState({
                                  gst_status: false,
                                  gst_number: '',
                                  gst_percentage: '',
                                  gst_type: '',
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor="gst"
                            className="checktoggle-small"
                          ></label>
                        </div>
                      </div>
                    </div>
                    {this.state.gst_status === true && (
                      <>
                        <div className="row">
                          <div className="col-lg-5 mt-4">
                            <div className="form-group">
                              <label className="mb-3">
                                All product prices are{' '}
                                <span className="text-danger">*</span>
                              </label>
                              <RadioGroup
                                value={this.state.gst_type}
                                onChange={(e) => {
                                  this.setState({ gst_type: e });
                                }}
                                horizontal
                              >
                                <ReversedRadioButton
                                  value="inclusive"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Inclusive of tax
                                </ReversedRadioButton>
                                <ReversedRadioButton
                                  value="exclusive"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Exclusive of tax
                                </ReversedRadioButton>
                              </RadioGroup>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                        <div className="col-lg-6 col-sm-12">
                            <div className="form-group">
                              <label>
                                Legal Business Name
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Legal Business Name"
                                value={this.state.legal_business_name}
                                onChange={(e) => {
                                  this.setState({
                                    legal_business_name: e.target.value,
                                  });
                                }}
                                style={{
                                  textTransform: 'uppercase',
                                }}
                                // maxLength={15}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6 col-sm-12">
                            <div className="form-group">
                              <label>
                                GST Number{' '}
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="GST Number"
                                value={this.state.gst_number}
                                onChange={(e) => {
                                  this.setState({
                                    gst_number: e.target.value,
                                  });
                                }}
                                style={{
                                  textTransform: 'uppercase',
                                }}
                                maxLength={15}
                              />
                            </div>
                          </div>
                         
                        </div>
                      </>
                    )}
                  </div>

                  {
                    this.state.charges.length > 0 &&  
                    this.state.charges.map((item,index) => (
                      <>

<div
                    className="dashboard-status-card flex-column"
                    style={{
                      padding: '30px',
                    }}
                  >
                    <div className="row">
                      <div className="col-lg-12 d-flex align-items-center justify-content-between">
                        <h5>
                          <strong>{item.charge_name}</strong>
                        </h5>
                        <div className="status-toggle">
                          <input
                            type="checkbox"
                            id={index}
                            className="dropdown-toggle nav-link align-items-center d-flex check"
                            checked={
                              item.status === 'inactive' ? false : true
                            }
                            onChange={(e) => {
                              // this.setState({ gst_status: e.target.checked });
                              if (e.target.checked) {
                                var charges=this.state.charges;
                                charges[index].status='active'
                                this.setState({charges})
                              } else {
                                var charges=this.state.charges;
                                charges[index].status='inactive'
                                this.setState({charges})
                              }
                            }}
                          />
                          <label
                            htmlFor={index}
                            className="checktoggle-small"
                          ></label>
                        </div>
                      </div>
                    </div>
                    {this.state.gst_status === true && (
                      <>
                        <div className="row">
                          <div className="col-lg-5 mt-4">
                            <div className="form-group">
                              <label className="mb-3">
                                Charge Type{' '}
                                <span className="text-danger">*</span>
                              </label>
                              <RadioGroup
                                value={item.charge_type}
                                onChange={(e) => {
                                  var charges=this.state.charges
                                  charges[index].charge_type=e
                                  this.setState({charges})
                              
                                }}
                                horizontal
                              >
                                <ReversedRadioButton
                                  value="fixed"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Fixed
                                </ReversedRadioButton>
                                <ReversedRadioButton
                                  value="percentage"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Percentage
                                </ReversedRadioButton>
                              </RadioGroup>
                            </div>
                            </div>
                            <div className="col-lg-5 mt-4">
                              <div className="form-group">
                                <label className="mb-3">
                                  Charge Value{' '}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Charge Amount"
                                  value={item.charge_value}
                                  className='form-control'
                                  onChange={(e) => {
                                   var charages=this.state.charges
                                   charages[index].charge_value=e.target.value
                                   this.setState({charages})
                                  }}
                                />
                              </div>
                              </div>
                         
                        </div>
                        <div className="row">
                          <div className="col-lg-5 mt-4">
                            <div className="form-group">
                              <label className="mb-3">
                                Charge Tax{' '}
                                <span className="text-danger">*</span>
                              </label>
                              <RadioGroup
                                value={item.charge_tax_type}
                                onChange={(e) => {
                                  var charges=this.state.charges
                                  charges[index].charge_tax_type=e
                                  this.setState({charges})
                              
                                }}
                                horizontal
                              >
                                <ReversedRadioButton
                                  value="fixed"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Inclusive
                                </ReversedRadioButton>
                                <ReversedRadioButton
                                  value="percentage"
                                  pointColor="#0066b2"
                                  iconSize={20}
                                  rootColor="#1a181e"
                                  iconInnerSize={10}
                                  padding={10}
                                >
                                  Exclusive
                                </ReversedRadioButton>
                              </RadioGroup>
                            </div>
                            </div>
                            <div className="col-lg-5 mt-4">
                              <div className="form-group">
                                <label className="mb-3">
                                  Charge Tax{' '}
                                  <span className="text-danger">*</span>
                                </label>
                               <select
                                  className="form-control"
                                  value={item.charge_tax}
                                  onChange={(e) => {
                                    var charges=this.state.charges
                                    charges[index].charge_tax=e.target.value
                                    this.setState({charges})
                                  }}
                                >
                                  <option value="0">0%</option>
                                  <option value="5">5%</option>
                                  <option value="12">12%</option>
                                  <option value="18">18%</option>
                                  <option value="28">28%</option>
                                </select>
                              </div>
                              </div>
                         
                        </div>
                        <div className="row">
                        <div className="col-lg-6 col-sm-12">
                            <div className="form-group">
                              <label>
                               Charge Name
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Legal Business Name"
                                value={item.charge_name}
                                onChange={(e) => {
                                  var charges=this.state.charges
                                  charges[index].charge_name=e.target.value
                                  this.setState({charges})
                                }}
                                style={{
                                  textTransform: 'uppercase',
                                }}
                                // maxLength={15}
                              />
                            </div>
                          </div>

                          <div className="col-lg-6 col-sm-12">
                            <div className="form-group">
                              <label>
                                is required
                                <span className="text-danger">*</span>
                              </label>
                                <select
                                  className="form-control"
                                  value={item.is_required}
                                  onChange={(e) => {
                                    var charges=this.state.charges
                                    charges[index].is_required=e.target.value
                                    this.setState({charges});
                                  }}
                                >
                                  <option value="0">No</option>
                                  <option value="1">Yes</option>
                                </select>
                            </div>
                          </div>
                          <div className="col-lg-6 col-sm-12">
                            <div className="form-group">
                              <label>
                                Area
                                <span className="text-danger">*</span>
                              </label>
                          <Stack spacing={10} direction="column" alignItems="flex-start">
                                <CheckPicker
                                  data={data}
                                  searchable={false}
                                  style={{ width: 224 }}
                                  placeholder="Select Area"
                                  onChange={(e) => {
                                    var charges=this.state.charges
                                    charges[index].area=e;
                                    this.setState({charges});
                                  }}
                                  onClean={() => {
                                    var charges=this.state.charges
                                    charges[index].area=[];
                                    this.setState({charges});
                                  }}
                                defaultValue={item.area}
                                />
                       
                                </Stack>
                         </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                      </>
                    ))
                  }

               
                 
                </>
              )}
            </div>
          </div>
        </div>

        <Modal
          focusTrapped={false}
          open={this.state.add_charges}
          onClose={() => this.setState({add_charges: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Add Charges</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Name*</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ charge_name: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group">
                  <label>Type*</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ charge_type: e.target.value });
                    }}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>

              <div className='col-lg-12'>
                <div className="form-group">
                  <label>Value*</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ charge_value: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className='col-lg-12'>
                <div className="form-group">
                  <label>Charge Tax*</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ charge_tax: e.target.value });
                    }}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className='col-lg-12'>
                <div className="form-group">
                  <label>Charge Tax Type*</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ charge_tax_type: e.target.value });
                    }}
                  >
                    <option value="inclusive">Inclusive</option>
                    <option value="exclusive">Exclusive</option>
                  </select>
                </div>
              </div>


              <div className='col-lg-12'>
                <div className="form-group">
                  <label>Is Required*</label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      this.setState({ charge_required: e.target.value });
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className='col-lg-12'>
              <div className="form-group">
              <label>Area</label>
              <Stack spacing={10} direction="column" alignItems="flex-start">
                                <CheckPicker
                                  data={data}
                                  searchable={false}
                                  style={{ width: 224 }}
                                  placeholder="Select Area"
                                  onChange={(e) => {
                                      this.setState({charge_area:e})
                                    // const area=[];
                                    // e.map((item, index) => {
                                    //   area.push(item);
                                    // });
                                    // this.setState({ area: area });
                                    //  // this.onSelect(e,idx);
                                  }}
                                  onClean={() => {
                                    this.setState({ area: [] });
                                 //   this.onRemove('',idx);
                                  }}
                               //  defaultValue={this.state.rowsRaw[idx].area}
                                />
                       
                                </Stack>
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
                      
                      this.add_charges();
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

export default Updategst;

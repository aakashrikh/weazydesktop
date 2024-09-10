import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import React, { Component } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

const objectd = [
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Mon',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Tue',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Wed',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Thurs',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Fri',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Sat',
  },
  {
    status: true,
    open: '12:00 AM',
    close: '12:00 AM',
    day_name: 'Sun',
  },
];

export class SetupAccount extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      explosion: true,
      activeStep: 0,
      steps: [
        { label: 'Enter Business Details' },
        { label: 'Edit Business Timings' },
      ],
      timing: objectd,
      current_time: '',
      current_day: '',
      name: '',
      shop_name: '',
      description: '',
      business_contact: '',
      whatsapp_number: '',
      is_whatsapp_number: false,
      isLoading: false,
    };
  }

  vendor_registration = () => {
    if (
      this.state.name == '' ||
      this.state.shop_name == '' ||
      this.state.description == ''
    ) {
      toast.error('All fields are required !');
    } else if (this.state.shop_name == '') {
      toast.error('Enter your Shop name!');
    } else if (this.state.name == '') {
      toast.error('Enter your name!');
    } else if (this.state.description == '') {
      toast.error('Enter description for your shop!');
    } else {
      this.setState({ isloading: true });
      fetch(api + 'update_profile_vendor', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          // email: mail,
          name: this.state.name,
          shop_name: this.state.shop_name,
          description: this.state.description,
          whatsapp: this.state.whatsapp_number,
          business_contact: this.state.business_contact,
          // website: this.state.website,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            toast.error(json.errors[0]);
          } else {
            toast.success('Profile Updated Successfully !');
            fetch(api + 'get_vendor_profile', {
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
                if (json.message === 'Unauthenticated.') {
                  this.logout();
                }
                if (!json.status) {
                } else {
                  if (json.data[0].timings.length > 0) {
                    window.location.reload();
                  } else {
                    this.handleNext();
                  }
                }
                return json;
              });
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false });
        });
    }
  };

  update_vendor_timing = () => {
    this.setState({ isLoading: true });
    fetch(api + 'update_store_timing', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        days: this.state.timing,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Timings Updated Successfully !');
          // this.props.navigation.navigate('UploadLogo');
          window.location.reload();
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  handleNext = () => {
    this.setState((prevState) => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  render() {
    const { activeStep, steps } = this.state;
    const format = 'hh:mm A';
    return (
      <div className="content w-100">
        {this.state.explosion && (
          <div className="w-100 d-flex align-items-center justify-content-center">
            <ConfettiExplosion
              force={0.2}
              particleCount={100}
              floorHeight={100}
              floorWidth={100}
              floor={true}
              x={window.innerWidth / 2}
              y={window.innerHeight / 1.5}
              opacity={0.5}
              duration={3000}
              zIndex={999}
            />
          </div>
        )}
        <div className="d-flex align-items-center justify-content-center">
          <div className="card onboarding-card">
            <div
              className="card-body"
              style={{
                padding: '48px',
              }}
            >
              <div className="page-header">
                <div className="page-title">
                  <h4>Complete your store setup...</h4>
                  <h6 className="onboarding-text">
                    Use high quality images and product descriptions to have a
                    great looking product page. Let's get started.
                  </h6>
                </div>
              </div>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepIcon-text': {
                          fontWeight: 'bold',
                          fontSize: '1rem',
                        },
                        '& .MuiSvgIcon-root': {
                          height: '1.75rem',
                          width: '1.75rem',
                        },
                        '& .MuiSvgIcon-root.Mui-active': {
                          color: '#0066b2',
                        },
                        '& .MuiSvgIcon-root.Mui-completed': {
                          color: '#0066b2',
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent
                      sx={{
                        '& .MuiStepContent-root': {
                          marginLeft: '14px',
                        },
                        '& .MuiStepConnector-root': {
                          marginLeft: '14px',
                        },
                      }}
                    >
                      {index === 0 && (
                        <div className="form-group m-0">
                          <div className="row">
                            <div className="col-md-6 mb-2">
                              <label>Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                value={this.state.name}
                                onChange={(e) => {
                                  this.setState({
                                    name: e.target.value
                                      .replace(/[^a-zA-Z ]/g, '')
                                      .replace(/\s+/g, ' '),
                                  });
                                }}
                              />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label>Shop Name *</label>
                              <input
                                className="form-control"
                                placeholder="Shop Name"
                                value={this.state.shop_name}
                                onChange={(e) => {
                                  this.setState({
                                    shop_name: e.target.value
                                      .replace(/[^a-zA-Z ]/g, '')
                                      .replace(/\s+/g, ' '),
                                  });
                                }}
                              />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label>Shop Description *</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Shop Description"
                                value={this.state.description}
                                onChange={(e) => {
                                  this.setState({
                                    description: e.target.value
                                      .replace(/[^a-zA-Z ]/g, '')
                                      .replace(/\s+/g, ' '),
                                  });
                                }}
                              />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label>Business Contact (Optional)</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Business Contact"
                                maxLength="10"
                                value={this.state.business_contact}
                                onChange={(e) => {
                                  this.setState({
                                    business_contact: e.target.value
                                      .replace(/[^0-9]/g, '')
                                      .replace(/\s+/g, ' '),
                                  });
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-2">
                              <label>Whatsapp number (Optional) </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Whatsapp number"
                                maxLength="10"
                                value={this.state.whatsapp_number}
                                onChange={(e) => {
                                  this.setState({
                                    whatsapp_number: e.target.value
                                      .replace(/[^0-9]/g, '')
                                      .replace(/\s+/g, ' '),
                                  });
                                }}
                              />
                            </div>
                            <div className="col-md-12 mb-2">
                              {/* create a checkbox */}

                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id="flexCheckDefault"
                                  checked={this.state.is_whatsapp_number}
                                  onChange={(e) => {
                                    this.setState({
                                      is_whatsapp_number:
                                        !this.state.is_whatsapp_number,
                                    });
                                    if (e.target.checked) {
                                      this.setState({
                                        whatsapp_number:
                                          this.context.user.contact,
                                      });
                                    } else {
                                      this.setState({
                                        whatsapp_number: '',
                                      });
                                    }
                                  }}
                                />
                                <label
                                  className="form-check-label"
                                  for="flexCheckDefault"
                                >
                                  Is register number on your whatsapp number{' '}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="form-group">
                          {this.state.timing.map((item, index) => {
                            return (
                              <div className="col-md-12 d-flex align-items-center justify-content-between">
                                <div className="row w-100">
                                  <div className="col-md-5 status-toggle d-flex align-items-center justify-content-between">
                                    <span
                                      style={{
                                        fontSize: '14px',
                                      }}
                                    >
                                      {item.day_name === 'Sun'
                                        ? 'Sunday'
                                        : item.day_name === 'Mon'
                                        ? 'Monday'
                                        : item.day_name === 'Tue'
                                        ? 'Tuesday'
                                        : item.day_name === 'Wed'
                                        ? 'Wednesday'
                                        : item.day_name === 'Thurs'
                                        ? 'Thursday'
                                        : item.day_name === 'Fri'
                                        ? 'Friday'
                                        : item.day_name === 'Sat'
                                        ? 'Saturday'
                                        : ''}
                                    </span>
                                    <input
                                      type="checkbox"
                                      id={'day' + index}
                                      className="dropdown-toggle nav-link check"
                                      checked={item.status}
                                      onChange={(e) => {
                                        let timing = this.state.timing;
                                        timing[index].status =
                                          !timing[index].status;
                                        this.setState({ timing });
                                      }}
                                    />
                                    <label
                                      htmlFor={'day' + index}
                                      className="checktoggle-small m-0"
                                    ></label>
                                  </div>
                                  <div className="col-md-2" />
                                  {item.status ? (
                                    <div className="col-md-5 d-flex align-items-center justify-content-between">
                                      <div className="form-group me-3 mb-2">
                                        <label>From</label>
                                        <TimePicker
                                          onSelect={(time) => {
                                            let timing = this.state.timing;
                                            timing[index].open =
                                              time.format('hh:mm A');
                                            this.setState({ timing });
                                            console.log(timing);
                                          }}
                                          format={format}
                                          use12Hours
                                          value={dayjs(item.open, 'hh:mm A')}
                                        />
                                      </div>
                                      <div className="form-group mb-2">
                                        <label>To</label>
                                        <TimePicker
                                          onSelect={(time) => {
                                            let timing = this.state.timing;
                                            timing[index].close =
                                              time.format('hh:mm A');
                                            this.setState({ timing });
                                            console.log(timing);
                                          }}
                                          format={format}
                                          use12Hours
                                          value={dayjs(item.close, 'hh:mm A')}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="col-md-5 d-flex align-items-center justify-content-between"
                                      style={{
                                        height: '66px',
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="d-flex justify-content-end">
                        {index !== 0 ? (
                          <button
                            className="btn btn-secondary me-4"
                            onClick={() => {
                              window.location.reload();
                            }}
                          >
                            Skip
                          </button>
                        ) : null}
                        {this.state.isLoading ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              pointerEvents: 'none',
                              opacity: '0.8',
                            }}
                          >
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            ></span>
                            Saving...
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              if (index === 0) {
                                this.vendor_registration();
                              } else {
                                this.update_vendor_timing();
                              }
                            }}
                          >
                            {index === steps.length - 1 ? 'Finish' : 'Continue'}
                          </button>
                        )}
                      </div>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SetupAccount;

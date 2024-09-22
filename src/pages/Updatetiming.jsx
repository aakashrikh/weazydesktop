import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

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

export class Updatetiming extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      timing: objectd,
      submit_buttonLoading: false,
      is_loading: true,
    };
  }

  componentDidMount() {
    this.get_vendor_details();
  }

  get_vendor_details = async () => {
    await fetch(api + 'get_vendor_profile', {
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
        const obj = json.data[0].timings;
        const object = this.state.timing;
        if (obj.length > 0) {
          object.forEach((value2, id2) => {
            const matchingDay = obj.find(
              (value) => value.day_name === value2.day_name
            );

            if (matchingDay) {
              const op = '2016-05-02T' + matchingDay.open_timing;
              const cp = '2016-05-02T' + matchingDay.close_timing;

              object[id2] = {
                status: matchingDay.day_status === 1,
                open: moment(op).format('hh:mm A'),
                close: moment(cp).format('hh:mm A'),
                day_name: matchingDay.day_name,
              };
            } else {
              object[id2] = {
                status: false,
                open: '12:00 AM',
                close: '12:00 AM',
                day_name: value2.day_name,
              };
            }
          });
          this.setState({ timing: object });
        } else {
          this.setState({ timing: objectd });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

  update_vendor_timing = () => {
    this.setState({ submit_buttonLoading: true });
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
          this.get_vendor_details();
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ submit_buttonLoading: false });
      });
  };

  render() {
    const format = 'hh:mm A';
    return (
      <>
        <Helmet>
          <title>Store Timings</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Outlet Timings</h4>
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
                      Updating...
                    </button>
                  ) : (
                    <a
                      onClick={() => {
                        this.update_vendor_timing();
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Update  Timings
                    </a>
                  )}
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.is_loading ? (
                <Loader />
              ) : (
                <div
                  className="dashboard-status-card flex-column"
                  style={{
                    padding: '20px',
                  }}
                >
                  {this.state.timing.map((item, index) => {
                    return (
                      <div className="row" key={index}>
                        <div className="col-md-1"></div>
                        <div className="col-md-10 d-flex align-items-center justify-content-between">
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
                                  timing[index].status = !timing[index].status;
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
                                <div className="form-group mb-2">
                                  <label>From</label>
                                  <TimePicker
                                    onSelect={(time) => {
                                      let timing = this.state.timing;
                                      timing[index].open =
                                        time.format('hh:mm A');
                                      this.setState({ timing });
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
                        <div className="col-md-1"></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Updatetiming;

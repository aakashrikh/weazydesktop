import moment from 'moment';
import React, { Component } from 'react';
import { Menu, MenuItem, Sidebar } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Drawer,SelectPicker } from 'rsuite';
import { toast } from 'sonner';
import {
  api,
  billingToolKey,
  environment,
  marketingToolLink,
  version,
} from '../../config';
import { AuthContext } from '../AuthContextProvider';
import logo_black from '../assets/images/logos/favicon.png';
import logo_black_full from '../assets/images/logos/main_logo_black.png';
import main_logo_black1 from '../assets/images/logos/main_logo_black1.png';
import no_notifications from '../assets/images/no_notifications.webp';
import billing from '../assets/images/tool_icons/billing.png';
import marketing from '../assets/images/tool_icons/marketing.png';
import Loader from './Loader';
import Swal from 'sweetalert2';

export class Header extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      data: [],
      dropdown: false,
      is_loading: true,
      next_page: '',
      total_count: '',
      remove_last_slash_and_word: '',
      shop_status: 1,
      role: '',
      activeTab: '',
      sidebarOpen: false,
      notificationLoader: true,
      mainSidebarOpen: false,
    };
  }

  componentDidMount() {
    var remove_last_slash_and_word = api
      .split('/')
      .slice(0, -2)
      .join('/')
      .concat('/');
    this.setState({
      remove_last_slash_and_word: remove_last_slash_and_word,
      shop_status: this.context.user.shop_open,
      role: this.context.role.staff_role,
    });
    var fullUrl = window.location.href;
    const urlObject = new URL(fullUrl);
    const baseUrl = `${urlObject.protocol}//${urlObject.host}/`;

    // as soon as the page scrolls to 30px, the header will have a class of "sticky"
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        document.querySelector('.header').classList.add('sticky');
      } else {
        document.querySelector('.header').classList.remove('sticky');
      }
    });
  }

  setActiveTab = (pathname) => {
    this.setState({
      activeTab: pathname,
    });
  };

  logOut = () => {
    fetch(api + 'logout_vendor', {
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
        toast.success('Logged out successfully');
        this.context.logout();
        if(this.context.isElectron())
        {
          this.props.navigate('/loginpassword', { replace: true });
        }
        else
        {
          this.props.navigate('/login', { replace: true });
        }
       
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  fetch_notifications = (page) => {
    this.setState({ page: page, load_more: true });
    fetch(api + 'fetch_vendor_notification', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({
            data: this.state.data.concat(json.data.data),
            next_page: json.data.next_page_url,
            total_count: json.data.total_count,
            load_more: false,
          });
        } else {
          this.setState({ next_page_url: null });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.setState({ notificationLoader: false });
      });
  };

  update_shop_status = (e) => {
    this.setState({ shop_status: e.target.checked ? 1 : 0 });
    fetch(api + 'update_shop_status', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        shop_status: e.target.checked ? 1 : 0,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.context.get_vendor_profile(this.context.token);
          if (e.target.checked == true) {
            toast.success('You are now open for business!');
          } else {
            toast.error('You are now closed for business!');
          }
        } else {
          toast.error(json.msg);
          this.setState({ shop_status: this.context.user.shop_open });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  toggleSidebar = () => {
    if (this.state.sidebarOpen) {
      this.setState({ sidebarOpen: false });
    } else {
      this.setState({ sidebarOpen: true });
    }
  };

  updateData = () => {
    this.setState({ page: this.state.page + 1 });
    this.fetch_notifications(this.state.page + 1);
  };

   change_location = (e)=>
   {
    fetch(api + 'switch_store', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        store_id: e
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.msg === 'ok') {

          var steps = 'done';
          const data = {
            token: json.token,
            vendor_id: json.usr,
            step: 'done',
          };
          localStorage.setItem('@auth_login', JSON.stringify(data));
          window.location.reload();
          toast.success('You are now in this store!');
        } else {
          toast.error(json.msg);
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  }
   

  render() {
    const themes = {
      sidebar: {
        backgroundColor: '#fff',
        color: '#000',
      },
      menu: {
        menuContent: '#082440',
        icon: '#59d0ff',
        hover: {
          backgroundColor: '#13395e',
          color: '#b6c8d9',
        },
        active: {
          backgroundColor: '#13395e',
          color: '#b6c8d9',
        },
        disabled: {
          color: '#3e5e7e',
        },
      },
    };

    const menuItemStyles = {
      root: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#000',
      },
      icon: {
        fontSize: '13px',
        marginRight: '0px',
      },
      SubMenuExpandIcon: {
        color: '#000',
      },
      subMenuContent: {
        backgroundColor: '#fff',
      },
      label: ({ open }) => ({
        fontWeight: open ? 700 : undefined,
      }),
    };

    const data = this.context.role.stores.map((item, index) => (
      
      {
      label: item.shop_name == null ? 'N/A' : item.shop_name + ' - ' + item.area,
      value: item.vendor_uu_id,
    }));


    return (
      <>
        <div className="header w-100">
          <div className="header-left border-0 w-3 d-flex justify-content-start">
            <div className="logo">
            {
              this.context.is_enterprise == true?
              <Link to="/">
                <img
                  src={main_logo_black1 }
                  alt="img"
                  style={{
                    width: '110px',
                  }}
                />
              </Link>:
             <Link to="/">
                <img
                  src={logo_black_full}
                  alt="img"
                  style={{
                    width: '110px',
                  }}
                />
              </Link>
              }
             
            </div>
            &nbsp;
            {/* {
              this.context.user.profile_pic != '' &&
              <div className="logo" style={{borderLeft: '1px solid #ecece',paddingLeft: '10px',marginLeft: '10px'}}>
                <Link to="/">
                  <img
                    src={this.context.user.profile_pic}
                    alt="img"
                    style={{
                      width: '95px',
                      
                    }}
                  />
                </Link>
              </div>
            } */}
            
          </div>
          <a
            id="mobile_btn"
            className="mobile_btn"
            onClick={() => {
              document
                .getElementById('sidebar1')
                .classList.toggle('mobile_sidebar_opened');
            }}
          >
            <span className="bar-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </a>
          <ul className="nav user-menu w-9 d-flex justify-content-end">
          {
                this.context.role.stores.length>1 && <li className="nav-item dropdown has-arrow main-drop">
          
            <SelectPicker
                                data={data}
                                cleanable={false}
                                placeholder="Choose Location"
                                onChange={(e) => {
                                  this.change_location(e);
                                }}
                                style={{
                                  width: '100%',
                                  borderColor: 'rgba(145, 158, 171, 0.32)',
                                }}
                                value={this.context.user.vendor_uu_id}
                              />

            </li>
          }


            {/* <li className="nav-item dropdown">
              <a
                className="dropdown-toggle nav-link"
                onClick={() => {
                  document.documentElement.requestFullscreen()
                    ? document.exitFullscreen()
                    : document.documentElement.requestFullscreen();
                }}
              >
                <i className="fa-solid fa-expand"></i>
              </a>
            </li> */}

            <li className="nav-item dropdown has-arrow main-drop">
              <a
                href="return false;"
                className="dropdown-toggle nav-link userset"
                data-bs-toggle="dropdown"
              >
                <i className="fa-solid fa-headset"></i>
              </a>
              <div className="dropdown-menu menu-drop-user">
                <div className="profilename">
                  <p className="p-2">
                    +91 7060-222-517 (Mon - Sat)
                    <br /> (9am to 8pm)
                  </p>
                </div>
              </div>
            </li>

            <li className="nav-item dropdown">
              <a
                onClick={() => {
                  this.toggleSidebar();
                }}
              >
                <i className="fa-solid fa-bell"></i>
              </a>
            </li>

            <li className="nav-item dropdown">
              <a
                href={
                  this.state.remove_last_slash_and_word +
                  'qr-shop/' +
                  this.context.user.id
                }
                target="_blank"
              >
                <i className="fa-solid fa-qrcode"></i>
              </a>
            </li>

            <li className="nav-item dropdown has-arrow main-drop">
              <a
                href="return false;"
                className="dropdown-toggle nav-link userset"
                data-bs-toggle="dropdown"
                onClick={() => {
                  this.setState({ mainSidebarOpen: true });
                }}
              >
                <span className="user-img">
                  <i className="fa-solid fa-shop"></i>

                  <span
                    className={
                      this.context.user.shop_open === 1
                        ? 'status online'
                        : 'status offline'
                    }
                  />
                </span>
              </a>
            </li>
          </ul>
        </div>
        {/* Menu sidebar */}
        {this.props.sidebar !== false && (
          <>
            <div className="sidebar1" id="sidebar1">
              <div className="sidebar-inner slimscroll">
                <div id="sidebar-menu" className="sidebar-menu">
                  {/* <div className="sidebar_logo_main_div">
                    <img
                      src={logo_black}
                      className="logo sidebar_logo"
                      alt="img"
                    />
                  </div> */}
                  <Sidebar
                    id="sidebar12"
                    width={'100%'}
                    collapsedWidth={'200px'}
                    overflow="scroll"
                    backgroundColor={themes.sidebar.backgroundColor}
                    rootStyles={{
                      color: themes.sidebar.color,
                      '&:active': {
                        color: themes.sidebar.color,
                        backgroundColor: themes.sidebar.backgroundColor,
                      },
                    }}
                    activeTab={this.state.activeTab}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <Menu menuItemStyles={menuItemStyles}>
                        {/* Home */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/" />}
                            active={window.location.pathname === '/'}
                            icon={
                              <i className="iconly-Home icli sidebar_icons"></i>
                            }
                          >
                            <span>Home</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}
                        {/* pos */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/pos" />}
                            icon={
                              <i className="iconly-Info-Square icli sidebar_icons"></i>
                            }
                          >
                            <span>Billing</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}
                        {/* orders */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role == 'staff' ? (
                          <MenuItem
                            component={<Link to="/insights" />}
                            icon={
                              <i className="iconly-Chart icli sidebar_icons"></i>
                            }
                          >
                            <span>Insights</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}
                        {/* orders */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/orderlist" />}
                            icon={
                              <i className="iconly-Buy icli sidebar_icons"></i>
                            }
                          >
                            <span>Orders</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}

                        {/* catalogue */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/productlist" />}
                            icon={
                              <i className="iconly-Category icli sidebar_icons"></i>
                            }
                          >
                            <span>Catalogue</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}
                        {/* inventory */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/inventoryproducts" />}
                            icon={
                              <i className="iconly-Activity icli sidebar_icons"></i>
                            }
                          >
                            <span>Inventory</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}

{this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/expense" />}
                            icon={
                              <i className="iconly-Graph icli sidebar_icons"></i>
                            }
                          >
                            <span>Finance</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}

                        {/* reports */}

                        <MenuItem
                          component={<Link to="/myreport" />}
                          icon={
                            <i className="iconly-Graph icli sidebar_icons"></i>
                          }
                        >
                          <span>Reports</span>
                        </MenuItem>

                        {/* my_report */}


                        {/* customers */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/customers" />}
                            icon={
                              <i className="iconly-User3 icli sidebar_icons"></i>
                            }
                          >
                            <span>Customers</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}


                        {/* marketing */}
                        {/* {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/crmcampaigns" />}
                            icon={
                              <i className="iconly-Ticket icli sidebar_icons"></i>
                            }
                          >
                            <span>Campaigns</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )} */}
                        {/* offers */}
                        {/* {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/offers" />}
                            icon={
                              <i className="iconly-Bag icli sidebar_icons"></i>
                            }
                          >
                            <span>Offers</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )} */}

                        {/* {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/loyalty" />}
                            icon={
                              <i className="iconly-Wallet icli sidebar_icons"></i>
                            }
                          >
                            <span>Loyalty</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )} */}

                        {/* {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/customerfeedback" />}
                            icon={
                              <i className="iconly-Heart icli sidebar_icons"></i>
                            }
                          >
                            <span>Feedback</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )} */}

                        {/* setup */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        !this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/dineinlisting" />}
                            icon={
                              <i className="iconly-Setting icli sidebar_icons"></i>
                            }
                          >
                            <span>Setup</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}

                        {/* room management */}
                        {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        !this.context.role.staff_role === 'manager' ||
                        !this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/kot" />}
                            icon={
                              <i className="iconly-Paper icli sidebar_icons"></i>
                            }
                          >
                            <span>KDS</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )}

                        {/* learning center */}
                        {/* {this.context.role.staff_role === 'owner' ||
                        this.context.role.staff_role === 'admin' ||
                        this.context.role.staff_role === 'manager' ||
                        this.context.role.staff_role === 'staff' ? (
                          <MenuItem
                            component={<Link to="/ourservices" />}
                            icon={
                              <i className="iconly-Message icli sidebar_icons"></i>
                            }
                          >
                            <span>Our Services</span>
                          </MenuItem>
                        ) : (
                          <></>
                        )} */}
                      </Menu>
                    </div>
                  </Sidebar>
                </div>
              </div>
            </div>
            {environment === 'development' && (
              <div className="beta-prod-footer">
                BETA-Development Environment
              </div>
            )}
            <div className="footer_bottom_version">Version - {`${version}`}</div>
            {this.context.user.subscription_expire < 15 ? (
              <div className="footer_bottom">
                <Link to="/subscription">
                  <p>
                    Subscription Expires in:{' '}
                    <strong>
                      {this.context.user.subscription_expire} Day
                      {this.context.user.subscription_expire > 1 ? 's' : ''}
                    </strong>
                  </p>
                </Link>
              </div>
            ) : null}
          </>
        )}
        {/* Notification sidebar */}
        <Drawer
          size="xs"
          placement="right"
          open={this.state.sidebarOpen}
          onClose={() => this.setState({ sidebarOpen: false })}
          onOpen={() => this.fetch_notifications(1)}
        >
          <Drawer.Header>
            <Drawer.Title>Notifications</Drawer.Title>
          </Drawer.Header>
          {this.state.notificationLoader ? (
            <Loader />
          ) : (
            <Drawer.Body
              style={{
                padding: '0px',
              }}
            >
              {this.state.data.length === 0 ? (
                <div className="notification-message">
                  <div className="media d-flex">
                    <div className="media-body flex-grow-1">
                      <p className="noti-details">
                        <img
                          src={no_notifications}
                          alt="img"
                          style={{
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {this.state.data.map((item, index) => {
                    return (
                      <div className="notification-message" key={index}>
                        <Link to={item.notification_url}>
                          <div className="media d-flex">
                            <div className="media-body flex-grow-1">
                              <p className="noti-details">
                                {item.notification_title}
                              </p>
                              {item.notification_description == null && (
                                <p>{item.notification_description}</p>
                              )}
                              <p className="noti-time">
                                <span className="notification-time">
                                  {moment(item.created_at).fromNow()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                  {this.state.next_page !== null &&
                    (this.state.load_more ? (
                      <div className="align-center mb-3">
                        <button
                          className="btn btn-secondary btn-sm px-5"
                          disabled
                          style={{
                            pointerEvents: 'none',
                            opacity: '0.8',
                          }}
                        >
                          Loading...
                          <span
                            className="spinner-border spinner-border-sm ms-2"
                            role="status"
                          ></span>
                        </button>
                      </div>
                    ) : (
                      <div className="align-center mb-3">
                        <button
                          className="btn btn-secondary btn-sm px-5"
                          onClick={() => this.updateData()}
                        >
                          Load More
                        </button>
                      </div>
                    ))}
                </>
              )}
            </Drawer.Body>
          )}
        </Drawer>
        {/* Main sidebar */}
        <Drawer
          size="xs"
          placement="right"
          open={this.state.mainSidebarOpen}
          onClose={() => this.setState({ mainSidebarOpen: false })}
          closeButton={false}
        >
          <Drawer.Header>
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="w-80 media pe-2">
                <div className="media-body">
                  <h6>
                    <Link to="/editprofile">
                      <strong>{this.context.user.shop_name}</strong>
                    </Link>
                  </h6>

                  <h6 style={{ fontSize: '14px' }}>Hii {this.context.role.staff_name} </h6>
                  <p>+91 {this.context.role.staff_contact}</p>
                </div>
              </div>
              <div className="w-20 d-flex align-items-center">
                <img
                  src={
                    this.context.user.profile_pic !== null
                      ? logo_black
                      : this.context.user.profile_pic
                  }
                  alt="img"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                  }}
                />
              </div>
            </div>
          </Drawer.Header>
          <Drawer.Body
            style={{
              padding: '10px',
            }}
          >
            {this.context.role.staff_role !== 'staff' ? (
              <div className="main_drawer_navigation">
                <h5 className="heading">Store Status</h5>
                <div className="main_card">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="media-body">
                      <h6 className="mb-0">
                        {this.state.shop_status === 1 ? (
                          <span className="text-success shop_status_text">
                            Open for Business
                          </span>
                        ) : (
                          <span className="text-danger shop_status_text">
                            Closed for Business
                          </span>
                        )}
                      </h6>
                    </div>
                    <div className="status-toggle ml-3 d-flex align-items-center">
                      <input
                        type="checkbox"
                        id="live_inventory"
                        className="dropdown-toggle nav-link align-items-center d-flex check"
                        checked={this.state.shop_status === 1 ? true : false}
                        onChange={(e) => {
                          // Swal.fire({
                          //   title: 'Are you sure?',
                          //   text: 'You want to change the status?',
                          //   showCancelButton: true,
                          //   confirmButtonColor: '#3085d6',
                          //   cancelButtonColor: '#d33',
                          //   confirmButtonText: 'Yes, change it!',
                          // }).then((result) => {
                          //   if (result.isConfirmed) {
                          //     this.update_shop_status(e);
                          //   }
                          // });

                          this.update_shop_status(e);
                        }}
                      />
                      <label
                        htmlFor="live_inventory"
                        className="checktoggle-small"
                      ></label>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {
              this.context.role.staff_role !== 'staff' &&
            <div className="main_drawer_navigation mt-3">
              <h5 className="heading">Our Products</h5>
              <div className="row">
              <div className="col-md-6">
                  <Link to={billingToolKey} target="_blank">
                    <div className={'main_card_product active'}>
                      <img src={billing} alt="img" />
                      <h6 className="mb-0">Weazy Billing</h6>
                    </div>
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link to={marketingToolLink} target="_blank">
                    <div className={'main_card_product '}>
                      <img src={marketing} alt="img" />
                      <h6 className="mb-0">Weazy Marketing</h6>
                    </div>
                  </Link>
                </div>
              
              </div>
            </div>
          }
            <div className="main_drawer_navigation signout">
              <h5 className="heading">Account</h5>
              <div
                className="main_card"
                onClick={() => {
                  this.logOut();
                }}
              >
                <h6 className="mb-0">
                  <span className="text-danger shop_status_text text-center">
                    Sign Out
                  </span>
                </h6>
              </div>
            </div>
          </Drawer.Body>
        </Drawer>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Header {...props} {...useParams()} navigate={abcd} location={location} />
  );
}

export default (props) => <Navigate {...props} />;

import Timer from 'otp-timer';
import { Component } from 'react';
import { Helmet } from 'react-helmet';
import OtpInput from 'react-otp-input';
import { useLocation, useNavigate, useParams,Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import logo from '../assets/images/logos/main_logo_black2.png';
import welcome from '../assets/images/welcome.svg';
class Login extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      otp: '',
      otpButton: false,
      heading: 'Get Started',
      subheading: 'Continue to WeazyDine Dashboard',
      sendotploading: false,
      verifyotploading: false,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  mobileVerify = () => {
    this.setState({ sendotploading: true, isLoading: true });
    var phoneNumber = this.state.phoneNumber;
    let rjx = /^[0]?[6789]\d{9}$/;
    let isValid = rjx.test(phoneNumber);
    if (!isValid) {
      toast.error('Please enter valid mobile number');
      this.setState({ sendotploading: false, isLoading: false });
    } else {
      fetch(api + 'staff-mobile-verification', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: phoneNumber,
          verification_type: 'vendor',
          request_type: 'send',
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.msg === 'ok') {
            // this.resend();
            this.setState({
              otpButton: true,
              heading: 'Verify OTP',
              subheading: 'Please enter the OTP sent to your mobile number',
            });
            toast.success('OTP sent successfully');
          } else {
            toast.error(json.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ sendotploading: false, isLoading: false });
        });
    }
  };

  otpVerification = async (otp) => {
    this.setState({ verifyotploading: true });
    if (otp === '') {
      toast.error('OTP is required');
      this.setState({ verifyotploading: false });
    } else {
      const response = await fetch(api + 'staff-otp-verification', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: this.state.phoneNumber,
          otp: otp,
          verification_type: 'vendor',
        }),
      });

try{
      const json = await response.json();

          if (json.msg === 'ok') {
            toast.success('OTP verified successfully');
            let data; 
            if (json.user_type == 'login') {
              var steps = 'done';
              data = {
                token: json.token,
                vendor_id: json.usr,
                step: 'done',
              };
            
            } else {
              var steps = 'steps';
              data = {
                token: json.token,
                vendor_id: json.usr,
                step: 'steps',
              };
             
            }

              json.data.token=json.token;

              if(this.context.isElectron())
              {
                const response = await window.electron.saveCredentials('AUTHMAIN', json.data);
                if (response.status === 'success') {
                  // alert('Credentials saved successfully!');
                  } else {
                   console.log(response.error);
                 }
              }
              else
              {
                localStorage.setItem('@auth_login', JSON.stringify(data));
              }
  
            //redirect to dashboard
            window.location.href = '/';
            // this.context.login(steps, json.data, json.user, json.token);
            // const path = this.props.location.state?.path || '/';
            // this.props.navigate(path, { replace: true });
          } else {
            toast.error(json.error);
            this.setState({
              otp: '',
            });
          }
        }
        catch(error)  {
          console.error(error);
        }
        finally {
          this.setState({ verifyotploading: false });
        }
    }
  };



  resendOtp = () => {
    fetch(api + 'staff-mobile-verification', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: this.state.phoneNumber,
        verification_type: 'vendor',
        request_type: 'resend',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.msg === 'ok') {
          toast.success('OTP Resend successfully');
          this.setState({
            otp: '',
          });
        } else {
          toast.error(json.msg);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  revealOtp = () => {
    var x = document.getElementById('pass');
    if (x.type === 'password') {
      x.type = 'text';
    } else {
      x.type = 'password';
    }
  };
  render() {
    return (
      <>
        <Helmet>
          <title>Login - Weazy Billing</title>
        </Helmet>
        <div className="main-wrapper">
          <div className="account-content">
            <div className="login-wrapper">
              <div className="login-img">
                <h1>We're holding the door for you!</h1>
                <h3>
                  Login now and manage all your Weazy Billing services with
                  ease.
                </h3>
              </div>

              <div className="login-content">
                <div className="login-userset">
                  <div className="login-logo">
                    <img
                      src={logo}
                      alt="img"
                      style={{
                        maxWidth: '60%',
                        margin: '0px auto 10px',
                      }}
                    />
                  </div>

                  {this.state.otpButton ? (
                    <>
                      <div className="login-userheading">
                        <h2 className="mb-1">{this.state.heading}</h2>
                        <h5>{this.state.subheading}</h5>
                      </div>

                      <p
                        onClick={() => {
                          this.setState({
                            heading: 'Log in',
                            subheading: 'Continue to WeazyDine Dashboard',
                            otpButton: false,
                            otp: '',
                          });
                        }}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginTop: -20,
                        }}
                      >
                        <i className="fa fa-edit" />{' '}
                        <span>{this.state.phoneNumber}</span>
                      </p>
                      <div className="form-login">
                        <div className="pass-group d-flex justify-content-center my-3">
                          <OtpInput
                            value={this.state.otp}
                            onChange={(otp) => {
                              this.setState({ otp: otp });
                              if (otp.length === 6) {
                                this.otpVerification(otp);
                              }
                            }}
                            renderInput={(props) => (
                              <input
                                {...props}
                                placeholder="#"
                                readOnly={this.state.verifyotploading}
                              />
                            )}
                            numInputs={6}
                            renderSeparator={<span>-</span>}
                            shouldAutoFocus={true}
                            inputStyle={{
                              width: '3rem',
                              height: '3rem',
                              marginRight: '0.5rem',
                              marginLeft: '0.5rem',
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-login">
                        {this.state.verifyotploading ? (
                          <button className="btn btn-login" disabled="">
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Verifying OTP
                          </button>
                        ) : (
                          <div
                            className="btn btn-login"
                            onClick={() => {
                              this.otpVerification(this.state.otp);
                            }}
                          >
                            Verify & Login to Weazy
                          </div>
                        )}
                      </div>
                      <Timer
                        seconds={30}
                        minutes={0}
                        resend={() => this.resendOtp()}
                        text={'Resend OTP in'}
                        buttonColor={'#0066b2'}
                        background={'#fff'}
                        ButtonText={"Didn't get the code? Resend OTP"}
                      />
                    </>
                  ) : (
                    <>
                      <div className="top-welcome-card">
                        <img
                          src={welcome}
                          alt="img"
                          style={{ width: 90, height: 90, marginTop: '-10px' }}
                        />
                        <div>
                          <h6
                            className="sb-typography sb-typography--heading-lg sb-typography--semibold "
                            style={{ fontSize: '16px' }}
                          >
                            Welcome! <br />
                            Happy to serve you.
                            <br />
                            <small style={{ fontSize: '12px' }}>
                              Continue to WeazyDine Dashboard
                            </small>
                          </h6>
                        </div>
                      </div>

                      <div className="form-login">
                        <label>Mobile Number</label>
                        <div className="form-addons">
                          <input
                            type="tel"
                            placeholder="Enter your mobile number"
                            maxLength={10}
                            value={this.state.phoneNumber}
                            onChange={(e) =>
                              this.setState({
                                phoneNumber: e.target.value,
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                this.mobileVerify();
                              }
                            }}
                          />
                          <i
                            className="iconly-Calling icli"
                            style={{
                              fontSize: 25,
                              position: 'absolute',
                              right: 8,
                              top: 8,
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-login">
                        {this.state.sendotploading ? (
                          <button className="btn btn-login" disabled="">
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Continue
                          </button>
                        ) : (
                          <>
                          <div
                            className="btn btn-sm btn-login"
                            onClick={() => {
                              this.mobileVerify();
                            }}
                          >
                            Send OTP
                          </div>
                            {this.context.isElectron() && <Link to="/loginpassword">
                            <br/> <p
                              className="forgot-password"
                              style={{ cursor: 'pointer',fontWeight:'500',textAlign:'center',color:'#0066b2' }}
                            >
                              Login with  Password instead
                            </p>
                            </Link>}
                            
                          </>
                          

                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
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
    <Login {...props} {...useParams()} navigate={abcd} location={location} />
  );
}

export default (props) => <Navigate {...props} />;

import React, { Component } from 'react';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContextProvider';
import pos_logo from '../assets/images/logos/main_logo_black.png';

export class Header extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  render() {
    return (
      <div
        className="header w-100 "
        style={{
          position: 'inherit',
        }}
      >
        <div
          className="header-left border-0 w-3 d-flex justify-content-start p-0"
          style={{ marginLeft: '10px' }}
        >
          <div className="logo">
            <Link to="/">
              <img
                src={pos_logo}
                alt="img"
                style={{
                  width: '90px',
                }}
              />
            </Link>
          </div>
        </div>

        <ul
          className="nav user-menu d-flex justify-content-end pe-0"
          style={{
            width: '40%',
          }}
        >
          <RadioGroup
            value={this.props.order_method}
            onChange={(e) => {
              this.props.update_order_method(e);
            }}
            horizontal
          >
            <RadioButton
              value="TakeAway"
              pointColor="#619DD1"
              iconSize={20}
              rootColor="#37474f"
              iconInnerSize={10}
              padding={5}
            >
              TakeAway
            </RadioButton>
            <RadioButton
              value="Delivery"
              pointColor="#619DD1"
              iconSize={20}
              rootColor="#37474f"
              iconInnerSize={10}
              padding={5}
            >
              Delivery
            </RadioButton>

            <RadioButton
              value="DineIn"
              pointColor="#619DD1"
              iconSize={20}
              rootColor="#37474f"
              iconInnerSize={10}
              padding={5}
            >
              DineIn
            </RadioButton>
          </RadioGroup>
        </ul>
      </div>
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

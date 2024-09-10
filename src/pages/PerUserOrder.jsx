import moment from 'moment';
import React, { Component } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Drawer } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no_orders.webp';
import Loader from '../othercomponent/Loader';
import OrdersTable from '../othercomponent/OrdersTable';

class PerUserOrder extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      is_loading: false,
      load_data: false,
      page: 1,
      value: [new Date(), new Date()],
      start_date: new Date(),
      end_date: new Date(),
      user_data: [],
      last_order_date: '',
      avg_order: 0,
      user_uu_id: this.props.id,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  fetch_order = (page_id, status, id) => {
    fetch(api + 'get_order_user', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        user_uu_id: this.props.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
              is_loading: false,
              user_data: [],
              last_order_date: '',
            });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
            user_data: json.user,
          });
          if (page_id == 1) {
            this.setState({
              data: json.data.data,
              last_order_date: moment(json.data.data[0].created_at).format(
                'lll'
              ),
              avg_order: json.avg_order,
            });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    data: [...this.state.data, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    data: json.data.data,
                  });
            }
          }
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  render() {
    return (
      <Drawer
        open={this.props.openPerUserOrder}
        size="full"
        placement="right"
        onClose={() => this.props.onClose()}
        onOpen={() => {
          this.fetch_order(1, '', this.props.id);
          this.setState({ is_loading: true });
        }}
      >
        {!this.state.is_loading ? (
          <>
            <Drawer.Header>
              <Drawer.Title>
                Order Details for :{' '}
                <span
                  style={{
                    textTransform: 'capitalize',
                  }}
                >
                  {this.state.user_data.name}{' '}
                </span>
                <span
                  className="text-muted"
                  style={{
                    fontSize: '14px',
                  }}
                >
                  {/* (******{this.state.user_data.contact.slice(-4)}) */}(
                  {this.state.user_data.contact})
                </span>
              </Drawer.Title>
              <Drawer.Actions>
                <h5>Avg. Order : ₹ {this.state.avg_order.toFixed(2)}</h5>
                <h6>
                  Last order was {moment(this.state.last_order_date).fromNow()}
                </h6>
              </Drawer.Actions>
            </Drawer.Header>
            <Drawer.Body>
              <div className="content">
                <div className="card">
                  {this.state.data.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <OrdersTable
                          fetch_order={this.fetch_order}
                          next_page={this.state.next_page}
                          page={this.state.page}
                          status={this.state.status}
                          data={this.state.data}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="page-wrapper">
                      <div
                        className="content"
                        style={{
                          height: '60vh',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'column',
                          margin: '40px 0',
                        }}
                      >
                        <img src={no_order} alt="img" />
                        <h5>
                          Sorry, Sorry, we couldn't find any records at this
                          moment.{' '}
                        </h5>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Drawer.Body>
          </>
        ) : (
          <Loader />
        )}
      </Drawer>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  return <PerUserOrder {...props} {...useParams()} navigate={abcd} />;
}

export default Navigate;

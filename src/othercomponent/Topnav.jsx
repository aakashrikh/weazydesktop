import moment from 'moment';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

const from = moment(new Date()).format('YYYY-MM-DD');
const to = moment(new Date()).format('YYYY-MM-DD');

const catalogue = [
  {
    id: 1,
    name: 'Product List',
    link: 'productlist',
  },
  {
    id: 2,
    name: 'Category List',
    link: 'categorylist',
  },
  {
    id: 3,
    name: 'Product Addons',
    link: 'productaddons',
  },

];

const inventory = [
  {
    id: 4,
    name: 'Inventory Stock',
    link: 'inventoryproducts',
  },
  {
    id: 5,
    name: 'Inventory Stock Category',
    link: 'inventorycategory',
  },
 
  {
    id: 7,
    name: 'Stock Adjustment',
    link: 'releasestock',
  },

  {
    id: 7,
    name: 'Stock Adjustment',
    link: 'StockAdjustment',
  },
  
  
  {
    id: 8,
    name: 'Purchase Receive',
    link: 'PurchaseReceive',
  },
 
  {
    id: 9,
    name: 'Product Recipe',
    link: 'productrecipe',
  },
];

const report = [
  {
    id: 10,
    name: 'My Report',
    link: 'myreport',
  },
  {
    id: 11,
    name: 'Transactions Report',
    link: 'transactionreport/all/custom/' + from + '/' + to,
  },
  {
    id: 12,
    name: 'Sales Report',
    link: 'salesreport',
  },
  {
    id: 13,
    name: 'Closing Report',
    link: 'closingreport',
  },
  {
    id: 14,
    name: 'Product Report',
    link: 'productreport',
  },
  {
    id: 15,
    name: 'Category Report',
    link: 'categoryreport',
  },
  {
    id: 16,
    name: 'Inventory Report',
    link: 'InventoryReport',
  },
  {
    id:17,
    name:'Logs',
    link:'LogReport'
  },
  // {
  //   id: 18,
  //   name: 'Weazy Invoices',
  //   link: 'orderinvoices',
  // },
];

const setup = [
  {
    id: 16,
    name: 'Dine-In',
    link: 'dineinlisting',
  },
  {
    id: 17,
    name: 'Pickup Points',
    link: 'pickuppoint',
  },
  {
    id: 18,
    name: 'Kitchens',
    link: 'kitchens',
  },
  {
    id: 19,
    name: 'Staff Accounts',
    link: 'staffaccounts',
  },
  // {
  //   id: 20,
  //   name: 'POS Theme',
  //   link: 'postheme',
  // },
  {
    id: 21,
    name: 'Store Profile',
    link: 'editprofile',
  },
  {
    id: 22,
    name: 'Tax & Charges',
    link: 'updategst',
  },
  {
    id: 22,
    name: 'Serial Number',
    link: 'transactionnumber',
  },
  {
    id: 23,
    name: 'Store Timings',
    link: 'updatetiming',
  },
  // {
  //   id: 24,
  //   name: 'Cover Pictures',
  //   link: 'uploadcover',
  // },
];

const customers = [
  {
    id: 25,
    name: 'Customers List',
    link: 'customers',
  },
  {
    id: 26,
    name: 'Customers Category',
    link: 'customersCategory',
  },
];

const finance = [
  {
    id: 25,
    name: 'Expenses',
    link: 'expense',
  },
  {
    id: 6,
    name: 'Purchase Orders',
    link: 'stockpurchase',
  },
  {
    id: 9,
    name: 'Suppliers List',
    link: 'suppliers',
  },
];


export class Topnav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      array: [],
    };
  }
  componentDidMount() {
    const match = this.props.array;
    if (match === 'setup') {
      this.setState({ array: setup });
    }
    if (match === 'catalogue') {
      this.setState({ array: catalogue });
    }
    if (match === 'inventory') {
      this.setState({ array: inventory });
    }
    if (match === 'report') {
      this.setState({ array: report });
    }
    if (match === 'customers') {
      this.setState({ array: customers });
    }
    if (match === 'finance') {
      this.setState({ array: finance });
    }
  }

  render() {
    return (
      <div className="row">
        <div
          className="col-md-12 pb-2 my-3"
          style={{ borderBottom: '1px solid #ececec' }}
        >
          {this.state.array.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.link}`}
              className="new-tabs-for-page-top"
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }
}

export default Topnav;

import React, { Component } from 'react';

export class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      currentPage: 1,
      totalPages: 10,
      search: '',
      text: '',
      index: 0,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentPage !== this.state.currentPage) {
      this.fetchUsers(this.state.currentPage);
    }
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let page = params.get('page');
    console.log(page);
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchUsers(this.state.currentPage);
  }

  fetchUsers = (currentPage) => {
    fetch(`https://gorest.co.in/public/v2/users?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          users: data,
          totalPages: data.total_pages,
        });
      });
  };

  updatePage = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
    window.history.pushState(null, null, `?page=${pageNumber}`);
    this.fetchUsers(this.state.currentPage);
  };

  render() {
    const { currentPage, totalPages } = this.state;

    return (
      <div>
        <button
          onClick={() => {
            const csvData = this.state.users.map((user) => {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
              };
            });
            const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
            const header = Object.keys(csvData[0]);
            let csv = csvData.map((row) =>
              header
                .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                .join(',')
            );
            csv.unshift(header.join(','));
            csv = csv.join('\r\n');

            const hiddenElement = document.createElement('a');
            hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(
              csv
            )}`;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'users.csv';
            hiddenElement.click();
          }}
        >
          Export as CSV{' '}
        </button>
        <input
          type="text"
          placeholder="Search"
          value={this.state.search}
          onChange={(e) => {
            this.setState({ search: e.target.value });
          }}
        />
        <button
          onClick={() => {
            const filteredData = this.state.users.filter((user) => {
              return (
                user.name
                  .toLowerCase()
                  .includes(this.state.search.toLowerCase()) ||
                user.email
                  .toLowerCase()
                  .includes(this.state.search.toLowerCase())
              );
            });
            this.setState({ users: filteredData });
          }}
        >
          Search
        </button>
        <button
          onClick={() => {
            this.fetchUsers(this.state.currentPage);
            this.setState({ search: '' });
          }}
        >
          Reset
        </button>
        <table
          style={{
            border: '1px solid black',
          }}
        >
          <thead
            style={{
              border: '1px solid black',
            }}
          >
            <tr>
              <th
                style={{
                  border: '1px solid black',
                }}
              >
                Id
              </th>
              <th
                style={{
                  border: '1px solid black',
                }}
              >
                Name
              </th>
              <th
                style={{
                  border: '1px solid black',
                }}
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              border: '1px solid black',
            }}
          >
            {this.state.users.map((user) => (
              <tr
                key={user.id}
                style={{
                  border: '1px solid black',
                }}
              >
                <td
                  style={{
                    border: '1px solid black',
                  }}
                >
                  {user.id}
                </td>
                <td
                  style={{
                    border: '1px solid black',
                  }}
                >
                  {user.name}
                </td>
                <td
                  style={{
                    border: '1px solid black',
                  }}
                >
                  {user.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          {currentPage > 1 && (
            <button onClick={() => this.updatePage(currentPage - 1)}>
              Prev
            </button>
          )}
          {
            // eslint-disable-next-line no-nested-ternary
            currentPage === 1 ? (
              <button onClick={() => this.updatePage(currentPage + 1)}>
                Next
              </button>
            ) : (
              <button onClick={() => this.updatePage(currentPage + 1)}>
                Next
              </button>
            )
          }
          {currentPage < totalPages && (
            <button onClick={() => this.updatePage(currentPage + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default DataTable;

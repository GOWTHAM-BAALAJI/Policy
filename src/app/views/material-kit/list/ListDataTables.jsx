import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
 
const columns = [
  {
    name: 'ID',
    selector: row => row.id,
    sortable: true,
  },
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
  },
  {
    name: 'Email',
    selector: row => row.email,
    sortable: true,
  },
];
 
const MyDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(5);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users'); // Example API
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  if (loading) {
    return <p>Loading...</p>;
  }
 
  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }
 
  const handleRowsPerPageChange = newPerPage => {
    setRowsPerPage(newPerPage);
  };
 
  return (
    <DataTable
      title="User Data"
      columns={columns}
      data={data}
      pagination
      paginationPerPage={rowsPerPage}
      paginationRowsPerPageOptions={[5, 10, 15]}
      onChangeRowsPerPage={handleRowsPerPageChange}
    />
  );
};

export default MyDataTable;

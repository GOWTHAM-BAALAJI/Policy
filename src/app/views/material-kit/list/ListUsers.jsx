import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const columns = [
    {
        name: 'ID',
        selector: row => row.user_id,
        sortable: true,
    },
    {
        name: 'Name',
        selector: row => row.emp_name,
        sortable: true,
    },
    {
        name: 'Email',
        selector: row => row.emp_email,
        sortable: true,
    },
    {
        name: 'Status',
        cell: row => (
            <button 
                style={{
                    backgroundColor: row.status === 1 ? 'green' : 'red', // Conditional styling
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }} 
                // onClick={() => handleStatusClick(row.user_id, row.status)}
            >
                {row.status === 1 ? 'Active' : 'Inactive'}
            </button>
        ),
        sortable: true,
    }
];

const MyDataTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchData = async (page, limit) => {
        try {
          const response = await axios.post('https://damuat.spandanasphoorty.com/policy_api/users_list', {
            page,
            limit,
          });

          setData(response.data.data);
          setTotal(response.data.total);
          //alert("hi......");
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
    };
        
    useEffect(() => {
        fetchData(currentPage, rowsPerPage);
    }, []);

    useEffect(() => {
        if(!loading){
            fetchData(currentPage,rowsPerPage);
        }
    }, [currentPage,rowsPerPage]);
   
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
            paginationServer  // Enable manual server-side pagination
            paginationTotalRows={total}  // Set total number of records
            paginationPerPage={rowsPerPage}  // Number of rows per page
            paginationRowsPerPageOptions={[5, 10, 15]}  // Rows per page options
            onChangePage={page => {
                console.log("Page changed to:", page); // Debugging log
                setCurrentPage(page);  // Set current page when next/previous page button is clicked
            }}
            onChangeRowsPerPage={newPerPage => {
                console.log("Rows per page changed to:", newPerPage); // Debugging log
                setRowsPerPage(newPerPage); // Update rows per page
                setCurrentPage(1);  // Reset to first page on rows per page change
            }}
        />
    );
};

export default MyDataTable;

/*
const MyDataTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchData = async (page, limit) => {
        console.log("Fetching data for page:", page); // Debugging log
        //alert("123");
        setLoading(true); // Show loading
        try {
            const response = await axios.post('https://damuat.spandanasphoorty.com/policy_api/users_list', {
                page,
                limit,
            });
            setData(response.data.data);   // Set the data received
            setTotal(response.data.total); // Set the total count of records
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false); // Hide loading
        }
    };

    useEffect(() => {
        fetchData(currentPage, rowsPerPage); // Fetch data when page or rows per page changes
    }, [currentPage, rowsPerPage]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching data: {error.message}</p>;

    return (
        <DataTable
            title="User Data"
            columns={columns}
            data={data}
            pagination
            paginationServer  // Enable manual server-side pagination
            paginationTotalRows={total}  // Set total number of records
            paginationPerPage={rowsPerPage}  // Number of rows per page
            paginationRowsPerPageOptions={[5, 10, 15]}  // Rows per page options
            onChangePage={page => {
                console.log("Page changed to:", page); // Debugging log
                setCurrentPage(page);  // Set current page when next/previous page button is clicked
            }}
            onChangeRowsPerPage={newPerPage => {
                console.log("Rows per page changed to:", newPerPage); // Debugging log
                setRowsPerPage(newPerPage); // Update rows per page
                setCurrentPage(1);  // Reset to first page on rows per page change
            }}
        />
    );
};
*/


// export default MyDataTable;










// import React, { useEffect, useState } from 'react';
// import DataTable from 'react-data-table-component';
// import axios from 'axios';
 
// const columns = [
//     {
//         name: 'ID',
//         selector: row => row.user_id,
//         sortable: true,
//     },
//     {
//         name: 'Name',
//         selector: row => row.emp_name,
//         sortable: true,
//     },
//     {
//         name: 'Email',
//         selector: row => row.emp_email,
//         sortable: true,
//     },
// ];
 
// const MyDataTable = () => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [total, setTotal] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(5);
 
//     const fetchData = async (page, limit) => {
//         try {
//             const response = await axios.post('https://damuat.spandanasphoorty.com/policy_api/users_list', {
//                 page,
//                 limit,
//             });
//             setData(response.data.data);
//             setTotal(response.data.total);
//             alert("hi");
//         } catch (err) {
//             setError(err);
//         } finally {
//             setLoading(false);
//         }
//     };
 
//     useEffect(() => {
//         fetchData(currentPage, rowsPerPage);
//     }, []); // Fetch data once on mount
 
//     useEffect(() => {
//         if (!loading) {
//             fetchData(currentPage, rowsPerPage); // Fetch data on page or rows per page change
//         }
//     }, [currentPage, rowsPerPage]); // Fetch data when current page or rows per page change
 
//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error fetching data: {error.message}</p>;
 
//     return (
// <DataTable
//             title="User Data"
//             columns={columns}
//             data={data}
//             pagination
//             paginationPerPage={rowsPerPage}
//             paginationRowsPerPageOptions={[5, 10, 15]}
//             paginationTotalRows={total}
//             onChangePage={page => setCurrentPage(page)}
//             onChangeRowsPerPage={newPerPage => {
//                 setRowsPerPage(newPerPage);
//                 setCurrentPage(1); // Reset to first page
//             }}
//         />
//     );
// };
 
// export default MyDataTable;
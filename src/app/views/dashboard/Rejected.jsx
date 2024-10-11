import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";

// const psgList = [
//   {
//     sno: "1",
//     title: "Policy 1",
//     lastupdated: "01/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "2",
//     title: "Policy 2",
//     lastupdated: "02/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "3",
//     title: "SOP 1",
//     lastupdated: "03/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "4",
//     title: "Policy 3",
//     lastupdated: "04/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "5",
//     title: "Guidance Note 1",
//     lastupdated: "05/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "6",
//     title: "Policy 4",
//     lastupdated: "06/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "7",
//     title: "SOP 2",
//     lastupdated: "07/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   },
//   {
//     sno: "8",
//     title: "SOP 3",
//     lastupdated: "08/01/2024",
//     remarks: "wsretdfygijopugydtrsetdgui"
//   }
// ];

const customSort = (data, column, direction) => {
  return [...data].sort((a, b) => {
    const aValue = a[column] || ''; // Handle undefined values
    const bValue = b[column] || ''; // Handle undefined values
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export default function RejectedTable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const [psgList, setPsgList] = useState([]);

  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });
  console.log("UserToken:",userToken);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/policy/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
          },
        });
        console.log(response);
        const data = await response.json();
        console.log("Data:",data);
        // const { approved, rejected, pending, waitingForAction } = response.data;

        // Flatten the data and add the status field
        // const formattedData = [
        //   ...approved.map(item => ({ ...item, status: 'Approved' })),
        //   ...rejected.map(item => ({ ...item, status: 'Rejected' })),
        //   ...pending.map(item => ({ ...item, status: 'Pending' })),
        //   ...waitingForAction.map(item => ({ ...item, status: 'Waiting for Action' })),
        // ];
        // console.log("Formatted Data:",formattedData);
        const decodedToken = jwtDecode(userToken);
        console.log('Decoded Token:', decodedToken.role_id);
        if (decodedToken.role_id) {
          setRoleId(decodedToken.role_id);
        }
        if (decodedToken.user_id) {
          setUserId(decodedToken.user_id);
        }

        if (data && data.status) {
          // Combine approved, rejected, and pending data into a single array
          const combinedData = [
            ...data.rejected.map(item => ({ ...item, status: 'Rejected' })),
          ];
          console.log("Combined Data:",combinedData);

          const statusOrder = {
            'Waiting for Action': 1,
            'Approved': 2,
            'Rejected': 3,
            'Pending': 4,
          };
          
          // Sort the combined data
          const sortedCombinedData = combinedData.sort((a, b) => {
            // Compare by status using the defined order
            const statusComparison = statusOrder[a.status] - statusOrder[b.status];
          
            // If the status is "Pending", sort by ID in descending order
            if (a.status === 'Rejected' && b.status === 'Rejected') {
              return a.id - b.id;
            }
          
            // If statuses are the same, sort by ID in descending order
            if (statusComparison === 0) {
              return a.id - b.id;
            }
          
            return statusComparison; // Return the status comparison result
          });
          
          // Now, sortedCombinedData will contain the data arranged as specified
          console.log(sortedCombinedData);
          setPsgList(sortedCombinedData);
        }

        // setPsgList(formattedData);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Current roleId:', roleId); // Log the roleId
    console.log('Current userId:', userId); // Log the roleId
  }, [roleId, userId]);

  const sortedData = sortColumn ? customSort(psgList, sortColumn, sortDirection) : psgList;

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const columns = [
    {
      name: 'ID',
      selector: row => row.id || 'N/A',
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {row.id || 'N/A'}
        </div>
      ),
      width: '15%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A',
      sortable: true,
      // center: true,
      width: '40%',
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{ textAlign: 'left', cursor: 'pointer', color: 'blue', textDecoration: 'underline', paddingLeft: '8px' }}
          onClick={() => handleRowClick(row)}
        >
          {row.title}
        </Typography>
      ),
    },
    {
      name: 'Status',
      selector: row => row.status || 'N/A',
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {row.status || 'N/A'}
        </div>
      ),
      width: '20%',
    },
    {
      name: 'Updated on',
      selector: row => new Date(row.updatedAt).toLocaleDateString() || 'N/A',
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {new Date(row.updatedAt).toLocaleDateString() || 'N/A'}
        </div>
      ),
      width: '25%',
    },
  ];

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status }});
  };

  return (
    <Grid container spacing={2}>
    <Grid item lg={12} md={12} sm={12} xs={12}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Rejected
        </Typography>
        <Typography variant="h6" sx={{fontFamily: 'sans-serif', fontSize: '1rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Policy/SOP/Guidance Note
        </Typography>
    </Grid>
    <Grid item lg={12} md={12} sm={12} xs={12}>
    <Box width="100%" overflow="auto">
    <DataTable
          columns={columns}
          data={paginatedData} // Use paginated and sorted data
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={psgList.length}
          paginationRowsPerPageOptions={[5, 10, 25]}
          paginationPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onSort={handleSort} // Enable sorting
          sortServer={false} // Ensure this is false since sorting is handled locally
          customStyles={{
            headCells: {
              style: {
                fontSize: '1rem',
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
              },
            },
            cells: {
              style: {
                fontFamily: 'sans-serif',
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: '8px',
              },
            },
          }}
        />
    </Box>
    </Grid>
    </Grid>
  );
}

import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Icon, MenuItem, Select, Table, styled, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";

const StyledSelect = styled(Select)(() => ({
    width: '100%',
    height: '30px', // Ensure the select component itself has a defined height
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    '& .MuiInputBase-root': {
      height: '30px', // Apply the height to the input base
      alignItems: 'center', // Align the content vertically
      fontFamily: 'sans-serif',
      fontSize: '1.10rem'
    },
    '& .MuiInputLabel-root': {
      lineHeight: '30px', // Set the line height to match the height of the input
      top: '40', // Align the label at the top of the input
      transform: 'none', // Ensure there's no unwanted transformation
      left: '20px', // Add padding for better spacing
      fontFamily: 'sans-serif',
      fontSize: '0.875rem'
    },
    '& .MuiInputLabel-shrink': {
      top: '-6px', // Move the label when focused or with content
    },
}));

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

export default function PSGTable() {
  const showRowsPerPageOptions = true;
  const { control } = useForm();
  const navigate = useNavigate();

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);
  const [error, setError] = useState(null);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);

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
        // console.log("Role ID:",roleId);

        if (data && data.status) {
          if (data.approved || data.rejected || data.pending || data.waitingForAction) {
            // Combine approved, rejected, and pending data into a single array
            const combinedData = [
              ...data.waitingForAction.map(item => ({ ...item, status: 'Waiting for Action' })),
              ...data.approved.map(item => ({ ...item, status: 'Approved' })),
              ...data.rejected.map(item => ({ ...item, status: 'Rejected' })),
              ...data.pending.map(item => ({ ...item, status: 'Pending' })),
            ];
            console.log("Combined Data:",combinedData);

            const statusOrder = {
              'Waiting for Action': 1,
              'Approved': 2,
              'Rejected': 3,
              'Pending': 4,
            };
            
            // Sort the combined data first by status and then by descending ID
            const sortedCombinedData = combinedData.sort((a, b) => {
              // Compare by status using the defined order
              const statusComparison = statusOrder[a.status] - statusOrder[b.status];
            
              // If statuses are the same, compare by ID in descending order
              if (statusComparison === 0) {
                return b.id - a.id; // Assuming `id` is a numeric value
              }
            
              return statusComparison; // Return the status comparison result
            });
            
            // Now, sortedCombinedData will contain the data arranged as specified
            console.log("Sorted combined data:",sortedCombinedData);

            setPsgList(sortedCombinedData);
            setApprovedCount(approvedCount);
            setRejectedCount(rejectedCount);
            setPendingCount(pendingCount);
            setWaitingForActionCount(waitingForActionCount);
          }
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
  console.log("Paginated data: ",paginatedData);

  const columns1 = [
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
      width: '20%',
      cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {row.status || 'N/A'}
        </div>
      ),
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

  const columns = columns1;
  const tabledata = paginatedData;

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
    <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            List of Policies, SOPs and Guidance notes
        </Typography>
    </Grid>
    {roleId === 1 && (
  <Grid item lg={3} md={3} sm={3} xs={3}>
    <Button
      variant="contained"
      startIcon={<AddIcon />} // Adding the "+" icon
      sx={{
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
        textTransform: 'none',
        marginTop: { sm: 2, xs: 2 },
        height: '30px',
      }}
      onClick={() => navigate('/initiate/psg')} // Navigate to the desired path
    >
      New
    </Button>
  </Grid>
)}
    <Grid item lg={roleId === 1 ? 3 : 6} md={roleId === 1 ? 3 : 6} sm={roleId === 1 ? 3 : 6} xs={roleId === 1 ? 3 : 6}>
  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mr: 2 }}>
    <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2, mt: 0.5 }}>
      Type
    </Typography>
    <Controller
      name="documentType"
      control={control}
      render={({ field }) => (
        <StyledSelect
          labelId="document-type-label"
          id="documentType"
          {...field}
          sx={{
            width: '180px',
          }}
          onChange={(e) => {
            field.onChange(e);
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={1}>Policy</MenuItem>
          <MenuItem value={3}>SOP</MenuItem>
          <MenuItem value={2}>Guidance Note</MenuItem>
        </StyledSelect>
      )}
    />
  </Grid>
</Grid>
    <Grid item lg={12} md={12} sm={12} xs={12}>
      <Box width="100%" overflow="auto">
        <DataTable
          columns={columns}
          data={tabledata} // Use paginated and sorted data
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={psgList.length}
          paginationRowsPerPageOptions={showRowsPerPageOptions ? [5, 10, 25] : []}
          paginationPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onSort={handleSort} // Enable sorting
          sortServer={false} // Ensure this is false since sorting is handled locally
          // defaultSortFieldId={1} // Optional: Default sorting column
          // defaultSortAsc={false} // Optional: Default sorting direction
          customStyles={{
            table: {
              style: {
                width: '100%',
                autowidth: false,
                scrollX: true,
                responsive: true,
                tableLayout: 'fixed',
              },
            },
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
};

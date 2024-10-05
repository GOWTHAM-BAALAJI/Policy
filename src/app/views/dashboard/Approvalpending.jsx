import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Card, CardContent, Dialog, DialogTitle, DialogContent, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from 'react-data-table-component';

// STYLED COMPONENT
const StyledTable = styled(Table)(() => ({
  whiteSpace: "pre",
  "& thead": {
    "& tr": { "& th": { paddingLeft: 0, paddingRight: 0 } }
  },
  "& tbody": {
    "& tr": { "& td": { paddingLeft: 0, textTransform: "capitalize" } }
  }
}));

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

export default function PendingTable() {
  const { control } = useForm();
  const [psgList, setPsgList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

        if (data && data.status) {
          // Combine approved, rejected, and pending data into a single array
          const combinedData = [
            ...data.pending.map(item => ({ ...item, status: 'Pending' })),
          ];
          console.log("Combined Data:",combinedData);
          setPsgList(combinedData);
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

  const sortedData = sortColumn ? customSort(psgList, sortColumn, sortDirection) : psgList;

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + page * rowsPerPage,
      sortable: true,
      center: true,
      width: '10%',
    },
    {
      name: 'Document Title',
      selector: row => row.title || 'N/A',
      sortable: true,
      center: true,
      width: '50%',
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
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
      center: true,
      width: '20%',
    },
    {
      name: 'Last Updated on',
      selector: row => new Date(row.updatedAt).toLocaleDateString() || 'N/A',
      sortable: true,
      center: true,
      width: '20%',
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
    setSelectedDocument(row); // Set the clicked document as selected
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false); // Close modal
  };

  return (
    <Grid container spacing={2}>
    <Grid item lg={12} md={12} sm={12} xs={12}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            Pending
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
          defaultSortFieldId={1} // Optional: Default sorting column
          defaultSortAsc={true} // Optional: Default sorting direction
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
    {/* Modal for the selected document */}
    <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Document Details</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'sans-serif' }}>
                  Document Title: {selectedDocument.title}
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Icon, MenuItem, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import DataTable from 'react-data-table-component';
import { jwtDecode } from "jwt-decode";

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

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgb(27,28,54)',
    color: 'white',
  },
}));

const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'white',
}));

const CustomDialogContent = styled(DialogContent)(({ theme }) => ({
  color: 'white',
}));

const CustomDialogActions = styled(DialogActions)(({ theme }) => ({
  '& .MuiButton-root': {
    color: 'white',
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

export default function RejectedTable() {
  const { control } = useForm();
  const [psgList, setPsgList] = useState([]);

  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(''); // Column being sorted
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogtitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const pendingApprover = selectedDocument?.Policy_status?.find(
    status => {
      return status.approver_id === selectedDocument?.pending_at_id;
    }
  );
  console.log("Pending approver:",pendingApprover);
  
  // Check if the pendingApprover exists before accessing its properties
  const pendingApproverName = pendingApprover ? pendingApprover.approver_details?.emp_name : 'No pending approver';
  console.log("Pending approver name:",pendingApproverName);

  console.log("Selected Document:", selectedDocument);

  const latestPolicyStatus = selectedDocument?.Policy_status?.filter(status => status.decision !== 0)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  console.log("Policy Status latest:",latestPolicyStatus);
  
  const initiators = [
    { id: 571, name: 'testUser1' },
  ];
  
  // Function to get the reviewer name by ID
  const getInitiatorName = (id) => {
    const initiator = initiators.find(initiator => initiator.id === id);
    return initiator ? initiator.name : 'Unknown Initiator'; // Return a default value if not found
  };

  const reviewers = [
    { id: 572, name: 'testUser2' },
  ];
  
  // Function to get the reviewer name by ID
  const getReviewerName = (id) => {
    const reviewer = reviewers.find(reviewer => reviewer.id === id);
    return reviewer ? reviewer.name : 'Unknown Reviewer'; // Return a default value if not found
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
      name: 'S.No.',
      selector: row => row.id || 'N/A',
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

  useEffect(() => {
    if (selectedDocumentTitle) {
      fetchDocumentDetails(selectedDocumentTitle);
    }
  }, [selectedDocumentTitle]);
  
  const fetchDocumentDetails = async (documentId) => {
    setLoading(true); // Start loading
    setError(null); // Reset error

    try {
      // Replace with your actual API URL
      const response = await fetch(`http://localhost:3000/policy/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
        },
      });
      const data = await response.json();
      console.log("Response:",data);
      setSelectedDocument(data.data); // Set the document data
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false); // End loading
    }
  };

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
    fetchDocumentDetails(row.id); // Set the clicked document as selected
    setSelectedDocument(row.title);
    setOpenModal(true);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
  };

  const handleClose = () => {
    setOpenModal(false); // Close modal
    setSelectedDocument(null);
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
    <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
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
          {selectedDocument ? (
            <Card>
              <CardContent>
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif' }}>
                  <b>Document Title:</b> {selectedDocument.title}
                </Typography>
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                  <b>Document Description:</b> {selectedDocument.description}
                </Typography>
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                  <b>Initiator Name:</b> {getInitiatorName(selectedDocument.initiator_id)}
                </Typography>
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                  <b>Reviewer Name:</b> {getReviewerName(selectedDocument.reviewer_id)}
                </Typography>
                
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                  <b>Version:</b> {selectedDocument.version}
                </Typography>
                {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                  <b>Status:</b> {selectedDocument.status}
                </Typography> */}
                {selectedDocument.pending_at_id !== userId && (
                <>
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Pending at:</b> {pendingApproverName}
                  </Typography>
                </>
                )}
                {/* Files section to display uploaded files */}
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, mb: -1 }}>
                  <b>Files:</b>
                </Typography>
                {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
                  <ul>
                    {selectedDocument.policy_files.map((file, index) => (
                      <li key={index}>
                        <a
                          href={`http://localhost:3000/policy_document/${file.file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          }}
                        >
                          {file.file_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No files uploaded.</Typography>
                )}
                {/* Display Latest Policy Status */}
                {(selectedDocument.pending_at_id === userId || selectedDocument.pending_at_id === null) && latestPolicyStatus && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                      <b>Latest Policy Status:</b>
                    </Typography>
                    {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, ml: 2 }}>
                      <b>Approver ID:</b> {latestPolicyStatus.approver_id}
                    </Typography>
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, ml: 2 }}>
                      <b>Priority:</b> {latestPolicyStatus.priority}
                    </Typography> */}
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, ml: 2 }}>
                      <b>Approver Name:</b> {latestPolicyStatus.approver_details.emp_name}
                    </Typography>
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, ml: 2 }}>
                      <b>Decision:</b> 
                      {latestPolicyStatus.decision === 1
                        ? 'Approved'
                        : latestPolicyStatus.decision === 2
                        ? 'Sent for review'
                        : latestPolicyStatus.decision === 3
                        ? 'Rejected'
                        : 'Pending'}
                    </Typography>
                    {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, ml: 2 }}>
                      <b>Approver Email:</b> {latestPolicyStatus.approver_details.emp_email}
                    </Typography> */}
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Typography>Loading...</Typography>
          )
        }
        </DialogContent>
        <CustomDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <CustomDialogTitle id="alert-dialog-title">
            {dialogtitle}
            </CustomDialogTitle>
            <CustomDialogContent>
            <Typography id="alert-dialog-description">
                {dialogMessage}
            </Typography>
            </CustomDialogContent>
            <CustomDialogActions>
            <Button onClick={handleDialogClose} color="primary">
                OK
            </Button>
            </CustomDialogActions>
        </CustomDialog>
      </Dialog>
    </Grid>
  );
}

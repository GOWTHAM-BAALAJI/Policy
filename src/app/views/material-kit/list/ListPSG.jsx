import React, { useState, useEffect } from "react";
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Icon, MenuItem, ListItemText, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, TablePagination, Typography } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from "jwt-decode";
import InitiatePSG from "../initiate/InitiatePSG";

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

let policyCounts = {
  approvedCount: 0,
  rejectedCount: 0,
  pendingCount: 0,
  waitingForActionCount: 0,
};

export default function PSGTable() {
  const { control } = useForm();
  const navigate = useNavigate();

  const [psgList, setPsgList] = useState([]);
  const [policyData, setPolicyData] = useState([]);
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
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);





  const reviewersOptions = [
    { value:'572', label: 'testUser2' }
  ]

  const approvalMembersOptions = [
    { value: '573', label: 'testUser3' },
    { value: '574', label: 'testUser4' },
    { value: '575', label: 'testUser5' },
  ];

  const userGroupOptions = [
    { value: '1', label: 'Field Staff' },
    { value: '2', label: 'HO Staff' },
  ]; 

  const renderPriorityValue = (selected) => {
      return selected
          .map((val) => {
              const priority = priorityOrder.indexOf(val) + 1; // Get the priority based on the current order
              return `${priority}. ${approvalMembersOptions.find((opt) => opt.value === val)?.label}`;
          })
          .join(', ');
  };

  const [documentID, setDocumentID] = useState(selectedDocument?.id || '');
  const [documentTitle, setDocumentTitle] = useState(selectedDocument?.title || '');
  const [documentDescription, setDocumentDescription] = useState(selectedDocument?.description || '');
  const [selectedReviewer, setSelectedReviewer] = useState(selectedDocument?.reviewer_id || '');
  const [approvalMembersWithPriority, setApprovalMembersWithPriority] = useState([]);
  const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
  const [useDefaultValue, setUseDefaultValue] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState(selectedDocument?.user_group || '');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
    // Load fresh approvalMembersOptions here if needed
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleSelectChangeApprovalMembers = (event) => {
    const { value } = event.target;
  
    // Ensure that we merge the existing selected members with the new selection
    const updatedSelection = Array.isArray(value) ? [...value] : [];
  
    // Filter only valid selected values from options to prevent unknowns
    const validatedSelection = updatedSelection
      .map(selectedValue => {
        const member = approvalMembersOptions.find(m => m.value === selectedValue);
        return member ? { value: selectedValue, label: member.label } : null; // Handle unknowns
      })
      .filter(Boolean); // Remove null (unknown) values
  
    // Recalculate priority order starting from 1 after update
    const newPriorityOrder = validatedSelection.map((member, index) => ({
      value: member.value,
      priority: index + 1, // Reset priority starting from 1
      label: member.label
    }));
  
    // Update state: priority, selected members, and approval members with priority
    setSelectedApprovalMembers(validatedSelection.map(member => member.value)); // Update for dropdown and value tracking
    setApprovalMembersWithPriority(newPriorityOrder); // Update for rendering in the field
    setPriorityOrder(newPriorityOrder.map(member => member.value)); // Set priority order list
    setUseDefaultValue(false); // Disable default value tracking once updated
  };

useEffect(() => {
  if (selectedDocument) {
    setDocumentID(selectedDocument.id || '');
    setDocumentTitle(selectedDocument.title);
    setDocumentDescription(selectedDocument.description);
    setSelectedReviewer(selectedDocument.reviewer_id || '');
    setSelectedUserGroup(selectedDocument.user_group || '');
    if (Array.isArray(selectedDocument.Policy_status)) {
      const approvalMembers = selectedDocument.Policy_status
        .filter(member => member.priority > 2)
        .map(member => ({
          value: member.approver_id,
          priority: member.priority - 2,
          label: member.approver_details.emp_name,
        }));

      const sortedMembers = approvalMembers.sort((a, b) => a.priority - b.priority);

      setApprovalMembersWithPriority(sortedMembers);

      const initiallySelected = sortedMembers
        .filter(member => selectedDocument.approvers && selectedDocument.approvers.includes(member.value))
        .map(member => member.value);

      setSelectedApprovalMembers(initiallySelected);
      setPriorityOrder(initiallySelected);
    } else {
      console.error('Policy_status is not defined or not an array', selectedDocument.Policy_status);
    }
  }
}, [selectedDocument]);




  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploadedFile, setUploadedFile] = useState([]);
  const [uploadedFile1, setUploadedFile1] = useState([]);

  const mapDecisionToNumber = (decision) => {
    switch (decision) {
      case 'approved':
        return 1;
      case 'reviewraised':
        return 2;
      case 'rejected':
        return 3;
      default:
        return '';
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogtitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const handleDialogClose = () => {
    setDialogOpen(false);
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

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
    if (event.target.value === "approved") {
      setRemarks(''); // Clear remarks if approved
    }
  };

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };

  const handleFileUpload1 = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile1(file);
      // event.target.value = '';
      console.log('Selected file:', file);
      // Perform necessary actions with the file, such as uploading to the server
    }
  };

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

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
        // console.log("Role ID:",roleId);

        if (data && data.status) {
          policyCounts = {
            approvedCount: data.approved.length || 0,
            rejectedCount: data.rejected.length || 0,
            pendingCount: data.pending.length || 0,
            waitingForActionCount: data.waitingForAction.length || 0,
          };
          // Combine approved, rejected, and pending data into a single array
          const combinedData = [
            ...data.approved.map(item => ({ ...item, status: 'Approved' })),
            ...data.rejected.map(item => ({ ...item, status: 'Rejected' })),
            ...data.pending.map(item => ({ ...item, status: 'Pending' })),
            ...data.waitingForAction.map(item => ({ ...item, status: 'Waiting for Action' })),
          ];
          console.log("Combined Data:",combinedData);
          setPsgList(combinedData);
          setApprovedCount(approvedCount);
          setRejectedCount(rejectedCount);
          setPendingCount(pendingCount);
          setWaitingForActionCount(waitingForActionCount);
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

  const isRejected = selectedRow && selectedRow.status === 'Rejected';
  const isPending = selectedRow && selectedRow.status === 'Pending';
  const isWaitingForAction = selectedRow && selectedRow.status === 'Waiting for Action';

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

  // const handleChangePage = (_, newPage) => {
  //   setPage(newPage);
  // };
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
    setSelectedRow(row);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
  };

  // const handleBlur = () => {
  //   // Reset fields if the user clicks outside and doesn't confirm
  //   setDecision('');
  //   setRemarks('');
  //   setUploadedFile(null);
  // };

  const handleClose = () => {
    setOpenModal(false); // Close modal
    setSelectedDocument(null);
    setSelectedRow(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      setUploadedFile(file); // Update the uploaded file state
    }
  };




  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // if ((roleId === 2 || roleId === 3)){
    //   if(decision === "approved"){
    //     if(!decision)
    //       setDialogTitle("Warning");
    //       setDialogMessage("Please fill in all the required fields");
    //       setDialogOpen(true);
    //       return;
    //   }
    //   else if(decision === "rejected"){
    //     if(!decision || !remarks)
    //       setDialogTitle("Warning");
    //       setDialogMessage("Please fill in all the required fields");
    //       setDialogOpen(true);
    //       return;
    //   }
    //   else if(decision === "reviewraised"){
    //     if(!decision || !remarks || !uploadedFile1)
    //       setDialogTitle("Warning");
    //       setDialogMessage("Please fill in all the required fields");
    //       setDialogOpen(true);
    //       return;
    //   }
    // }

    const mappedDecision = mapDecisionToNumber(decision);

    const url = "http://localhost:3000/policy/update";
    const formData = new FormData(); // Create a FormData object

    // Append other data to FormData
    formData.append("policy_id", selectedDocument.id);
    formData.append("decision", mappedDecision);
    formData.append("remarks", remarks);
    formData.append("files", uploadedFile1);
    formData.append("title", documentTitle);
    formData.append("description", documentDescription);
    formData.append("files", uploadedFile);
    // const file1 = uploadedFile.files[0];
    // console.log("File1: ",file1);
    console.log("Success!");
    console.log("File: ",uploadedFile);
    formData.append("reviewer_id", selectedReviewer);
    formData.append("approver_ids", JSON.stringify(approvalMembersWithPriority.map(member => member.value.toString())));
    console.log("Approval members with priority: ", approvalMembersWithPriority.map(member => member.value.toString()));
    formData.append("user_group", selectedUserGroup);

    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${userToken}`, // Example header for token authentication
        },
        body: formData,
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log("Server Response: ", data);
        if (data.status) {
            console.log("Successfully submitted");
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } else {
            console.log("Error");
        }
        setLoading(false); // Reset loading state
    })
    .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false); // Reset loading state
    });
  };








  return (
    <Grid container spacing={2}>
    <Grid item lg={6} md={6} sm={6} xs={6}>
        <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
            List of Policies, SOPs and Guidance notes
        </Typography>
    </Grid>
    <Grid item lg={3} md={3} sm={3} xs={3}>
    <Button
      variant="contained"
      startIcon={<AddIcon />} // Adding the "+" icon
      sx={{
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
        textTransform: 'none',
        marginTop: {sm: 2, xs: 2},
        height: '30px',
      }}
      onClick={() => navigate('/initiate/psg')} // Navigate to the desired path
      disabled={roleId !== 1}
    >
      Initiate New
    </Button>
    </Grid>
    <Grid item lg={3} md={3} sm={3} xs={3}>
    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mt: 2, mr: 2 }}>
    <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
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
                onChange={(e) => {
                    field.onChange(e);
                }}
                // sx={{ ml: -2 }}
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
    <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                {!isWaitingForAction && !isRejected && !(selectedDocument.pending_at_id === userId) && (
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
                {!isPending && (selectedDocument.pending_at_id === selectedDocument.initiator_id || selectedDocument.pending_at_id === null) && latestPolicyStatus && (
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
                {/* {selectedDocument.pending_at_id === selectedDocument.initiator_id && roleId === 1 && (
                <>
                  <InitiatePSG />
                </>
                )} */}



                
                {isWaitingForAction && selectedDocument.pending_at_id === userId && roleId === 1 && (
                <>
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                    <b>Policy ID:</b>
                  </Typography>
                  <TextField
                    fullWidth
                    value={documentID}  // Use the state as the value (editable)
                    onChange={(e) => setDocumentID(e.target.value)}  // Update the state when changed
                    sx={{ mt: 1 }}
                    InputProps={{
                      readOnly: true,  // Make the field read-only
                    }}
                  />
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                    <b>Document Title:</b>
                  </Typography>
                  <TextField
                    fullWidth
                    value={documentTitle}  // Use the state as the value (editable)
                    onChange={(e) => setDocumentTitle(e.target.value)}  // Update the state when changed
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                    <b>Document Description:</b>
                  </Typography>
                  <TextField
                    fullWidth
                    value={documentDescription}  // Use the state as the value (editable)
                    onChange={(e) => setDocumentDescription(e.target.value)}  // Update the state when changed
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Upload the updated document:</b>
                  </Typography>
                  <TextField
                      type="file"
                      fullWidth
                      inputProps={{
                        accept: '.doc,.docx', // Specify accepted file types
                      }}
                      onChange={handleFileUpload} // Function to handle the file upload
                      // value={uploadedFile}
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                      <b>Select the Reviewer:</b>
                    </Typography>
                    <StyledSelect
                      labelId="reviewer-label"
                      id="reviewer"
                      value={selectedReviewer || selectedDocument.reviewer_id || ''}
                      onChange={(e) => setSelectedReviewer(e.target.value)}  // Update the state when a reviewer is selected
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      <MenuItem value="">Select a reviewer</MenuItem>
                      {reviewersOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </StyledSelect>

                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                      <b>Select Approval Committee Members:</b>
                    </Typography>
                    <StyledSelect
                      labelId="approval-members-label"
                      id="approvalMembers"
                      multiple
                      value={useDefaultValue ? approvalMembersWithPriority.map(member => member.value) : selectedApprovalMembers}
                      onChange={handleSelectChangeApprovalMembers}
                      fullWidth
                      onOpen={handleDropdownOpen}   // Track when dropdown is opened
                      onClose={handleDropdownClose} // Track when dropdown is closed
                      renderValue={(selected) =>
                        selected.map(value => {
                          const member = approvalMembersWithPriority.find(m => m.value === value);
                          return member ? `${member.priority} - ${member.label}` : '';
                        }).join(', ')
                      }
                    >
                      {approvalMembersOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Checkbox checked={selectedApprovalMembers.includes(option.value)} />
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </StyledSelect>

                    {/* Approval Committee Members Field */}
                    {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                      <b>Select Approval Committee Members:</b>
                    </Typography>
                    <StyledSelect
                      labelId="approval-members-label"
                      id="approvalMembers"
                      multiple
                      value={selectedApprovalMembers}
                      onChange={(e) => {
                        handleSelectChangeApprovalMembers(e); // Handle changes in local state
                      }}
                      fullWidth
                      sx={{ mt: 1 }}
                      renderValue={renderPriorityValue}  // Display selected members
                    >
                      {approvalMembersOptions.map((member) => (
                        <MenuItem key={member.value} value={member.value}>
                          <Checkbox checked={selectedApprovalMembers.indexOf(member.value) > -1} />
                          <ListItemText
                            primary={`${priorityOrder.indexOf(member.value) > -1 ? `${priorityOrder.indexOf(member.value) + 1}. ` : ''}${member.label}`}
                          />
                        </MenuItem>
                      ))}
                    </StyledSelect> */}

                    {/* User Groups Field */}
                    <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                      <b>Select User Groups for Publishing:</b>
                    </Typography>
                    <StyledSelect
                      labelId="user-groups-label"
                      id="userGroups"
                      value={selectedUserGroup || selectedDocument.user_group || ''}
                      onChange={(e) => setSelectedUserGroup(e.target.value)}  // Handle change in selected user group
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      <MenuItem value="">Select a user group</MenuItem>
                      {userGroupOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </StyledSelect>
                </>
                )}












                {/* Decision dropdown */}
                {(roleId === 2 || roleId === 3) && (selectedDocument.pending_at_id === userId) && isWaitingForAction && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
                    <b>Decision:</b>
                  </Typography>
                  <Select
                    value={decision}
                    onChange={handleDecisionChange}
                    // onBlur={handleBlur}
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="approved">Approve</MenuItem>
                    <MenuItem value="reviewraised">Review raised</MenuItem>
                    <MenuItem value="rejected">Reject</MenuItem>
                  </Select>
                </Box>
                )}

                {(roleId === 2 || roleId === 3) && decision && decision !== "approved" && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Remarks"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={remarks}
                    onChange={handleRemarksChange}
                    // onBlur={handleBlur}
                    sx={{ mt: 1 }}
                  />
                </Box>
                )}

                {/* Conditional file upload field */}
                {(roleId === 2 || roleId === 3) && decision && decision === "reviewraised" && (
                  <><Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Upload Document:</b>
                  </Typography>
                  <TextField
                      type="file"
                      fullWidth
                      inputProps={{
                        accept: '.doc,.docx', // Specify accepted file types
                      }}
                      // value={uploadedFile1}
                      onChange={handleFileUpload1} // Function to handle the file upload
                      // onBlur={handleBlur}
                      sx={{ mt: 1 }}
                    /></>
                )}
                {selectedDocument.pending_at_id === userId && isWaitingForAction && (
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, padding: '6px 16px', fontSize: '0.875rem', minHeight: '24px', lineHeight: 1 }}>
                    Submit
                  </Button>
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
      </form>
      </Dialog>
    </Grid>
  );
};

export const getPolicyCounts = () => {
  return policyCounts;
};
import React, { useState, useEffect } from "react";
import { Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogTitle, DialogContent, Grid, Icon, MenuItem, ListItemText, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, TextField, IconButton, TablePagination, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useLocation, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const StyledTextField = styled(TextField)(() => ({
    width: "100%",
    marginBottom: "16px",
    "& .MuiInputLabel-root": {
      textAlign: "center",
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      fontFamily: "sans-serif",
      fontSize: "0.875rem",
      transition: "top 0.2s ease-out, font-size 0.2s ease-out",
    },
    "& .MuiInputLabel-shrink": {
      top: "2px", // Adjust this value to move the label to the border of the box outline
      fontSize: "0.75rem", // Optional: Reduce font size when the label is shrunk
    },
    '& .MuiInputBase-root': {
      height: 30, // Adjust the height as needed
      fontFamily: 'sans-serif',
      fontSize: '0.875rem',
      backgroundColor: 'transparent', // Default background color
    },
  
    "& .MuiOutlinedInput-root": {
      position: "relative", // Ensure the label is positioned relative to the input
    },
  
    "& .MuiInputBase-input": {
      backgroundColor: "transparent", // Input remains transparent
      height: "100%", // Ensure input takes full height
      boxSizing: "border-box",
    },
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

export default function PolicyDetails() {
    const { control } = useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { title, status } = location.state || {}; 
    console.log("Document status: ", status);

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

    const [userId, setUserId] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [sortColumn, setSortColumn] = useState(''); // Column being sorted
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    console.log("Selected Document: ",selectedDocument);
    const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);

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
        fetchDocumentDetails(id);
    }, [id]);
      
    const fetchDocumentDetails = async (documentId) => {
        setLoading(true); // Start loading
        setError(null); // Reset error
    
        try {
          // Replace with your actual API URL
        //   console.log('isWaitingForAction:', isWaitingForAction);
        //   console.log('isApproved:', isApproved);
        //   console.log('isRejected:', isRejected);
            const response = await fetch(`http://localhost:3000/policy/${documentId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
            },
            });
            const data = await response.json();
            console.log("Response data:",data);
            setSelectedDocument(data.data); // Set the document data
            const decodedToken = jwtDecode(userToken);
            console.log('Decoded Token roleid:', decodedToken.role_id);
            console.log('Decoded Token userid:', decodedToken.user_id);
            if (decodedToken.role_id) {
            setRoleId(decodedToken.role_id);
            }
            if (decodedToken.user_id) {
            setUserId(decodedToken.user_id);
            }
        } catch (err) {
          setError("Failed to fetch document details.");
        } finally {
          setLoading(false); // End loading
        }
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
                    navigate('/list/psg');
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
        <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={2}>
        <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1 rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                Document Details:
            </Typography>
        </Grid>
        <Grid item lg={12} md={12} sm={12} xs={12} sx={{fontFamily: 'sans-serif', fontSize: '0.875 rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
        {selectedDocument ? (
            <><Typography variant="h8" sx={{ fontFamily: 'sans-serif' }}>
                <b>Document ID:</b> {selectedDocument.id}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Document Title:</b> {selectedDocument.title}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Document Description:</b> {selectedDocument.description}
            </Typography>
            {roleId !== 4 && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Initiator Name:</b> {getInitiatorName(selectedDocument.initiator_id)}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Reviewer Name:</b> {getReviewerName(selectedDocument.reviewer_id)}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Version:</b> {selectedDocument.version}
            </Typography>
            </>
            )}
            {status === "Pending" && !(selectedDocument.pending_at_id === userId) && roleId !== 4 && (
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
            {status === "Waiting for Action" && roleId === 1 ? (
            <>
            {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
            <Grid container spacing={2}>
                <Grid item xs={5}>
                <Typography variant="h10" sx={{ fontFamily: 'sans-serif', mt: 2, ml: 10 }}>
                    <b>Received for Review</b>
                </Typography>
                <ul>
                {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 2) ? (
                    <li>
                        <a
                        href={`http://localhost:3000/policy_document/${selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 2).file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        }}
                        >
                        {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 2).file_name}
                        </a>
                        <span style={{ marginLeft: '16px' }}>
                        Version: {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 2).version}
                        </span>
                    </li>
                    ) : (
                    <Typography>No file found for the selected version and type.</Typography>
                    )}
                </ul>
                </Grid>

                <Grid item xs={5}>
                <Typography variant="h10" sx={{ fontFamily: 'sans-serif', mt: 2, ml: 10 }}>
                    <b>Uploaded Files</b>
                </Typography>
                <ul>
                {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1) ? (
                        <li>
                        <a
                            href={`http://localhost:3000/policy_document/${selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            }}
                        >
                            {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).file_name}
                        </a>
                        <span style={{ marginLeft: '16px' }}>
                            Version: {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).version}
                        </span>
                        </li>
                    ) : (
                        <Typography>No file found for the selected version and type.</Typography>
                    )}
                </ul>
                </Grid>
            </Grid>
            ) : (
                <Typography>No files uploaded</Typography>
            )}
            </>
            ) : status === "Waiting for Action" && (roleId === 2 || roleId === 3) ? (
                <>
                {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
                    <Grid container spacing={2}>
                        {/* First Column: Received for Review */}
                        <Grid item xs={6}>
                        <Typography variant="h10" sx={{ fontFamily: 'sans-serif', mt: 2, ml: 10 }}>
                            <b>Received file</b>
                        </Typography>
                        <ul>
                        {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1) ? (
                            <li>
                                <a
                                href={`http://localhost:3000/policy_document/${selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                }}
                                >
                                {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).file_name}
                                </a>
                                <span style={{ marginLeft: '16px' }}>
                                Version: {selectedDocument.policy_files.find(file => file.version === selectedDocument.version && file.type === 1).version}
                                </span>
                            </li>
                            ) : (
                            <Typography>No file found for the selected version and type.</Typography>
                            )}
                        </ul>
                        </Grid>
                    </Grid>
                    ) : (
                        <Typography>No files uploaded</Typography>
                    )}
                    </>
            ) : (
                <ul>
                {selectedDocument.policy_files.map((file, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
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
                        <span style={{ marginLeft: '16px' }}>Version: {file.version}</span>
                    </li>
                ))}
                </ul>
            )}
            {(status === "Approved") && selectedDocument.pending_at_id === null && roleId !== 4 && (
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Final Decision: </b> Approved
                </Typography>
            )}
            {(status === "Rejected") && selectedDocument.pending_at_id === null && roleId !== 4 && (
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Final Decision: </b> Rejected
                </Typography>
            )}
            {/* Display Latest Policy Status */}
            {status === "Waiting for Action" && (selectedDocument.pending_at_id === selectedDocument.initiator_id || selectedDocument.pending_at_id === null) && latestPolicyStatus && roleId !== 4 && (
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



        
            {status === "Waiting for Action" && selectedDocument.pending_at_id === userId && roleId === 1 && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                <b>Policy ID:</b>
            </Typography>
            <StyledTextField
                fullWidth
                value={documentID}  // Use the state as the value (editable)
                onChange={(e) => setDocumentID(e.target.value)}  // Update the state when changed
                sx={{ mt: 1 }}
                InputProps={{
                readOnly: true,  // Make the field read-only
                }}
            />
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
                <b>Document Title:</b>
            </Typography>
            <StyledTextField
                fullWidth
                value={documentTitle}  // Use the state as the value (editable)
                onChange={(e) => setDocumentTitle(e.target.value)}  // Update the state when changed
                sx={{ mt: 1 }}
            />
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
                <b>Document Description:</b>
            </Typography>
            <StyledTextField
                fullWidth
                value={documentDescription}  // Use the state as the value (editable)
                onChange={(e) => setDocumentDescription(e.target.value)}  // Update the state when changed
                sx={{ mt: 1 }}
            />
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
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
                sx={{ mt: 1 }}
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
            {(roleId === 2 || roleId === 3) && (selectedDocument.pending_at_id === userId) && status === "Waiting for Action" && (
            <Box sx={{ mt: 2 }}>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
                <b>Decision:</b>
            </Typography>
            <StyledSelect
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
            </StyledSelect>
            </Box>
            )}

            {(roleId === 2 || roleId === 3) && decision && decision !== "approved" && (
            <Box sx={{ mt: 2 }}>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block' }}>
                <b>Remarks:</b>
            </Typography>
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
            {selectedDocument.pending_at_id === userId && status === "Waiting for Action" && (
            <Grid container justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                <Grid item>
                    <Button type="submit" variant="contained" color="primary" sx={{ padding: '6px 16px', fontSize: '0.875rem', minHeight: '24px', lineHeight: 1 }}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
            )}</>
            ) : (
                <Typography>Loading...</Typography>
            )
        }
        </Grid>
        </Grid>
        </form>
    );
};



// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';

// const PolicyDetails = () => {
//   const { id } = useParams(); // Get the id from the URL
//   const [documentDetails, setDocumentDetails] = useState(null);
//   console.log("Document details: ",documentDetails);

//   useEffect(() => {
//     // Fetch the document details based on the id
//     fetchDocumentDetails(id);
//   }, [id]);

//   const userToken = useSelector((state)=>{
//     return state.token;//.data;
//   });

//   const fetchDocumentDetails = (documentId) => {
//     // Fetch your document details from an API or other source
//     // Example:
//     fetch(`http://localhost:3000/policy/${documentId}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${userToken}`, // Include JWT token in the headers
//         },
//       })
//       .then(response => response.json())
//       .then(data => setDocumentDetails(data.data))
//       .catch(error => console.error('Error fetching document:', error));
//   };

//   if (!documentDetails) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>{documentDetails.title}</h1>
//       {/* Render other details of the document */}
//       <p>{documentDetails.description}</p>
//     </div>
//   );
// };

// export default PolicyDetails;

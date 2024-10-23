import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, Card, CardContent, Checkbox, Divider, Grid, Icon, MenuItem, ListItemText, Paper, Select, Table, styled, TableRow, TableBody, TableCell, TableHead, TableContainer, TextField, IconButton, TablePagination, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useLocation, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";

const ContentBox = styled("div")(({ theme }) => ({
    margin: "20px",
    [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

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
    const { title, status, activeTab } = location.state || {}; 
    console.log("Document status: ", status);
    console.log("Document tab: ", activeTab);

    const getDisplayPolicyId = (policy_id) => {
        return "PL" + String(policy_id).padStart(7, "0");
    };

    // const reviewersOptions = [
    //     { value:'572', label: 'testUser2' }
    // ]

    // const approvalMembersOptions = [
    //     { value: '573', label: 'testUser3' },
    //     { value: '574', label: 'testUser4' },
    //     { value: '575', label: 'testUser5' },
    // ];

    const userGroupOptions = [
        { value: '1', label: 'Field Staff' },
        { value: '2', label: 'HO Staff' },
    ]; 

    const [userId, setUserId] = useState(null);
    const [roleId, setRoleId] = useState(null);

    const [reviewersOptions, setReviewersOptions] = useState([]);
    const [approvalMembersOptions, setApprovalMembersOptions] = useState([]);

    
    console.log("User id: ",userId);
    console.log("Role id: ",roleId);
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

    const approvalMembers = approvalMembersWithPriority.map(member => member.value.toString());
    console.log("Approval members: ",approvalMembers);

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

    useEffect(() => {
        // Fetch reviewers from the API
        axios.get('https://policyuat.spandanasphoorty.com/policy_apis/auth/getReviewer', {
            headers: {
              Authorization: `Bearer ${userToken}`,  // Include the JWT token in the Authorization header
            },
          })
          .then(response => {
            if (response.data.status) {
              // Map the API response to format for dropdown (using emp_name as label and user_id as value)
              const fetchedReviewers = response.data.data.map(reviewer => ({
                value: reviewer.user_id,
                label: reviewer.emp_name,
              }));
              setReviewersOptions(fetchedReviewers);
            }
          })
          .catch(error => {
            console.error('Error fetching reviewers:', error);
          });
    }, []);

    useEffect(() => {
        // Fetch reviewers from the API
        axios.get('https://policyuat.spandanasphoorty.com/policy_apis/auth/getApprover', {
            headers: {
              Authorization: `Bearer ${userToken}`,  // Include the JWT token in the Authorization header
            },
          })
          .then(response => {
            if (response.data.status) {
              // Map the API response to format for dropdown (using emp_name as label and user_id as value)
              const fetchedApprovalMembers = response.data.data.map(approvalmember => ({
                value: approvalmember.user_id,
                label: approvalmember.emp_name,
              }));
              setApprovalMembersOptions(fetchedApprovalMembers);
            }
          })
          .catch(error => {
            console.error('Error fetching reviewers:', error);
          });
    }, []);


    const [decision, setDecision] = useState('');
    const [remarks, setRemarks] = useState('');
    const [uploadedFile, setUploadedFile] = useState([]);
    const [uploadedFileName, setUploadedFileName] = useState([]);
    const [uploadedFile1, setUploadedFile1] = useState([]);
    const [uploadedFile1Name, setUploadedFile1Name] = useState([]);

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
        status => status.approver_id === selectedDocument?.pending_at_id
    );
    
    // If pendingApprover is not found and pending_at_id is equal to initiator_id, set name to initiator's name
    const pendingApproverName = pendingApprover 
        ? pendingApprover.approver_details?.emp_name 
        : (selectedDocument?.pending_at_id === selectedDocument?.initiator_id 
            ? 'Initiator' 
            : 'No pending approver');
    
    console.log("Pending approver name:", pendingApproverName);

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
            setUploadedFile1Name(file.name);
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
        { id: 583, name: 'Mukesh kumar' },
        { id: 584, name: 'Prashant kumar' },
        { id: 585, name: 'Surendra kumar Mishra' },
        { id: 586, name: 'Jyoti Ranjan Behera' },
        { id: 587, name: 'Saloni Agrawal' },
        { id: 588, name: 'Bhavesh kukreja' },
        { id: 589, name: 'Pamli Ganguly' },
        { id: 590, name: 'Sarthak Nayak' },
    ];
    
    // Function to get the reviewer name by ID
    const getInitiatorName = (id) => {
        const initiator = initiators.find(initiator => initiator.id === id);
        return initiator ? initiator.name : 'Unknown Initiator'; // Return a default value if not found
    };

    const reviewers = [
        { id: 581, name: 'Divaker Jha' },
        { id: 582, name: 'Vikram Kumar' },
        { id: 584, name: 'Prashant kumar' },
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

    // useEffect(() => {
    //     if (activeTab) {
    //         fetchDocumentDetails(activeTab); // Replace with your API call to fetch data
    //     }
    // }, [activeTab]);
      
    const fetchDocumentDetails = async (documentId) => {
        setLoading(true); // Start loading
        setError(null); // Reset error
    
        try {
          // Replace with your actual API URL
        //   console.log('isWaitingForAction:', isWaitingForAction);
        //   console.log('isApproved:', isApproved);
        //   console.log('isRejected:', isRejected);
            const response = await fetch(`https://policyuat.spandanasphoorty.com/policy_apis/policy/${documentId}`, {
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
            // console.log("Role id: ",roleId);
            }
            if (decodedToken.user_id) {
            setUserId(decodedToken.user_id);
            // console.log("User id: ",userId);
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
          setUploadedFile(file);
          setUploadedFileName(file.name);
        }
    };
    
    const handleBackClick = () => {
        navigate(-1); // Navigates to the previous page
    };
    
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const mappedDecision = mapDecisionToNumber(decision);

        if((roleId === 1 || roleId === 3 || roleId === 9) && activeTab == 4){
            if(selectedDocument.initiator_id === userId){
                if (!documentTitle || !documentDescription || uploadedFile.length === 0 || !selectedReviewer || approvalMembers.length === 0 || selectedUserGroup.length === 0) {
                    toast.error("Please fill in all the required fields");
                    return;
                }
            }
            else{
                if(!mappedDecision){
                    toast.error("Please fill the decision");
                    return;
                }
                else{
                    if(mappedDecision === 2){
                        if(!remarks || uploadedFile1.length === 0){
                            toast.error("Please fill the remarks and upload a file");
                            return;
                        }
                    }
                    else if(mappedDecision === 3){
                        if(!remarks){
                            toast.error("Please fill the remarks")
                            return;
                        }
                    }
                }
            }
        }
    
        if ((roleId === 2 || roleId === 3 || roleId === 4 || roleId === 6) && activeTab == 4){
            if(!mappedDecision){
                toast.error("Please fill the decision");
                return;
            }
            else{
                if(mappedDecision === 2){
                    if(!remarks || uploadedFile1.length === 0){
                        toast.error("Please fill the remarks and upload a file");
                        return;
                    }
                }
                else if(mappedDecision === 3){
                    if(!remarks){
                        toast.error("Please fill the remarks")
                        return;
                    }
                }
            }
        }
    
        const url = "https://policyuat.spandanasphoorty.com/policy_apis/policy/update";
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
    
         const submitForm = fetch(url, {
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
                }, 1000);
            } else {
                console.log("Error");
            }
            setLoading(false); // Reset loading state
        })
        .catch((error) => {
            console.error("Submission error:", error);
            setLoading(false); // Reset loading state
        });

        toast.promise(submitForm, {
            loading: 'Submitting...',
            success: (data) => `Form submitted successfully`, // Adjust based on your API response
            error: (err) => `Error while filling the form`,
        });
    };

    return (
        <ContentBox className="analytics">
        <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
        {/* <form onSubmit={handleSubmit} encType="multipart/form-data"> */}
        <Grid container>
        <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
            variant="contained"
            onClick={handleBackClick}
            sx={{
                marginRight: 2,
                marginTop: 2,
                height: '28px',
                backgroundColor: '#ee8812',
                '&:hover': { backgroundColor: 'rgb(249, 83, 22)' },
            }}
            >
            Back
            </Button>
        </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
        <Grid item lg={6} md={6} sm={12} xs={12} sx={{fontFamily: 'sans-serif', fontSize: '0.875 rem', marginLeft: 2, marginTop: 2, marginRight: 2, paddingRight: '16px'}}>
        <Typography
                variant="h5"
                sx={{
                    fontFamily: 'sans-serif',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    marginBottom: 2,
                    marginTop: -2,
                    marginRight: 2,
                    
                }}
            >
                Document Details:
        </Typography>
        {selectedDocument && (
            <>
            {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif' }}>
                <b>Document ID:</b> {selectedDocument.id}
            </Typography> */}
            <TableContainer component={Paper} sx={{ marginLeft: '0', }}>
                <Table aria-label="data table">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ pl: 2, width: '30%' }}><b>Document ID:</b></TableCell>
                            <TableCell sx={{ pl: 2, width: '70%' }}>{getDisplayPolicyId(selectedDocument.id)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ pl: 2, }}><b>Document Title:</b></TableCell>
                            <TableCell sx={{ pl: 2, }}>{selectedDocument.title}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ pl: 2, }}><b>Document Description:</b></TableCell>
                            <TableCell sx={{ pl: 2, }}>{selectedDocument.description}</TableCell>
                        </TableRow>
                        {roleId !== 8 && (
                            <><TableRow>
                                <TableCell sx={{ pl: 2, }}><b>Initiator Name:</b></TableCell>
                                <TableCell sx={{ pl: 2, }}>{selectedDocument.initiator_details?.emp_name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ pl: 2, }}><b>Reviewer Name:</b></TableCell>
                                <TableCell sx={{ pl: 2, }}>{selectedDocument.reviwer_details?.emp_name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ pl: 2, }}><b>Version:</b></TableCell>
                                <TableCell sx={{ pl: 2, }}>{selectedDocument.version}</TableCell>
                            </TableRow>
                            </>
                        )}
                        {activeTab == 3 && roleId !== 8 && (
                            <><TableRow>
                                <TableCell sx={{ pl: 2 }}><b>Pending at:</b></TableCell>
                                <TableCell sx={{ pl: 2 }}>{selectedDocument.pending_at_details?.emp_name}</TableCell>
                            </TableRow>
                            </>
                        )}
                        {activeTab == 1 && selectedDocument.pending_at_id === null && roleId !== 8 && (
                            <><TableRow>
                                <TableCell sx={{ pl: 2 }}><b>Final Decision: </b></TableCell>
                                <TableCell sx={{ pl: 2 }}>Approved</TableCell>
                            </TableRow>
                            </>
                        )}
                        {activeTab == 2 && selectedDocument.pending_at_id === null && roleId !== 8 && (
                            <><TableRow>
                                <TableCell sx={{ pl: 2 }}><b>Final Decision: </b></TableCell>
                                <TableCell sx={{ pl: 2 }}>Rejected</TableCell>
                            </TableRow>
                            </>
                        )}
                        {activeTab == 4 && (selectedDocument.pending_at_id === selectedDocument.initiator_id || selectedDocument.pending_at_id === null) && latestPolicyStatus && roleId !== 8 && (
                            <><TableRow>
                                <TableCell sx={{ pl: 2 }}><b>Latest policy status: </b></TableCell>
                                <TableCell sx={{ pl: 2 }}>{latestPolicyStatus.decision === 1 ? 'Approved' : latestPolicyStatus.decision === 2 ? 'Sent for review' : latestPolicyStatus.decision === 3 ? 'Rejected' : 'Pending'} by {latestPolicyStatus.approver_details.emp_name}</TableCell>
                            </TableRow></>
                        )}
                    {/* </TableBody>
                </Table>
            </TableContainer> */}
            {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Document Title:</b> {selectedDocument.title}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Document Description:</b> {selectedDocument.description}
            </Typography> */}
            {/* {roleId !== 8 && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Initiator Name:</b> {selectedDocument.initiator_details?.emp_name}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Reviewer Name:</b> {selectedDocument.reviwer_details?.emp_name}
            </Typography>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Version:</b> {selectedDocument.version}
            </Typography>
            </>
            )} */}
            {/* {activeTab == 3 && roleId !== 8 && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Pending at:</b> {selectedDocument.pending_at_details?.emp_name}
            </Typography>
            </>
            )} */}
            {/* Files section to display uploaded files */}
            {/* <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1, mb: -1 }}>
            <b>Files:</b>
            </Typography> */}
            {activeTab == 4 && (roleId === 1 || roleId === 3 || roleId === 9) ? (
            <>
            {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
            
            <><TableRow>
                <TableCell sx={{ pl: 2 }}><b>Received for changes</b></TableCell>
                {/* <Typography variant="h10" sx={{ fontFamily: 'sans-serif', mt: 2, ml: 10 }}>
                    <b>Received for Changes</b>
                </Typography> */}
                <TableCell>
                <ul>
                {selectedDocument.policy_files
                    .filter(file => file.version === selectedDocument.version && file.type === 2) // Filter files based on condition
                    .map((file, index) => (
                    <li key={index} style={{ listStyleType: 'none' }}>
                        <div style={{ position: 'relative', paddingLeft: '25px' }}>
                            <div style={{ position: 'absolute', left: '0', top: '0' }}>
                                <strong>{index + 1}.</strong>
                            </div>
                            <div>
                                <a
                                href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                style={{
                                    cursor: 'pointer',
                                }}
                                >
                                <div className="img-wrapper">
                                    <img src={img1} width="15%" alt="" />
                                </div>
                                </a>
                                <div>
                                Version: {file.version}
                                <span style={{ marginLeft: '16px' }}>
                                    Uploaded on: {new Date(file.createdAt).toLocaleDateString('en-GB')}
                                </span>
                                </div>
                            </div>
                        </div>
                    </li>
                    ))}

                {/* If no files match, display a message */}
                {selectedDocument.policy_files.filter(file => file.version === selectedDocument.version && file.type === 2).length === 0 && (
                    <Typography>No file found for the selected version and type.</Typography>
                )}
                </ul>
                </TableCell>
            </TableRow>

            <TableRow>

                {/* <Typography variant="h10" sx={{ fontFamily: 'sans-serif', mt: 2, ml: 10 }}>
                    <b>Uploaded Files</b>
                </Typography> */}
                <TableCell sx={{ pl: 2 }}><b>Uploaded files</b></TableCell>
                <TableCell>
                <ul>
                {selectedDocument.policy_files
                    .filter(file => file.version === selectedDocument.version && file.type === 1) // Filter files based on version and type
                    .map((file, index) => (
                    <li key={index} style={{ listStyleType: 'none' }}>
                        <div style={{ position: 'relative', paddingLeft: '25px' }}>
                            <div style={{ position: 'absolute', left: '0', top: '0' }}>
                                <strong>{index + 1}.</strong>
                            </div>
                            <div>
                                <a
                                href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                style={{
                                    cursor: 'pointer',
                                }}
                                >
                                <div className="img-wrapper">
                                    <img src={img1} width="15%" alt="" />
                                </div>
                                </a>
                                <div>
                                Version: {file.version}
                                <span style={{ marginLeft: '16px' }}>
                                    Uploaded on: {new Date(file.createdAt).toLocaleDateString('en-GB')}
                                </span>
                                </div>
                            </div>
                        </div>
                    </li>
                    ))}

                {/* Fallback message if no files match */}
                {selectedDocument.policy_files.filter(file => file.version === selectedDocument.version && file.type === 1).length === 0 && (
                    <Typography>No file found for the selected version and type.</Typography>
                )}
                </ul>
                </TableCell>
            </TableRow></>
            ) : (
                <Typography>No files uploaded</Typography>
            )}
            </>
            ) : activeTab == 4 && (roleId === 2 || roleId === 3 || roleId === 4 || roleId === 6) ? (
                <>
                {selectedDocument.policy_files && Array.isArray(selectedDocument.policy_files) && selectedDocument.policy_files.length > 0 ? (
                    <><TableRow>
                        <TableCell sx={{ pl: 2 }}><b>Received file</b></TableCell>
                        <TableCell>
                        <ul>
                        {selectedDocument.policy_files
                            .filter(file => file.version === selectedDocument.version && file.type === 1) // Filter files based on version and type
                            .map((file, index) => (
                            <li key={index} style={{ listStyleType: 'none' }}>
                                <div style={{ position: 'relative', paddingLeft: '25px' }}>
                                    <div style={{ position: 'absolute', left: '0', top: '0' }}>
                                        <strong>{index + 1}.</strong>
                                    </div>
                                    <div>
                                        <a
                                        href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                        >
                                        <div className="img-wrapper">
                                            <img src={img1} width="15%" alt="" />
                                        </div>
                                        </a>
                                        <div>
                                        Version: {file.version}
                                        <span style={{ marginLeft: '16px' }}>
                                            Uploaded on: {new Date(file.createdAt).toLocaleDateString('en-GB')}
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            ))}

                        {/* Fallback message if no files match */}
                        {selectedDocument.policy_files.filter(file => file.version === selectedDocument.version && file.type === 1).length === 0 && (
                            <Typography>No file found for the selected version and type.</Typography>
                        )}
                        </ul>
                        </TableCell>
                        </TableRow></>
                    ) : (
                        <Typography>No files uploaded</Typography>
                    )}
                    </>
            ) : activeTab == 3 && (roleId !== 8) ? (
                <><TableRow>
                    <TableCell sx={{ pl: 2 }}><b>Files</b></TableCell>
                    <TableCell>
                    <ul>
                    {selectedDocument.policy_files.map((file, index) => (
                    <li key={index} style={{ marginBottom: '8px', listStyleType: 'none' }}>
                        <div style={{ position: 'relative', paddingLeft: '25px' }}>
                            <div style={{ position: 'absolute', left: '0', top: '0' }}>
                                {index + 1})
                            </div>
                            <div>
                                <a
                                href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                style={{
                                    // color: 'blue',
                                    // textDecoration: 'underline',
                                    cursor: 'pointer',

                                }}
                                >
                                <div className="img-wrapper">
                                    <img src={img1} width="15%" alt="" />
                                </div>
                                </a>
                                <div style={{ marginTop: '4px' }}>
                                    Version: {file.version}
                                    <span style={{ marginLeft: '16px' }}>Uploaded on: {new Date(file.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
                </ul>
                </TableCell>
                </TableRow></>
            ) : (
                <><TableRow>
                    <TableCell sx={{ pl: 2 }}><b>Final file</b></TableCell>
                    <TableCell>
                    <ul>
                    {selectedDocument.policy_files.map((file, index) => (
                    <li key={index} style={{ marginBottom: '8px', listStyleType: 'none' }}>
                        <a
                        href={`https://policyuat.spandanasphoorty.com/policy_apis/policy_document/${file.file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{
                            // color: 'blue',
                            // textDecoration: 'underline',
                            cursor: 'pointer',

                        }}
                        >
                        <div className="img-wrapper">
                            <img src={img1} width="15%" alt="" />
                        </div>
                        </a>
                        <div style={{ marginTop: '4px' }}>
                            Version: {file.version}
                            <span style={{ marginLeft: '16px' }}>Uploaded on: {new Date(file.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                        </div>
                    </li>
                ))}
                </ul>
                </TableCell>
                </TableRow></>
            )}
            </TableBody>
                </Table>
            </TableContainer>
            </>
            )}
            </Grid>
            <Grid item lg={5} md={5} sm={12} xs={12} sx={{fontFamily: 'sans-serif', fontSize: '0.875 rem', marginLeft: 2, marginTop: 2, marginRight: 2}}>
            <Typography
                variant="h5"
                sx={{
                    fontFamily: 'sans-serif',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    marginTop: -2,
                    marginRight: 2,
                }}
            >
                Action:
            </Typography>
            {selectedDocument ? (
            <>
            {/* {(status === "Approved") && selectedDocument.pending_at_id === null && roleId !== 8 && (
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Final Decision: </b> Approved
                </Typography>
            )}
            {(status === "Rejected") && selectedDocument.pending_at_id === null && roleId !== 8 && (
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                    <b>Final Decision: </b> Rejected
                </Typography>
            )} */}
            {/* Display Latest Policy Status */}
            {/* {activeTab == 4 && (selectedDocument.pending_at_id === selectedDocument.initiator_id || selectedDocument.pending_at_id === null) && latestPolicyStatus && roleId !== 8 && (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
                <b>Latest Policy Status:</b>
                </Typography>
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
            </Box>
            )} */}
            {/* {selectedDocument.pending_at_id === selectedDocument.initiator_id && roleId === 1 && (
            <>
            <InitiatePSG />
            </>
            )} */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* <Box sx={{ width: '600px', margin: '0 auto', padding: '16px',}}> */}
            {activeTab == 4 && selectedDocument.pending_at_id === userId && (roleId === 1 || roleId === 9) && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 2 }}>
                <b>Policy ID:</b>
            </Typography>
            <StyledTextField
                fullWidth
                value={getDisplayPolicyId(documentID)}  // Use the state as the value (editable)
                onChange={(e) => setDocumentID(e.target.value)}  // Update the state when changed
                sx={{ mt: 1, }}
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
            {/* </Box> */}

            {/* Decision dropdown */}
            {/* <Box sx={{ width: '600px', margin: '0 auto',}}> */}
            {(roleId === 2 || roleId === 3 || roleId === 4 || roleId === 6) && (selectedDocument.pending_at_id === userId) && activeTab == 4 && (
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
            {/* </Box> */}

            {/* <Box sx={{ width: '600px', margin: '0 auto', mt: 2 }}> */}
            {(roleId === 2 || roleId === 3 || roleId === 4 || roleId === 6) && decision && decision !== "approved" && (
            <>
            <Typography variant="h8" sx={{ fontFamily: 'sans-serif', display: 'block', mt: 1 }}>
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
            /></>
            )}
            {/* </Box> */}

            {/* Conditional file upload field */}
            {/* <Box sx={{ width: '600px', margin: '0 auto',}}> */}
            {(roleId === 2 || roleId === 3 || roleId === 4 || roleId === 6) && decision && decision === "reviewraised" && (
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
            {/* </Box> */}

            {selectedDocument.pending_at_id === userId && activeTab == 4 && (
            <Grid container justifyContent="center" sx={{ mt: 2, mb: 2 }}>
                <Grid item>
                    <Button type="submit" variant="contained" sx={{ padding: '6px 16px', fontSize: '0.875rem', minHeight: '24px', lineHeight: 1, backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)' } }}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
            )}</form></>
            ) : (
                <Typography>Loading...</Typography>
            )
        }
        </Grid>
        </Grid>
        </Card>
        </ContentBox>
    );
};



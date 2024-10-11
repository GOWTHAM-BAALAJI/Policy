import React, { useState } from "react";
import axios from "axios";
import { useForm, Controller } from 'react-hook-form';
import { NavLink, useNavigate } from "react-router-dom";
import { Autocomplete, Button, Chip, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, ListItemText, MenuItem, FormControl, Grid, IconButton, InputLabel, styled, Select, Typography, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import toast from "react-hot-toast";

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

const StyledAutocomplete = styled(Autocomplete)(() => ({
    width: "100%",
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
    // Override focus and auto-fill background colors
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input': {
      backgroundColor: 'transparent', // Remove blue background when focused
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-input': {
      backgroundColor: 'transparent', // Remove blue background on hover
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px transparent inset', // Remove autofill background
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 1000px transparent inset', // Remove autofill background on hover and focus
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

const InitiatePSG = () => {
    const { control, setValue, formState: { errors }, } = useForm();
    const navigate = useNavigate();

    const [documentType, setDocumentType] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadFilename, setUploadFilename] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadFilenames, setUploadFilenames] = useState([]); // Store multiple filenames
    const [uploadedFiles, setUploadedFiles] = useState([]); // Store multiple file objects
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedReviewer, setSelectedReviewer] = useState("");
    const [reviewerId, setReviewerId] = useState("");
    const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
    const [priorityOrder, setPriorityOrder] = useState([]);
    const [selectedUserGroup, setSelectedUserGroup] = useState("");
    const [loading, setLoading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogtitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");

    const reviewers = [
        { value:'572', label: 'testUser2' }
    ]

    const approvalMembersOptions = [
        { value: '573', label: 'testUser3' },
        { value: '574', label: 'testUser4' },
        { value: '575', label: 'testUser5' },
    ];

    const userGroupOptions = [
        { value: '2', label: 'Field Staff' },
        { value: '1', label: 'HO Staff' },
    ]
    
    const handleSelectChangeApprovalMembers = (event) => {
        const { target: { value } } = event;
    
        // Update the selected members state
        setSelectedApprovalMembers(value);
    
        // Update the priority order
        setPriorityOrder(value); // Set the priority order directly based on the current selection
    };    

    const renderPriorityValue = (selected) => {
        return selected
            .map((val) => {
                const priority = priorityOrder.indexOf(val) + 1; // Get the priority based on the current order
                return `${priority}. ${approvalMembersOptions.find((opt) => opt.value === val)?.label}`;
            })
            .join(', ');
    };      

    const handleSelectChangeUserGroups = (event) => {
        const value = event.target.value;
        setSelectedUserGroup(value);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            setUploadFilenames(prev => [...prev, file.name]); // Store the filenames in state
            setUploadedFiles(prev => [...prev, file]); // Store the file objects
        });
        // setUploadedFiles(prev => [...prev, ...files]);
        // setUploadFilenames(prev => [...prev, files.name]);
    };
    
    const openUploadedFile = (index) => {
        const fileURL = URL.createObjectURL(uploadedFiles[index]);
        window.open(fileURL); // Open the file in a new tab
    };
    
    const handleRemoveFile = (index) => {
        setUploadFilenames((prev) => prev.filter((_, i) => i !== index)); // Remove the filename
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index)); // Remove the file object
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const customHeaders = {
        "Content-Type": "application/json",
    };

    const userToken = useSelector((state)=>{
        return state.token;//.data;
      });
    console.log("UserToken:",userToken);
     
    const headers = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
    'Authorization': 'Bearer ' + userToken // Ensure userToken is defined
    };
      console.log(headers);
      const headerData = {
                headers: headers
            };

    // const userToken = useSelector((state)=>{
    //     return state.token;//.data;
    //   });
    // const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1NzEsImVtcF9pZCI6InNmMDAwMDAwMSIsImVtcF9uYW1lIjoidGVzdFVzZXIxIiwiZW1wX2VtYWlsIjoidGVzdHVzZXIxQHNwYW5kYW5hc3Bob29ydHkuY29tIiwicm9sZV9pZCI6MSwiaWF0IjoxNzI3OTU1NzMxLCJleHAiOjE3Mjc5NTkzMzF9.xTwc_7a9ZPjAMRkSBiTkwPcoS4H0uIfwD96rhV0m7rc";
    
    //   const headers = {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${userToken}`, // Add this if required
    //   };

    // const handleSubmit = () => {
    //     const formData = new FormData(); // Create a FormData object
    
    //     // Append files to FormData
    //     uploadedFiles.forEach(file => {
    //         formData.append("files[]", file); // Name the file array appropriately
    //     });
    
    //     // Append other data to FormData
    //     formData.append("title", title);
    //     formData.append("description", description);
    //     formData.append("reviewer_id", selectedReviewer || null);
    //     formData.append("approver_ids", JSON.stringify(selectedApprovalMembers || [])); // Convert array to string
    //     formData.append("user_group", selectedUserGroup || null);
    
    //     console.log("Request Data:", formData);

    //     const url = "http://localhost:3000/policy/";
    
    //     fetch(url, {
    //         method: "POST",
    //         headers: headers,
    //         body: formData, // Send the FormData object
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log("Server Response:", data);
    //         if (data.status) {
    //             console.log("Successfully submitted");
    //         } else {
    //             console.log("Error");
    //         }
    //         setLoading(false); // Reset loading state
    //     })
    //     .catch(error => {
    //         console.error("Submission error:", error);
    //         setLoading(false); // Reset loading state
    //     });
    // };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        if (!title || !description || uploadedFiles.length === 0 || !selectedReviewer || selectedApprovalMembers.length === 0 || selectedUserGroup.length === 0) {
            if (!title || !description || uploadedFiles.length === 0 || selectedUserGroup.length === 0) {
                toast.error("Please fill in all the required fields");
                return;
            }
            return;
        }
        // setDialogTitle("Success");
        // setDialogMessage("Form submitted successfully");
        // setDialogOpen(true);
        // setTimeout(() => {
        //     navigate('/list/psg');
        // }, 2000);

        const url = "http://localhost:3000/policy/";
        const formData = new FormData(); // Create a FormData object
    
        // Append files to FormData
        uploadedFiles.forEach(file => {
            formData.append("files[]", file); // Name the file array appropriately
        });
    
        // Append other data to FormData
        formData.append("title", title);
        formData.append("description", description);
        formData.append("reviewer_id", selectedReviewer || null);
        formData.append("approver_ids", JSON.stringify(selectedApprovalMembers || [])); // Convert array to string
        formData.append("user_group", selectedUserGroup || null);
    
        const submitPromise=fetch(url, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${userToken}`, // Example header for token authentication
                // Note: Do not include 'Content-Type: application/json' when sending FormData
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


        toast.promise(submitPromise, {
            loading: 'Submitting...',
            success: (data) => `Policy Initiated Successfully`, // Adjust based on your API response
            error: (err) => `Error while Initiating`,
          });
        // console.log("Result:",result);
        // if (response.ok && result?.status) {
        //     console.log("Successfully submitted");
        // } else {
        //     // setPasswordError("Invalid employee ID or password");
        // }
        // } catch (error) {
        // console.error(error);
        // // setPasswordError("Failed to load, please try again later.");
        // }
    }
    // const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1NzEsImVtcF9pZCI6InNmMDAwMDAwMSIsImVtcF9uYW1lIjoidGVzdFVzZXIxIiwiZW1wX2VtYWlsIjoidGVzdHVzZXIxQHNwYW5kYW5hc3Bob29ydHkuY29tIiwicm9sZV9pZCI6MSwiaWF0IjoxNzI3OTY5NjQwLCJleHAiOjE3Mjc5NzMyNDB9.uI74ktmWkddM8N7j0_HI36TgAbrjHHElMQeYU2S49UU';

//     const handleSubmit = async (e) => {
//   e.preventDefault();

//   const payload = {
//     title: title,
//     description: description,
//     files: uploadFilenames || [],
//     reviewer_id: selectedReviewer || null,
//     approver_ids: selectedApprovalMembers || [],
//     user_group: selectedUserGroup || null,
//   };

//   try {
//     const response = await fetch('http://localhost:3000/policy', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${userToken}`, // Ensure userToken is defined
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Success:', data);
//   } catch (error) {
//     console.error('Error during submission:', error);
//   }
// };

    
    return(
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={2}>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                        Initiate a Policy, SOP or Guidance note
                    </Typography>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '0.875rem'}}>
                        Type of Document
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Controller
                        name="documentType"
                        control={control}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="document-type-label"
                            id="documentType"
                            value={documentType}
                            // required
                            onChange={(e) => {
                                setDocumentType(e.target.value);
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
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '0.875rem'}}>
                        Title
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs>
                            <TextField
                            id='title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            // multiline
                            rows={1}
                            maxRows={1}
                            variant="outlined"
                            fullWidth
                            placeholder="Enter the title"
                            // required
                            inputProps={{ maxLength: 100 }}
                            InputProps={{
                                style: {
                                fontFamily: 'sans-serif', 
                                fontSize: '0.875rem',
                                height: '30px',
                                },
                            }}
                            />
                        </Grid>
                    </Grid>
                    </Grid>
                </Grid>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '0.875rem'}}>
                        Description
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs>
                            <TextField
                            id='description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={2}
                            maxRows={2}
                            variant="outlined"
                            fullWidth
                            placeholder="Enter the description"
                            // required
                            inputProps={{ maxLength: 1000 }}
                            InputProps={{
                                style: {
                                fontFamily: 'sans-serif', 
                                fontSize: '0.875rem',
                                // height: '30px',
                                },
                            }}
                            />
                        </Grid>
                    </Grid>
                    </Grid>
                </Grid>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                    <Grid container alignItems="flex-start" spacing={2}>
                        <Grid item xs={3} sm={3} md={3} lg={3}>
                            <Typography 
                                variant="h5" 
                                sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', alignSelf: 'flex-start' }} // Adjust lineHeight to match button height
                            >
                                Upload
                            </Typography>
                        </Grid>
                        <Grid item xs={9} sm={9} md={9} lg={9}>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <Grid container alignItems="center">
                                        <Grid item>
                                            <Button
                                                variant="contained"
                                                component="label"
                                                sx={{
                                                    fontFamily: 'sans-serif',
                                                    fontSize: '0.875rem',
                                                    height: '30px',
                                                }}
                                            >
                                                Upload
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept=".doc, .docx"
                                                    multiple // Allow multiple file selection
                                                    onChange={(e) => handleFileUpload(e)} // Handle file upload
                                                />
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                {/* Display uploaded filenames below the upload button */}
                                <Grid item>
                                    <Grid container direction="column" spacing={0}>
                                        {uploadFilenames.map((filename, index) => (
                                            <Grid item key={index} container alignItems="center" spacing={1}>
                                                <Grid item>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            cursor: 'pointer', 
                                                            fontFamily: 'sans-serif', 
                                                            fontSize: '0.875rem',
                                                            marginRight: 1 // Add some space between filename and close button
                                                        }}
                                                        onClick={() => openUploadedFile(index)} // Open specific file on click
                                                    >
                                                        {filename}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <IconButton onClick={() => handleRemoveFile(index)} aria-label="remove file" size="small">
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '0.875rem'}}>
                        Select the Reviewer
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Controller
                        name="reviewer"
                        control={control}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="reviewer-label"
                            id="reviewer"
                            value={selectedReviewer}
                            // required
                            onChange={(e) => {
                                setSelectedReviewer(e.target.value);
                            }}
                            >
                            <option value="">Select a reviewer</option>
                            {reviewers.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                    <ListItemText primary={option.label} />
                                    </MenuItem>
                                ))}
                            </StyledSelect>
                        )}
                    />
                    </Grid>
                </Grid>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={3} sm={3} md={3} lg={3}>
                            <Typography 
                                variant="h5" 
                                sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}
                            >
                                Select Approval committee members
                            </Typography>
                        </Grid>
                        <Grid item xs={9} sm={9} md={9} lg={9}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs>
                                    <FormControl variant="outlined" fullWidth sx={{ position: 'relative' }}>
                                        <Controller
                                            name="approvalMembers"
                                            control={control}
                                            render={({ field }) => (
                                                <StyledSelect
                                                    labelId="approval-members-label"
                                                    id="approvalMembers"
                                                    multiple
                                                    value={selectedApprovalMembers}
                                                    onChange={(e) => {
                                                        handleSelectChangeApprovalMembers(e); // Update local state
                                                        field.onChange(e); // Update react-hook-form state
                                                    }}
                                                    renderValue={renderPriorityValue} // Function to render the value
                                                    >
                                                    {approvalMembersOptions.map((member) => (
                                                        <MenuItem key={member.value} value={member.value}>
                                                        <Checkbox checked={selectedApprovalMembers.indexOf(member.value) > -1} />
                                                        <ListItemText
                                                            primary={`${priorityOrder.indexOf(member.value) > -1 ? `${priorityOrder.indexOf(member.value) + 1}. ` : ''}${member.label}`}
                                                        />
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography 
                    variant="h5" 
                    sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}
                    >
                    Select User Groups for publishing
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs>
                            <FormControl variant="outlined" fullWidth sx={{ position: 'relative' }}>
                            {/* <Controller
                            name="userGroups"
                            control={control}
                            render={({ field }) => (
                                <StyledSelect
                                labelId="user-groups-label"
                                id="userGroups"
                                // required
                                multiple
                                value={selectedUserGroup}
                                onChange={(e) => {
                                    handleSelectChangeUserGroups(e); // Limit selection to 3
                                    setSelectedUserGroup(e.target.value);
                                }}
                                renderValue={(selected) => selected.map((val) => userGroupOptions.find(opt => opt.value === val)?.label).join(', ')}
                                >
                                {userGroupOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                    <Checkbox checked={selectedUserGroup.indexOf(option.value) > -1} />
                                    <ListItemText primary={option.label} />
                                    </MenuItem>
                                ))}
                                </StyledSelect>
                            )}
                            /> */}
                            <Controller
                                name="userGroups"
                                control={control}
                                render={({ field }) => (
                                    <StyledSelect
                                    labelId="user-groups-label"
                                    id="userGroups"
                                    value={selectedUserGroup}
                                    // required
                                    onChange={(e) => {
                                        setSelectedUserGroup(e.target.value);
                                    }}
                                    >
                                    <option value="">Select a user group</option>
                                    {userGroupOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                            <ListItemText primary={option.label} />
                                            </MenuItem>
                                        ))}
                                    </StyledSelect>
                                )}
                            />
                            </FormControl>
                        </Grid>
                    </Grid>
                    </Grid>
                </Grid>
                </Grid>
                <Grid container justifyContent="center" alignItems="center" sx={{ marginTop: 1.5, marginBottom: 1.5 }}>
                    <Button type="submit" variant="contained" sx={{ height: '30px', fontFamily: 'sans-serif', fontSize: '0.875rem' }}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
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
    )
}

export default InitiatePSG;
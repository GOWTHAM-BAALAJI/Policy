import React, { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { NavLink, useNavigate } from "react-router-dom";
import { Autocomplete, Button, Chip, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, ListItemText, MenuItem, FormControl, Grid, IconButton, InputLabel, styled, Select, Typography, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

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
    const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
    const [priorityOrder, setPriorityOrder] = useState([]);
    const [selectedUserGroup, setSelectedUserGroup] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogtitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");

    const approvalMembersOptions = [
        { value: 'SF0064296', label: 'Shalabh Saxena - Chief Executive Officer & Managing director' },
        { value: 'SF0064297', label: 'Ashish Damani - Chief Financial Officer' },
        { value: 'SF0070235', label: 'Vishal Sharma - Chief Operating Officer' },
        { value: 'SF0072729', label: 'Prashant Rai - Chief People Officer' },
        { value: 'CFL0003193', label: 'Sushanta Tripathy - Chief Business Officer' },
        { value: 'SF0065999', label: 'Amit Anand - Chief Risk Officer' },
        { value: 'SF0067776', label: 'Dharmvir kumar Singh - Chief Information Officer' },
        { value: 'SF0051604', label: 'Ramesh Periasamy - Company Secretary' },
        { value: 'SF0066397', label: 'Subhrangsu Chakravarty - Financial Controller' },
        { value: 'SF0067851', label: 'Shilpa Jain - Head Financial reporting' },
        { value: 'SF0071659', label: 'Divaker Jha - Head of Product & Organizational Excellence Dept.' },
    ];

    const userGroupOptions = [
        { value: 1, label: 'Field Staff' },
        { value: 2, label: 'HO Staff' },
        { value: 3, label: 'CBOs' },
        { value: 4, label: 'SVPs' },
        { value: 5, label: 'VPs' },
        { value: 6, label: 'AVPs' },
        { value: 7, label: 'CMs' },
        { value: 8, label: 'BMs' },
        { value: 9, label: 'BQMs' },
        { value: 10, label: 'LOs' },
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

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!documentType || !title || !description || !uploadFilename || !selectedReviewer || selectedApprovalMembers.length === 0 || selectedUserGroup.length === 0) {
            setDialogTitle("Warning");
            setDialogMessage("Please fill in all the required fields");
            setDialogOpen(true);
            return;
        }
        setDialogTitle("Success");
        setDialogMessage("Form submitted successfully");
        setDialogOpen(true);
        setTimeout(() => {
            navigate('/list/psg');
        }, 2000);
    }
    
    return(
        <form onSubmit={handleSubmit}>
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
                            <MenuItem value="">
                            <em>None</em>
                            </MenuItem>
                            <MenuItem value={1}>A</MenuItem>
                            <MenuItem value={2}>B</MenuItem>
                            <MenuItem value={3}>C</MenuItem>
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
                                                        handleSelectChangeApprovalMembers(e);
                                                        field.onChange(e); // Update react-hook-form state
                                                    }}
                                                    renderValue={renderPriorityValue} // Use the function to render the value
                                                >
                                                    {approvalMembersOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            <Checkbox checked={selectedApprovalMembers.indexOf(option.value) > -1} />
                                                            <ListItemText
                                                                primary={`${priorityOrder.indexOf(option.value) > -1 ? `${priorityOrder.indexOf(option.value) + 1}. ` : ''}${option.label}`}
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
                            <Controller
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
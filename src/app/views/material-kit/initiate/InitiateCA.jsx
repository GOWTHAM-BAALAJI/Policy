import React, { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Autocomplete, Button, Chip, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, ListItemText, MenuItem, FormControl, Grid, IconButton, InputLabel, styled, Select, Typography, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
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

const InitiateCA = () => {
    const { control, formState: { errors }, } = useForm();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadFilename, setUploadFilename] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedUserGroup, setSelectedUserGroup] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogtitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const userToken = useSelector((state)=>{
        return state.token;//.data;
      });
    console.log("UserToken:",userToken);

    const userGroupOptions = [
        { value: '2', label: 'Field Staff' },
        { value: '1', label: 'HO Staff' },
        // { value: '3', label: 'Both' },
    ]

    const handleSelectChangeUserGroups = (event) => {
        const value = event.target.value;
        setSelectedUserGroup(value);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          setUploadFilename(file.name); // Store the filename in state
          setUploadedFile(file);
        }
    };

    const openUploadedFile = () => {
        if (uploadedFile) {
          const fileURL = URL.createObjectURL(uploadedFile);
          window.open(fileURL); // Open the file in a new tab
        }
    };

    const handleRemoveFile = () => {
        setUploadFilename(''); // Clear the filename
        setUploadedFile(null); // Remove the uploaded file
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        if (!title || !description || uploadedFile.length === 0 || selectedUserGroup.length === 0) {
            toast.error("Please fill in all the required fields");
            return;
        }
        // setDialogTitle("Success");
        // setDialogMessage("Form submitted successfully");
        // setDialogOpen(true);
        // setTimeout(() => {
        //     navigate('/list/psg');
        // }, 2000);

        const url = "http://localhost:3000/circular-advisories/";
        const formData = new FormData(); // Create a FormData object
    
        //Append files to FormData
        // uploadedFile.forEach(file => {
        //     formData.append("files[]", file); // Name the file array appropriately
        // });
    
        // Append other data to FormData
        formData.append("title", title);
        formData.append("description", description);
        formData.append("files[]",uploadedFile);
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
                    navigate('/list/ca');
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
            success: (data) => `Circular Initiated Successfully`, // Adjust based on your API response
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
    
    return(
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                        Initiate a Circular or Advisory
                    </Typography>
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
                <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}, marginRight: {sm: 2, xs: 2}}}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={3} sm={3} md={3} lg={3}>
                    <Typography 
                    variant="h5" 
                    sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem' }}
                    >
                    Upload
                    </Typography>
                    </Grid>
                    <Grid item xs={9} sm={9} md={9} lg={9}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs>
                            <TextField
                            id="upload"
                            value={uploadFilename}
                            placeholder="Choose a file..."
                            // required
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                style: {
                                fontFamily: 'sans-serif',
                                fontSize: '0.875rem',
                                height: '30px',
                                },
                            }}
                            onChange={(e) => setUploadFilename(e.target.value)}
                            onClick={openUploadedFile}
                            />
                        </Grid>
                        {uploadedFile && (
                            <Grid item>
                                <IconButton onClick={handleRemoveFile} aria-label="remove file" size="small">
                                <CloseIcon />
                                </IconButton>
                            </Grid>
                        )}
                        <Grid item xs>
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
                                accept=".doc, .docx, .pdf"
                                onChange={(e) => handleFileUpload(e)} // Handle file upload
                            />
                            </Button>
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
                <Grid container justifyContent="center" alignItems="center" sx={{ marginTop: 2 }}>
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

export default InitiateCA;
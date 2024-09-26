import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Autocomplete, Button, MenuItem, FormControl, Grid, InputLabel, styled, Select, Typography, TextField } from "@mui/material";

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
    // "& .MuiInputLabel-shrink": {
    //   top: "2px", // Adjust this value to move the label to the border of the box outline
    //   fontSize: "0.75rem", // Optional: Reduce font size when the label is shrunk
    // },
    '& .MuiInputBase-root': {
      height: 30, // Adjust the height as needed
      fontFamily: 'sans-serif',
      fontSize: '0.875rem',
      backgroundColor: 'transparent', // Default background color
    },
  
    // "& .MuiOutlinedInput-root": {
    //   position: "relative", // Ensure the label is positioned relative to the input
    // },
  
    // "& .MuiInputBase-input": {
    //   backgroundColor: "transparent", // Input remains transparent
    //   height: "100%", // Ensure input takes full height
    //   boxSizing: "border-box",
    // },
    // // Override focus and auto-fill background colors
    // '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input': {
    //   backgroundColor: 'transparent', // Remove blue background when focused
    // },
    // '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-input': {
    //   backgroundColor: 'transparent', // Remove blue background on hover
    // },
    // '& input:-webkit-autofill': {
    //   WebkitBoxShadow: '0 0 0 1000px transparent inset', // Remove autofill background
    //   transition: 'background-color 5000s ease-in-out 0s',
    // },
    // '& input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
    //   WebkitBoxShadow: '0 0 0 1000px transparent inset', // Remove autofill background on hover and focus
    // },
}));

const InitiatePSG = () => {
    const { control, setValue, formState: { errors }, } = useForm();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploadFilename, setUploadFilename] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          setUploadFilename(file.name); // Store the filename in state
          // You can also handle the actual file upload logic here
        }
    };
    
    return(
        <form>
            <Grid container spacing={2}>
                <Grid item lg={11} md={11} sm={12} xs={12}>
                    <Typography variant="h5" sx={{fontFamily: 'sans-serif', fontSize: '1.4rem', marginLeft: {sm: 2, xs: 2}, marginTop: {sm: 2, xs: 2}}}>
                        Policies, SOPs and Guidance notes
                    </Typography>
                </Grid>
                <Grid item lg={11} md={11} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}}}>
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
                            {...field}
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
                </Grid>
                <Grid item lg={11} md={11} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}}}>
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
                            required
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
                <Grid item lg={11} md={11} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}}}>
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
                            required
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
                <Grid item lg={11} md={11} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}}}>
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
                            />
                        </Grid>
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
                                onChange={(e) => handleFileUpload(e)} // Handle file upload
                            />
                            </Button>
                        </Grid>
                    </Grid>
                    </Grid>
                </Grid>
                </Grid>
                <Grid item lg={11} md={11} sm={12} xs={12} sx={{ marginLeft: {sm: 2, xs: 2}}}>
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
                                name="empId"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <StyledAutocomplete
                                    {...field}
                                    value={employeeOptions.find(option => option.value === field.value) || null}
                                    options={employeeOptions}
                                    getOptionLabel={(option) => option.label || ""}
                                    onChange={(e, selectedValue) => {
                                        const value = selectedValue?.value || "";
                                        field.onChange(value); // Update form state
                                        setValue('empId'); // Directly set the value
                                    }}
                                    onInputChange={(e, newInputValue) => {
                                        field.onChange(newInputValue); // Update form state
                                        setValue('empId', newInputValue); // Directly set the value
                                    }}
                                    required
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Employee ID"
                                        variant="outlined"
                                        error={!!errors.empId}
                                        helperText={errors.empId?.message}
                                        InputProps={{
                                            ...params.InputProps,
                                            style: {
                                            fontSize: '0.875rem', // Adjust font size
                                            fontFamily: 'sans-serif', // Adjust font family
                                            },
                                        }}
                                        inputProps={{
                                            ...params.inputProps,
                                        }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.value === value || value === ""}
                                    />
                                )}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    </Grid>
                </Grid>
                </Grid>
            </Grid>
        </form>
    )
}

export default InitiatePSG;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Autocomplete,
  Button,
  Chip,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
  MenuItem,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  styled,
  Select,
  Typography,
  TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import useCustomFetch from "../../../hooks/useFetchWithAuth";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "20px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "30px", // Ensure the select component itself has a defined height
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px", // Apply the height to the input base
    alignItems: "center", // Align the content vertically
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px", // Set the line height to match the height of the input
    top: "40", // Align the label at the top of the input
    transform: "none", // Ensure there's no unwanted transformation
    left: "20px", // Add padding for better spacing
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px" // Move the label when focused or with content
  }
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
    transition: "top 0.2s ease-out, font-size 0.2s ease-out"
  },
  "& .MuiInputLabel-shrink": {
    top: "2px", // Adjust this value to move the label to the border of the box outline
    fontSize: "0.75rem" // Optional: Reduce font size when the label is shrunk
  },
  "& .MuiInputBase-root": {
    height: 30, // Adjust the height as needed
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    backgroundColor: "transparent" // Default background color
  },

  "& .MuiOutlinedInput-root": {
    position: "relative" // Ensure the label is positioned relative to the input
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent", // Input remains transparent
    height: "100%", // Ensure input takes full height
    boxSizing: "border-box"
  },
  // Override focus and auto-fill background colors
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
    backgroundColor: "transparent" // Remove blue background when focused
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-input": {
    backgroundColor: "transparent" // Remove blue background on hover
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset", // Remove autofill background
    transition: "background-color 5000s ease-in-out 0s"
  },
  "& input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 1000px transparent inset" // Remove autofill background on hover and focus
  }
}));

const CustomDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    backgroundColor: "rgb(27,28,54)",
    color: "white"
  }
}));

const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: "white"
}));

const CustomDialogContent = styled(DialogContent)(({ theme }) => ({
  color: "white"
}));

const CustomDialogActions = styled(DialogActions)(({ theme }) => ({
  "& .MuiButton-root": {
    color: "white"
  }
}));

const InitiateCA = () => {
  const {
    control,
    formState: { errors }
  } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth=useCustomFetch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadFilename, setUploadFilename] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  console.log("User group options: ", userGroupOptions);
  const [selectedUserGroup, setSelectedUserGroup] = useState([]);
  const [selectedUserGroupSum, setSelectedUserGroupSum] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogtitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  // const userGroupOptions = [
  //   { value: "2", label: "Field Staff" },
  //   { value: "1", label: "HO Staff" }
  //   // { value: '3', label: 'Both' },
  // ];

  const handleCheckboxChange = (optionValue) => {
    setSelectedUserGroup((prevSelected) => {
      const updatedSelection = prevSelected.includes(optionValue)
        ? prevSelected.filter((item) => item !== optionValue) // Deselect if already selected
        : [...prevSelected, optionValue]; // Add if not selected

      // Calculate the sum of selected values
      const newTotalValue = updatedSelection.reduce((sum, value) => sum + value, 0);
      console.log("New total value: ", newTotalValue);
      setSelectedUserGroupSum(newTotalValue);
      console.log("Selected User group total sum: ", selectedUserGroupSum);

      return updatedSelection;
    });
  };

  useEffect(() => {
    console.log("Selected User group total sum:", selectedUserGroupSum);
  }, [selectedUserGroupSum]);

  const handleSelectChangeUserGroups = (event) => {
    const value = event.target.value;
    console.log("User group values:", value);
    const sum = value.reduce((acc, curr) => acc + curr, 0);
    console.log("Sum of selected user group values:", sum);
    setSelectedUserGroup(value);
    setSelectedUserGroupSum(sum);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedFile.length + files.length > 10) {
      toast.error("You can only upload a maximum of 10 files.");
      return;
    }
    files.forEach((file) => {
      setUploadFilename((prev) => [...prev, file.name]); // Store the filenames in state
      setUploadedFile((prev) => [...prev, file]); // Store the file objects
    });
  };

  const openUploadedFile = (index) => {
    const fileURL = URL.createObjectURL(uploadedFile[index]);
    window.open(fileURL); // Open the file in a new tab
  };

  const handleRemoveFile = (index) => {
    setUploadFilename((prev) => prev.filter((_, i) => i !== index)); // Remove the filename
    setUploadedFile((prev) => prev.filter((_, i) => i !== index)); // Remove the file object
  };

  // const openUploadedFile = () => {
  //     if (uploadedFile) {
  //       const fileURL = URL.createObjectURL(uploadedFile);
  //       window.open(fileURL); // Open the file in a new tab
  //     }
  // };

  // const handleRemoveFile = () => {
  //     setUploadFilename(''); // Clear the filename
  //     setUploadedFile(null); // Remove the uploaded file
  // };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchUserGroups = async() => {
      try{
        const response = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/auth/get-user-groups","GET",1,{});
        const data = await response.json();
        if (data.status) {
          const categorizedGroups = data.data.reduce((acc, usergroup) => {
            const category = usergroup.category;
            const option = {
              value: usergroup.value,
              label: usergroup.user_group
            };

            if (!acc[category]) {
              acc[category] = []; // Initialize array for a new category
            }

            acc[category].push(option);
            return acc;
          }, {});
          console.log("Categorized groups: ", categorizedGroups);

          setUserGroupOptions(categorizedGroups);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserGroups();
  }, [userToken]);

  // const handleCheckboxChange = (category, value) => {
  //   // Handle checkbox state changes here
  //   console.log(`Checkbox for ${value} in ${category} category changed.`);
  // };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleTitleChange = (e) => {
    if (!(title === "" && e.target.value === " ")) setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    if (!(description === "" && e.target.value === " ")) setDescription(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    if (
      !title.trimStart() ||
      !description.trimStart() ||
      uploadedFile.length === 0 ||
      (selectedUserGroup.length === 0 && selectedUserGroupSum === 0)
    ) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }

    if (uploadedFile.length > 10) {
      toast.error("You can upload a maximum of 10 files only");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }

    const maxFileSizeMB = 5;
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

    const oversizedFile = uploadedFile.some((file) => file.size > maxFileSizeBytes);
    if (oversizedFile) {
      toast.error(`Each file must be smaller than ${maxFileSizeMB} MB`);
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    // setDialogTitle("Success");
    // setDialogMessage("Form submitted successfully");
    // setDialogOpen(true);
    // setTimeout(() => {
    //     navigate('/list/psg');
    // }, 2000);

    const isValidFileFormat = uploadedFile.every(
      (file) =>
        file.name.endsWith(".doc") || file.name.endsWith(".docx") || file.name.endsWith(".pdf")
    );

    if (!isValidFileFormat) {
      toast.error("Please upload only .doc, .docx or .pdf files");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      // setLoading(false);
      return;
    }

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/";
    const formData = new FormData();

    uploadedFile.forEach((file) => {
      formData.append("files[]", file);
    });

    formData.append("title", title.trimStart());
    formData.append("description", description.trimStart());
    // formData.append("files[]",uploadedFile);
    formData.append("user_group", selectedUserGroupSum || 0);

    const submitPromise = customFetchWithAuth(url,"POST",3,formData)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            navigate("/list/ca");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setLoading(false);
        setIsBtnDisabled(false);
        throw error;
      });

    toast.promise(submitPromise, {
      loading: "Submitting...",
      success: (data) => `Circular Initiated Successfully`,
      error: (err) => `Error while Initiating`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "1.4rem",
                  marginLeft: { sm: 2, xs: 2 },
                  marginTop: { sm: 2, xs: 2 },
                  marginRight: { sm: 2, xs: 2 }
                }}
              >
                Initiate a Circular or Advisory
              </Typography>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
            </Grid>
            <Grid
              item
              lg={12}
              md={12}
              sm={12}
              xs={12}
              sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}
            >
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Title <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="title"
                        value={title}
                        onChange={handleTitleChange}
                        // multiline
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        placeholder="Enter title"
                        // required
                        inputProps={{ maxLength: 100 }}
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: "30px"
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}
                    >
                      {title.length}/100 characters
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              lg={12}
              md={12}
              sm={12}
              xs={12}
              sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}
            >
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Description <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="description"
                        value={description}
                        onChange={handleDescriptionChange}
                        multiline
                        rows={2}
                        maxRows={2}
                        variant="outlined"
                        fullWidth
                        placeholder="Enter description"
                        // required
                        inputProps={{ maxLength: 1000 }}
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem"
                            // height: '30px',
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "right", marginTop: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "sans-serif", fontSize: "0.7rem" }}
                    >
                      {description.length}/1000 characters
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              lg={12}
              md={12}
              sm={12}
              xs={12}
              sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}
            >
              <Grid container alignItems="flex-start" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", alignSelf: "flex-start" }}
                  >
                    Upload <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Typography
                    variant="body2" // Use a smaller variant for the message
                    sx={{
                      fontFamily: "sans-serif",
                      fontSize: "0.7rem",
                      color: "#666",
                      marginTop: 0.5
                    }} // Style the message
                  >
                    Maximum 10 files allowed
                  </Typography>
                  <Typography
                    variant="body2" // Use a smaller variant for the message
                    sx={{
                      fontFamily: "sans-serif",
                      fontSize: "0.7rem",
                      color: "#666",
                      marginTop: 0.5
                    }} // Style the message
                  >
                    Allowed extension .doc/.docx/.pdf
                  </Typography>
                  <Typography
                    variant="body2" // Use a smaller variant for the message
                    sx={{
                      fontFamily: "sans-serif",
                      fontSize: "0.7rem",
                      color: "#666",
                      marginTop: 0.5
                    }} // Style the message
                  >
                    Max file size 5Mb
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
                              fontFamily: "sans-serif",
                              fontSize: "0.875rem",
                              height: "30px",
                              backgroundColor: "#ee8812",
                              "&:hover": {
                                backgroundColor: "rgb(249, 83, 22)"
                              }
                            }}
                          >
                            Upload
                            <input
                              type="file"
                              hidden
                              accept=".doc, .docx, .pdf"
                              multiple
                              onChange={(e) => handleFileUpload(e)} // Handle file upload
                            />
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* Display uploaded filenames below the upload button */}
                    <Grid item>
                      <Grid container direction="column" spacing={0}>
                        {uploadFilename.map((filename, index) => (
                          <Grid
                            item
                            key={index}
                            container
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            {/* Left side: Filename */}
                            <Grid item xs>
                              <Typography
                                variant="body2"
                                sx={{
                                  cursor: "pointer",
                                  fontFamily: "sans-serif",
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  color:
                                    filename.slice(-4) == "docx" ||
                                    filename.slice(-4) == ".doc" ||
                                    filename.slice(-4) == ".pdf"
                                      ? "green"
                                      : "red"
                                }}
                                onClick={() => openUploadedFile(index)} // Open specific file on click
                              >
                                {index + 1}.{" "}
                                {filename.length > 40
                                  ? filename.substring(0, 37) + "... ." + filename.split(".").pop()
                                  : filename}
                              </Typography>
                            </Grid>

                            {/* Right side: Size and Remove Button */}
                            <Grid
                              item
                              container
                              direction="row"
                              alignItems="center"
                              justifyContent="flex-end"
                              xs
                            >
                              <Typography
                                sx={{
                                  marginRight: 1,
                                  color:
                                    uploadedFile[index].size >= 5 * 1024 * 1024 ? "red" : "green"
                                }}
                              >
                                {(uploadedFile[index].size / (1024 * 1024)).toFixed(2)} MB
                              </Typography>
                              <IconButton
                                onClick={() => handleRemoveFile(index)}
                                aria-label="remove file"
                                size="small"
                              >
                                <CloseIcon />
                              </IconButton>
                            </Grid>

                            {/* Horizontal line */}
                            <Grid item xs={12}>
                              <hr
                                style={{
                                  border: "none",
                                  borderTop: "1px solid #ccc",
                                  margin: "5px 0"
                                }}
                              />
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              lg={12}
              md={12}
              sm={12}
              xs={12}
              sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Select User Groups for publishing <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <FormControl variant="outlined" fullWidth sx={{ position: "relative" }}>
                        <Controller
                          name="userGroups"
                          control={control}
                          render={({ field }) => (
                            <StyledSelect
                              labelId="user-groups-label"
                              id="userGroups"
                              value={selectedUserGroup}
                              multiple
                              displayEmpty
                              onChange={(e) => field.onChange(selectedUserGroup)} // Pass the current state directly
                              renderValue={(selected) =>
                                selected.length > 0 ? (
                                  selected
                                    .map(
                                      (value) =>
                                        Object.values(userGroupOptions)
                                          .flat()
                                          .find((option) => option.value === value)?.label
                                    )
                                    .join(", ")
                                ) : (
                                  <span style={{ color: "#bdbdbd" }}>Select a user group</span>
                                )
                              }
                            >
                              <MenuItem value="" disabled>
                                <ListItemText
                                  style={{ color: "#bdbdbd" }}
                                  primary="Select a user group"
                                />
                              </MenuItem>
                              {Object.entries(userGroupOptions).map(([category, options]) => (
                                <div key={category}>
                                  {/* Category Header */}
                                  <MenuItem>
                                    <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                      {category}
                                    </Typography>
                                  </MenuItem>
                                  {options.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      <Checkbox
                                        sx={{
                                          "&.Mui-checked": {
                                            color: "#ee8812" // Change this to your desired color
                                          }
                                        }}
                                        checked={selectedUserGroup.includes(option.value)}
                                        onChange={() => handleCheckboxChange(option.value)} // Use option.value directly
                                      />
                                      <ListItemText primary={option.label} />
                                    </MenuItem>
                                  ))}
                                </div>
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
              <Button
                type="submit"
                disabled={isBtnDisabled}
                variant="contained"
                sx={{
                  mb: 2,
                  height: "30px",
                  fontFamily: "sans-serif",
                  fontSize: "0.875rem",
                  backgroundColor: "#ee8812",
                  "&:hover": { backgroundColor: "rgb(249, 83, 22)" }
                }}
              >
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
            <CustomDialogTitle id="alert-dialog-title">{dialogtitle}</CustomDialogTitle>
            <CustomDialogContent>
              <Typography id="alert-dialog-description">{dialogMessage}</Typography>
            </CustomDialogContent>
            <CustomDialogActions>
              <Button onClick={handleDialogClose} color="primary">
                OK
              </Button>
            </CustomDialogActions>
          </CustomDialog>
        </form>
      </Card>
    </ContentBox>
  );
};

export default InitiateCA;

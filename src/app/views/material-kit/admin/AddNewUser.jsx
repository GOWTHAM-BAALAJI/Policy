import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Button,
  Card,
  Chip,
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
import { useDispatch, useSelector } from "react-redux";
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

const AddNewUser = () => {
  const {
    control,
    setValue,
    formState: { errors }
  } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth=useCustomFetch();

  const [empID, setEmpID] = useState("");
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empMobile, setEmpMobile] = useState("");
  const [role, setRole] = useState([]);
  const [roleSum, setRoleSum] = useState(0);
  const [othersSelected, setOthersSelected] = useState(false);
  const [designation, setDesignation] = useState("");
  const [state, setState] = useState("");
  const [clusterID, setClusterID] = useState("");
  const [selectedUserGroup, setSelectedUserGroup] = useState("");
  console.log("Selected User Group: ",selectedUserGroup);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUserGroupSum, setSelectedUserGroupSum] = useState(0);
//   const [status, setStatus] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadFilenames, setUploadFilenames] = useState([]); // Store multiple filenames
  const [uploadedFiles, setUploadedFiles] = useState([]); // Store multiple file objects
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [approvalMembers, setApprovalMembers] = useState([]);
  const [selectedApprovalMembers, setSelectedApprovalMembers] = useState([]);
  const [priorityOrder, setPriorityOrder] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  console.log("Categorized user options -----------", categorizedUserGroupOptions);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogtitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const roleIDOptions = [
    { value: 1, label: "Initiator" },
    { value: 2, label: "Reviewer" },
    { value: 4, label: "Approver" },
    { value: 8, label: "Admin" },
    { value: 16, label: "View Access Only" },
  ];

  useEffect(() => {
    const sum = role.reduce((total, selectedValue) => {
        const roleOption = roleIDOptions.find(option => option.value === selectedValue);
        return total + (roleOption ? roleOption.value : 0);
    }, 0);
    setRoleSum(sum);
  }, [role]);

  useEffect(() => {
    console.log("Selected role sum:", roleSum);
  }, [roleSum]);

  const handleRoleChange = (event) => {
    const value = event.target.value;
    setRole((prevSelectedRoles) =>
      prevSelectedRoles.includes(value)
        ? prevSelectedRoles.filter((option) => option !== value) // Deselect role
        : [...prevSelectedRoles, value] // Select role
    );
  };

//   const status_types = [
//     { value: "1", label: "Active" },
//     { value: "2", label: "Inactive" },
//   ];

  const handleCheckboxChange = (optionValue, category) => {
    setSelectedUserGroup((prevSelected) => {
        const updatedSelection = prevSelected.includes(optionValue)
            ? prevSelected.filter((item) => item !== optionValue) // Deselect if already selected
            : [...prevSelected, optionValue]; // Add if not selected

        // Calculate the sum of selected values
        const newTotalValue = updatedSelection.reduce((sum, value) => sum + value, 0);
        setSelectedUserGroupSum(newTotalValue);
        console.log("New total value:", newTotalValue);

        // Check if the selected category should be updated or cleared
        if (updatedSelection.length === 0) {
            setSelectedCategory(null); // Clear category if nothing is selected
        } else if (!prevSelected.includes(optionValue)) {
            setSelectedCategory(category); // Set the category when a new option is selected
        } else if (!updatedSelection.some((item) =>
            userGroupOptions[category].some(option => option.value === item)
        )) {
            setSelectedCategory(null); // Reset category if no items remain in it
        }

        return updatedSelection;
    });
  };

  useEffect(() => {
    console.log("Selected User group total sum:", selectedUserGroupSum);
  }, [selectedUserGroupSum]);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  const headers = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    Authorization: "Bearer " + userToken // Ensure userToken is defined
  };
  const headerData = {
    headers: headers
  };

  useEffect(() => {
    const fetchUserGroups = async() => {
      try{
        const response = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/auth/get-user-groups","GET",{},{
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        })
        const data = await response.json();
        if (data.status) {
          const fetchedUserGroups = data.data.map((usergroup) => ({
            value: usergroup.value,
            label: usergroup.user_group,
            category: usergroup.category
          }));

          // Categorize user groups
          const categorizedGroups = fetchedUserGroups.reduce((acc, usergroup) => {
            const { category } = usergroup;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(usergroup);
            return acc;
          }, {});

          // Set the state for both user group options and categorized user group options
          setUserGroupOptions(fetchedUserGroups);
          setCategorizedUserGroupOptions(categorizedGroups);

          console.log("Fetched user groups from useEffect: ", fetchedUserGroups);
          console.log("Categorized user groups: ", categorizedGroups);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserGroups();
  }, [userToken]);

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    if (
      !empID ||
      !empName ||
      !empEmail ||
      (!empMobile && empMobile.length === 0) ||
      (role.length === 0 && roleSum === 0) ||
      !designation ||
      !selectedUserGroup
    ) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/admin/add-user";
    const formData = {
      emp_id: empID,
      emp_name: empName,
      emp_email: empEmail,
      emp_mobile: empMobile,
      role_id: roleSum,
      designation: designation,
      state: state,
      cluster_id: clusterID,
      user_group: selectedUserGroup
    };

    // formData.append("emp_id", empID);
    // formData.append("emp_name", empName);
    // formData.append("emp_email", empEmail);
    // formData.append("emp_mobile", empMobile);
    // formData.append("role_id", roleSum || 0);
    // formData.append("designation", designation);
    // formData.append("state", state || "");
    // formData.append("cluster_id", clusterID || "");
    // formData.append("user_group", selectedUserGroup || 0);

    const submitPromise = customFetchWithAuth(url,"POST",JSON.stringify(formData), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(formData)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsBtnDisabled(false);
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(false);
        setLoading(false);
        throw error;
      });

    toast.promise(submitPromise, {
      loading: "Adding...",
      success: (data) => `New user added successfully`,
      error: (err) => `Error while adding the new user`
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
                Add a New User
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
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Employee ID <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empid"
                        value={empID}
                        onChange={(e) => setEmpID(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee ID"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    Employee Name <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empname"
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee Name"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    Employee Email <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empemail"
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee Email"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    Mobile Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empmobile"
                        value={empMobile}
                        onChange={(e) => setEmpMobile(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee Mobile Number"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    Roles <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <FormControl variant="outlined" fullWidth sx={{ position: "relative" }}>
                      <Controller
                        name="roles"
                        control={control}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="roles-label"
                            id="roles"
                            value={role}  // Sync value with Controller
                            multiple
                            displayEmpty
                            onChange={(event) => {
                                const selectedValues = event.target.value;
                                setRole(selectedValues);
                                field.onChange(selectedValues);
                                setOthersSelected(selectedValues.includes(16));
                            }}
                            renderValue={(selected) =>
                                selected.length > 0 ? (
                                selected
                                    .map(
                                    (value) =>
                                        roleIDOptions.find((option) => option.value === value)?.label // Find label by value
                                    )
                                    .join(", ") // Join all selected labels with commas
                                ) : (
                                <span style={{ color: "#bdbdbd" }}>Select the roles</span> // Placeholder when no roles are selected
                                )
                            }
                            >
                            <MenuItem value="" disabled>
                                <ListItemText
                                style={{ color: "#bdbdbd" }}
                                primary="Select a role"
                                />
                            </MenuItem>
                            {roleIDOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value} disabled={(othersSelected && option.value !== 16)||(!othersSelected && option.value === 16 && role.length > 0)}>
                                <Checkbox
                                    sx={{
                                        "&.Mui-checked": {
                                        color: "#ee8812" // Change this to your desired color
                                        }
                                    }}
                                    checked={role.indexOf(option.value) > -1}  // Check if the option is selected
                                />
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
                    Designation <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee Designation"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    State
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empstate"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder="Enter the Employee State"
                        fullWidth
                        InputProps={{
                          style: {
                            fontFamily: "sans-serif",
                            fontSize: "0.875rem",
                            height: '30px',
                          }
                        }}
                      />
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
                    User Group <span style={{ color: "red" }}>*</span>
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
                        value={selectedUserGroup || ""}
                        displayEmpty
                        onChange={(e) => {
                          setSelectedUserGroup(e.target.value);
                        }}
                      >
                        <MenuItem value="" disabled>
                          <ListItemText
                            style={{ color: "#bdbdbd" }}
                            primary="Select a user group"
                          />
                        </MenuItem>
                        {userGroupOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                        {/* <Controller
                          name="userGroups"
                          control={control}
                          render={({ field }) => (
                            <StyledSelect
                              labelId="user-groups-label"
                              id="userGroups"
                              value={field.value || ""}
                              displayEmpty
                              onChange={(e) => {
                                field.onChange(e.target.value); // Sync Controller's field value
                                setSelectedUserGroup(e.target.value); // Update local state
                              }}
                            >
                              <MenuItem value="" disabled>
                                <ListItemText
                                  style={{ color: "#bdbdbd" }}
                                  primary="User Group"
                                />
                              </MenuItem>
                              {Object.entries(categorizedUserGroupOptions).map(([category, options]) => (
                                <div key={category}>
                                  <MenuItem>
                                    <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                      {category}
                                    </Typography>
                                  </MenuItem>
                                  {options.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      <ListItemText primary={option.label} />
                                    </MenuItem>
                                  ))}
                                </div>
                              ))}
                            </StyledSelect>
                          )}
                        /> */}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* <Grid
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
                    Employee Status <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Controller
                    name="empstatus"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        labelId="status-type-label"
                        id="empstatus"
                        value={status || ""}
                        displayEmpty
                        onChange={(e) => {
                          setStatus(e.target.value);
                        }}
                      >
                        <MenuItem value="" disabled>
                          <ListItemText
                            style={{ color: "#bdbdbd" }}
                            primary="Select the employee status"
                          />
                        </MenuItem>
                        {status_types.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                </Grid>
              </Grid>
            </Grid> */}
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              sx={{ marginTop: 1.5, marginBottom: 1.5 }}
            >
              <Button
                type="submit"
                disabled={isBtnDisabled}
                variant="contained"
                sx={{
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

export default AddNewUser;

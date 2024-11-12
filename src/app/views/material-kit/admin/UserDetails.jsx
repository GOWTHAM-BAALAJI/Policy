import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Icon,
  MenuItem,
  ListItemText,
  ListSubheader,
  Paper,
  Select,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TextField,
  IconButton,
  TablePagination,
  Typography
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import img1 from "../../../assets/download_file_icon.png";
import useCustomFetch from "../../../hooks/useFetchWithAuth";

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
  }
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

export default function PolicyDetails() {
  const { control } = useForm();
  const navigate = useNavigate();
  const { user_id } = useParams();
  const location = useLocation();
  const customFetchWithAuth=useCustomFetch();
  const { title, status, activeTab } = location.state || {};

  const [reviewersOptions, setReviewersOptions] = useState([]);
  const [approvalMembersOptions, setApprovalMembersOptions] = useState([]);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  const [sortColumn, setSortColumn] = useState(""); // Column being sorted
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userID, setUserID] = useState(selectedUser?.user_id || "");
  const [documentStatus, setDocumentStatus] = useState(null);
  const [empID, setEmpID] = useState(selectedUser?.emp_id || "");
  const [empName, setEmpName] = useState(selectedUser?.emp_name || "");
  const [empEmail, setEmpEmail] = useState(selectedUser?.emp_email || "");
  const [empMobile, setEmpMobile] = useState(selectedUser?.emp_mobile || "");
  const [roleID, setRoleID] = useState(selectedUser?.role_id || 0);
  const [roleIDLabel, setRoleIDLabel] = useState([]);
  const [designation, setDesignation] = useState(selectedUser?.designation || "");
  const [state, setState] = useState(selectedUser?.state || "");
  const [clusterID, setClusterID] = useState(selectedUser?.cluster_id || "");
  const [userGroup, setUserGroup] = useState(selectedUser?.user_group || 0);
  const [userGroupLabel, setUserGroupLabel] = useState("");
  const [empStatusLabel, setEmpStatusLabel] = useState("");
  const [empStatus, setEmpStatus] = useState(selectedUser?.status || 0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [othersSelected, setOthersSelected] = useState(false);

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  useEffect(() => {
    if (selectedUser) {
      setUserID(selectedUser.user_id || "");
      setEmpID(selectedUser.emp_id || "");
      setEmpName(selectedUser.emp_name || "");
      setEmpEmail(selectedUser.emp_email || "");
      setEmpMobile(selectedUser.emp_mobile || "");
      setRoleID(selectedUser.role_id || 0);
      const roleLabel = selectedRoleIDOptions.find((option) => option.value === selectedUser.role_id)?.label;

      if (roleLabel) {
        const selectedLabels = roleLabel.split(", ").map((label) => label.trim());
        setRoleIDLabel(selectedLabels);
        setOthersSelected(selectedLabels.includes("View Access Only"));
      }
      setDesignation(selectedUser.designation || "");
      setState(selectedUser.state || "");
      setClusterID(selectedUser.cluster_id || "");
      setUserGroup(selectedUser.user_group || 0);
      setEmpStatus(selectedUser.status || 0);
      setEmpStatusLabel(selectedUser.status == 1 ? "Active" : selectedUser.status == 2 ? "Inactive" : "Unknown");
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser?.user_group && userGroupOptions.length > 0) {
      const matchingGroup = userGroupOptions.find(
        (group) => group.value === selectedUser.user_group
      );
      setUserGroupLabel(matchingGroup ? matchingGroup.label : "");
    }
  }, [selectedUser?.user_group, userGroupOptions]);

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Inactive" },
  ];

  const roleIDOptions = [
    { value: 1, label: "Initiator" },
    { value: 2, label: "Reviewer" },
    { value: 4, label: "Approver" },
    { value: 8, label: "Admin" },
    { value: 16, label: "View Access Only" },
  ];

  const selectedRoleIDOptions = [
    { value: 1, label: "Initiator" },
    { value: 2, label: "Reviewer" },
    { value: 3, label: "Initiator, Reviewer" },
    { value: 4, label: "Approver" },
    { value: 5, label: "Initiator, Approver" },
    { value: 6, label: "Reviewer, Approver" },
    { value: 7, label: "Initiator, Reviewer, Approver" },
    { value: 8, label: "Admin" },
    { value: 9, label: "Initiator, Admin" },
    { value: 10, label: "Reviewer, Admin" },
    { value: 11, label: "Initiator, Reviewer, Admin" },
    { value: 12, label: "Approver, Admin" },
    { value: 13, label: "Initiator, Approver, Admin" },
    { value: 14, label: "Reviewer, Approver, Admin" },
    { value: 15, label: "Initiator, Reviewer, Approver, Admin" },
    { value: 16, label: "View Access Only" },
  ];

  // useEffect(() => {
  //   const sum = roleIDLabel.reduce((acc, label) => {
  //     const selectedOption = roleIDOptions.find(option => option.label === label);
  //     return selectedOption ? acc + selectedOption.value : acc;
  //   }, 0);
  //   setRoleID(sum);
  // }, [roleIDLabel]);

  const handleRoleChange = (event) => {
    const selectedLabels = event.target.value;

    // Update the labels
    setRoleIDLabel(selectedLabels);

    // Calculate the sum of selected values
    const sum = selectedLabels.reduce((acc, label) => {
      const selectedOption = roleIDOptions.find(option => option.label === label);
      return selectedOption ? acc + selectedOption.value : acc;
    }, 0);

    // Update the sum and `othersSelected` state
    setRoleID(sum);
    setOthersSelected(selectedLabels.includes("View Access Only"));
  };

  // useEffect(() => {
  //   if (selectedUser?.role_id) {
  //     const matchingRole = roleIDOptions[selectedUser.role_id];
  //     setRoleIDLabel(matchingRole || []); // Set the corresponding label, or empty string if no match
  //   }
  // }, [selectedUser?.role_id]);

  useEffect(() => {
    const fetchUserGroups = async() => {
      try{
        const response = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/auth/get-user-groups","GET",1,{});
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
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserGroups();
  }, [userToken]);

  const [decision, setDecision] = useState("");
  const [documentDecision, setDocumentDecision] = useState("");

  useEffect(() => {
    if (selectedUser && selectedUser?.status !== undefined) {
      setDocumentStatus(selectedUser?.status);
    }
  }, [selectedUser?.status]);

    useEffect(() => {
        if (documentStatus === 1) {
            setDecision("activate");
            setDocumentDecision("activate");
        } else if (documentStatus === 3) {
            setDecision("deprecate");
            setDocumentDecision("deprecate");
        }
    }, [documentStatus]);

  useEffect(() => {
    fetchDocumentDetails(user_id);
  }, [user_id]);

  // useEffect(() => {
  //     if (activeTab) {
  //         fetchDocumentDetails(activeTab); // Replace with your API call to fetch data
  //     }
  // }, [activeTab]);

  const fetchDocumentDetails = async (documentId) => {
    setLoading(true); // Start loading
    setError(null); // Reset error

    try {
      const response = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/admin/get-user/${documentId}`,"GET",1,{});
      const data = await response.json();
      setSelectedUser(data.data); // Set the document data
    //   const decodedToken = jwtDecode(userToken);
    //   if (decodedToken.role_id) {
    //     setRoleId(decodedToken.role_id);
    //   }
    //   if (decodedToken.user_id) {
    //     setUserId(decodedToken.user_id);
    //   }
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Navigates to the previous page
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    // const mappedDecision = mapDecisionToNumber(decision);

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/admin/update-user";

    const formData = {
      user_id: userID,
      emp_id: empID,
      emp_name: empName,
      emp_email: empEmail,
      emp_mobile: empMobile,
      role_id: roleID,
      designation: designation,
      state: state,
      cluster_id: clusterID,
      user_group: userGroup,
      status: empStatus
    };

    const submitForm = customFetchWithAuth(url,"POST",2,JSON.stringify(formData))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false); // Reset loading state
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(false);
        setLoading(false); // Reset loading state
        throw error;
      });

    toast.promise(submitForm, {
      loading: "Updating...",
      success: (data) => `Decision updated successfully`, // Adjust based on your API response
      error: (err) => `Error while updating the decision`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <form onSubmit={handleSubmit}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Grid item>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "sans-serif",
                fontSize: "1.4rem",
                fontWeight: "bold",
                marginTop: 2,
                marginRight: 2,
                marginLeft: 2
              }}
            >
              User Details:
            </Typography>
            </Grid>
            <Grid item>
            <Button
                variant="contained"
                onClick={handleBackClick}
                sx={{
                    marginRight: 2,
                    marginTop: 2,
                    height: "28px",
                    backgroundColor: "#ee8812",
                    "&:hover": { backgroundColor: "rgb(249, 83, 22)" }
                }}
            >
                Back
            </Button>
            </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
            </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid
              item
              lg={12}
              md={12}
              sm={12}
              xs={12}
              sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}
            >
              {selectedUser && (
              <>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    User ID <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="userid"
                        value={userID}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          readOnly: true,
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
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setEmpID(event.target.value)}
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
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setEmpName(event.target.value)}
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
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Employee Email ID <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empemail"
                        value={empEmail}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setEmpEmail(event.target.value)}
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
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Employee Mobile Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empmobile"
                        value={empMobile}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setEmpMobile(event.target.value)}
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
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Role ID <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      {/* <Controller
                        name="roleid"
                        control={control}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="role-id-label"
                            id="roleid"
                            displayEmpty
                            value={roleIDLabel}
                            onChange={(event) => {
                                const selectedValue = event.target.value;
                                setRoleIDLabel(selectedValue);
                                field.onChange(selectedValue);
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : roleIDLabel
                            }}
                            >
                            {Object.entries(roleIDOptions).map(([value, label]) => (
                                <MenuItem key={value} value={label}>
                                    <ListItemText primary={label} />
                                </MenuItem>
                            ))}
                            </StyledSelect>
                        )}
                    /> */}
                    <Controller
                      name="roleid"
                      control={control}
                      defaultValue={roleIDLabel}
                      render={({ field }) => (
                        <StyledSelect
                          labelId="role-id-label"
                          id="roleid"
                          value={field.value ?? roleIDLabel}
                          multiple // Enable multiple selection
                          displayEmpty
                          onChange={(event) => {
                            handleRoleChange(event); // Call our custom handler
                            field.onChange(event.target.value);
                          }}
                          renderValue={(selected) =>
                            selected.length > 0 ? (
                              selected.join(", ") // Join all selected labels with commas
                            ) : (
                              <span style={{ color: "#bdbdbd" }}>Select the roles</span> // Placeholder when no roles are selected
                            )
                          }
                        >
                          <MenuItem value="" disabled>
                            <ListItemText style={{ color: "#bdbdbd" }} primary="Select the roles" />
                          </MenuItem>
                          {roleIDOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.label}
                              disabled={
                                (othersSelected && option.value !== 16) ||
                                (!othersSelected && option.value === 16 && roleIDLabel.length > 0)
                              }
                            >
                              <Checkbox
                                sx={{
                                  "&.Mui-checked": {
                                    color: "#ee8812", // Change this to your desired color
                                  },
                                }}
                                checked={roleIDLabel.indexOf(option.label) > -1} // Check if the option is selected
                              />
                              <ListItemText primary={option.label} />
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      )}
                    />
                    </Grid>
                  </Grid>
                </Grid>
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
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setDesignation(event.target.value)}
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
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    State
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="state"
                        value={state}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => setState(event.target.value)}
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
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    User Group <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                    <Controller
                        name="userGroups"
                        control={control}
                        defaultValue={userGroupLabel}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="user-groups-label"
                            id="userGroups"
                            displayEmpty
                            value={field.value ?? userGroupLabel}
                            onChange={(event) => {
                              const selectedLabel = event.target.value;
                  
                              // Find the selected option object based on the label
                              const selectedOption = userGroupOptions.find(option => option.label === selectedLabel);
                              
                              if (selectedOption) {
                                // Update both label and value
                                setUserGroupLabel(selectedOption.label); // Update label
                                setUserGroup(selectedOption.value); // Update corresponding value
                                field.onChange(selectedOption.value); // Update form field with the value (not label)
                              }
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : userGroupLabel
                            }}
                            >
                            {Object.entries(categorizedUserGroupOptions).map(([category, options]) => (
                              <div key={category}>
                                <ListSubheader disableSticky>
                                  <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                    {category}
                                  </Typography>
                                </ListSubheader>
                                {options.map((option) => (
                                  <MenuItem
                                    key={option.value} // Ensure unique key for each item
                                    value={option.label}
                                    onClick={() => {
                                      setUserGroup(option.value);
                                      setUserGroupLabel(option.label); // Update label
                                      field.onChange(option.label); // Update form control
                                    }}
                                  >
                                    <ListItemText primary={option.label} />
                                  </MenuItem>
                                ))}
                              </div>
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
                            displayEmpty
                            value={userGroupLabel}
                            onChange={(event) => {
                                const selectedValue = event.target.value;
                                setUserGroupLabel(selectedValue);
                                field.onChange(selectedValue);
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : userGroupLabel
                            }}
                            >
                            {Object.entries(categorizedUserGroupOptions).map(
                                ([category, options]) => (
                                <div key={category}>
                                    <MenuItem>
                                    <Typography variant="h8" color="#ee8812" fontWeight="bolder">
                                        {category}
                                    </Typography>
                                    </MenuItem>
                                    {options.map((option) => (
                                    <MenuItem key={option.label} value={option.label} onClick={() => setUserGroupLabel(option.label)}>
                                        <ListItemText primary={option.label} />
                                    </MenuItem>
                                    ))}
                                </div>
                                )
                            )}
                            </StyledSelect>
                        )}
                    /> */}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    Status <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                    <Controller
                        name="empstatus"
                        control={control}
                        defaultValue={empStatusLabel}
                        render={({ field }) => (
                            <StyledSelect
                            labelId="status-label"
                            id="empstatus"
                            displayEmpty
                            value={field.value ?? empStatusLabel}
                            onChange={(event) => {
                                const selectedValue = event.target.value;
                                field.onChange(selectedValue); // Update form field value
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : empStatusLabel
                            }}
                            >
                                {statusOptions.map((option) => (
                                  <MenuItem
                                    key={option.value} // Ensure unique key for each item
                                    value={option.label}
                                    onClick={() => {
                                      setEmpStatus(option.value); // Update label
                                      field.onChange(option.label); // Update form control
                                    }}
                                  >
                                    <ListItemText primary={option.label} />
                                  </MenuItem>
                                ))}
                            </StyledSelect>
                        )}
                    />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
              container
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2 }}
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
              </>
              )}
            </Grid>
        </Grid>
        </form>
      </Card>
    </ContentBox>
  );
}

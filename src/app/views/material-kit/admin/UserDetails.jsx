import React, { useState, useEffect } from "react";
import { Button, Card, Checkbox, Grid, MenuItem, ListItemText, ListSubheader, Select, styled, TextField, Typography } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';

const ContentBox = styled("div")(({ theme }) => ({
  margin: "15px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "30px",
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px",
    alignItems: "center",
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px",
    top: "40",
    transform: "none",
    left: "20px",
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px"
  }
}));

export default function UserDetails() {
  const { control } = useForm();
  const navigate = useNavigate();
  const { user_id } = useParams();
  const location = useLocation();
  const customFetchWithAuth=useCustomFetch();
  const { title, status, activeTab } = location.state || {};

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userID, setUserID] = useState(selectedUser?.user_id || "");
  const [initialuserID, setInitialUserID] = useState(selectedUser?.user_id || "");
  const [documentStatus, setDocumentStatus] = useState(null);
  const [empID, setEmpID] = useState(selectedUser?.emp_id || "");
  const [initialempID, setInitialEmpID] = useState(selectedUser?.emp_id || "");
  const [empName, setEmpName] = useState(selectedUser?.emp_name || "");
  const [initialempName, setInitialEmpName] = useState(selectedUser?.emp_name || "");
  const [empEmail, setEmpEmail] = useState(selectedUser?.emp_email || "");
  const [initialempEmail, setInitialEmpEmail] = useState(selectedUser?.emp_email || "");
  const [empMobile, setEmpMobile] = useState(selectedUser?.emp_mobile || "");
  const [initialempMobile, setInitialEmpMobile] = useState(selectedUser?.emp_mobile || "");
  const [roleID, setRoleID] = useState(selectedUser?.role_id || 0);
  const [initialroleID, setInitialRoleID] = useState(selectedUser?.role_id || 0);
  const [roleIDLabel, setRoleIDLabel] = useState([]);
  const [designation, setDesignation] = useState(selectedUser?.designation || "");
  const [initialdesignation, setInitialDesignation] = useState(selectedUser?.designation || "");
  const [state, setState] = useState(selectedUser?.state || "");
  const [initialstate, setInitialState] = useState(selectedUser?.state || "");
  const [clusterID, setClusterID] = useState(selectedUser?.cluster_id || "");
  const [userGroup, setUserGroup] = useState(selectedUser?.user_group || 0);
  const [initialuserGroup, setInitialUserGroup] = useState(selectedUser?.user_group || 0);
  const [userGroupLabel, setUserGroupLabel] = useState("");
  const [empStatusLabel, setEmpStatusLabel] = useState("");
  const [empStatus, setEmpStatus] = useState(selectedUser?.status || 0);
  const [initialempStatus, setInitialEmpStatus] = useState(selectedUser?.status || 0);
  const [othersSelected, setOthersSelected] = useState(false);

  const userToken = useSelector((state) => {
    return state.token;
  });

  useEffect(() => {
    if (selectedUser) {
      setUserID(selectedUser.user_id || "");
      setInitialUserID(selectedUser.user_id || "");
      setEmpID(selectedUser.emp_id || "");
      setInitialEmpID(selectedUser.emp_id || "");
      setEmpName(selectedUser.emp_name || "");
      setInitialEmpName(selectedUser.emp_name || "");
      setEmpEmail(selectedUser.emp_email || "");
      setInitialEmpEmail(selectedUser.emp_email || "");
      setEmpMobile(selectedUser.emp_mobile || "");
      setInitialEmpMobile(selectedUser.emp_mobile || "");
      setRoleID(selectedUser.role_id || 0);
      setInitialRoleID(selectedUser.role_id || 0);
      const roleLabel = selectedRoleIDOptions.find((option) => option.value === selectedUser.role_id)?.label;
      if (roleLabel) {
        const selectedLabels = roleLabel.split(", ").map((label) => label.trim());
        setRoleIDLabel(selectedLabels);
        setOthersSelected(selectedLabels.includes("View Access Only"));
      }
      setDesignation(selectedUser.designation || "");
      setInitialDesignation(selectedUser.designation || "");
      setState(selectedUser.state || "");
      setInitialState(selectedUser.state || "");
      setClusterID(selectedUser.cluster_id || "");
      setUserGroup(selectedUser.user_group || 0);
      setInitialUserGroup(selectedUser.user_group || 0);
      setEmpStatus(selectedUser.status || 0);
      setInitialEmpStatus(selectedUser.status || 0);
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

  useEffect(() => {
    const fetchUserGroups = async() => {
      try{
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`,"GET",1,{});
        const data = await response.json();
        if (data.status) {
          const fetchedUserGroups = data.data.map((usergroup) => ({
            value: usergroup.value,
            label: usergroup.user_group,
            category: usergroup.category
          }));
          const categorizedGroups = fetchedUserGroups.reduce((acc, usergroup) => {
            const { category } = usergroup;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(usergroup);
            return acc;
          }, {});
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

  useEffect(() => {
    if (selectedUser && selectedUser?.status !== undefined) {
      setDocumentStatus(selectedUser?.status);
    }
  }, [selectedUser?.status]);

  useEffect(() => {
    fetchDocumentDetails(user_id);
  }, [user_id]);

  const fetchDocumentDetails = async (documentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-user/${documentId}`,"GET",1,{});
      const data = await response.json();
      setSelectedUser(data.data);
    } catch (err) {
      setError("Failed to fetch document details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const [initialFormData, setInitialFormData] = useState({});

  useEffect(()=>{
    if (initialuserID) {
      setInitialFormData((prevData) => ({
        ...prevData,
        user_id: initialuserID,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        user_id: "",
      }));
    }
    if (initialempID) {
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_id: initialempID,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_id: "",
      }));
    }
    if (initialempName) {
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_name: initialempName,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_name: "",
      }));
    }
    if (initialempEmail) {
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_email: initialempEmail,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_email: "",
      }));
    }
    if (initialempMobile) {
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_mobile: initialempMobile,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        emp_mobile: "",
      }));
    }
    if (initialroleID) {
      setInitialFormData((prevData) => ({
        ...prevData,
        role_id: initialroleID,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        role_id: 0,
      }));
    }
    if (initialdesignation) {
      setInitialFormData((prevData) => ({
        ...prevData,
        designation: initialdesignation,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        designation: "",
      }));
    }
    if (initialstate) {
      setInitialFormData((prevData) => ({
        ...prevData,
        state: initialstate,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        state: "",
      }));
    }
    if (clusterID) {
      setInitialFormData((prevData) => ({
        ...prevData,
        cluster_id: clusterID,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        cluster_id: "",
      }));
    }
    if (initialuserGroup) {
      setInitialFormData((prevData) => ({
        ...prevData,
        user_group: initialuserGroup,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        user_group: 0,
      }));
    }
    if (initialempStatus) {
      setInitialFormData((prevData) => ({
        ...prevData,
        status: initialempStatus,
      }));
    } else{
      setInitialFormData((prevData) => ({
        ...prevData,
        status: 0,
      }));
    }
  },[initialuserID, initialempID, initialempName, initialempEmail, initialempMobile, initialroleID, initialdesignation, initialstate, clusterID, initialuserGroup, initialempStatus]);

  const [userData, setUserData] = useState({});
  useEffect(()=>{
    if (userID) {
      setUserData((prevData) => ({
        ...prevData,
        user_id: userID,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        user_id: "",
      }));
    }
    if (empID) {
      setUserData((prevData) => ({
        ...prevData,
        emp_id: empID,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        emp_id: "",
      }));
    }
    if (empName.trimStart()) {
      setUserData((prevData) => ({
        ...prevData,
        emp_name: empName.trimStart(),
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        emp_name: "",
      }));
    }
    if (empEmail) {
      setUserData((prevData) => ({
        ...prevData,
        emp_email: empEmail,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        emp_email: "",
      }));
    }
    if (empMobile) {
      setUserData((prevData) => ({
        ...prevData,
        emp_mobile: empMobile,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        emp_mobile: "",
      }));
    }
    if (roleID) {
      setUserData((prevData) => ({
        ...prevData,
        role_id: roleID,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        role_id: 0,
      }));
    }
    if (designation.trimStart()) {
      setUserData((prevData) => ({
        ...prevData,
        designation: designation.trimStart(),
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        designation: "",
      }));
    }
    if (state.trimStart()) {
      setUserData((prevData) => ({
        ...prevData,
        state: state.trimStart(),
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        state: "",
      }));
    }
    if (clusterID) {
      setUserData((prevData) => ({
        ...prevData,
        cluster_id: clusterID,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        cluster_id: "",
      }));
    }
    if (userGroup) {
      setUserData((prevData) => ({
        ...prevData,
        user_group: userGroup,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        user_group: 0,
      }));
    }
    if (empStatus) {
      setUserData((prevData) => ({
        ...prevData,
        status: empStatus,
      }));
    } else{
      setUserData((prevData) => ({
        ...prevData,
        status: 0,
      }));
    }
  },[userID, empID, empName, empEmail, empMobile, roleID, designation, state, clusterID, userGroup, empStatus]);

  useEffect(() => {
    let isModified = false;
    if(JSON.stringify(userData) !== JSON.stringify(initialFormData)){
      isModified = true;
    } else{
      isModified = false;
    }
    setIsBtnDisabled(!isModified);
  }, [userData]);

  const isValidFormat = /^(s|S)(f|F)\d{7}$/.test(empID);
  const isExactLength = empID.length === 9;
  const shouldShowEmpIDError = empID.length > 0 && (!isExactLength || !isValidFormat);
  const isValidEmail = /^[a-zA-Z0-9._%+-]+@spandanasphoorty\.com$/.test(empEmail);
  const shouldShowEmpEmailError = empEmail.length > 0 && !isValidEmail;
  const isValidMobileNo = /^[0-9]{10}$/.test(empMobile);
  const isExactMobileNoLength = empMobile.length === 10;
  const shouldShowEmpMobileNoError = empMobile.length > 0 && (!isExactMobileNoLength || !isValidMobileNo);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    if (!empID || !empName || !empEmail || (!empMobile && empMobile.length === 0) || (roleID === 0) || !designation || userGroup === 0) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    if (!/^(s|S)(f|F)\d{7}$/.test(empID) || empID.length !== 9) {
      toast.error("Employee ID must be 9 characters, starting with 'SF' followed by 7 digits");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    if (!/^[a-zA-Z ]+$/.test(empName) || empName.length > 50) {
      toast.error("Employee name must contain only letters and spaces, with a maximum of 50 characters.");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@spandanasphoorty\.com$/.test(empEmail)) {
      toast.error("Employee email must be in the format ********@spandanasphoorty.com");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }
    if (!/^[0-9]{10}$/.test(empMobile) || empMobile.length !== 10) {
      toast.error("Mobile number should be of 10 digits long");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }

    const url = `${process.env.REACT_APP_POLICY_BACKEND}admin/update-user`;

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
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === false) {
          setIsBtnDisabled(false);
          toast.error(data.message);
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
        } else {
          setIsBtnDisabled(true);
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
        setLoading(false);
        throw error;
      });

    toast.promise(submitForm, {
      loading: "Updating...",
      success: (data) => `User details updated successfully`,
      error: (err) => `${err}`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <form onSubmit={handleSubmit}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Grid item>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginTop: 2, marginRight: 2, marginLeft: 2 }}>
                User Details:
              </Typography>
            </Grid>
            {!isXs && (
            <Grid item>
              <Button variant="contained" onClick={handleBackClick} sx={{ marginRight: 2, marginTop: 2, height: "28px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                  Back
              </Button>
            </Grid>
            )}
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
              <span style={{ fontSize: "0.7rem" }}>
                Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
              </span>
            </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              {selectedUser && (
              <>
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
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        fullWidth
                        onChange={(event) => {
                          setUserData({ ...userData, emp_id: event.target.value.toUpperCase() });
                          setEmpID(event.target.value.toUpperCase());
                        }}
                        InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpIDError}
                        helperText={shouldShowEmpIDError? !isExactLength ? "Input must be exactly 9 characters" : "Must start with SF followed by 7 digits" : ""}
                        inputProps={{ maxLength: 9 }}
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
                        onChange={(event) => {
                          setUserData({ ...userData, emp_name: event.target.value });
                          setEmpName(event.target.value);
                        }}
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={/[^a-zA-Z\s]/.test(empName)}
                        helperText={/[^a-zA-Z\s]/.test(empName) ? "Only letters are allowed" : ""}
                        inputProps={{ pattern: "[A-Za-z ]*", maxLength: 50 }}
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
                        onChange={(event) => {
                          setUserData({ ...userData, emp_email: event.target.value });
                          setEmpEmail(event.target.value);
                        }}
                        InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpEmailError}
                        helperText={shouldShowEmpEmailError ? "Email must be in the format *******@spandanasphoorty.com" : ""}
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
                        onChange={(event) => {
                          setUserData({ ...userData, emp_mobile: event.target.value });
                          setEmpMobile(event.target.value);
                        }}
                        InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpMobileNoError}
                        helperText={shouldShowEmpMobileNoError ? (!isExactMobileNoLength ? "Mobile number must be of 10 digits long" : "Mobile number must have numbers only") : ""}
                        inputProps={{ maxLength: 10 }}
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
                    <Controller
                      name="roleid"
                      control={control}
                      render={({ field }) => (
                        <StyledSelect
                          labelId="role-id-label"
                          id="roleid"
                          value={roleIDLabel}
                          multiple
                          displayEmpty
                          onChange={(event) => {
                            const selectedLabels = event.target.value;
                            setRoleIDLabel(selectedLabels);
                            const sum = selectedLabels.reduce((acc, label) => {
                              const selectedOption = roleIDOptions.find(option => option.label === label);
                              return selectedOption ? acc + selectedOption.value : acc;
                            }, 0);
                            setRoleID(sum);
                            setUserData({ ...userData, role_id: sum });
                            setOthersSelected(selectedLabels.includes("View Access Only"));
                            field.onChange(selectedLabels);
                          }}                          
                          renderValue={(selected) =>
                            selected.length > 0 ? (
                              selected.join(", ")
                            ) : (
                              <span style={{ color: "#bdbdbd" }}>Select the roles</span>
                            )
                          }
                        >
                          <MenuItem value="" disabled>
                            <ListItemText style={{ color: "#bdbdbd" }} primary="Select the roles" />
                          </MenuItem>
                          {roleIDOptions.map((option) => (
                            <MenuItem key={option.value} value={option.label} disabled={(othersSelected && option.value !== 16) || (!othersSelected && option.value === 16 && roleIDLabel.length > 0)}>
                              <Checkbox
                                sx={{
                                  "&.Mui-checked": {
                                    color: "#ee8812",
                                  },
                                }}
                                checked={roleIDLabel.indexOf(option.label) > -1}
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
                        onChange={(event) => {
                          setUserData({ ...userData, designation: event.target.value });
                          setDesignation(event.target.value);
                        }}
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
                        onChange={(event) => {
                          setUserData({ ...userData, state: event.target.value });
                          setState(event.target.value);
                        }}
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
                        render={({ field }) => (
                            <StyledSelect
                            labelId="user-groups-label"
                            id="userGroups"
                            displayEmpty
                            value={userGroupLabel || field.value}
                            onChange={(event) => {
                              const selectedLabel = event.target.value;
                              const selectedOption = userGroupOptions.find(option => option.label === selectedLabel);
                              
                              if (selectedOption) {
                                setUserGroupLabel(selectedOption.label);
                                setUserGroup(selectedOption.value);
                                field.onChange(selectedOption.value);
                              }
                              setUserData({ ...userData, user_group: selectedOption.value })
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
                                    key={option.value}
                                    value={option.label}
                                    onClick={() => {
                                      setUserGroup(option.value);
                                      setUserGroupLabel(option.label);
                                      field.onChange(option.label);
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
                                field.onChange(selectedValue);
                                setUserData({ ...userData, status: selectedValue })
                                // setEmpStatus(selectedValue);
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : empStatusLabel
                            }}
                            >
                                {statusOptions.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.label}
                                    onClick={() => {
                                      setEmpStatus(option.value);
                                      field.onChange(option.label);
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
              <Grid container justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ height: "30px", fontFamily: "sans-serif", fontSize: "0.875rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
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

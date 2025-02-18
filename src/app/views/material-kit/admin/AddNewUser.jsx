import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, ListItemText, ListSubheader, MenuItem, FormControl, Grid, styled, Select, Typography, TextField } from "@mui/material";
import { useSelector } from "react-redux";
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

const AddNewUser = () => {
  const { control } = useForm();
  const navigate = useNavigate();
  const customFetchWithAuth = useCustomFetch();

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isCustomScreenXxs = useMediaQuery("(min-width:0px) and (max-width:350px)");
  const isCustomScreenXxs1 = useMediaQuery("(min-width:0px) and (max-width:400px)");

  const [empID, setEmpID] = useState("");
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empMobile, setEmpMobile] = useState("");
  const [role, setRole] = useState([]);
  const [roleSum, setRoleSum] = useState(0);
  const [roleStoresum, setRoleStoreSum] = useState(0);
  const [othersSelected, setOthersSelected] = useState(false);
  const [designation, setDesignation] = useState("");
  const [state, setState] = useState("");
  const [clusterID, setClusterID] = useState("");
  const [selectedUserGroup, setSelectedUserGroup] = useState(0);
  const [userGroupLabel, setUserGroupLabel] = useState("");
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
  const [loading, setLoading] = useState(false);

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
    setRoleStoreSum(roleSum);
  }, [roleSum]);

  const userToken = useSelector((state) => {
    return state.token;
  });

  const handleBackClick = () => {
    navigate("/admin?tab=1");
  };

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`, "GET", 1, {});
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

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

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
    if (!empID || !empName || !empEmail || (!empMobile && empMobile.length === 0) || (role.length === 0 && roleSum === 0) || !designation || selectedUserGroup === 0) {
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
    const url = `${process.env.REACT_APP_POLICY_BACKEND}admin/add-user`;
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

    const submitPromise = customFetchWithAuth(url, "POST", 2, JSON.stringify(formData))
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
    toast.promise(submitPromise, {
      loading: "Adding...",
      success: (data) => `New user added successfully`,
      error: (err) => `${err}`
    });
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Grid item>
              <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", marginLeft: { sm: 2, xs: 2 }, marginTop: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
                Add a New User
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
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                    {isCustomScreenXxs ? "Emp ID" : "Employee ID"} <span style={{ color: "red" }}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <TextField
                        id="empid"
                        value={empID}
                        onChange={(e) => setEmpID(e.target.value.toUpperCase())}
                        rows={1}
                        maxRows={1}
                        variant="outlined"
                        placeholder={isCustomScreenXxs ? "Employee ID" : "Enter the Employee ID"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpIDError}
                        helperText={shouldShowEmpIDError? !isExactLength ? "Input must be exactly 9 characters" : "Must start with SF followed by 7 digits" : ""}
                        inputProps={{ maxLength: 9 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                  {isCustomScreenXxs ? "Emp Name" : "Employee Name"} <span style={{ color: "red" }}>*</span>
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
                        placeholder={isCustomScreenXxs ? "Employee Name" : "Enter the Employee Name"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={/[^a-zA-Z\s]/.test(empName)}
                        helperText={/[^a-zA-Z\s]/.test(empName) ? "Only letters are allowed" : ""}
                        inputProps={{ pattern: "[A-Za-z ]*", maxLength: 50 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                  {isCustomScreenXxs ? "Emp Email" : "Employee Email"} <span style={{ color: "red" }}>*</span>
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
                        placeholder={isCustomScreenXxs ? "Employee Email" : "Enter the Employee Email"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpEmailError}
                        helperText={shouldShowEmpEmailError ? "Email must be in the format *******@spandanasphoorty.com" : ""}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                  {isCustomScreenXxs ? "Mobile No." : "Mobile Number"} <span style={{ color: "red" }}>*</span>
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
                        placeholder={isCustomScreenXxs ? "Mobile Number" : "Enter the Mobile Number"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                        error={shouldShowEmpMobileNoError}
                        helperText={shouldShowEmpMobileNoError ? (!isExactMobileNoLength ? "Mobile number must be of 10 digits long" : "Mobile number must have numbers only") : ""}
                        inputProps={{ maxLength: 10 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
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
                              value={role}
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
                                        roleIDOptions.find((option) => option.value === value)?.label
                                    )
                                    .join(", ")
                                ) : (
                                  <span style={{ color: "#bdbdbd" }}>Select the roles</span>
                                )
                              }
                            >
                              <MenuItem value="" disabled>
                                <ListItemText style={{ color: "#bdbdbd" }} primary="Select the roles" />
                              </MenuItem>
                              {roleIDOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value} disabled={(othersSelected && option.value !== 16) || (!othersSelected && option.value === 16 && role.length > 0)}>
                                  <Checkbox sx={{ "&.Mui-checked": { color: "#ee8812" } }} checked={role.indexOf(option.value) > -1} />
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
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={3} sm={3} md={3} lg={3}>
                  <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
                  {isCustomScreenXxs1 ? "Desig nation" : "Designation"} <span style={{ color: "red" }}>*</span>
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
                        placeholder={isCustomScreenXxs1 ? "Employee Designation" : "Enter the Employee Designation"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
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
                        placeholder={isCustomScreenXxs ? "Employee State" : "Enter the Employee State"}
                        fullWidth
                        InputProps={{ style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
              <Grid container alignItems="center" spacing={2}>
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
                            value={userGroupLabel}
                            onChange={(event) => {
                              const selectedLabel = event.target.value;
                              const selectedOption = userGroupOptions.find(option => option.label === selectedLabel);
                              
                              if (selectedOption) {
                                setUserGroupLabel(selectedOption.label);
                                setSelectedUserGroup(selectedOption.value);
                                field.onChange(selectedOption.value);
                              }
                            }}
                            renderValue={(selected) => {
                                return selected ? selected : <span style={{ color: "#bdbdbd" }}>{isCustomScreenXxs ? "User Group" : "Select a user group"}</span>
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
                                      setSelectedUserGroup(option.value);
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
              </Grid>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" sx={{ marginTop: 1.5, marginBottom: 1.5 }}>
              <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ height: "30px", fontFamily: "sans-serif", fontSize: "0.875rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </ContentBox>
  );
};

export default AddNewUser;

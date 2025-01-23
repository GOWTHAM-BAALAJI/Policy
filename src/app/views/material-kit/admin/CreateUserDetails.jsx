// import React, { useState, useEffect } from "react";
// import { Button, Card, Checkbox, FormControl, Grid, MenuItem, ListItemText, ListSubheader, Select, styled, TextField, Typography } from "@mui/material";
// import { useLocation, useParams } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import useCustomFetch from "../../../hooks/useFetchWithAuth";
// import { useMediaQuery } from '@mui/material';

// const ContentBox = styled("div")(({ theme }) => ({
//     margin: "15px",
//     [theme.breakpoints.down("sm")]: { margin: "16px" }
// }));

// const StyledSelect = styled(Select)(() => ({
//     width: "100%",
//     height: "30px",
//     fontFamily: "sans-serif",
//     fontSize: "0.875rem",
//     "& .MuiInputBase-root": {
//         height: "30px",
//         alignItems: "center",
//         fontFamily: "sans-serif",
//         fontSize: "1.10rem"
//     },
//     "& .MuiInputLabel-root": {
//         lineHeight: "30px",
//         top: "40",
//         transform: "none",
//         left: "20px",
//         fontFamily: "sans-serif",
//         fontSize: "0.875rem"
//     },
//     "& .MuiInputLabel-shrink": {
//         top: "-6px"
//     }
// }));

// export default function CreateUserDetails() {
//     const { control } = useForm();
//     const navigate = useNavigate();
//     // const { id } = useParams();
//     const location = useLocation();
//     const customFetchWithAuth = useCustomFetch();
//     const { id, title, status, activeTab } = location.state || {};

//     useEffect(() => {
//         if (!location.state?.fromHandleRowClick) {
//             navigate(-1);
//         }
//     }, [location.state, navigate]);

//     const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
//     const isCustomScreenXxs = useMediaQuery("(min-width:0px) and (max-width:350px)");
//     const isCustomScreenXxs1 = useMediaQuery("(min-width:0px) and (max-width:400px)");

//     const [userGroupOptions, setUserGroupOptions] = useState([]);
//     const [categorizedUserGroupOptions, setCategorizedUserGroupOptions] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [userID, setUserID] = useState(selectedUser?.id || "");
//     const [initialuserID, setInitialUserID] = useState(selectedUser?.id || "");
//     const [documentStatus, setDocumentStatus] = useState(null);
//     const [empID, setEmpID] = useState(selectedUser?.emp_id || "");
//     const [initialempID, setInitialEmpID] = useState(selectedUser?.emp_id || "");
//     const [empName, setEmpName] = useState(selectedUser?.emp_name || "");
//     const [initialempName, setInitialEmpName] = useState(selectedUser?.emp_name || "");
//     const [empEmail, setEmpEmail] = useState(selectedUser?.emp_email || "");
//     const [initialempEmail, setInitialEmpEmail] = useState(selectedUser?.emp_email || "");
//     const [empMobile, setEmpMobile] = useState(selectedUser?.emp_mobile || "");
//     const [initialempMobile, setInitialEmpMobile] = useState(selectedUser?.emp_mobile || "");
//     // const [roleID, setRoleID] = useState(0);
//     // const [initialroleID, setInitialRoleID] = useState(0);
//     // const [roleIDLabel, setRoleIDLabel] = useState([]);
//     const [role, setRole] = useState([]);
//     const [roleSum, setRoleSum] = useState(0);
//     const [roleStoresum, setRoleStoreSum] = useState(0);
//     const [othersSelected, setOthersSelected] = useState(false);
//     const [designation, setDesignation] = useState(selectedUser?.designation || "");
//     const [initialdesignation, setInitialDesignation] = useState(selectedUser?.designation || "");
//     const [state, setState] = useState(selectedUser?.state || "");
//     const [initialstate, setInitialState] = useState(selectedUser?.state || "");
//     const [clusterID, setClusterID] = useState(selectedUser?.cluster_id || "");
//     const [selectedUserGroup, setSelectedUserGroup] = useState(0);
//     const [userGroupLabel, setUserGroupLabel] = useState("");

//     const userToken = useSelector((state) => {
//         return state.token;
//     });

//     useEffect(() => {
//         if (selectedUser) {
//             setUserID(selectedUser.id || "");
//             setInitialUserID(selectedUser.id || "");
//             setEmpID(selectedUser.emp_id || "");
//             setInitialEmpID(selectedUser.emp_id || "");
//             setEmpName(selectedUser.emp_name || "");
//             setInitialEmpName(selectedUser.emp_name || "");
//             setEmpEmail(selectedUser.emp_email || "");
//             setInitialEmpEmail(selectedUser.emp_email || "");
//             setEmpMobile(selectedUser.emp_mobile || "");
//             setInitialEmpMobile(selectedUser.emp_mobile || "");
//             setDesignation(selectedUser.designation || "");
//             setInitialDesignation(selectedUser.designation || "");
//             setState(selectedUser.state || "");
//             setInitialState(selectedUser.state || "");
//             setClusterID(selectedUser.cluster_id || "");
//         }
//     }, [selectedUser]);

//     const roleIDOptions = [
//         { value: 1, label: "Initiator" },
//         { value: 2, label: "Reviewer" },
//         { value: 4, label: "Approver" },
//         { value: 8, label: "Admin" },
//         { value: 16, label: "View Access Only" },
//     ];

//     useEffect(() => {
//         const sum = role.reduce((total, selectedValue) => {
//             const roleOption = roleIDOptions.find(option => option.value === selectedValue);
//             return total + (roleOption ? roleOption.value : 0);
//         }, 0);
//         setRoleSum(sum);
//     }, [role]);

//     useEffect(() => {
//         setRoleStoreSum(roleSum);
//     }, [roleSum]);

//     useEffect(() => {
//         const fetchUserGroups = async () => {
//             try {
//                 const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}auth/get-user-groups`, "GET", 1, {});
//                 const data = await response.json();
//                 if (data.status) {
//                     const fetchedUserGroups = data.data.map((usergroup) => ({
//                         value: usergroup.value,
//                         label: usergroup.user_group,
//                         category: usergroup.category
//                     }));
//                     const categorizedGroups = fetchedUserGroups.reduce((acc, usergroup) => {
//                         const { category } = usergroup;
//                         if (!acc[category]) {
//                             acc[category] = [];
//                         }
//                         acc[category].push(usergroup);
//                         return acc;
//                     }, {});
//                     setUserGroupOptions(fetchedUserGroups);
//                     setCategorizedUserGroupOptions(categorizedGroups);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUserGroups();
//     }, [userToken]);

//     useEffect(() => {
//         fetchUserDetails(id);
//     }, [id]);

//     const fetchUserDetails = async (userId) => {
//         setLoading(true);
//         setError(null);

//         try {
//             const response = await customFetchWithAuth(`${process.env.REACT_APP_POLICY_BACKEND}admin/get-new-user-details/${userId}`, "GET", 1, {});
//             const data = await response.json();
//             setSelectedUser(data.data);
//         } catch (err) {
//             setError("Failed to fetch user details.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleBackClick = () => {
//         navigate(-1);
//     };

//     const [isBtnDisabled, setIsBtnDisabled] = useState(true);

//     useEffect(() => {
//         let isModified = false;
//         if(roleSum != 0 && selectedUserGroup != 0){
//             isModified = true;
//         } else{
//             isModified = false;
//         }
//         setIsBtnDisabled(!isModified);
//     }, [roleSum, selectedUserGroup]);

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setLoading(true);

//         setIsBtnDisabled(true);

//         if ((role.length === 0 && roleSum === 0) || selectedUserGroup === 0) {
//             toast.error("Please fill in all the required fields");
//             setIsBtnDisabled(true);
//             setTimeout(() => {
//                 setIsBtnDisabled(false);
//             }, 4000);
//             return;
//         }

//         const url = `${process.env.REACT_APP_POLICY_BACKEND}admin/new-user-action`;

//         const formData = {
//             id: userID,
//             role_id: roleSum,
//             user_group: selectedUserGroup,
//         };

//         const submitForm = customFetchWithAuth(url, "POST", 2, JSON.stringify(formData))
//             .then((response) => {
//                 if (!response.ok) {
//                     return response.json().then((errorData) => {
//                         throw new Error(errorData.message || "An error occurred");
//                     });
//                 }
//                 return response.json();
//             })
//             .then((data) => {
//                 if (data.status === false) {
//                     setIsBtnDisabled(false);
//                     toast.error(data.message);
//                     setIsBtnDisabled(true);
//                     setTimeout(() => {
//                         setIsBtnDisabled(false);
//                     }, 4000);
//                 } else {
//                     setIsBtnDisabled(true);
//                     setTimeout(() => {
//                         navigate("/admin");
//                     }, 1000);
//                 }
//                 setLoading(false);
//             })
//             .catch((error) => {
//                 console.error("Submission error:", error);
//                 setIsBtnDisabled(true);
//                 setTimeout(() => {
//                     setIsBtnDisabled(false);
//                 }, 4000);
//                 setLoading(false);
//                 throw error;
//             });

//         toast.promise(submitForm, {
//             loading: "Updating...",
//             success: (data) => `New User added successfully to this application`,
//             error: (err) => `${err}`
//         });
//     };

//     return (
//         <ContentBox className="analytics">
//             <Card sx={{ px: 3, py: 3, height: "100%", width: "100%" }}>
//                 <form onSubmit={handleSubmit}>
//                 {/* <form> */}
//                     <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
//                         <Grid item>
//                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: "bold", marginTop: 2, marginRight: 2, marginLeft: 2 }}>
//                                 New User Details:
//                             </Typography>
//                         </Grid>
//                         {!isXs && (
//                             <Grid item>
//                                 <Button variant="contained" onClick={handleBackClick} sx={{ marginRight: 2, marginTop: 2, height: "28px", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
//                                     Back
//                                 </Button>
//                             </Grid>
//                         )}
//                     </Grid>
//                     <Grid container spacing={2} sx={{ mb: 2 }}>
//                         <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 } }}>
//                             <span style={{ fontSize: "0.7rem" }}>
//                                 Fields marked with (<span style={{ color: "red" }}>*</span>) are mandatory
//                             </span>
//                         </Grid>
//                     </Grid>
//                     <Grid container spacing={2} alignItems="flex-start">
//                         <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: { sm: 2, xs: 2 }, marginRight: { sm: 2, xs: 2 } }}>
//                             {selectedUser && (
//                                 <>
//                                     <Grid container alignItems="center" spacing={2}>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                                 {isCustomScreenXxs ? "Emp ID" : "Employee ID"} <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="empid"
//                                                         value={empID}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, emp_id: event.target.value.toUpperCase() });
//                                                         //     setEmpID(event.target.value.toUpperCase());
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                         // error={shouldShowEmpIDError}
//                                                         // helperText={shouldShowEmpIDError ? !isExactLength ? "Input must be exactly 9 characters" : "Must start with SF followed by 7 digits" : ""}
//                                                         // inputProps={{ maxLength: 9 }}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                             {isCustomScreenXxs ? "Emp Name" : "Employee Name"} <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="empname"
//                                                         value={empName}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, emp_name: event.target.value });
//                                                         //     setEmpName(event.target.value);
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                         // error={/[^a-zA-Z\s]/.test(empName)}
//                                                         // helperText={/[^a-zA-Z\s]/.test(empName) ? "Only letters are allowed" : ""}
//                                                         // inputProps={{ pattern: "[A-Za-z ]*", maxLength: 50 }}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                             {isCustomScreenXxs ? "Emp Email" : "Employee Email"} <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="empemail"
//                                                         value={empEmail}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, emp_email: event.target.value });
//                                                         //     setEmpEmail(event.target.value);
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                         // error={shouldShowEmpEmailError}
//                                                         // helperText={shouldShowEmpEmailError ? "Email must be in the format *******@spandanasphoorty.com" : ""}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                             {isCustomScreenXxs ? "Mobile No." : "Mobile Number"} <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="empmobile"
//                                                         value={empMobile}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, emp_mobile: event.target.value });
//                                                         //     setEmpMobile(event.target.value);
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                         // error={shouldShowEmpMobileNoError}
//                                                         // helperText={shouldShowEmpMobileNoError ? (!isExactMobileNoLength ? "Mobile number must be of 10 digits long" : "Mobile number must have numbers only") : ""}
//                                                         // inputProps={{ maxLength: 10 }}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                                 {isCustomScreenXxs1 ? "Desig nation" : "Designation"} <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="designation"
//                                                         value={designation}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, designation: event.target.value });
//                                                         //     setDesignation(event.target.value);
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                                 State
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <TextField
//                                                         id="state"
//                                                         value={state}
//                                                         rows={1}
//                                                         maxRows={1}
//                                                         variant="outlined"
//                                                         fullWidth
//                                                         // onChange={(event) => {
//                                                         //     setUserData({ ...userData, state: event.target.value });
//                                                         //     setState(event.target.value);
//                                                         // }}
//                                                         InputProps={{ readOnly: true, style: { fontFamily: "sans-serif", fontSize: "0.875rem", height: '30px', } }}
//                                                     />
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                                 Roles <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                                 <Grid item xs>
//                                                     <FormControl variant="outlined" fullWidth sx={{ position: "relative" }}>
//                                                         <Controller
//                                                             name="roles"
//                                                             control={control}
//                                                             render={({ field }) => (
//                                                                 <StyledSelect
//                                                                     labelId="roles-label"
//                                                                     id="roles"
//                                                                     value={role}
//                                                                     multiple
//                                                                     displayEmpty
//                                                                     onChange={(event) => {
//                                                                         const selectedValues = event.target.value;
//                                                                         setRole(selectedValues);
//                                                                         field.onChange(selectedValues);
//                                                                         setOthersSelected(selectedValues.includes(16));
//                                                                     }}
//                                                                     renderValue={(selected) =>
//                                                                         selected.length > 0 ? (
//                                                                             selected
//                                                                                 .map(
//                                                                                     (value) =>
//                                                                                         roleIDOptions.find((option) => option.value === value)?.label
//                                                                                 )
//                                                                                 .join(", ")
//                                                                         ) : (
//                                                                             <span style={{ color: "#bdbdbd" }}>{isCustomScreenXxs ? "Roles" : "Select the roles"}</span>
//                                                                         )
//                                                                     }
//                                                                 >
//                                                                     <MenuItem value="" disabled>
//                                                                         <ListItemText style={{ color: "#bdbdbd" }} primary="Select the roles" />
//                                                                     </MenuItem>
//                                                                     {roleIDOptions.map((option) => (
//                                                                         <MenuItem key={option.value} value={option.value} disabled={(othersSelected && option.value !== 16) || (!othersSelected && option.value === 16 && role.length > 0)}>
//                                                                             <Checkbox sx={{ "&.Mui-checked": { color: "#ee8812" } }} checked={role.indexOf(option.value) > -1} />
//                                                                             <ListItemText primary={option.label} />
//                                                                         </MenuItem>
//                                                                     ))}
//                                                                 </StyledSelect>
//                                                             )}
//                                                         />
//                                                     </FormControl>
//                                                 </Grid>
//                                             </Grid>
//                                         </Grid>
//                                         <Grid item xs={3} sm={3} md={3} lg={3}>
//                                             <Typography variant="h5" sx={{ fontFamily: "sans-serif", fontSize: "0.875rem" }}>
//                                                 User Group <span style={{ color: "red" }}>*</span>
//                                             </Typography>
//                                         </Grid>
//                                         <Grid item xs={9} sm={9} md={9} lg={9}>
//                                             <Grid container alignItems="center" spacing={2}>
//                                             <Grid item xs>
//                                             <Controller
//                                                 name="userGroups"
//                                                 control={control}
//                                                 render={({ field }) => (
//                                                     <StyledSelect
//                                                     labelId="user-groups-label"
//                                                     id="userGroups"
//                                                     displayEmpty
//                                                     value={userGroupLabel}
//                                                     onChange={(event) => {
//                                                         const selectedLabel = event.target.value;
//                                                         const selectedOption = userGroupOptions.find(option => option.label === selectedLabel);
                                                        
//                                                         if (selectedOption) {
//                                                         setUserGroupLabel(selectedOption.label);
//                                                         setSelectedUserGroup(selectedOption.value);
//                                                         field.onChange(selectedOption.value);
//                                                         }
//                                                     }}
//                                                     renderValue={(selected) => {
//                                                         return selected ? selected : <span style={{ color: "#bdbdbd" }}>{isCustomScreenXxs ? "User Group" : "Select a user group"}</span>
//                                                     }}
//                                                     >
//                                                     {Object.entries(categorizedUserGroupOptions).map(([category, options]) => (
//                                                         <div key={category}>
//                                                         <ListSubheader disableSticky>
//                                                             <Typography variant="h8" color="#ee8812" fontWeight="bolder">
//                                                             {category}
//                                                             </Typography>
//                                                         </ListSubheader>
//                                                         {options.map((option) => (
//                                                             <MenuItem
//                                                             key={option.value}
//                                                             value={option.label}
//                                                             onClick={() => {
//                                                                 setSelectedUserGroup(option.value);
//                                                                 setUserGroupLabel(option.label);
//                                                                 field.onChange(option.label);
//                                                             }}
//                                                             >
//                                                             <ListItemText primary={option.label} />
//                                                             </MenuItem>
//                                                         ))}
//                                                         </div>
//                                                     ))}
//                                                     </StyledSelect>
//                                                 )}
//                                             />
//                                             </Grid>
//                                             </Grid>
//                                         </Grid>
//                                     </Grid>
//                                     <Grid container justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
//                                         <Button type="submit" disabled={isBtnDisabled} variant="contained" sx={{ height: "30px", fontFamily: "sans-serif", fontSize: "0.875rem", backgroundColor: "#ee8812", "&:hover": { backgroundColor: "rgb(249, 83, 22)" } }}>
//                                             {isXs ? "Add User" : "Add this user to the application"}
//                                         </Button>
//                                     </Grid>
//                                 </>
//                             )}
//                         </Grid>
//                     </Grid>
//                 </form>
//             </Card>
//         </ContentBox>
//     );
// }

// import { useState, useEffect } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { Card, Checkbox, Grid, TextField, Box, styled, useTheme } from "@mui/material";
// import { LoadingButton } from "@mui/lab";
// import { Formik } from "formik";
// import * as Yup from "yup";

// import { useDispatch } from 'react-redux';
// import { setJwtToken } from '../redux/actions/authActions';
// import {setUserData } from '../redux/actions/userActions';

// import useAuth from "../app/hooks/useAuth";
// import { Paragraph } from "../app/components/Typography";
// // import "../assets/spandana_logo.jpg";

// // STYLED COMPONENTS
// const FlexBox = styled(Box)(() => ({
//   display: "flex"
// }));

// const ContentBox = styled("div")(() => ({
//   height: "100%",
//   padding: "32px",
//   position: "relative",
//   background: "rgba(0, 0, 0, 0.01)"
// }));

// const StyledRoot = styled("div")(() => ({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   backgroundColor: "#1A2038",
//   minHeight: 599,
//   "& .card": {
//     maxWidth: 800,
//     minHeight: 400,
//     margin: "1rem",
//     display: "flex",
//     borderRadius: 12,
//     alignItems: "center"
//   },

//   ".img-wrapper": {
//     height: 300,
//     minWidth: 320,
//     display: "flex",
//     padding: "2rem",
//     alignItems: "center",
//     justifyContent: "center"
//   }
// }));

// // initial login credentials
// const initialValues = {
//   email: "rajesh.gajula@spandanasphoorty.com",
//   password: "123456",
//   remember: true
// };

// // form field validation schema
// const validationSchema = Yup.object().shape({
//   password: Yup.string()
//     .min(6, "Password must be 6 character length")
//     .required("Password is required!"),
//   email: Yup.string().email("Invalid Email address").required("Email is required!")
// });


// export default function Login() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState(false);
//   const [passwordError, setPasswordError] = useState("");
//   const [employeeIdError, setEmployeeIdError] = useState("");
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogMessage, setDialogMessage] = useState("");

//   // Cooldown timer effect
//   useEffect(() => {
//     let timer;
//     if (resendCooldown > 0) {
//       timer = setInterval(() => {
//         setResendCooldown((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [resendCooldown]);

//   const handleFormSubmit = async (values) => {
//     setLoading(true);
//     const url = process.env.REACT_APP_BACKEND+'auth/login';
//     const data = {
//       "empRef": values.employeeId,
//       "password": values.password
//     };
//     const customHeaders = {
//       "Content-Type": "application/json",
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: customHeaders,
//         body: JSON.stringify(data),
//       });

//       const result = await response.json();
//       if (response.ok && result?.status) {
//         setEmail(values.employeeId);
//         setPasswordError(""); // Clear error if login is successful
//       } else {
//         setPasswordError("Invalid employee ID or password");
//       }
//     } catch (error) {
//       console.error(error);
//       setPasswordError("Failed to load, please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (resendCooldown > 0) return; // Prevent resend if cooldown is active

//     setLoading(true);
//     const url = process.env.REACT_APP_BACKEND+'auth/reSendOTP';
//     const data = {
//       "empRef": email
//     };
//     const customHeaders = {
//       "Content-Type": "application/json",
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: customHeaders,
//         body: JSON.stringify(data),
//       });

//       const result = await response.json();
//       if (response.ok && result?.status) {
//         // Handle successful OTP resend
//         setDialogMessage("OTP has been resent to your email.");
//         setDialogOpen(true);
//         setResendCooldown(30); // Set cooldown to 30 seconds
//       } else {
//         setPasswordError("Failed to resend OTP.");
//       }
//     } catch (error) {
//       console.error(error);
//       setPasswordError("Failed to resend OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const chkOTP = async (values) => {
//     setLoading(true);
//     const url = process.env.REACT_APP_BACKEND+'auth/verifyOTP';
//     const data = {
//       "emp_Email": email,
//       "otp": parseInt(values.otp, 10)
//     };
//     const customHeaders = {
//       "Content-Type": "application/json",
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: customHeaders,
//         body: JSON.stringify(data),
//       });

//       const result = await response.json();
//       console.log("OTP Verification Result:", result);

//       if (result?.status) {
//         const token = result.jwt_access_token;
//         const loggedUser = result.user_data;

//         console.log("Dispatching setJwtToken with token:", token);

//         if (token) {
//           await dispatch(setJwtToken(token));
//           await dispatch(setUserData(loggedUser));
//           // Navigate to dashboard after setting the token
//           navigate('/dashboard');
//         } else {
//           setPasswordError("Token not found in response.");
//         }
//       } else {
//         setPasswordError("Invalid OTP");
//       }
//     } catch (error) {
//       console.error("Error in OTP Verification:", error);
//       setPasswordError("Failed to verify OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//   };


//   const [showPassword, setShowPassword] = useState(false);

//   const handleClickShowPassword = () => setShowPassword(!showPassword);

// const handleMouseDownPassword = (event) => {
//   event.preventDefault();
// };


  
//   if (!email) {
//     return (
//       <StyledRoot>
//       <Card className="card">
//         <Grid container>
//           <Grid item sm={6} xs={12}>
//             <div className="img-wrapper">
//               <img src="assets/spandana_logo.png" width="100%" alt="" />
//             </div>
//           </Grid>

//           <Grid item sm={6} xs={12} sx={{ mt: 7 }}>
//             <ContentBox>
//               <Formik
//                 onSubmit={handleFormSubmit}
//                 initialValues={initialValues}
//                 validationSchema={validationSchema}>
//                 {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
//                   <form onSubmit={handleSubmit}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="email"
//                       name="email"
//                       label="Email"
//                       variant="outlined"
//                       onBlur={handleBlur}
//                       value={values.email}
//                       onChange={handleChange}
//                       helperText={touched.email && errors.email}
//                       error={Boolean(errors.email && touched.email)}
//                       sx={{ mb: 2 }}
//                     />

//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="password"
//                       type="password"
//                       label="Password"
//                       variant="outlined"
//                       onBlur={handleBlur}
//                       value={values.password}
//                       onChange={handleChange}
//                       helperText={touched.password && errors.password}
//                       error={Boolean(errors.password && touched.password)}
//                       sx={{ mb: 2 }}
//                     />

//                     <FlexBox justifyContent="space-between">
//                       <FlexBox gap={1}>
//                         <Checkbox
//                           size="small"
//                           name="remember"
//                           onChange={handleChange}
//                           checked={values.remember}
//                           sx={{ padding: 0 }}
//                         />

//                         <Paragraph>Remember Me</Paragraph>
//                       </FlexBox>

//                       <NavLink
//                         to="/forgotpwd"
//                         style={{ color: theme.palette.primary.main }}>
//                         Forgot password?
//                       </NavLink>
//                     </FlexBox>

//                     <LoadingButton
//                       type="submit"
//                       color="primary"
//                       loading={loading}
//                       variant="contained"
//                       sx={{ my: 2 }}>
//                       Login
//                     </LoadingButton>
//                   </form>
//                 )}
//               </Formik>
//             </ContentBox>
//           </Grid>
//         </Grid>
//       </Card>
//     </StyledRoot>
//     );
//   }

//   return (
//     <StyledRoot>
//       <Card className="card">
//         <Grid container>
//           <Grid item sm={6} xs={12}>
//             <div className="img-wrapper">
//               <img src="assets/spandana_logo.png" width="100%" alt="" />
//             </div>
//           </Grid>

//           <Grid item sm={6} xs={12} sx={{ mt: 7 }}>
//             <ContentBox>
//               <Formik
//                 onSubmit={handleFormSubmit}
//                 initialValues={initialValues}
//                 validationSchema={validationSchema}>
//                 {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
//                   <form onSubmit={handleSubmit}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       type="email"
//                       name="email"
//                       label="Email"
//                       variant="outlined"
//                       onBlur={handleBlur}
//                       value={values.email}
//                       onChange={handleChange}
//                       helperText={touched.email && errors.email}
//                       error={Boolean(errors.email && touched.email)}
//                       sx={{ mb: 2 }}
//                     />

//                     <TextField
//                       fullWidth
//                       size="small"
//                       name="password"
//                       type="password"
//                       label="Password"
//                       variant="outlined"
//                       onBlur={handleBlur}
//                       value={values.password}
//                       onChange={handleChange}
//                       helperText={touched.password && errors.password}
//                       error={Boolean(errors.password && touched.password)}
//                       sx={{ mb: 2 }}
//                     />

//                     <FlexBox justifyContent="space-between">
//                       <FlexBox gap={1}>
//                         <Checkbox
//                           size="small"
//                           name="remember"
//                           onChange={handleChange}
//                           checked={values.remember}
//                           sx={{ padding: 0 }}
//                         />

//                         <Paragraph>Remember Me</Paragraph>
//                       </FlexBox>

//                       <NavLink
//                         to="/forgotpwd"
//                         style={{ color: theme.palette.primary.main }}>
//                         Forgot password?
//                       </NavLink>
//                     </FlexBox>

//                     <LoadingButton
//                       type="submit"
//                       color="primary"
//                       loading={loading}
//                       variant="contained"
//                       sx={{ my: 2 }}>
//                       Login
//                     </LoadingButton>
//                   </form>
//                 )}
//               </Formik>
//             </ContentBox>
//           </Grid>
//         </Grid>
//       </Card>
//     </StyledRoot>
//   );
// }




























































































































import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Card, Checkbox, Grid, styled, useTheme, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Paragraph } from "../../../../app/components/Typography";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from 'react-redux';
import { setUserData } from "../../../../redux/actions/userActions";
import { setJwtToken } from "../../../../redux/actions/authActions";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { StyledTextField,CustomDialog,CustomDialogTitle,CustomDialogContent,CustomDialogActions } from "./StyledComponentsLogin";
// import {Container,ContentBox,Logo,HeaderText} from './StyledComponentsLogin';
import img1 from '../../../assets/spandana_logo.png';

const FlexBox = styled(Box)(() => ({
  display: "flex"
}));

const StyledRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#1A2038",
  minHeight: "100vh !important",

  "& .card": {
    maxWidth: 800,
    margin: "1rem",
    borderRadius: 12
  },

  ".img-wrapper": {
    display: "flex",
    // padding: "2rem",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const ContentBox = styled("div")(({ theme }) => ({
  padding: 32,
  background: theme.palette.background.default
}));

// initial login credentials
const initialValues = {
  emailId: "",
  password: "",
  remember: true,
  otp: "",
};

// form field validation schema
const validationSchema = Yup.object().shape({
  emailId: Yup.string()
    .required("Email ID is required!"),
  password: Yup.string()
    .min(6, "Password must be 6 characters long")
    .required("Password is required!"),
});

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailIdError, setEmailIdError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    const url = "https://damuat.spandanasphoorty.com/policy_api/users/login";
    const requestData = {
      user_id: values.emailId,
      pwd: values.password
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      if (response.ok && result.status === true) {
        const { user_id, pwd } = result.data;
  
        if (user_id === values.emailId && pwd === values.password) {
          setUsername(user_id);
          setPasswordError("");
        } else {
          setPasswordError("Invalid employee ID or password");
        }
      } else {
        setPasswordError("Invalid employee ID or password");
      }
    } catch (error) {
      console.error(error);
      setPasswordError("Failed to load, please try again later.");
    } finally {
      setLoading(false);
    }
  };  

  const handleResendOTP = async () => {
    if (resendCooldown > 0)
      return;

    setLoading(true);
    const url = process.env.REACT_APP_BACKEND+'auth/reSendOTP';
    const data = {
      "empRef": username
    };
    const customHeaders = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result?.status) {
        setDialogMessage("OTP has been resent to your email.");
        setDialogOpen(true);
        setResendCooldown(30);
      } else {
        setPasswordError("Failed to resend OTP.");
      }
    } catch (error) {
      console.error(error);
      setPasswordError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const chkOTP = async (values) => {
    setLoading(true);
  
    // Hardcoded OTP
    const hardcodedOTP = 1234;
  
    try {
      // Check if the entered OTP matches the hardcoded OTP
      if (parseInt(values.otp, 10) === hardcodedOTP) {
        // Simulated JWT token and the real user data from login step
        const token = "sampleJwtToken";
  
        // Assuming username is the email entered during the login step
        const loggedUser = {
          email: values.emailId,   // Using the email provided in the login step
        };
  
        console.log("Dispatching setJwtToken with token:", token);
  
        // Dispatch the token and user data
        if (token) {
          await dispatch(setJwtToken(token));
          await dispatch(setUserData(loggedUser));
          // Navigate to the dashboard after setting the token
          navigate('/dashboard');
        } else {
          setPasswordError("Token not found.");
        }
      } else {
        setPasswordError("Invalid OTP");
      }
    } catch (error) {
      console.error("Error in OTP Verification:", error);
      setPasswordError("Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };  

  const handleDialogClose = () => {
    setDialogOpen(false);
  };


  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

const handleMouseDownPassword = (event) => {
  event.preventDefault();
};


  
  if (!username) {
    return (
      <StyledRoot>
        <Card className="card">
          <Grid container>
            <Grid item sm={12} xs={12}>
              <div className="img-wrapper">
                <img src={img1} width="300" alt="" />
              </div>
              <ContentBox>
                <Formik
                  onSubmit={handleFormSubmit}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        size="small"
                        name="emailId"
                        type="text"
                        label="Email ID"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.emailId}
                        onChange={(e) => {
                          handleChange(e);
                          setEmailIdError("");
                        }}
                        helperText={emailIdError || (touched.emailId && errors.emailId)}
                        error={Boolean(emailIdError || (errors.emailId && touched.emailId))}
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton edge="end">
                                <PersonOutlineIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        name="password"
                        type={showPassword ? "text" : "password"}  // Toggle between text and password
                        label="Password"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.password}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value.length >= 6) {
                            setPasswordError("");  // Clear error if password is valid length
                          }
                        }}
                        helperText={passwordError || (touched.password && errors.password)}
                        error={Boolean(passwordError || (errors.password && touched.password))}
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />


                      <FlexBox justifyContent="space-between">
                        <NavLink
                          to="/forgotpwd"
                          style={{ color: theme.palette.primary.main }}>
                          Forgot password?
                        </NavLink>
                      </FlexBox>


                      <LoadingButton
                        type="submit"
                        color="primary"
                        fullWidth
                        loading={loading}
                        variant="contained"
                        sx={{ my: 2 }}>
                        Login
                      </LoadingButton>
                    </form>
                  )}
                </Formik>
              </ContentBox>
            </Grid>
          </Grid>
        </Card>
      </StyledRoot>
    );
  }

  return (
    <StyledRoot>
        <Card className="card">
          <Grid container>
            <Grid item sm={12} xs={12}>
              <div className="img-wrapper">
                <img src={img1} width="300" alt="" />
              </div>
              <ContentBox>
                <Formik
                  onSubmit={chkOTP}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        size="small"
                        name="emailId"
                        type="text"
                        label="Email ID"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.emailId}
                        onChange={handleChange}
                        helperText={emailIdError || (touched.emailId && errors.emailId)}
                        error={Boolean(emailIdError || (errors.emailId && touched.emailId))}
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton edge="end">
                                <PersonOutlineIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        name="otp"
                        type="text"
                        label="OTP"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.otp}
                        onChange={(e) => {
                          let input = e.target.value;
                          // Allow only digits and enforce maximum length of 4 digits
                          if (/^\d{0,4}$/.test(input)) {
                            handleChange(e);
                            setPasswordError("");  // Clear error if input is valid
                            if (input.length === 4) {
                              handleSubmit(); // Trigger form submission
                            }
                          } else {
                            setPasswordError("OTP must be exactly 4 digits.");
                            e.target.value = values.otp;  // Revert to the last valid state
                          }
                        }}
                        onKeyPress={(e) => {
                          // Allow only numeric characters
                          if (!/[\d]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        helperText={passwordError || (touched.otp && errors.otp)}
                        error={Boolean(passwordError || (errors.otp && touched.otp))}
                        sx={{ mb: 2 }}
                        
                      />

                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                        <LoadingButton
                          type="submit"
                          color="primary"
                          loading={loading}
                          variant="contained"
                          sx={{ my: 2 }}
                        >
                          Verify OTP
                        </LoadingButton>

                        <Typography
                          component="a"
                          href="#"
                          onClick={handleResendOTP}
                          sx={{
                            ml: 2, // Optional: Add margin to the left of the Resend OTP link
                            color: theme.palette.primary.main,
                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            textDecoration: 'none', // Optional: Removes underline
                            '&:hover': {
                              color: resendCooldown > 0 ? theme.palette.primary.main : 'rgb(249, 83, 22)',
                            },
                          }}
                        >
                          {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                        </Typography>
                      </Box>
                    </form>
                  )}
                </Formik>
                {/* <CustomDialog
                  open={dialogOpen}
                  onClose={handleDialogClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <CustomDialogTitle id="alert-dialog-title">
                    OTP Resend
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
                </CustomDialog> */}
              </ContentBox>
            </Grid>
          </Grid>
        </Card>
      </StyledRoot>
  );
}

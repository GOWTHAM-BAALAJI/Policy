import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Card, Grid, styled, useTheme, Typography, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from 'react-redux';
import { setJwtToken } from "../../../../redux/actions/authActions";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import img1 from '../../../assets/spandana_logo.png';
import toast from "react-hot-toast";

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
  const [userId, setUserId] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [emailIdError, setEmailIdError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const userToken = useSelector((state)=>{
    return state.token;//.data;
  });

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+userToken
  };

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
    const url = "http://localhost:3000/auth/";
    const requestData = {
      empRef: values.emailId,
      password: values.password
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (response.ok && result?.status) {
        setUsername(values.emailId);
        setUserId(result.user_id);
        setPasswordError(""); // Clear error if login is successful
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
    const url = 'http://localhost:3000/auth/resendOtp';
    const data = {
      "user_id": userId
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
    const url = "http://localhost:3000/auth/verifyOTP";
    const data = {
      "user_id": userId,
      "otp": values.otp,
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
      console.log("OTP Verification Result:", result);

      if (result?.status) {
        toast.success("Logged in successfully")
        const token           = result.jwt;
        // const loggedUser      = result.user_data;
        // const permissionList  = result.permissionList;

        if (token) {
          await dispatch(setJwtToken(token));
          // await dispatch(setUserData(loggedUser));
          // await dispatch(setPermissionData(permissionList));
          //await dispatch(setPermissionData(permissionList));
          // Navigate to dashboard after setting the token
          navigate('/dashboard');
        } else {
          setPasswordError("Token not found in response.");
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
                        label="Email ID or Employee ID"
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
                        label="Email ID or Employee ID"
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

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Box, Card, Grid, styled, useTheme, Typography, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { setJwtToken } from "../../../../redux/actions/authActions";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import img1 from "../../../assets/spandana_logo.png";
import toast from "react-hot-toast";

const FlexBox = styled(Box)(() => ({
  display: "flex"
}));

const StyledRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
  minHeight: "100vh !important",
  "& .card": {
    maxWidth: 800,
    margin: "1rem",
    borderRadius: 12
  },
  ".img-wrapper": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const ContentBox = styled("div")(() => ({
  padding: 32,
  background: "white"
}));

const initialValues = {
  emailId: "",
  password: "",
  remember: true,
  otp: ""
};

const validationSchema = Yup.object().shape({
  emailId: Yup.string(),
  password: Yup.string().min(6, "Password must be 6 characters long")
});

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(false);
  const [userId, setUserId] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [emailIdError, setEmailIdError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const current_year = new Date().getFullYear();
  const redirectUrl = location.state?.redirect || "/dashboard";

  const userToken = useSelector((state) => {
    return state.token;
  });

  const headers = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
    "Content-Type": "application/json",
    Authorization: "Bearer " + userToken
  };

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleFormSubmit = async (values) => {
    setLoading(true);

    if (!values.emailId.trim() || !values.password) {
      toast.error("Please fill in all the required fields");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
      return;
    }

    const url = `${process.env.REACT_APP_POLICY_BACKEND}auth/`;
    const requestData = {
      empRef: values.emailId.trim(),
      password: values.password
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      if (result?.status == false) {
        if (result.message === "invalid credentials") {
          toast.error("Invalid employee ID or password");
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
        } else if (result.message === "account deactivated! , please contact admin") {
          toast.error("Account deactivated!, Please contact admin");
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
        }
      } else {
        // localStorage.setItem("redirectUrl", redirectUrl);
        setUsername(values.emailId.trim());
        setUserId(result.user_id);
        setPasswordError("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load, please try again later.");
      setIsBtnDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    const url = `${process.env.REACT_APP_POLICY_BACKEND}auth/resendOtp`;
    const data = {
      user_id: userId
    };
    const customHeaders = {
      "Content-Type": "application/json"
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok && result?.status) {
        setDialogMessage("OTP has been resent to your email.");
        setDialogOpen(true);
        setResendCooldown(30);
      } else {
        toast.error("Failed to resend OTP.");
        setIsBtnDisabled(true);
        setTimeout(() => {
          setIsBtnDisabled(false);
        }, 4000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to resend OTP.");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const chkOTP = async (values) => {
    setLoading(true);
    const url = `${process.env.REACT_APP_POLICY_BACKEND}auth/verifyOTP`;
    const data = {
      user_id: userId,
      otp: values.otp
    };
    const customHeaders = {
      "Content-Type": "application/json"
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result?.status) {
        toast.success("Logged in successfully");
        const token = result.jwt;
        // const redirectUrl = localStorage.getItem("redirectUrl");
        // const loggedUser      = result.user_data;
        if (token) {
          sessionStorage.clear();
          localStorage.clear();
          await dispatch(setJwtToken(token));
          // await dispatch(setUserData(loggedUser));
          // navigate("/dashboard");
          navigate(redirectUrl, { replace: true });
        } else {
          toast.error("Token not found in response.");
          setIsBtnDisabled(true);
          setTimeout(() => {
            setIsBtnDisabled(false);
          }, 4000);
        }
      } else {
        toast.error("Invalid OTP");
        setIsBtnDisabled(true);
        setTimeout(() => {
          setIsBtnDisabled(false);
        }, 4000);
      }
    } catch (error) {
      console.error("Error in OTP Verification:", error);
      toast.error("Failed to verify OTP.");
      setIsBtnDisabled(true);
      setTimeout(() => {
        setIsBtnDisabled(false);
      }, 4000);
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
          <Grid container sx={{ boxSizing: "border-box", border: "2px solid #e0e0e0", boxShadow: "0px 0px 16px 2px rgba(0, 0, 0, 0.5)" }}>
            <Grid item sm={12} xs={12}>
              <div className="img-wrapper">
                <img src={img1} width="20%" alt="" />
              </div>
              <Typography sx={{ mb: -2, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "500" }}>
                Kaleidoscope
              </Typography>
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
                      />

                      <TextField
                        fullWidth
                        size="small"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.password}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value.length >= 6) {
                            setPasswordError("");
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
                          )
                        }}
                      />

                      <FlexBox justifyContent="space-between">
                        <NavLink to="/forgotpwd" style={{ color: "#ee8812", fontWeight: "500" }}>
                          Forgot password?
                        </NavLink>
                      </FlexBox>

                      <LoadingButton
                        type="submit"
                        fullWidth
                        disabled={isBtnDisabled}
                        variant="contained"
                        sx={{ my: 2, backgroundColor: "rgb(238, 136, 18)", "&:hover": { backgroundColor: "rgba(235, 127, 2)" } }}
                      >
                        Login
                      </LoadingButton>

                      <Typography sx={{ fontSize: "12px", fontWeight: 10, fontFamily: "sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        © {current_year}. Kaleidoscope by Spandana
                      </Typography>
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
        <Grid container sx={{ boxSizing: "border-box", border: "2px solid #e0e0e0", boxShadow: "0px 0px 16px 2px rgba(0, 0, 0, 0.5)" }}>
          <Grid item sm={12} xs={12}>
            <div className="img-wrapper">
              <img src={img1} width="20%" alt="" />
            </div>
            <Typography sx={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "500" }}>
              Kaleidoscope
            </Typography>
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
                      value={values.emailId.trim()}
                      onChange={(e) => {
                        handleChange(e);
                        setEmailIdError("");
                      }}
                      InputProps={{ readOnly: true }}
                      helperText={emailIdError || (touched.emailId && errors.emailId)}
                      error={Boolean(emailIdError || (errors.emailId && touched.emailId))}
                      sx={{ mb: 2 }}
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
                        if (/^\d{0,4}$/.test(input)) {
                          handleChange(e);
                          setPasswordError("");
                          if (input.length === 4) {
                            handleSubmit();
                          }
                        } else {
                          e.target.value = values.otp;
                        }
                      }}
                      onKeyPress={(e) => {
                        if (!/[\d]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      helperText={passwordError || (touched.otp && errors.otp)}
                      error={Boolean(passwordError || (errors.otp && touched.otp))}
                      sx={{ mb: 2 }}
                    />

                    <Box display="flex" alignItems="flex-end" justifyContent="flex-end" sx={{ width: "100%" }}>
                      <Typography component="a" href="#" onClick={handleResendOTP} sx={{ ml: 2, color: "#ee8812", fontWeight: "500", cursor: resendCooldown > 0 ? "not-allowed" : "pointer", textDecoration: "none", "&:hover": { color: resendCooldown > 0 ? "#f0a44d" : "rgb(249, 83, 22)" } }}>
                        {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 10, fontFamily: "sans-serif", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      © {current_year}. Kaleidoscope by Spandana
                    </Typography>
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

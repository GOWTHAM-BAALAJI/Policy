import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Grid, styled, TextField } from "@mui/material";
import img1 from "../../assets/spandana_logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {IconButton, InputAdornment } from '@mui/material';

// STYLED COMPONENTS
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

const initialValues = {
  emailId: "",
};

// form field validation schema
const validationSchema = Yup.object().shape({
  emailId: Yup.string()
    .required("Email ID is required!"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
    'Content-Type': 'application/json',
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    const url = "http://localhost:3000/auth/forgetPassword";
    const requestData = {
      empRef: values.emailId,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (response.ok && result.status === 200) {
        navigate('/');
        setEmailError("");
      } else {
        setEmailError("Invalid Employee ID or Email ID");
      }
    } catch (error) {
      console.error(error);
      setEmailError("Failed to load, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledRoot>
      <Card className="card">
        <Grid container>
          <Grid item xs={12}>
            <div className="img-wrapper">
              <img width="300" src={img1} alt="" />
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
                    setEmailError("");
                  }}
                  helperText={emailError || (touched.emailId && errors.emailId)}
                  error={Boolean(emailError || (errors.emailId && touched.emailId))}
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

                <Button fullWidth variant="contained" color="primary" type="submit">
                  Reset Password
                </Button>

                <Button
                  fullWidth
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ mt: 3 }}>
                  Go Back
                </Button>
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

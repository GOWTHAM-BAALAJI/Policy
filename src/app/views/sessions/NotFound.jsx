import { Box, Button, styled, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// STYLED COMPONENTS
const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});

const JustifyBox = styled(FlexBox)({
  // maxWidth: 320,
  flexDirection: "column",
  justifyContent: "center"
});

const IMG = styled("img")({
  width: "100%",
  marginBottom: "32px"
});

const NotFoundRoot = styled(FlexBox)({
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh !important"
});

export default function NotFound() {
  const navigate = useNavigate();

  // useEffect(()=>{
  //   {setTimeout(() => {
  //     navigate(-1);
  //   }, 1000)}
  // },[]);

  setTimeout(() => {
    navigate(-1);
  }, 2000);

  return (
    <NotFoundRoot>
      <JustifyBox>
        <Typography sx={{ fontSize: '40px', color: '#ee8812', fontWeight: 'bold' }}>
          404, Page Not Found
        </Typography>

        {/* {setTimeout(() => {
          navigate(-1);
        }, 1000)} */}
      </JustifyBox>
    </NotFoundRoot>
  );
}

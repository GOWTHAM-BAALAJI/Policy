import { Box, styled, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});

const JustifyBox = styled(FlexBox)({
  flexDirection: "column",
  justifyContent: "center"
});

const NotFoundRoot = styled(FlexBox)({
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh !important"
});

export default function NotFound() {
  const navigate = useNavigate();
  setTimeout(() => {
    navigate(-1);
  }, 2000);

  return (
    <NotFoundRoot>
      <JustifyBox>
        <Typography sx={{ fontSize: '40px', color: '#ee8812', fontWeight: 'bold' }}>
          404, Page Not Found
        </Typography>
      </JustifyBox>
    </NotFoundRoot>
  );
}

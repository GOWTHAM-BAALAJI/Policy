import { Fragment } from "react";
import { Box, Card, Grid, styled, useTheme } from "@mui/material";
import DoughnutChart from "./shared/Doughnut";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const Title = styled("span")(() => ({
  fontSize: "1rem",
  fontWeight: "500",
  marginRight: ".5rem",
  textTransform: "capitalize"
}));

const SubTitle = styled("span")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary
}));

export default function Analytics() {
  const { palette } = useTheme();

  return (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={3}>

          <Grid item lg={6} md={6} sm={12} xs={12} style={{ height: 'calc(100vh - 100px)' }}>
            <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
              <Title>Dashboard</Title>
              <SubTitle>Policy, SOP & Guidance Note</SubTitle>

              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <DoughnutChart height="100%" />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}

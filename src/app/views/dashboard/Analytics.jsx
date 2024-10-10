import { Fragment, useState, useEffect } from "react";
import { Box, Card, Grid, styled, useTheme } from "@mui/material";
import DoughnutChart from "./shared/Doughnut";
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import ApprovedTable from "./Approved";
import RejectedTable from "./Rejected";
import PendingTable from "./Approvalpending";
import WaitingForActionTable from "./Reviewraised";
import PSGTable from "../material-kit/list/ListPSG";

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
  const navigate = useNavigate();

  const userToken = useSelector((state)=>{
    return state.token;//.data;
    });
  console.log("UserToken:",userToken);

  useEffect(() => {
    if (!userToken) {
      console.log("UserToken is missing.");
      navigate('/');
    }
  }, [userToken]);

  const [selectedSection, setSelectedSection] = useState('');

  const onClickSection = (section) => {
    setSelectedSection(section);
  };

  const handleChartClick = (sectionName) => {
    setSelectedSection(sectionName); // Update state based on the clicked section
  };

  // Render the table based on the selected chart section
  const renderTable = () => {
    switch (selectedSection) {
      case 'Approved':
        return <ApprovedTable />;
      case 'Rejected':
        return <RejectedTable />;
      case 'Pending':
        return <PendingTable />;
      case 'Waiting for Action':
        return <WaitingForActionTable />;
      default:
        return <PSGTable showRowsPerPageOptions={false} />;
    }
  };

  return (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={2}>

          <Grid item lg={6} md={6} sm={12} xs={12} style={{ height: 'calc(100vh - 120px)' }}>
            <Card sx={{ px: 3, py: 3, height: '100%', width: '100%' }}>
              <Title>Dashboard</Title>
              <SubTitle>Policy, SOP & Guidance Note</SubTitle>

              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <DoughnutChart height="100%" onClickSection={onClickSection} />
              </Box>
            </Card>
          </Grid>
          {/* Dynamic table based on the clicked section of the chart */}
          <Grid item lg={6} md={6} sm={12} xs={12} style={{ height: 'calc(100vh - 120px)' }}>
            <Card sx={{ height: '100%', width: '100%' }}>
              {renderTable()} {/* Conditionally render the table */}
            </Card>
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}

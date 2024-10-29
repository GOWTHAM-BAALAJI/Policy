import { Fragment, useState, useEffect } from "react";
import { Box, Card, Grid, styled, useTheme } from "@mui/material";
import DoughnutChart from "./shared/Doughnut";
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import PolicyList from "../material-kit/list/PolicyList";

// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "20px",
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

  const handleTabChange = (tabIndex) => {
    const tabMap = {
      1: 'Approved',
      2: 'Rejected',
      3: 'Pending',
      4: 'Waiting for Action'
    };
    const sectionName = tabMap[tabIndex];
    setSelectedSection(sectionName);
  };

  // Render the table based on the selected chart section
  const renderTable = () => {
    switch (selectedSection) {
      case 'Approved':
        return <PolicyList initialTab={1} onTabChange={handleTabChange}/>;
      case 'Rejected':
        return <PolicyList initialTab={2} onTabChange={handleTabChange}/>;
      case 'Pending':
        return <PolicyList initialTab={3} onTabChange={handleTabChange}/>;
      case 'Waiting for Action':
        return <PolicyList initialTab={4} onTabChange={handleTabChange}/>;
      default:
        return <PolicyList initialTab={4} onTabChange={handleTabChange}/>;
    }
  };

  return (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={2}>

          <Grid item lg={6} md={6} sm={12} xs={12}>
            <Card sx={{ px: 3, py: 3, minHeight: '80vh', height: '100%', width: '100%' }}>
              <Title>Dashboard</Title>
              <SubTitle>Policy, SOP & Guidance Note</SubTitle>

              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <DoughnutChart height="100%" width="100%" onClickSection={onClickSection} selectedTab={selectedSection} />
              </Box>
            </Card>
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <Card sx={{ minHeight: '80vh', height: '100%', width: '100%' }}>
              {renderTable()}
            </Card>
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}

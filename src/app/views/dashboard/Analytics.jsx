import { Fragment, useState, useEffect } from "react";
import { Box, Card, Grid, styled } from "@mui/material";
import DoughnutChart from "./shared/Doughnut";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import PolicyList from "../material-kit/list/PolicyList";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "15px",
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
  const navigate = useNavigate();
  const userToken = useSelector((state)=>{
    return state.token;
    });
  
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isCustomScreenXs = useMediaQuery("(min-width:220px) and (max-width:340px)");
  const isCustomScreenXxs = useMediaQuery("(min-width:220px) and (max-width:600px)");
  const isCustomScreenXxxs = useMediaQuery("(min-width:0px) and (max-width:219px)");

  useEffect(() => {
    if (!userToken) {
      navigate('/');
    }
  }, [userToken]);

  const [selectedSection, setSelectedSection] = useState(null);
  const [storeSelectedSection, setStoreSelectedSection] = useState(null);
  const [section, setSection] = useState(selectedSection);

  useEffect(() => {
    setStoreSelectedSection(selectedSection);
  }, [selectedSection]);
  
  const [selectedSectionCount, setSelectedSectionCount] = useState(null);
  const [hasTabChanged, setHasTabChanged] = useState(false);
  const handleSelectedCountChange = (count) => {
      setSelectedSectionCount(count);
  };
  const onClickSection = (section) => {
    setSelectedSection(section);
    setHasTabChanged(true);
  };

  const [tabChangeTrack, setTabChangeTrack] = useState(false);

  const handleTabChange = (tabIndex) => {
    const tabMap = {
      1: 'Approved',
      2: 'Rejected',
      3: 'Pending',
      4: 'Waiting for Action'
    };
    // if(tabIndex != null){
    //   const sectionName = tabMap[tabIndex];
    //   setSelectedSection(sectionName);
    // } else{
    //   setSelectedSection(null);
    // }
    const sectionName = tabMap[tabIndex] || null;
    setSelectedSection(sectionName); // This should update selectedSection
    setTabChangeTrack(true);
  };

  const renderTable = () => {
    switch (selectedSection) {
      case 'Approved':
        return <PolicyList initialTab={1} onTabChange={handleTabChange} onChangeCount={selectedSectionCount} selectedTab={selectedSection} hasTabChanged={tabChangeTrack}/>;
      case 'Rejected':
        return <PolicyList initialTab={2} onTabChange={handleTabChange} onChangeCount={selectedSectionCount} selectedTab={selectedSection} hasTabChanged={tabChangeTrack}/>;
      case 'Pending':
        return <PolicyList initialTab={3} onTabChange={handleTabChange} onChangeCount={selectedSectionCount} selectedTab={selectedSection} hasTabChanged={tabChangeTrack}/>;
      case 'Waiting for Action':
        return <PolicyList initialTab={4} onTabChange={handleTabChange} onChangeCount={selectedSectionCount} selectedTab={selectedSection} hasTabChanged={tabChangeTrack}/>;
      default:
        return <PolicyList initialTab={4} onTabChange={handleTabChange} onChangeCount={selectedSectionCount} selectedTab={selectedSection} hasTabChanged={tabChangeTrack}/>;
    }
  };

  return (
    <Fragment>
      <ContentBox className="analytics">
        <Grid container spacing={2}>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <Card sx={{ px: 3, py: 3, minHeight: isCustomScreenXxs ? '40vh' : isCustomScreenXxxs ? '40vh' : {lg:'80vh', md:'40vh', sm:'60vh'}, height: '100%', width: '100%' }}>
              <Title>Dashboard</Title>
              <SubTitle>Policy, SOP & Guidance Note</SubTitle>
              <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', mt: isCustomScreenXs ? -8 : isCustomScreenXxxs ? -8 : 0 }}>
                <DoughnutChart height="100%" width="100%" onClickSection={onClickSection} selectedTab={selectedSection} onChangeCount={handleSelectedCountChange} onTabChange={handleTabChange} hasTabChanged={hasTabChanged} section={section}/>
              </Box>
            </Card>
          </Grid>
          <Grid item lg={6} md={12} sm={12} xs={12}>
            <Card sx={{ minHeight: '80vh', height: '100%', width: '100%' }}>
              {renderTable()}
            </Card>
          </Grid>
        </Grid>
      </ContentBox>
    </Fragment>
  );
}

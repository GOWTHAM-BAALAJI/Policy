import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clearJwtToken } from "../../../../redux/actions/authActions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { Box, styled, Avatar, Hidden, useTheme, MenuItem, IconButton, useMediaQuery } from "@mui/material";
import useSettings from "app/hooks/useSettings";
import { Span } from "app/components/Typography";
import { MatxMenu, MatxSearchBox } from "app/components";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { topBarHeight } from "app/utils/constant";
import { Home, Menu, Person, PowerSettingsNew, Settings } from "@mui/icons-material";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: "55px",
  height: "55px",
  borderRadius: "50%",
  color: theme.palette.text.primary,
  "&:hover": {
    boxShadow: "none"
  }
}));

const TopbarRoot = styled("div")({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease"
});

const TopbarContainer = styled(Box)(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: theme.palette.primary.main,
  [theme.breakpoints.down("sm")]: { paddingLeft: 16, paddingRight: 16 },
  [theme.breakpoints.down("xs")]: { paddingLeft: 14, paddingRight: 16 }
}));

const UserMenu = styled(Box)({
  padding: 4,
  display: "flex",
  borderRadius: 24,
  cursor: "pointer",
  alignItems: "center",
  "& span": { margin: "0 8px" }
});

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  "& a": {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textDecoration: "none"
  },
  "& span": { marginRight: "10px", color: theme.palette.text.primary }
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [roleId, setRoleId] = useState(null);
  const [userName, setUsername] = useState(null);
  const userToken = useSelector((state) => {
    return state.token;
  });
  const userProfile = useSelector((state) => state.userData);
  const { profile_pic } = userProfile;
  const [profileImage, setProfileImage] = useState("");
  useEffect(() => {
    if (userToken) {
      const decodedToken = jwtDecode(userToken);
      setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${decodedToken.profile_pic}`);
    }
    if (profile_pic) {
      setProfileImage(`${process.env.REACT_APP_POLICY_BACKEND}profile_image/${profile_pic}`);
    }
  }, [profile_pic, userToken]);

  useEffect(() => {
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken);
        if (decodedToken.emp_name) {
          setUsername(decodedToken.emp_name);
        }
        if (decodedToken.role_id) {
          setRoleId(decodedToken.role_id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setUsername(null);
      }
    }
  }, [userToken]);
  
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({ layout1Settings: { leftSidebar: { ...sidebarSettings } } });
  };

  const handleSidebarToggle = () => {
    let { layout1Settings } = settings;
    let mode;
    if (isMdScreen) {
      mode = layout1Settings.leftSidebar.mode === "close" ? "mobile" : "close";
    } else {
      mode = layout1Settings.leftSidebar.mode === "full" ? "close" : "full";
    }
    updateSidebarMode({ mode });
  };

  const handleSignOut = () => {
    dispatch(clearJwtToken());
    navigate("/");
    toast.success("Logged out successfully");
  };

  const path = roleId === 16 ? "/display/list" : "/dashboard";

  return (
    <TopbarRoot>
      <TopbarContainer>
        <Box display="flex">
          <StyledIconButton onClick={handleSidebarToggle}>
            <Menu />
          </StyledIconButton>
          <Link to={path} style={{ textDecoration: "none", color: "inherit" }}>
            <p
              style={{
                marginLeft: "8px",
                fontFamily: "sans-serif",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              POLICIES & CIRCULARS
            </p>
          </Link>
        </Box>

        <Box display="flex" alignItems="flex-end" justifyContent="flex-end">
          <MatxMenu
            menuButton={
              <UserMenu>
                <Hidden mdDown>
                  <Span sx={{ fontSize: "16px", fontFamily: "sans-serif", fontWeight: "bold" }}>
                    {userName || "Guest"}
                  </Span>
                </Hidden>
                <Avatar src={profileImage} sx={{ cursor: "pointer" }} />
              </UserMenu>
            }
          >
            <Box
              sx={{
                minWidth: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <StyledItem>
                <Link to="/profile">
                  <Person />
                  <Span sx={{ ml: "5px" }}>Profile</Span>
                </Link>
              </StyledItem>

              <StyledItem onClick={handleSignOut}>
                <PowerSettingsNew />
                <Span sx={{ ml: "2px" }}>&nbsp;Logout</Span>
              </StyledItem>
            </Box>
          </MatxMenu>
        </Box>
      </TopbarContainer>
    </TopbarRoot>
  );
};

export default memo(Layout1Topbar);

import React, { useState, useEffect } from "react";
import { Box, styled } from "@mui/material";
import { Span } from "./Typography";
import { Link } from 'react-router-dom';
import img1 from "app/assets/spandana_logo_white.png"
import useSettings from "app/hooks/useSettings";
import { useSelector } from 'react-redux';
import { jwtDecode } from "jwt-decode";

const BrandRoot = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 18px 20px 29px"
}));

const StyledSpan = styled(Span)(({ mode }) => ({
  fontSize: 20,
  fontWeight: 'bold',
  marginLeft: "1rem",
  marginTop: "-0.5rem",
  display: mode === "compact" ? "none" : "block"
}));

export default function Brand({ children }) {
  const { settings } = useSettings();
  const leftSidebar = settings.layout1Settings.leftSidebar;
  const { mode } = leftSidebar;

  const [roleId, setRoleId] = useState(null);

  const userToken = useSelector((state)=>{
    return state.token;
    });

  useEffect(() => {
    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken);
        if (decodedToken.role_id) {
          setRoleId(decodedToken.role_id);
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [userToken]);

  const path = roleId === 16 ? "/display/list" : "/dashboard";

  return (
    <BrandRoot>
    <Link to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <div className="img-wrapper">
          <img src={img1} width="40" alt="" />
        </div>
        <StyledSpan mode={mode} className="sidenavHoverShow">
          SPANDANA
        </StyledSpan>
      </Box>
    </Link>
    </BrandRoot>
  );
}

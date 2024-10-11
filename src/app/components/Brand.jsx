import { Box, styled } from "@mui/material";

import { Span } from "./Typography";
import img1 from "app/assets/logo.png"
import useSettings from "app/hooks/useSettings";

// STYLED COMPONENTS
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

  return (
    <BrandRoot>
      <Box display="flex" alignItems="center">
        <div className="img-wrapper">
          <img src={img1} width="40" alt="" />
        </div>
        <StyledSpan mode={mode} className="sidenavHoverShow">
          SPANDANA
        </StyledSpan>
      </Box>
    </BrandRoot>
  );
}

import { AppBar, ThemeProvider, Toolbar, styled, useTheme } from "@mui/material";
import useSettings from "app/hooks/useSettings";
import { topBarHeight } from "app/utils/constant";

const AppFooter = styled(Toolbar)(() => ({
  display: "flex",
  alignItems: "center",
  minHeight: topBarHeight,
  "@media (max-width: 499px)": {
    display: "table",
    width: "100%",
    minHeight: "auto",
    padding: "1rem 0",
    "& .container": {
      flexDirection: "column !important",
      "& a": { margin: "0 0 16px !important" }
    }
  },
  backgroundColor: 'white',
  color: 'black',
  opacity: '1',
  border: '1px solid #e0e0e0',
  boxShadow: '0px 0px 8px 2px rgba(0, 0, 0, 0.1)'
}));

const FooterContent = styled("div")(() => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  padding: "0px 1rem",
  maxWidth: "1170px",
  margin: "0 auto",
  opacity: '0.4',
}));

export default function Footer() {
  const theme = useTheme();
  const { settings } = useSettings();
  const current_year = new Date().getFullYear();

  const footerTheme = settings.themes[settings.footer.theme] || theme;

  return (
    <ThemeProvider theme={footerTheme}>
      <AppBar color="primary" position="static" sx={{ zIndex: 96 }}>
        <AppFooter>
          <FooterContent>
            {current_year} © Kaleidoscope by Spandana
          </FooterContent>
        </AppFooter>
      </AppBar>
    </ThemeProvider>
  );
}

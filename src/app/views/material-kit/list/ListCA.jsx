import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Select,
  styled,
  Tabs,
  Tab,
  TextField,
  Typography
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { jwtDecode } from "jwt-decode";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import useCustomFetch from "../../../hooks/useFetchWithAuth";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "15px",
  [theme.breakpoints.down("sm")]: { margin: "16px" }
}));

const StyledTextField = styled(TextField)(() => ({
  width: "100%",
  marginBottom: "16px",
  "& .MuiInputLabel-root": {
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "10px",
    transform: "translateY(-50%)",
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    transition: "top 0.2s ease-out, font-size 0.2s ease-out"
  },
  "& .MuiInputLabel-shrink": {
    top: "2px", // Adjust this value to move the label to the border of the box outline
    fontSize: "0.75rem" // Optional: Reduce font size when the label is shrunk
  },
  "& .MuiInputBase-root": {
    height: 30, // Adjust the height as needed
    fontFamily: "sans-serif",
    fontSize: "0.875rem",
    backgroundColor: "transparent" // Default background color
  },

  "& .MuiOutlinedInput-root": {
    position: "relative" // Ensure the label is positioned relative to the input
  },

  "& .MuiInputBase-input": {
    backgroundColor: "transparent", // Input remains transparent
    height: "100%", // Ensure input takes full height
    boxSizing: "border-box"
  }
}));

export default function CATable() {
  const { control } = useForm();
  const navigate = useNavigate();

  const customFetchWithAuth=useCustomFetch();

  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  const fetchData = async (page, rows) => {
    setLoading(true);
    try {
      const response = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories?page=${page}&rows=${rows}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data.data); // Adjust this based on your API response structure

      const countResponse = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/count`,"GET",1,{});

      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }

      const countData = await countResponse.json();

      setCount(countData.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSearchData = async (page, rows, searchValue) => {
    setLoading(true);

    setIsBtnDisabled(true);
    setTimeout(() => {
      setIsBtnDisabled(false);
    }, 1000);

    // Check for empty search value and return early if invalid
    // if (!(searchValue.trimStart())) {
    //   toast.error("Please provide some search words");
    //   setLoading(false);
    //   setIsBtnDisabled(true);
    //     setTimeout(() => {
    //         setIsBtnDisabled(false);
    //     }, 1000);
    //   return;
    // }

    setIsSearching(true);
    setSearchValue(searchValue.trimStart());

    try {
      // First API call: Fetch data based on searchValue
      const response = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories?page=${page}&rows=${rows}&search=${searchValue}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data.data);

      // Second API call: Fetch the count data based on searchValue
      const countResponse = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/count?search=${searchValue}`,"GET",1,{});

      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }

      const countData = await countResponse.json();
      setCount(countData.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayCircularId = (policy_id) => {
    return "CA" + String(policy_id).padStart(7, "0");
  };

  const columns1 = [
    {
      name: "Circular ID",
      selector: (row) => row.id || "N/A",
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayCircularId(row.id) || "N/A"}
        </div>
      ),
      width: "20%"
    },
    {
      name: "Circular Title",
      selector: (row) => row.title || "N/A",
      sortable: true,
      // center: true,
      width: "35%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            cursor: "pointer",
            color: "#ee8812",
            textDecoration: "none",
            paddingLeft: "8px",
            fontWeight: "bold",
            fontSize: "16px"
          }}
          onClick={() => handleRowClick(row)}
        >
          {row.title}
        </Typography>
      )
    },
    {
      name: "Circular Description",
      selector: (row) => row.description || "N/A",
      sortable: true,
      // center: true,
      width: "45%",
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {row.description || "N/A"}
        </div>
      )
    }
  ];

  const isInitiator = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 1] == "1";
  };

  const isReviewer = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 2] == "1";
  };

  const isApprover = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 3] == "1";
  };

  const isAdmin = (role_id) => {
    let temp = Number(role_id);
    const bin = temp.toString(2);
    return bin[bin.length - 4] == "1";
  };

  const columns = columns1;

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchData(newPage, rowsPerPage, searchValue);
    } else {
      setCurrentPage(newPage);
      fetchData(newPage, rowsPerPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(currentPage, newRowsPerPage, searchValue); // Search API with updated rows per page
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(currentPage, newRowsPerPage); // Default rows per page change
    }
  };

  useEffect(() => {
    if (userToken) {
      const decodedToken = jwtDecode(userToken);
      console.log("Decoded role ID ------------",decodedToken.role_id);
      if (decodedToken.role_id) {
        setRoleId(decodedToken.role_id);
      }
      if (decodedToken.user_id) {
        setUserId(decodedToken.user_id);
      }
    }
  }, [userToken, roleId, userId]);

  useEffect(() => {
    fetchData(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    handleSearchData(currentPage, rowsPerPage, searchValue);
  }, [currentPage, rowsPerPage, searchValue]);

  const handleRowClick = async (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);

    try {
      const response = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/circular-advisories/${row.id}`,"GET",1,{});

      const data = await response.json();

      if (data.status && data.data.file_name) {
        const fileResponse = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/CA_document/${data.data.file_name}`,"GET",1,{});
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.data.file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("File not found or invalid response");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  return (
    <ContentBox className="analytics">
      <Card sx={{ px: 1, py: 1, height: "100%", width: "100%" }}>
        <Grid container spacing={2}>
          <Grid item lg={6} md={6} sm={6} xs={6}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "sans-serif",
                fontWeight: "bold",
                fontSize: "1rem",
                marginLeft: { sm: 2, xs: 2 },
                marginTop: { sm: 2, xs: 2 },
                marginRight: { sm: 2, xs: 2 }
              }}
            >
              Circulars and Advisories
            </Typography>
          </Grid>
          {(isInitiator(roleId)) && (
            <Grid
              item
              lg={6}
              md={6}
              sm={6}
              xs={6}
              sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", mb: {sm:1, xs:1.5} }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "0.875rem",
                  textTransform: "none",
                  marginTop: { sm: 2, xs: 2 },
                  height: "25px",
                  backgroundColor: "#ee8812",
                  "&:hover": {
                    backgroundColor: "rgb(249, 83, 22)"
                  }
                }}
                onClick={() => navigate("/initiate/ca")}
              >
                New
              </Button>
            </Grid>
          )}
          <Grid
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            sx={{ marginLeft: 2, display: "flex", alignItems: "center" }}
          >
            <StyledTextField
              value={searchValue}
              onChange={handleInputChange}
              placeholder="Search Circular ID or Title"
              sx={{ width: "300px", marginRight: 2 }}
            />
            {searchValue && (
              <IconButton
                onClick={() => {
                  setSearchValue(""); // Clear the search field
                  setIsSearching(false); // Reset isSearching state
                  fetchData(currentPage, rowsPerPage); // Fetch data without search
                }}
                sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }} // Adjust for proper spacing
              >
                <CloseIcon />
              </IconButton>
            )}
            {/* <Button
          variant="contained"
          color="primary"
          disabled={isBtnDisabled}
          sx={{ marginTop: -2, textTransform: 'none', height: '30px', backgroundColor: '#ee8812', '&:hover': { backgroundColor: 'rgb(249, 83, 22)', }, }}
          onClick={() => handleSearchData(currentPage, rowsPerPage, searchValue)}
        >
          Search
        </Button> */}
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Box width="100%" overflow="auto">
              <DataTable
                columns={columns}
                data={psgList}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={count} // Adjust to the total records returned by your API
                paginationRowsPerPageOptions={[5, 10, 25]}
                paginationPerPage={rowsPerPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                customStyles={{
                  table: {
                    style: {
                      width: "100%",
                      autowidth: false,
                      scrollX: true,
                      responsive: true,
                      tableLayout: "fixed"
                    }
                  },
                  headCells: {
                    style: {
                      fontSize: "0.875rem",
                      fontFamily: "sans-serif",
                      fontWeight: "bold",
                      textAlign: "center"
                    }
                  },
                  cells: {
                    style: {
                      fontFamily: "sans-serif",
                      fontSize: "0.875rem",
                      textAlign: "center",
                      padding: "8px"
                    }
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Card>
    </ContentBox>
  );
}

import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
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
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import DoughnutChart from "app/views/charts/echarts/Doughnut";
import useCustomFetch from "../../../hooks/useFetchWithAuth";
import { useMediaQuery } from '@mui/material';

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

const StyledSelect = styled(Select)(() => ({
  width: "100%",
  height: "25px", // Ensure the select component itself has a defined height
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  "& .MuiInputBase-root": {
    height: "30px", // Apply the height to the input base
    alignItems: "center", // Align the content vertically
    fontFamily: "sans-serif",
    fontSize: "1.10rem"
  },
  "& .MuiInputLabel-root": {
    lineHeight: "30px", // Set the line height to match the height of the input
    top: "40", // Align the label at the top of the input
    transform: "none", // Ensure there's no unwanted transformation
    left: "20px", // Add padding for better spacing
    fontFamily: "sans-serif",
    fontSize: "0.875rem"
  },
  "& .MuiInputLabel-shrink": {
    top: "-6px" // Move the label when focused or with content
  }
}));

const customSort = (data, column, direction) => {
  return [...data].sort((a, b) => {
    const aValue = a[column] || ""; // Handle undefined values
    const bValue = b[column] || ""; // Handle undefined values
    if (aValue < bValue) {
      return direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
};

const PSGTable = ({ initialTab, onTabChange }) => {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const queryTab = Number(queryParams.get("tab")) || 4;

  const [activeTab, setActiveTab] = useState(initialTab || queryTab);

  const customFetchWithAuth=useCustomFetch();

  useEffect(() => {
    // If the queryTab exists and is different from initialTab, update activeTab
    if (queryTab && queryTab == initialTab) {
      setActiveTab(Number(queryTab)); // Update state if query parameter is present
    }
  }, [queryTab, initialTab]);

  // const [selectedTab, setSelectedTab] = useState(activeTab || 0);
  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // if (onTabChange) {
    //   onTabChange(newValue);
    // }
    setCurrentPage(1);
    // fetchData(newValue, currentPage, rowsPerPage);
    handleSearchType(newValue, currentPage, rowsPerPage, searchValue, selectedType);
  };

  const updateSelectedTab = (tabName) => {
    setActiveTab(tabName);
  };

  const [psgList, setPsgList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortColumn, setSortColumn] = useState(""); // Column being sorted
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [waitingForActionCount, setWaitingForActionCount] = useState(0);
  const [count, setCount] = useState(waitingForActionCount);

  useEffect(() => {
    if (waitingForActionCount > 0) {
      setCount(waitingForActionCount);
      setActiveTab("4");
    } else if (approvedCount > 0) {
      setCount(approvedCount);
      setActiveTab("1");
    } else if (rejectedCount > 0) {
      setCount(rejectedCount);
      setActiveTab("2");
    } else if (pendingCount > 0) {
      setCount(pendingCount);
      setActiveTab("3");
    }
  }, [waitingForActionCount, approvedCount, rejectedCount, pendingCount]);

  const [selectedType, setSelectedType] = useState("");

  const filteredData = selectedType
    ? psgList.filter((record) => record.type === Number(selectedType))
    : psgList;

  const handleSort = (column, sortDirection) => {
    setSortColumn(column.selector); // Store column to be sorted
    setSortDirection(sortDirection); // Store sort direction
  };

  const userToken = useSelector((state) => {
    return state.token; //.data;
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count", "GET",1,{});
        const data = await response.json();

        if (data && data.status) {
          const approvedCount = data.approved;
          const rejectedCount = data.rejected;
          const pendingCount = data.pending;
          const waitingForActionCount = data.waitingForAction;
          setApprovedCount(approvedCount || 0);
          setRejectedCount(rejectedCount || 0);
          setPendingCount(pendingCount || 0);
          setWaitingForActionCount(waitingForActionCount || 0);
        }

        // setPsgList(formattedData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalLength = approvedCount + rejectedCount + pendingCount + waitingForActionCount;

  const fetchData = async (tab, page, rows) => {
    setLoading(true);
    try {
      let url = `https://policyuat.spandanasphoorty.com/policy_apis/policy/user?tab=${tab}&page=${page}&rows=${rows}`;
      const response = await customFetchWithAuth(url, "GET",1,{});
      const data = await response.json();
      setPsgList(data); // Adjust this based on your API response structure
      if (tab == 1) {
        setCount(approvedCount || 0);
      } else if (tab == 2) {
        setCount(rejectedCount || 0);
      } else if (tab == 3) {
        setCount(pendingCount || 0);
      } else if (tab == 4) {
        setCount(waitingForActionCount || 0);
      }
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

  const handleSearchType = async (tab, page, rows, searchValue, selectedType) => {
    setLoading(true);

    setIsBtnDisabled(true);
    setTimeout(() => {
      setIsBtnDisabled(false);
    }, 1000);

    setIsSearching(true);
    setSelectedType(selectedType);
    // setSearchValue(searchValue.trimStart());

    try {
      // First API call: Fetch data based on searchValue
      const response = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/policy/user?tab=${tab}&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data);

      // Second API call: Fetch the count data based on searchValue
      const countResponse = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?search=${searchValue}&type=${selectedType}`,"GET",1,{});

      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }

      const countData = await countResponse.json();

      // Check tab values and set the count based on the tab
      if (tab === "1") setCount(countData.approved);
      if (tab === "2") setCount(countData.rejected);
      if (tab === "3") setCount(countData.pending);
      if (tab === "4") setCount(countData.waitingForAction);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchData = async (tab, page, rows, searchValue, selectedType) => {
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
        `https://policyuat.spandanasphoorty.com/policy_apis/policy/user?tab=${tab}&page=${page}&rows=${rows}&search=${searchValue}&type=${selectedType}`,"GET",1,{});
      const data = await response.json();
      setPsgList(data);

      // Second API call: Fetch the count data based on searchValue
      const countResponse = await customFetchWithAuth(
        `https://policyuat.spandanasphoorty.com/policy_apis/policy/user/count?search=${searchValue}&type=${selectedType}`,"GET",1,{});

      if (!countResponse.ok) {
        throw new Error("Failed to fetch count data");
      }

      const countData = await countResponse.json();

      // Check tab values and set the count based on the tab
      if (tab === "1") setCount(countData.approved);
      if (tab === "2") setCount(countData.rejected);
      if (tab === "3") setCount(countData.pending);
      if (tab === "4") setCount(countData.waitingForAction);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingApprover = selectedDocument?.Policy_status?.find(
    (status) => status.approver_id === selectedDocument?.pending_at_id
  );

  // If pendingApprover is not found and pending_at_id is equal to initiator_id, set name to initiator's name
  const pendingApproverName = pendingApprover
    ? pendingApprover.approver_details?.emp_name
    : selectedDocument?.pending_at_id === selectedDocument?.initiator_id
    ? "Initiator"
    : "No pending approver";

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const columns1 = [
    {
      name: "Document ID",
      selector: (row) => row.id || "N/A",
      // sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayPolicyId(row.id) || "N/A"}
        </div>
      ),
      width: isXs ? "30%" : "22%"
    },
    {
      name: "Document Title",
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
      name: "Type",
      selector: (row) => row.type || "N/A",
      sortable: true,
      // center: true,
      width: isXs ? "20%" : "15%",
      cell: (row) => {
        const typeMapping = {
          1: "Policy",
          2: "SOP",
          3: "Guidance Note"
        };
        const displayType = typeMapping[row.type] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>{displayType}</div>
        );
      }
    },
    {
      name: activeTab == 3 ? "Pending At" : "Updated On", // Conditionally render the name
      selector: (row) =>
        activeTab == 3
          ? row.pending_at_details?.emp_name || "N/A"
          : new Date(row.updatedAt).toLocaleDateString() || "N/A",
      sortable: true,
      cell: (row) => {
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
            {activeTab == 3
              ? row.pending_at_details?.emp_name || "N/A"
              : new Date(row.updatedAt).toLocaleDateString() || "N/A"}
          </div>
        );
      },
      width: isXs ? "30%" : "25%"
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
      handleSearchData(activeTab, newPage, rowsPerPage, searchValue);
    } else {
      setCurrentPage(newPage);
      fetchData(activeTab, newPage, rowsPerPage);
    }
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };
  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(activeTab, currentPage, newRowsPerPage, searchValue); // Search API with updated rows per page
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(activeTab, currentPage, newRowsPerPage); // Default rows per page change
    }
  };

  useEffect(() => {
    if (userToken) {
      const decodedToken = jwtDecode(userToken);
      if (decodedToken.role_id) {
        setRoleId(decodedToken.role_id);
      }
      if (decodedToken.user_id) {
        setUserId(decodedToken.user_id);
      }
    }
  }, [userToken, roleId, userId]);

  useEffect(() => {
    fetchData(activeTab, currentPage, rowsPerPage);
  }, [activeTab, currentPage, rowsPerPage]);

  useEffect(() => {
    if (userToken) {
      handleSearchType(activeTab, currentPage, rowsPerPage, searchValue, selectedType);
    }
  }, [selectedType, activeTab, currentPage, rowsPerPage, searchValue]);

  const handleRowClick = (row) => {
    setSelectedDocument(row.title);
    setSelectedRow(row);
    // setDecision('');
    // setRemarks('');
    // setUploadedFile(null);
    navigate(`/policy/${row.id}`, { state: { title: row.title, status: row.status, activeTab } });
  };

  return (
    <Grid container spacing={2}>
      <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mb: {sm:-2, xs:-2} }}>
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
          Policies, SOPs and Guidance notes
        </Typography>
      </Grid>
      {(isInitiator(roleId)) && (
        <Grid item lg={3} md={3} sm={6} xs={6} sx={{ml: {sm: 1, xs: 2}}}>
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
            onClick={() => navigate("/initiate/psg")}
          >
            New
          </Button>
        </Grid>
      )}
      <Grid
        item
        lg={(isInitiator(roleId)) ? 2.7 : 6}
        md={(isInitiator(roleId)) ? 2.7 : 6}
        sm={(isInitiator(roleId)) ? 5.7 : 12}
        xs={(isInitiator(roleId)) ? 5.2 : 12}
      >
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2, mr: 2 }}
        >
          <Typography
            variant="h5"
            sx={{ fontFamily: "sans-serif", fontSize: "0.875rem", mr: 2, mt: 0.5 }}
          >
            Type
          </Typography>
          <Controller
            name="documentType"
            control={control}
            defaultValue={selectedType}
            render={({ field }) => (
              <StyledSelect
                labelId="document-type-label"
                id="documentType"
                {...field}
                value={field.value ?? selectedType}
                sx={{
                  width: "160px"
                }}
                displayEmpty
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedType(e.target.value); // Set the selected type here
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={1}>Policy</MenuItem>
                <MenuItem value={2}>SOP</MenuItem>
                <MenuItem value={3}>Guidance Note</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{marginTop: -1}}>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ whiteSpace: 'nowrap' }}
        >
          <Tab
            label="Waiting for Action"
            value="4"
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              fontWeight: 100,
              textTransform: "none"
            }}
          />
          <Tab
            label="Approved"
            value="1"
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              fontWeight: 100,
              textTransform: "none"
            }}
          />
          <Tab
            label="Rejected"
            value="2"
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              fontWeight: 100,
              textTransform: "none"
            }}
          />
          <Tab
            label="Pending"
            value="3"
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              fontWeight: 100,
              textTransform: "none"
            }}
          />
        </Tabs>
      </Box>
      </Grid>
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
          placeholder="Enter Policy ID or Title"
          sx={{ width: "300px", marginRight: 2 }}
        />
        {searchValue && (
          <IconButton
            onClick={() => {
              setSearchValue(""); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(activeTab, currentPage, rowsPerPage); // Fetch data without search
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
          onClick={() => handleSearchData(activeTab, currentPage, rowsPerPage, searchValue, selectedType)}
        >
          Search
        </Button> */}
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
        <Box width="100%" overflow="auto">
          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={count} // Adjust to the total records returned by your API
            paginationRowsPerPageOptions={[5]}
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
  );
};

export default PSGTable;

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
import axios from "axios";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from '@mui/icons-material/Check';
import img1 from "../../../assets/download_file_icon.png";
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

export default function PSGTable() {
  const { control } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const customFetchWithAuth=useCustomFetch();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "1";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabledata, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    fetchData(newValue, currentPage, rowsPerPage);
    // handleSearchType(newValue, currentPage, rowsPerPage, searchValue, selectedType);
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

  const [userCount, setUserCount] = useState(0);
  const [policyCount, setPolicyCount] = useState(0);
  const [circularCount, setCircularCount] = useState(0);
  const [count, setCount] = useState(userCount);

  useEffect(() => {
    if (userCount > 0) {
      setCount(userCount);
      setActiveTab('1');
    } else if (policyCount > 0) {
      setCount(policyCount);
      setActiveTab('2');
    } else if (circularCount > 0) {
      setCount(circularCount);
      setActiveTab('3');
    }
  }, [userCount, policyCount, circularCount]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCAStatus, setSelectedCAStatus] = useState("");

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
    const fetchData = async () => {
      try {
        const response1 = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/admin/get-user-count","GET",1,{});
        const data1 = await response1.json();

        if (data1 && data1.status) {
          const userCount = data1.count;
          setUserCount(userCount || 0);
        }

        const response2 = await customFetchWithAuth("https://policyuat.spandanasphoorty.com/policy_apis/admin/get-policy-count","GET",1,{});
        const data2 = await response2.json();

        if (data2 && data2.status) {
          const policyCount = data2.count;
          setPolicyCount(policyCount || 0);
        }

        const response3 = await customFetchWithAuth('https://policyuat.spandanasphoorty.com/policy_apis/admin/get-circular-count',"GET",1,{});
        const data3 = await response3.json();

        if (data3 && data3.status) {
          const circularCount = data3.count;
          setCircularCount(circularCount || 0);
        }

      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCount,policyCount, circularCount]);

  const fetchData = async (tab, page, rows) => {
    setLoading(true);
    try {
      if (tab == 1) {
        let url = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-user?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url,"GET",1,{});
        const data = await response.json();
        setPsgList(data.data); // Adjust this based on your API response structure
        setCount(userCount || 0);
      } else if (tab == 2) {
        let url = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-policy?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url,"GET",1,{});
        const data = await response.json();
        setPsgList(data.data); // Adjust this based on your API response structure
        setCount(policyCount || 0);
      } else if (tab == 3) {
        let url = `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-circulars?page=${page}&rows=${rows}`;
        const response = await customFetchWithAuth(url,"GET",1,{});
        const data = await response.json();
        setPsgList(data.data); // Adjust this based on your API response structure
        setCount(circularCount || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchValue2, setSearchValue2] = useState("");
  const [searchValue3, setSearchValue3] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (event) => {
    if(activeTab == 1) setSearchValue(event.target.value);
    else if(activeTab == 2) setSearchValue2(event.target.value);
    else if(activeTab == 3) setSearchValue3(event.target.value);
  };

  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const handleSearchData = async (tab, page, rows, searchValue, searchValue2, searchValue3, type, status, CAstatus) => {
    setLoading(true);

    setIsBtnDisabled(true);
    setTimeout(() => {
      setIsBtnDisabled(false);
    }, 1000);

    setIsSearching(true);
    setSearchValue(searchValue.trimStart());
    setSearchValue2(searchValue2.trimStart());
    setSearchValue3(searchValue3.trimStart());

    try {
      if (tab == 1) {
        const response1 = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-user?page=${page}&rows=${rows}&search=${searchValue}`,"GET",1,{});
        const data1 = await response1.json();
        setPsgList(data1.data);

        const countResponse1 = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-user-count?search=${searchValue}`,"GET",1,{},);

        if (!countResponse1.ok) {
          throw new Error("Failed to fetch count data");
        }

        const countData1 = await countResponse1.json();
        setCount(countData1.count);
      } else if (tab == 2) {
        const response2 = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-policy?page=${page}&rows=${rows}&search=${searchValue2}&type=${type}&status=${status}`,"GET",1,{});
        const data2 = await response2.json();
        setPsgList(data2.data);

        const countResponse2 = await customFetchWithAuth(
          `https://policyuat.spandanasphoorty.com/policy_apis/admin/get-policy-count?search=${searchValue2}&type=${type}&status=${status}`,"GET",1,{});

        if (!countResponse2.ok) {
          throw new Error("Failed to fetch count data");
        }

        const countData2 = await countResponse2.json();
        setCount(countData2.count);
      } else if(tab == 3){
        const response3 = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/admin/get-all-circulars?page=${page}&rows=${rows}&search=${searchValue3}&status=${CAstatus}`,"GET",1,{});
        const data3 = await response3.json();
        setPsgList(data3.data);
    
        const countResponse3 = await customFetchWithAuth(`https://policyuat.spandanasphoorty.com/policy_apis/admin/get-circular-count?search=${searchValue3}&status=${CAstatus}`,"GET",1,{});
    
        if (!countResponse3.ok) {
          throw new Error('Failed to fetch count data');
        }
    
        const countData3 = await countResponse3.json();
        setCount(countData3.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPolicyId = (policy_id) => {
    return "PL" + String(policy_id).padStart(7, "0");
  };

  const getDisplayCircularId = (circular_id) => {
    return "CA" + String(circular_id).padStart(7, "0");
  };

  const [action, setAction] = useState({});
  const [rowActions, setRowActions] = useState({});
  const [isCheckEnabled, setIsCheckEnabled] = useState({});

  useEffect(() => {
    if (psgList) {
      const initialActions = {};
      const initialCheckEnabled = {};
      psgList.forEach((row) => {
        if (row.status === 1) {
          initialActions[row.id] = "activate";
        } else if (row.status === 2) {
          initialActions[row.id] = "deprecate";
        }
        initialCheckEnabled[row.id] = false; // Initially disable CheckIcon
      });
      setRowActions(initialActions);
      setIsCheckEnabled(initialCheckEnabled);
    }
  }, [psgList]);

  const handleActionChange = (event, row) => {
    const action = event.target.value;
    setAction((prevActions) => ({
      ...prevActions,
      [row.id]: action, // Set action for the specific row ID
    }));
    setRowActions((prevActions) => ({
      ...prevActions,
      [row.id]: action, // Set action for the specific row ID
    }));
    setIsCheckEnabled((prevEnabled) => ({
      ...prevEnabled,
      [row.id]: true, // Enable CheckIcon after selection change
    }));
  };

  const columns1 = [
    // {
    //   name: "S.No.",
    //   selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
    //   width: "15%",
    //   cell: (row, index) => (
    //     <Typography
    //       variant="body2"
    //       sx={{ textAlign: "center", textDecoration: "none", paddingLeft: "8px", fontSize: "14px" }}
    //     >
    //       {(currentPage - 1) * rowsPerPage + index + 1}
    //     </Typography>
    //   )
    // },
    {
      name: "Employee ID",
      selector: (row) => row.emp_id || "N/A",
      sortable: true,
      // center: true,
      width: "20%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            textDecoration: "none",
            paddingLeft: "8px",
            fontSize: "14px"
          }}
          // onClick={() => handleRowClick(row)}
        >
          {row.emp_id}
        </Typography>
      )
    },
    {
      name: "Employee Name",
      selector: (row) => row.emp_name || "N/A",
      sortable: true,
      // center: true,
      width: "30%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            cursor: "pointer",
            textDecoration: "none",
            paddingLeft: "8px",
            fontSize: "14px"
          }}
          // onClick={() => handleRowClick(row)}
        >
          {row.emp_name}
        </Typography>
      )
    },
    {
      name: "Employee Email",
      selector: (row) => row.emp_email || "N/A",
      sortable: true,
      // center: true,
      width: "35%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            cursor: "pointer",
            textDecoration: "none",
            paddingLeft: "8px",
            fontSize: "14px"
          }}
          // onClick={() => handleRowClick(row)}
        >
          {row.emp_email}
        </Typography>
      )
    },
    {
      name: "Action",
      selector: () => null,
      width: "10%",
      center: "true",
      cell: (row) => (
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
        >
          <EditIcon
            sx={{
              cursor: "pointer",
              color: "#ee8812",
              justifyContent: "center",
              alignItems: "center"
            }}
            onClick={() => handleRowClick(row)}
          />
        </Box>
      ),
      style: {
        textAlign: 'center',
        width: '100%'
      }
    }
  ];

  const columns2 = [
    {
      name: "Policy ID",
      selector: (row) => row.id || "N/A",
      sortable: true,
      // center: true,
      cell: (row) => (
        <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>
          {getDisplayPolicyId(row.id) || "N/A"}
        </div>
      ),
      width: "12%"
    },
    {
      name: "Document Title",
      selector: (row) => row.title || "N/A",
      sortable: true,
      // center: true,
      width: "25%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            textAlign: "left",
            cursor: "pointer",
            textDecoration: "none",
            paddingLeft: "8px",
            fontSize: "14px"
          }}
        >
          {row.title}
        </Typography>
      )
    },
    {
      name: "Type",
      selector: (row) => row.type || "N/A",
      // sortable: true,
      // center: true,
      width: "15%",
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
      name: "Description",
      selector: (row) => row.description || "N/A",
      sortable: true,
      // center: true,
      width: "28%",
      cell: (row) => (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "600px",
            textAlign: "center",
            paddingLeft: "8px"
          }}
          title={row.description} // Shows full text on hover
        >
          {row.description}
        </Typography>
      )
    },
    {
      name: "Status",
      selector: (row) => row.status || "N/A",
      // sortable: true,
      // center: true,
      width: "10%",
      cell: (row) => {
        const statusMapping = {
          0: "In review",
          1: "Approved",
          2: "Rejected",
          3: "Deprecated"
        };
        const displayStatus = statusMapping[row.status] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px" }}>{displayStatus}</div>
        );
      }
    },
    {
      name: "Action",
      selector: () => null, // No need for selector since we're using a custom cell
      width: "10%",
      center: "true",
      cell: (row) => (
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
        >
          <EditIcon
            sx={{
              cursor: "pointer",
              color: "#ee8812",
              justifyContent: "center",
              alignItems: "center"
            }}
            onClick={() => handleRowClick(row)}
          />
        </Box>
      )
    }
  ];

  const columns3 = [
    {
    name: 'Circular ID',
    selector: row => row.id || 'N/A',
    sortable: true,
    // center: true,
    cell: (row) => (
        <div style={{ textAlign: 'left', width: '100%', paddingLeft: '8px' }}>
          {getDisplayCircularId(row.id) || 'N/A'}
        </div>
    ),
    width: '13%',
    },
    {
    name: 'Circular Title',
    selector: row => row.title || 'N/A',
    sortable: true,
    // center: true,
    width: '23%',
    cell: (row) => (
        <Typography
        variant="body2"
        sx={{ textAlign: 'left', cursor: 'pointer', textDecoration: 'none', paddingLeft: '8px', fontSize: '14px' }}
        // onClick={() => handleRowClick(row)}
        >
        {row.title}
        </Typography>
    ),
    },
    {
    name: 'Circular Description',
    selector: row => row.description || 'N/A',
    sortable: true,
    // center: true,
    width: '33%',
    cell: (row) => (
        <Typography
        variant="body2"
        sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '600px',
            textAlign: 'center',
            paddingLeft: '8px'
        }}
        title={row.description} // Shows full text on hover
        >
        {row.description}
        </Typography>
    ),
    },
    {
      name: "Status",
      selector: (row) => row.status || "N/A",
      // sortable: true,
      // center: true,
      width: "13%",
      cell: (row) => {
        const statusMapping = {
          1: "Active",
          2: "Deprecated",
        };
        const displayStatus = statusMapping[row.status] || "N/A";
        return (
          <div style={{ textAlign: "left", width: "100%", paddingLeft: "8px", paddingRight: "8px" }}>{displayStatus}</div>
        );
      }
    },
    {
      name: 'Action',
      selector: () => null,
      width: '15%',
      headerStyle: {
        textAlign: 'center',
      },
      center: "true",
      cell: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40%' }}>
          <form>
            <StyledSelect
              value={rowActions[row.id] || ""}
              onChange={(event) => handleActionChange(event, row)}
              displayEmpty
              sx={{ width: '120px' }}
            >
              <MenuItem value="activate" disabled={row.status === 1}>Activate</MenuItem>
              <MenuItem value="deprecate" disabled={row.status === 2}>Deprecate</MenuItem>
            </StyledSelect>
          </form>
          {isCheckEnabled[row.id] && (
            <Button
              onClick={() => handleCASubmit(row)}
              sx={{
                ml: 1,
                backgroundColor: '#ee8812',
                color: '#fff',
                minWidth: '30px',
                height: '25px',
                borderRadius: '5px',
                '&:hover': {
                  backgroundColor: 'rgb(249, 83, 22)',
                },
              }}
            >
              <CheckIcon />
            </Button>
          )}
        </Box>
      ),
    }
  ];

  const columns = activeTab == 1 ? columns1 : activeTab == 2 ? columns2 : columns3;

  const handlePageChange = (newPage) => {
    if (isSearching) {
      setCurrentPage(newPage);
      handleSearchData(activeTab, newPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
    } else {
      setCurrentPage(newPage);
      fetchData(activeTab, newPage, rowsPerPage);
    }
  };

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  //   fetchData(activeTab, page, rowsPerPage);
  // };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (isSearching) {
      setRowsPerPage(newRowsPerPage);
      handleSearchData(activeTab, currentPage, newRowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus); // Search API with updated rows per page
    } else {
      setRowsPerPage(newRowsPerPage);
      fetchData(activeTab, currentPage, newRowsPerPage); // Default rows per page change
    }
  };

  // const handleRowsPerPageChange = (newRowsPerPage) => {
  //   setRowsPerPage(newRowsPerPage);
  //   setCurrentPage(1);
  //   fetchData(activeTab, 1, newRowsPerPage);
  // };

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
    fetchData(activeTab, currentPage, rowsPerPage);
  }, [activeTab, currentPage, rowsPerPage]);

  useEffect(() => {
    handleSearchData(activeTab, currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus);
  }, [activeTab, currentPage, rowsPerPage, searchValue, searchValue2, searchValue3, selectedType, selectedStatus, selectedCAStatus]);

  const handleRowClick = (row) => {
    if (activeTab == 1) {
      setSelectedDocument(row.user_id);
      setSelectedRow(row);
      navigate(`/admin/user/${row.user_id}`, {
        state: { user_id: row.user_id, emp_id: row.emp_id, emp_name: row.emp_name, activeTab }
      });
    } else if (activeTab == 2) {
      setSelectedDocument(row.title);
      setSelectedRow(row);
      navigate(`/admin/policy/${row.id}`, { state: { id: row.id, title: row.title, activeTab } });
    }
  };

  const handleCASubmit = (event) => {
    // event.preventDefault();
    setLoading(true);

    setIsBtnDisabled(true);

    // const mappedDecision = mapDecisionToNumber(decision);

    const url = "https://policyuat.spandanasphoorty.com/policy_apis/admin/CA-change-status";

    const selectedAction = action[event.id];
    let status = null;

    if (selectedAction === "activate") {
      status = 1; // Activate -> Status 1
    } else if (selectedAction === "deprecate") {
      status = 2; // Deprecate -> Status 2
    }

    const formData = {
      id: event.id,
      status: status
    }
    console.log("Payload Stringified:", JSON.stringify(formData));

    const submitForm = customFetchWithAuth(url,"POST",2,JSON.stringify(formData))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status) {
          setIsCheckEnabled((prevEnabled) => ({
            ...prevEnabled,
            [event.id]: false,
          }));
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        } else {
          throw new Error("Submission failed");
        }
        setLoading(false); // Reset loading state
      })
      .catch((error) => {
        console.error("Submission error:", error);
        setIsBtnDisabled(false);
        setLoading(false); // Reset loading state
        throw error;
      });

    toast.promise(submitForm, {
      loading: "Updating...",
      success: (data) => `Decision updated successfully`, // Adjust based on your API response
      error: (err) => `Error while updating the decision`
    });
  };

  return (
    <ContentBox className="analytics">
    <Card sx={{ px: 1, py: 1, height: '100%', width: '100%' }}>
    <Grid container spacing={2} sx={{ width: '100%', height: '100%' }}>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '1rem', ml: 2 }}>
          Admin Portal
        </Typography>
        {activeTab == 2 && (
        <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
            Type
          </Typography>
          <Controller
            name="documentType"
            control={control}
            value={selectedType}
            render={({ field }) => (
              <StyledSelect
                labelId="document-type-label"
                id="documentType"
                {...field}
                sx={{
                  width: '160px',
                }}
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedType(e.target.value);
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={1}>Policy</MenuItem>
                <MenuItem value={2}>SOP</MenuItem>
                <MenuItem value={3}>Guidance Note</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
        )}
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2, display: 'flex', flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Tab label="User Management" value='1' sx={{ fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none" }} />
          <Tab label="Policy Management" value='2' sx={{ fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none" }} />
          <Tab label="Circular Management" value='3' sx={{ fontFamily: "sans-serif", fontSize: '0.875rem', fontWeight: 100, textTransform: "none" }} />
        </Tabs>
        </Box>
        {activeTab == 2 && (
        <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center', mt: {lg: -1, md: -1, sm: 0, xs: 2} }}>
          <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
            Status
          </Typography>
          <Controller
            name="documentStatus"
            control={control}
            value={selectedStatus}
            render={({ field }) => (
              <StyledSelect
                labelId="document-status-label"
                id="documentStatus"
                {...field}
                sx={{
                  width: '160px',
                }}
                onChange={(e) => {
                  field.onChange(e);
                  if(e.target.value === ""){
                    setSelectedStatus("");
                  } else{
                    setSelectedStatus(e.target.value);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value={0}>In review</MenuItem>
                <MenuItem value={1}>Approved</MenuItem>
                <MenuItem value={2}>Rejected</MenuItem>
                <MenuItem value={3}>Deprecated</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
        )}
        {activeTab == 3 && (
        <Grid item xs="auto" sx={{ display: 'flex', alignItems: 'center', mt: {lg: -1, md: -1, sm: 0, xs: 2} }}>
          <Typography variant="h5" sx={{ fontFamily: 'sans-serif', fontSize: '0.875rem', mr: 2 }}>
            Status
          </Typography>
          <Controller
            name="documentStatus"
            control={control}
            value={selectedCAStatus}
            render={({ field }) => (
              <StyledSelect
                labelId="document-status-label"
                id="documentStatus"
                {...field}
                sx={{
                  width: '160px',
                }}
                onChange={(e) => {
                  field.onChange(e);
                  if(e.target.value == ""){
                    setSelectedCAStatus("");
                  } else{
                    setSelectedCAStatus((e.target.value)-3);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value={4}>Active</MenuItem>
                <MenuItem value={5}>Deprecated</MenuItem>
              </StyledSelect>
            )}
          />
        </Grid>
        )}
        {activeTab == 1 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              textTransform: "none",
              marginTop: { sm: -1, xs: 2 },
              height: "25px",
              width: {lg:"12%", md: "16%", sm:"20%", xs:"36%"},
              backgroundColor: "#ee8812",
              "&:hover": {
                backgroundColor: "rgb(249, 83, 22)"
              }
            }}
            onClick={() => navigate("/admin/user/add")}
          >
            New User
          </Button>
        )}
      </Grid>
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginLeft: 2, display: 'flex', alignItems: 'center' }}>
        {activeTab == 1 && (
        <>
        <StyledTextField
          value={searchValue}
          onChange={handleInputChange}
          placeholder="Search..."
          sx={{ width: '300px', marginRight: 2 }}
        />
        {searchValue && (
          <IconButton
            onClick={() => {
              setSearchValue(''); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(activeTab, currentPage, rowsPerPage); // Fetch data without search
            }}
            sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }} // Adjust for proper spacing
          >
            <CloseIcon />
          </IconButton>
        )}
        </>
        )}
        {activeTab == 2 && (
        <>
        <StyledTextField
          value={searchValue2}
          onChange={handleInputChange}
          placeholder="Search..."
          sx={{ width: '300px', marginRight: 2 }}
        />
        {searchValue2 && (
          <IconButton
            onClick={() => {
              setSearchValue2(''); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(activeTab, currentPage, rowsPerPage); // Fetch data without search
            }}
            sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }} // Adjust for proper spacing
          >
            <CloseIcon />
          </IconButton>
        )}
        </>
        )}
        {activeTab == 3 && (
        <>
        <StyledTextField
          value={searchValue3}
          onChange={handleInputChange}
          placeholder="Search..."
          sx={{ width: '300px', marginRight: 2 }}
        />
        {searchValue3 && (
          <IconButton
            onClick={() => {
              setSearchValue3(''); // Clear the search field
              setIsSearching(false); // Reset isSearching state
              fetchData(activeTab, currentPage, rowsPerPage); // Fetch data without search
            }}
            sx={{ marginRight: 1, marginLeft: -2, marginTop: -2 }} // Adjust for proper spacing
          >
            <CloseIcon />
          </IconButton>
        )}
        </>
        )}
        </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ marginTop: -2 }}>
            <Box width="100%" height="100%" overflow="auto">
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

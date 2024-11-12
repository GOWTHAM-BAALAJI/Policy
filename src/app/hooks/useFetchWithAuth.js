import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
//import { setAccessToken } from "./redux/accessTokenSlice";
import { clearJwtToken, setJwtToken } from "../../redux/actions/authActions";
const useCustomFetch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.token);
  //flag (1->GET, 2-> POST(application/json), 3->POST(form-data));
  const customFetchWithAuth = async (url,method,flag,payload) => {
    let token = accessToken;
    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime +1 > expirationTime) {
      //alert("inside refresh logic");
      const newAccessTokenData = await fetch("https://policyuat.spandanasphoorty.com/policy_apis/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: "value" })
      });
      const data = await newAccessTokenData.json();
      if (!data.status) {
        dispatch(clearJwtToken());
        toast.error("Token expired, redirecting to login page");
        setTimeout(()=>{
          navigate("/");
        },3000);
        return;
        //redirect to login page
      }
      dispatch(setJwtToken(data.jwt));
      token = data.jwt;
    }
    let requestParams ={
      method:method,
      // headers: {
      //   'Content-Type': 'application/json',
      //   Authorization: `Bearer ${token}`
      // },
    }
    if(method=="POST"){
      requestParams.body=payload;
    }
    if(flag==1||flag==3){
      requestParams.headers= {
          Authorization: `Bearer ${token}`
        }
    }
    else if(flag==2){
      requestParams.headers= {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }

    const response = await fetch(url, requestParams);
    return response;
    // const secretData = await response.json();
    // return secretData;
  };
  return customFetchWithAuth;
};
export default useCustomFetch;
//dispatch(setAccessToken(data.accessToken));

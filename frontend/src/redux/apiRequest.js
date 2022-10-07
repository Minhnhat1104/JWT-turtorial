import axios from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailed,
  registerStart,
  registerSuccess,
  registerFailed,
  logOutStart,
  logOutSuccess,
  logOutFailed,
} from "./authSlice.js";
import {
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailed,
} from "./userSlice.js";
import { getUsersStart, getUsersSuccess, getUsersFailed } from "./userSlice.js";

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/auth/log", user);
    dispatch(loginSuccess(res.data));
    navigate("/");
  } catch (err) {
    dispatch(loginFailed());
  }
};

export const registerUser = async (user, dispatch, navigate, axoisJWT) => {
  dispatch(registerStart());
  try {
    await axoisJWT.post("/v1/auth/register", user);
    dispatch(registerSuccess());
    navigate("/login");
  } catch (err) {
    dispatch(registerFailed());
  }
};

export const getAllUser = async (accessToken, dispatch) => {
  dispatch(getUsersStart());
  try {
    const res = await axios.get("/v1/user", {
      headers: {
        token: `Bearer ${accessToken}`,
      },
    });
    dispatch(getUsersSuccess(res.data));
  } catch (err) {
    dispatch(getUsersFailed());
  }
};

export const deleteUser = async (id, accessToken, dispatch, axoisJWT) => {
  dispatch(deleteUserStart());
  try {
    const res = await axoisJWT.delete(`/v1/user/${id}`, {
      headers: {
        token: `Bearer ${accessToken}`,
      },
    });
    dispatch(deleteUserSuccess(res.data));
  } catch (err) {
    dispatch(deleteUserFailed(err.response.data));
  }
};

export const logOutUser = async (
  dispatch,
  id,
  navigate,
  accessToken,
  axoisJWT
) => {
  dispatch(logOutStart());
  try {
    await axoisJWT.post("/v1/auth/logout", id, {
      headers: {
        token: `Bearer ${accessToken}`,
      },
    });
    dispatch(logOutSuccess());
    navigate("/login");
  } catch (err) {
    dispatch(logOutFailed());
  }
};

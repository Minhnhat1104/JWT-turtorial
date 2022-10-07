import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUser, deleteUser } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import "./home.css";
import { loginSuccess } from "../../redux/authSlice";
import { createAxios } from "../../createInstance";

const HomePage = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const allUsers = useSelector((state) => state.users.users?.allUsers);
  const msg = useSelector((state) => state.users?.msg);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axoisJWT = createAxios(user, dispatch, loginSuccess);

  const handleDelete = (id) => {
    deleteUser(id, user?.accessToken, dispatch, axoisJWT);
  };

  //DUMMY DATA
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    if (user?.accessToken) {
      getAllUser(user?.accessToken, dispatch, navigate, axoisJWT);
    }
  }, []);

  return (
    <main className="home-container">
      <div className="home-title">User List</div>
      <div className="home-role">{`Your role: ${
        user?.admin ? "Admin" : "User"
      }`}</div>
      <div className="home-userlist">
        {allUsers?.map((user, index) => {
          return (
            <div key={index} className="user-container">
              <div className="home-user">{user.username}</div>
              <div
                className="delete-user"
                onClick={() => handleDelete(user._id)}
              >
                {" "}
                Delete{" "}
              </div>
            </div>
          );
        })}
      </div>
      <div className="home-msg">{`Your message: ${msg}`}</div>
    </main>
  );
};

export default HomePage;

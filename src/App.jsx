import axios from "axios";
import React, { useState } from "react";
import jwtDecode from "jwt-decode";
const url = "http://localhost:3000";

const App = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/user/signin`, {
        username,
        password,
      });
      setUser(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <>
      {!user ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <form
            style={{ display: "flex", flexDirection: "column" }}
            onSubmit={handleSubmit}
          >
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign In</button>
          </form>
        </div>
      ) : (
        <AdminDash
          user={user}
          username={username}
          setSuccess={setSuccess}
          setError={setError}
          setUser={setUser}
        />
      )}
    </>
  );
};
const AdminDash = ({ user, username, setSuccess, setError, setUser }) => {
  const axiosJwt = axios.create();
  axiosJwt.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwtDecode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshHandler(user.refreshToken);
        config.headers["authorization"] = `Bearer ${data.accessToken}`;
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );
  const [message, setMessage] = useState("");
  const deletHandler = async (usrnm) => {
    setSuccess(false);
    setError(false);
    // console.log(user.accessToken);
    try {
      const res = await axiosJwt.delete(`${url}/somepost/123`, {
        headers: { authorization: `bearer ${user.accessToken}` },
        data: { username: usrnm },
      });
      setMessage(res.data);
      setSuccess(true);
      console.log("deleted success");
    } catch (error) {
      setError(true);
      console.log(error.message);
    }
  };
  const refreshHandler = async (rfrsh) => {
    try {
      const res = await axios.post(`${url}/api/refresh`, { token: rfrsh });
      console.log(res.data);
      console.log(user);
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div style={{ marginLeft: "100px" }}>
          <h2>{user?.user.username}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            onClick={() => {
              return deletHandler(username);
            }}
            style={{ marginLeft: "100px" }}
          >
            Delete
          </button>
          <p>{message}</p>
        </div>
        <button
          onClick={() => {
            return refreshHandler(user.refreshToken);
          }}
          style={{ marginLeft: "100px" }}
        >
          refresh
        </button>
      </div>
    </>
  );
};
export default App;

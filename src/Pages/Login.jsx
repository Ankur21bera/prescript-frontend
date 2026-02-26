import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { backendUrl, setToken } from "../redux/doctor";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (
        (state === "Sign Up") &&
        password !== confirmPass
      ) {
        toast.error("Password and Confirm Password do not match!");
        setLoading(false);
        return;
      }
      if (state === "Login") {
        const res = await axios.post(`${backendUrl}api/user/login`, {
          email,
          password,
        });

        if (res.data.success) {
          dispatch(
  setToken({
    token: res.data.token,
    user: null,
  })
);
          navigate("/");
          toast.success("Login Successful");
        } else {
          toast.error(res.data.message);
        }
      }

      // if (state === "Sign Up") {
      //   const res = await axios.post(`${backendUrl}api/user/register`, {
      //     name,
      //     email,
      //     password,
      //     confirmPass,
      //   });

      //   if (res.data.success) {
      //     toast.success("Account created! Please Login.");
      //     navigate("/");
      //   } else {
      //     toast.error(res.data.message);
      //   }
      // }

      if (state === "Sign Up") {
  const res = await axios.post(`${backendUrl}api/user/register`, {
    name,
    email,
    password,
  });

  if (res.data.success) {
    // AUTO LOGIN: save token + user
    dispatch(
      setToken({
        token: res.data.token,
        user: res.data.user,
      })
    );

    toast.success("Account Created Successfully!");
    navigate("/");  // redirect to home
  } else {
    toast.error(res.data.message);
  }
}


      if (state === "Forgot") {
        const res = await axios.post(`${backendUrl}api/user/forgot-password`, {
          email,
        });

        toast.success(res.data.message);
        setState("Reset");
      }

      if (state === "Reset") {
  if(password !== confirmPass){
    toast.error("Password and Confirm Password do not match!");
    return;
  }

  const res = await axios.post(`${backendUrl}api/user/reset-password`, {
    newPassword: password, 
  });

  if(res.data.success){
    toast.success(res.data.message);
    setState("Login");
    setPassword("");
    setConfirmPass("");
  } else {
    toast.error(res.data.message);
  }
}

     
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        {/* Title */}
        <p className="text-2xl font-semibold">
          {state === "Sign Up"
            ? "Create Account"
            : state === "Forgot"
            ? "Forgot Password"
            : state === "Reset"
            ? "Reset Password"
            : "Login"}
        </p>

        {/* Description */}
        {state === "Login" && <p>Please log in to book appointment</p>}
        {state === "Sign Up" && <p>Please sign up to book appointment</p>}
        {state === "Forgot" && <p>Enter your email to get reset link</p>}
        {state === "Reset" && <p>Enter your new password</p>}

        {/* SIGN UP FORM */}
        {state === "Sign Up" && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>

            <div className="w-full">
              <p>Email</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <div className="w-full">
              <p>Password</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>

            <div className="w-full">
              <p>Confirm Password</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setConfirmPass(e.target.value)}
                value={confirmPass}
              />
            </div>

            <button className="bg-blue-600 text-white w-full p-2 rounded-md text-base cursor-pointer">
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-600 underline cursor-pointer"
              >
                Login Here
              </span>
            </p>
          </>
        )}

        {/* LOGIN FORM */}
        {state === "Login" && (
          <>
            <div className="w-full">
              <p>Email</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <div className="w-full">
              <p>Password</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>

            <p
              className="text-blue-600 underline cursor-pointer"
              onClick={() => setState("Forgot")}
            >
              Forgot Password?
            </p>

            <button
              typ
              className="bg-blue-600 text-white w-full p-2 rounded-md cursor-pointer text-base"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p>
              Create an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-blue-600 underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          </>
        )}

        {/* FORGOT PASSWORD FORM */}
        {state === "Forgot" && (
          <>
            <div className="w-full">
              <p>Email</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <button
              type="submit" 
              className="bg-blue-600 text-white w-full p-2 rounded-md cursor-pointer text-base"
            >
              {loading ? "Resetting..." : "Reset Your Password"}
            </button>

            <p>
              Back to{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-600 underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </>
        )}

        {state === "Reset" && (
  <>
    <div className="w-full">
      <p>New Password</p>
      <input
        type="password"
        className="border border-zinc-300 rounded w-full p-2 mt-1"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>

    <div className="w-full">
      <p>Confirm New Password</p>
      <input
        type="password"
        className="border border-zinc-300 rounded w-full p-2 mt-1"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />
    </div>

    <button type="submit" className="bg-blue-600 cursor-pointer text-white w-full p-2 rounded-md">
      {loading ? "Resetting..." : "Reset Password"}
    </button>
  </>
)}

      </div>
    </form>
  );
};

export default Login;

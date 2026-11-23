import { useEffect, useState, type SubmitEvent } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router";
import "./LoginForm.css";

export function LoginForm() {
  const submitHandler = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const login_form = new FormData(e?.currentTarget);
    const login_data = Object.fromEntries(login_form.entries());
    const res = await fetch("/api/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login_data),
      credentials: "include",
    });
    if (res.ok) {
      alert("Login Successful");
    } else {
      alert("Login Failure");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "40px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form className="login-form" onSubmit={submitHandler}>
        <legend
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "5px",
            padding: "0",
          }}
        >
          Login
        </legend>
        <label htmlFor="username">User Name</label>
        <input
          id="username"
          className="mb10px text-input"
          type="text"
          name="username"
          autoComplete="username"
          placeholder="Username"
          required
        ></input>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="mb10px text-input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email"
          required
        ></input>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="mb10px text-input"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          required
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            // height: "30px",
          }}
        >
          <a className="a-button" href="register">
            Register
          </a>
          <button type="submit" className="a-button">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

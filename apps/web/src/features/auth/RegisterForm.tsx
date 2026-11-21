import { useEffect, useState, type SubmitEvent } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router";
// import "./RegisterForm.css";

export function RegisterForm() {
  const submitHandler = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      <form onSubmit={submitHandler}>
        <legend style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "5px",
          padding: "0",
        }}>Register</legend>
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
        <label htmlFor="display_name">Display Name</label>
        <input
          id="display_name"
          className="mb10px text-input"
          type="text"
          name="display_name"
          autoComplete="nickname"
          placeholder="Display Name"
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
          autoComplete="new-password"
          placeholder="Password"
          required
        />
        <label htmlFor="invitation_token">Invitation Token</label>
        <input
          id="invitation_token"
          className="mb10px text-input"
          type="text"
          name="invitation_token"
          autoComplete="nope"
          placeholder="Invitation Token"
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
          <a
            className="a-button func-btn"
            href="login"
          >
            Login
          </a>
          <button
            type="submit"
            className="func-btn"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

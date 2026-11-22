import { useEffect, useState, type SubmitEvent } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router";
import "./ProfileForm.css";

export function ProfileForm() {
  const submitHandler = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const pwdSubmitHandler = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div
      style={{
        // display: "flex",
        // justifyContent: "center",
        // margin: "0 auto",
        // overflowX: "auto",
        alignItems: "center",
        padding: "0 20px 80px 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form className="profile-form" onSubmit={submitHandler}>
        <legend
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            padding: "0",
          }}
        >
          Profile
        </legend>
        <div
          className="form-columns"
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <fieldset>
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
          </fieldset>
          <fieldset>
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
            <label htmlFor="invitation_token">Invitation Token</label>
            <input
              id="invitation_token"
              className="mb10px text-input"
              type="text"
              name="invitation_token"
              autoComplete="nope"
              placeholder="Invitation Token"
              style={{
                cursor: "not-allowed",
              }}
              required
              disabled
            />
          </fieldset>
        </div>

        <div className="form-button-div">
          <a className="a-button" href="logout">
            Logout
          </a>
          <button type="submit" className="a-button">
            Save
          </button>
        </div>
      </form>

      <form action="none" className="profile-form" onSubmit={pwdSubmitHandler}>
        <legend
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            padding: "0",
          }}
        >
          Password
        </legend>
        <div className="form-columns">
          <fieldset>
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              className="mb10px text-input"
              type="password"
              name="current-password"
              autoComplete="current-password"
              placeholder="Current Password"
              required
            />
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              className="mb10px text-input"
              type="password"
              name="new-password"
              autoComplete="new-password"
              placeholder="New Password"
              required
            />
          </fieldset>
        </div>
        <div className="form-button-div" style={{
          gap: "40px"
        }}>
          <a href="forgot" className="disable a-button">
            Forgot Password
          </a>
          <button type="submit" className="a-button">
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
}

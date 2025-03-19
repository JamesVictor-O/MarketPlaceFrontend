import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";

const Root = () => {
  return (
    <div>
      <Header />
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default Root;

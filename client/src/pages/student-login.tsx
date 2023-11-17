import { Autocomplete } from "./components/Autocomplete";
import { useState, FC } from "react";
import axios from 'axios';

import { Navbar } from "./components/Navbar";
import React from "react";

const Login: FC = () => {
  const [lightMode, setLightMode] = useState<boolean>(true);
  
  const [netId, setNetId] = useState('');
  const [netIdConfirm, setNetIdConfirm] = useState('');
  const [validated, setValidated] = useState(false);


  const loginHandler = () => {
    const url = `https://membership.acm.illinois.edu/api/v1/checkout/session?netid=${netId}`;
    axios.get(url).then((response: { data: string | URL; }) => {
      window.location.replace(response.data);
    })
  };

  const validateNetId = (value: string) => {
    return value.match(/^[A-Z0-9]+$/i);
  };

  return (
    <div className="bg-slate-400 h-screen w-full flex flex-col">
      <Navbar setLightMode={setLightMode} lightMode={lightMode} />
      
      <div className="h-full w-full bg-slate-200 h-screen flex items-center justify-center">

        {/* FORM CONTAINER */}
        <div className="w-full max-w-xs">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="netid">
                NetID
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="netid" type="text" placeholder="NetID" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="********" />
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div className="flex items-center justify-between">
              <button disabled={!validated} onClick={loginHandler} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
              </button>
              <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
              </a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;

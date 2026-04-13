import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CustomPhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  return (
    <>
      <style>{`
        .react-tel-input {
          margin: 0 !important;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          border-radius: 10px;
          box-shadow: var(--main-inner-boxShadow-color);
        }

        .react-tel-input .form-control {
          border: none;
          padding-left: 55px;
          font-size: var(--regular18-);
          font-family: var(--leagueSpartan-regular-400);
          color: var(--black-color);
          background-color: var(--main-white-color) !important;
        }

        .react-tel-input .form-control::placeholder {
          font-size: var(--regular18-);
          font-family: var(--leagueSpartan-regular-400);
          color: var(--black-color);
        }

        .selected-flag {
          border-radius: 10px 0px 0px 10px !important;
          background-color: var(--main-white-color) !important;
        }

        .flag-dropdown {
          border-radius: 10px 0px 0px 10px !important;
          background-color: var(--main-white-color) !important;
        }

        .flag-dropdown:hover {
          background-color: var(--main-white-color) !important;
        }

        .flag-dropdown.open {
          border-radius: 10px 0px 0px 10px !important;
          background-color: var(--main-white-color) !important;
        }

        .selected-flag:focus {
          border-radius: 10px !important;
        }

        .react-tel-input .flag-dropdown {
          border: none;
          border: 1px solid var(--color-dashboard-border) !important;
          outline: none;
          border-radius: 10px 0px 0px 0px;
          height: 100%;
          width: max-content;
          padding-right: 5px;
          }
          
        .country-list {
          height: 24vh;
          border-radius: 10px !important;
          margin: 2px 0px 0px 0px !important;
          z-index: 99999 !important;
          width: 24vw !important;
          min-width: 230px !important;
          box-shadow: none !important;
          background-color: var(--main-white-color) !important;
        }

        .country:hover {
          background-color: var(--main-blue-color) !important;
        }

        .country.highlight {
          background-color: var(--main-blue-color) !important;
        }

        .country-name {
          color: var(--black-color) !important;
          font-size: var(--regular18-) !important;
          font-family: var(--leagueSpartan-regular-400) !important;
        }

        .dial-code {
          color: var(--black-color) !important;
          font-size: var(--regular18-) !important;
          font-family: var(--leagueSpartan-regular-400) !important;
        }
      `}</style>
      <PhoneInput
        country={"us"}
        value={value}
        onChange={onChange}
        inputStyle={{
          width: "100%",
          maxHeight: "50px",
          height: "5.5vh",
          minHeight: "45px",
          boxSizing: "border-box",
          backgroundColor: "var(--main-white-color)",
          boxShadow: "var(--main-inner-boxShadow-color)",
          borderRadius: "10px",
        }}
      />
    </>
  );
};

export default CustomPhoneInput;

import React, { useState, useCallback, useMemo, memo } from "react";
import { Box, Typography, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { Country } from "country-state-city";
import { emailRegex, passwordRegex } from "@/utils/helpers/regex";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import CustomPhoneInput from "@/components/global/phone-number/phone-number";
import ImageUploader from "@/components/global/image-uploader/images-uploader";
import classes from "./add-modal.module.css";
import { ImageType } from "react-images-uploading";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: any;
}

interface UserType {
  id: string;
  name: string;
}

interface CountryType {
  isoCode: string;
  name: string;
}

const initialState = {
  fullName: "",
  email: "",
  password: "",
  gender: "",
  country: null as CountryType | null,
  phoneNumber: "",
  userType: null as UserType | null,
  image: null as ImageType | null,
};

const countries = Country.getAllCountries();
const dummyImagePath = "/assets/images/static/demmyPic.png";

const validateFormData = ({
  fullName,
  email,
  password,
  gender,
  country,
  phoneNumber,
  userType,
}: typeof initialState) => {
  if (!fullName) return "Full Name is required";
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter a valid email address";
  if (!password) return "Password is required";
  if (!password) return "Password is required.";
  if (!gender) return "Please select a gender";
  if (!country) return "Please select a country";
  if (!phoneNumber) return "Phone Number is required";
  if (!userType) return "Please select a user type";
  return null;
};

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
}) => {
  console.log("add-modal");
  const roles = useAppSelector((state) => state.roles.roles);
  const rolesArr = useMemo(() => {
    return roles?.map((item: any) => JSON.stringify(item));
  }, []);
  const [formData, setFormData] = useState(initialState);

  const {
    fullName,
    email,
    password,
    gender,
    country,
    phoneNumber,
    userType,
    image,
  } = formData;

  const handleInputChange = useCallback(
    (name: string, value: any) => {
      // console.log(value);
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData]
  );

  const handleFormSubmit = useCallback(async () => {
    const validationError = validateFormData(formData);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    let profileImage = image?.file;

    if (!profileImage) {
      try {
        const response = await fetch(dummyImagePath);
        const blob = await response.blob();
        profileImage = new File([blob], "dummy-pic.png", { type: "image/png" });
      } catch (error) {
        toast.error("Failed to load the default image");
        return;
      }
    }

    const payload = {
      roleId: userType?.id,
      name: fullName,
      email,
      password,
      country_code: country?.isoCode,
      phone_number: phoneNumber,
      gender,
      profileImage,
    };

    if (handleAdd) {
      handleAdd(payload);
    }
  }, [formData, handleAdd]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <Typography>
              {heading.endsWith("s") ? heading.slice(0, -1) : heading}
            </Typography>
          )}
          {subHeading && <Typography>{subHeading}</Typography>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.uploaderBox}>
              <ImageUploader
                inlinePicBoxStyles={{ width: "5vw", height: "5vw" }}
                onImageChange={(image: ImageType | null) => {
                  handleInputChange("image", image);
                }}
                image={image}
              />
            </div>
            <div className={classes.mainContent}>
              <div className={classes.fields}>
                Full Name
                <InputField
                  inputBoxStyles={{
                    width: "100%",
                    backgroundColor: "#FFF",
                    height: "90%",
                    boxShadow: "none",
                    fill: "#FFF",
                    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
                  }}
                  inputStyles={{ fontSize: "var(--normal-text-size)" }}
                  placeholder="Enter full name"
                  value={fullName}
                  changeFunc={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                />
              </div>
              <div className={classes.fields}>
                Email Address
                <InputField
                  inputBoxStyles={{
                    width: "100%",
                    backgroundColor: "#FFF",
                    height: "90%",
                    boxShadow: "none",
                    fill: "#FFF",
                    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
                  }}
                  inputStyles={{ fontSize: "var(--normal-text-size)" }}
                  placeholder="Enter email address"
                  value={email}
                  changeFunc={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className={classes.fields}>
                Password
                <InputField
                  inputBoxStyles={{
                    width: "100%",
                    backgroundColor: "#FFF",
                    height: "90%",
                    boxShadow: "none",
                    fill: "#FFF",
                    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
                  }}
                  inputStyles={{ fontSize: "var(--normal-text-size)" }}
                  placeholder="Enter password"
                  value={password}
                  changeFunc={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>
              <div className={classes.fields}>
                Gender
                <DropDownSimple
                  placeholder="Select gender"
                  data={["Male", "Female"]}
                  handleChange={(value: string) =>
                    handleInputChange("gender", value)
                  }
                  value={gender || ""}
                />
              </div>
              <div className={classes.fields}>
                Country
                <div className={classes.wrapper2}>
                  <DropDown
                    placeholder="Select Country"
                    data={countries?.map((item) => JSON.stringify(item))}
                    handleChange={(e: any) => {
                      try {
                        handleInputChange(
                          "country",
                          JSON.parse(e.target.value)
                        );
                      } catch {
                        handleInputChange("country", null);
                      }
                    }}
                    value={JSON.stringify(country) || ""}
                  />
                </div>
              </div>
              <div className={classes.fields}>
                Phone Number
                <CustomPhoneInput
                  value={phoneNumber}
                  onChange={(value) => handleInputChange("phoneNumber", value)}
                />
              </div>
              <div className={classes.fields}>
                Parent
                <div className={classes.parentWrapper}>
                  <div className={classes.wrapper3}>
                    <DropDown
                      placeholder="Select user type"
                      data={rolesArr}
                      handleChange={(e: any) => {
                        try {
                          handleInputChange(
                            "userType",
                            JSON.parse(e.target.value)
                          );
                        } catch {
                          handleInputChange("userType", null);
                        }
                      }}
                      value={JSON.stringify(userType) || ""}
                    />
                  </div>
                  <div className={classes.addModal}>
                    <AddOutlinedIcon />
                  </div>
                </div>
              </div>
            </div>
          </form>
          <Button
            loading={loading}
            inlineStyling={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "10%",
              fill: "#38B6FF",
              filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
            }}
            text="Add"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AddModal);

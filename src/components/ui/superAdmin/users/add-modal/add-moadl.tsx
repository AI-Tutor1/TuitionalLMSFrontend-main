import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  useEffect,
  use,
} from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { Country } from "country-state-city";
import { emailRegex } from "@/utils/helpers/regex";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import CustomPhoneInput from "@/components/global/phone-number/phone-number";
import ImageUploader from "@/components/global/image-uploader/images-uploader";
import classes from "./add-modal.module.css";
import { ImageType } from "react-images-uploading";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: any;
  success?: any;
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
  ticket: "",
};

const countries = Country.getAllCountries();
const dummyImagePath = "/assets/images/demmyPic.png";

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
  success,
}) => {
  const roles = useAppSelector((state) => state.roles.roles);
  const rolesArr = useMemo(() => {
    return roles?.map((item: any) => JSON.stringify(item));
  }, [roles]);
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
    ticket,
  } = formData;

  const handleInputChange = useCallback(
    (name: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "email" ? value.trim() : value,
      }));
    },
    [setFormData],
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
      ticket: userType?.name === "Student" ? ticket : undefined,
    };

    console.log(payload);

    if (handleAdd) {
      handleAdd(payload);
    }
  }, [formData, handleAdd]);

  const resetFormState = useCallback(() => {
    setFormData(initialState);
  }, []);

  // Reset form when success or modalOpen changes
  useEffect(() => {
    if (success) {
      resetFormState();
    }
  }, [success, resetFormState]);

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
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.uploaderBox}>
              <ImageUploader
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
                  inputBoxStyles={styles?.inputStyles}
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
                  inputBoxStyles={styles?.inputStyles}
                  placeholder="Enter email address"
                  value={email}
                  changeFunc={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className={classes.fields}>
                Password
                <InputField
                  inputBoxStyles={styles?.inputStyles}
                  placeholder="Enter password"
                  value={password}
                  type="password"
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
                  externalStyles={styles.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Country
                <DropDown
                  placeholder="Select Country"
                  data={countries?.map((item) => JSON.stringify(item))}
                  handleChange={(e: any) => {
                    try {
                      handleInputChange("country", JSON.parse(e.target.value));
                    } catch {
                      handleInputChange("country", null);
                    }
                  }}
                  value={JSON.stringify(country) || ""}
                  inlineDropDownStyles={styles?.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Phone Number
                <CustomPhoneInput
                  value={phoneNumber}
                  onChange={(value) => handleInputChange("phoneNumber", value)}
                />
              </div>
              <div className={classes.fields}>
                User Type
                <DropDown
                  placeholder="Select user type"
                  data={rolesArr}
                  handleChange={(e: any) => {
                    try {
                      handleInputChange("userType", JSON.parse(e.target.value));
                    } catch {
                      handleInputChange("userType", null);
                    }
                  }}
                  value={JSON.stringify(userType) || ""}
                  inlineDropDownStyles={styles?.dropDownStyles}
                />
              </div>
              {userType?.name === "Student" && (
                <div className={classes.fields}>
                  Ticket
                  <InputField
                    inputBoxStyles={styles?.inputStyles}
                    inputStyles={{ fontSize: "var(--normal-text-size)" }}
                    placeholder="Enter ticket"
                    type="number"
                    value={ticket}
                    changeFunc={(e) =>
                      handleInputChange("ticket", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </form>
          <Button
            loading={loading}
            text="Add"
            clickFn={handleFormSubmit}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AddModal);

const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
  dropDownStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
};

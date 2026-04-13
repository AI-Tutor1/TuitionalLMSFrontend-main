import React, { useState, useCallback, useMemo, useEffect, memo } from "react";
import { Box, Modal } from "@mui/material";
import { Country } from "country-state-city";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import CustomPhoneInput from "@/components/global/phone-number/phone-number";
import ImageUploader from "@/components/global/image-uploader/images-uploader";
import classes from "./edit-modal.module.css";
import { ImageType } from "react-images-uploading";
import { getImageString } from "@/services/dashboard/upload-file/upload-file";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useMutation } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";
import { emailRegex } from "@/utils/helpers/regex";

interface BasicModalProps {
  modalOpen: any;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleUpdate?: (data: any) => void;
  loading?: boolean;
  success?: boolean;
}

interface UserType {
  id: number;
  name: string;
}

interface CountryType {
  isoCode: string;
  name: string;
}

const initialState = {
  fullName: "",
  email: "",
  status: null as boolean | null,
  country: null as CountryType | null,
  phoneNumber: "",
  userType: null as UserType | null,
  image: null as ImageType | null,
  pseudo_name: "",
  parentsEmail: "",
};

const countries = Country.getAllCountries();

const EditModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleUpdate,
  loading,
  success,
}) => {
  const token = useAppSelector((state) => state?.user?.token);
  const roles = useAppSelector((state) => state.roles.roles);
  // Store form state
  const [formData, setFormData] = useState(initialState);
  // Memoized selected role
  const selectedRole = useMemo(() => {
    return (
      roles?.find((role: any) => role.id === modalOpen?.profile?.roleId) || {
        id: "",
        name: "",
      }
    );
  }, [modalOpen?.profile?.roleId, roles]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // get image url in string
  const handleImage = useMutation({
    mutationFn: (payload: any) =>
      getImageString(
        {
          token,
          contentType: "multipart/form-data",
        },
        payload,
      ),
    onSuccess: (data: any) => {
      if (data?.url) {
        setImageUrl(data.url);
        toast.success("Image uploaded successfully");
      } else if (data?.message) {
        toast.success(data.message);
      } else {
        toast.error(data?.error || "File upload failed");
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(axiosError.response?.data?.error || axiosError.message);
    },
  });

  // Handle input change
  const handleInputChange = useCallback(
    (name: keyof typeof initialState, value: any) => {
      setFormData((prev) => {
        if (prev[name] === value) return prev;
        return { ...prev, [name]: value };
      });
    },
    [],
  );

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (!emailRegex.test(formData?.email))
      return toast.error("Enter a valid email address");

    const payload = {
      id: modalOpen?.profile?.id,
      name: formData?.fullName || modalOpen?.profile?.name,
      email: formData?.email || modalOpen?.profile?.email,
      status:
        formData?.status !== null
          ? String(formData?.status)
          : modalOpen?.profile?.status,
      roleId: formData?.userType?.id || modalOpen?.profile?.roleId,
      pseudo_name:
        formData?.pseudo_name !== modalOpen.profile.pseudo_name
          ? formData?.pseudo_name
          : modalOpen.profile.pseudo_name,
      profileImageUrl: imageUrl || modalOpen?.profile?.profileImageUrl || null,
      country: formData?.country?.name || modalOpen?.profile?.country,
      country_code:
        formData?.country?.isoCode || modalOpen?.profile?.country_code,
      phone_number: formData?.phoneNumber || modalOpen?.profile?.phone_number,
      parentsEmail: formData?.parentsEmail || modalOpen?.profile?.parentsEmail,
    };

    // console.log("Payload:", payload);
    if (handleUpdate) handleUpdate(payload);
  }, [formData, imageUrl, handleUpdate, modalOpen?.profile]);

  // Populate form data when modal opens
  useEffect(() => {
    if (modalOpen?.profile) {
      setFormData({
        fullName: modalOpen.profile.name || "",
        email: modalOpen.profile.email || "",
        status: modalOpen.profile.status ?? null,
        country:
          countries.find((c) => c.name === modalOpen.profile.country) ||
          countries.find((c) => c.isoCode === modalOpen.profile.country_code) ||
          null,
        phoneNumber: modalOpen.profile.phone_number || "",
        userType:
          roles?.find((r: any) => r.id === modalOpen.profile.roleId) || null,
        image: modalOpen.profile.profileImageUrl
          ? ({ data_url: modalOpen.profile.profileImageUrl } as ImageType)
          : null,
        pseudo_name: modalOpen.profile.pseudo_name || "",
        parentsEmail: modalOpen.profile.parentsEmail || "",
      });
    }
  }, [modalOpen?.profile, roles]);

  // Reset form state on success
  useEffect(() => {
    if (success) {
      setFormData(initialState);
    }
  }, [success]);

  return (
    <Modal open={modalOpen?.open} onClose={handleClose}>
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
              {handleImage?.isPending ? (
                <CircularProgress />
              ) : (
                <ImageUploader
                  onImageChange={(image) => {
                    image?.file && handleImage?.mutate({ file: image?.file });
                    handleImage?.isSuccess && handleInputChange("image", image);
                  }}
                  image={formData?.image}
                />
              )}
            </div>
            <div className={classes.mainContent}>
              <div className={classes.fields}>
                Full Name
                <InputField
                  placeholder="Change full name"
                  value={formData?.fullName}
                  changeFunc={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  inputBoxStyles={styles?.inputStyles}
                />
              </div>
              <div className={classes.fields}>
                Email Address
                <InputField
                  placeholder="Change email address"
                  value={formData?.email}
                  changeFunc={(e) => handleInputChange("email", e.target.value)}
                  inputBoxStyles={styles?.inputStyles}
                />
              </div>
              <div className={classes.fields}>
                Pseudo Name
                <InputField
                  placeholder="Change pseudo name"
                  value={formData?.pseudo_name}
                  changeFunc={(e) =>
                    handleInputChange("pseudo_name", e.target.value)
                  }
                  inputBoxStyles={styles?.inputStyles}
                />
              </div>
              <div className={classes.fields}>
                Country
                <DropDown
                  placeholder="Change Country"
                  data={countries.map((item) => JSON.stringify(item))}
                  handleChange={(e: any) =>
                    handleInputChange("country", JSON.parse(e.target.value))
                  }
                  value={JSON.stringify(formData?.country)}
                  inlineDropDownStyles={styles?.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Phone Number
                <CustomPhoneInput
                  value={formData?.phoneNumber}
                  onChange={(value) => handleInputChange("phoneNumber", value)}
                />
              </div>
              <div className={classes.fields}>
                Role
                <DropDown
                  placeholder="Change Role"
                  data={roles?.map((item: any) => JSON.stringify(item))}
                  handleChange={(e: any) =>
                    handleInputChange("userType", JSON.parse(e.target.value))
                  }
                  value={JSON.stringify(formData?.userType || selectedRole)}
                  inlineDropDownStyles={styles?.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Parent Email Address
                <InputField
                  placeholder="Parent email address"
                  value={formData?.parentsEmail}
                  changeFunc={(e) =>
                    handleInputChange("parentsEmail", e.target.value)
                  }
                  inputBoxStyles={styles?.inputStyles}
                />
              </div>
            </div>
          </form>
          <Button
            loading={handleImage?.isPending || loading}
            disabled={handleImage?.isPending || loading}
            text="Update"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(EditModal);

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

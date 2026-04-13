import { AxiosPost } from "../../utils/helpers/api-methods";
import { BASE_URL, configDataType } from "../config";
import {
  SignIn_Payload_Type,
  SignIn_Response_Type,
  ForgotPassword_Payload_Type,
  ForgotPassword_Response_Type,
  ResetPasword_Type_Payload,
  ResetPasword_Type_Response,
  ConfirmPassword_Type_Payload,
  ConfirmPassword_Type_Response,
} from "./auth.types";

const signApi = () => `${BASE_URL}/api/user/signIn`;
const forgotPasswordApi = () => `${BASE_URL}/api/user/requestPasswordReset`;
const resetPasswordApi = () => `${BASE_URL}/api/user/verifyResetToken`;
const confirmPasswordApi = () => `${BASE_URL}/api/user/changePassword`;

export const SignIn = async (
  data: SignIn_Payload_Type,
  config: configDataType
) => AxiosPost<SignIn_Response_Type>(signApi(), config, data);

export const ForgotPassword = (
  data: ForgotPassword_Payload_Type,
  config: configDataType
) => AxiosPost<ForgotPassword_Response_Type>(forgotPasswordApi(), config, data);

export const ResetPassword = (
  data: ResetPasword_Type_Payload,
  config: configDataType
) => AxiosPost<ResetPasword_Type_Response>(resetPasswordApi(), config, data);

export const ConfirmPassword = (
  data: ConfirmPassword_Type_Payload,
  config: configDataType
) =>
  AxiosPost<ConfirmPassword_Type_Response>(confirmPasswordApi(), config, data);

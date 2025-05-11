import { Helmet } from "react-helmet";
import { AuthForm } from "@/components/auth/auth-form";

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Register - SmartKid Manager</title>
        <meta name="description" content="Create a new account on SmartKid Manager" />
      </Helmet>
      <AuthForm type="register" />
    </>
  );
}

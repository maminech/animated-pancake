import { Helmet } from "react-helmet";
import { AuthForm } from "@/components/auth/auth-form";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login - SmartKid Manager</title>
        <meta name="description" content="Log in to SmartKid Manager to access your dashboard" />
      </Helmet>
      <AuthForm type="login" />
    </>
  );
}

import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  Mail,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  ArrowRight,
  ArrowLeft,
  DollarSign
} from "lucide-react";

interface AuthProps {
  initialMode?: "login" | "signup";
}

const Auth: React.FC<AuthProps> = ({ initialMode = "login" }) => {
  const { user, signUp, signIn, signInWithPhone, loginWithDemo, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    initialBalance: "",
  });



  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (authMethod === "email" && !formData.email) {
      setError("Email is required");
      return false;
    }
    if (authMethod === "phone" && !formData.phone) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!isLogin && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let result;

      if (isLogin) {
        if (authMethod === "email") {
          result = await signIn(formData.email, formData.password);
        } else {
          result = await signInWithPhone(formData.phone, formData.password);
        }
      } else {
        result = await signUp(
          formData.email,
          formData.password,
          authMethod === "phone" ? formData.phone : undefined,
          formData.initialBalance ? Number(formData.initialBalance) : undefined
        );

        if (!result.error) {
          setSuccess(
            "✅ Account created! Please check your email inbox and click the confirmation link before signing in."
          );
        }
      }

      if (result.error) {
        const msg: string = result.error.message || "";
        // "Email not confirmed" - user signed up but hasn't verified their email yet
        if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("not confirmed")) {
          setError("Your email address has not been confirmed. Please check your inbox (and spam folder) for a verification link.");
        // Empty message = unconfirmed account trying to sign in (Supabase quirk)
        } else if (!msg || msg === "{\"message\":\"\"}") {
          setError("Sign-in failed. If you just signed up, please check your email inbox for a confirmation link before signing in.");
        } else if (msg.toLowerCase().includes("invalid login credentials")) {
          setError("Incorrect email or password. Please try again.");
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      console.error("Auth Error Details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause,
        error: err
      });

      if (err.message === 'Failed to fetch') {
        setError(`Network error: Unable to connect to authentication server. Please check your internet connection or verify if the Supabase URL is correct. (Details: ${err.message})`);
      } else {
        setError(err.message || "An unexpected error occurred during authentication.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-semibold">Back to Home</span>
      </Link>

      {/* Dynamic Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {isLogin
              ? "Enter your details to access your account"
              : "Start tracking your expenses with AI today"}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 dark:border-slate-700 p-8 relative overflow-hidden">
          {/* Version Indicator */}
          <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-bl-xl border-l border-b border-indigo-600/20">
            v2.0-SMS-ALERTS
          </div>


          {/* Auth Method Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                authMethod === "email"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}>
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                authMethod === "phone"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}>
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-scale-in">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-300 px-4 py-3 rounded-xl mb-6 text-sm animate-scale-in">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {authMethod === "email" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-16 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-16 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                    Current Balance (Optional)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      name="initialBalance"
                      type="number"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">Set your starting point for tracking.</p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-8 text-center space-y-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                  setFormData({ email: "", phone: "", password: "", confirmPassword: "", initialBalance: "" });
                }}
                className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-all"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="px-4 bg-white dark:bg-slate-800 text-slate-400">Or continue with</span></div>
            </div>

            <button
              type="button"
              onClick={() => loginWithDemo()}
              className="w-full bg-white dark:bg-slate-700 text-slate-700 dark:text-white py-3.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 hover:shadow-md"
            >
              <User className="h-5 w-5 text-slate-400" />
              Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";
import CookVerseLogo from "../../components/CookVerseLogo";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const sendResetCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Enter your email address");
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStep("code");
      Alert.alert("Check your email", "We sent a reset code to your email.");
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Could not send reset code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Enter the code from your email");
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });

      if (attempt.status === "needs_new_password") {
        const result = await signIn.resetPassword({ password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          Alert.alert("Success", "Your password has been reset!");
          router.replace(ROUTES.tabs);
          return;
        }
      }

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace(ROUTES.tabs);
        return;
      }

      Alert.alert("Error", "Could not reset password. Please try again.");
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontWeight: "600", marginLeft: 6 }}>Back</Text>
          </TouchableOpacity>

          <CookVerseLogo size="small" />

          <Text style={[authStyles.title, { marginTop: 20 }]}>
            {step === "email" ? "Forgot Password?" : "Set New Password"}
          </Text>
          <Text style={authStyles.subtitle}>
            {step === "email"
              ? "Enter your email and we'll send you a reset code"
              : "Enter the code from your email and choose a new password"}
          </Text>

          <View style={authStyles.formContainer}>
            {step === "email" ? (
              <>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Email address"
                    placeholderTextColor={COLORS.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                  onPress={sendResetCode}
                  disabled={loading}
                >
                  <Text style={authStyles.buttonText}>
                    {loading ? "Sending..." : "Send Reset Code"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Reset code"
                    placeholderTextColor={COLORS.textLight}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="New password"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={authStyles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.textLight}
                    />
                  </TouchableOpacity>
                </View>
                <View style={authStyles.inputContainer}>
                  <TextInput
                    style={authStyles.textInput}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                  onPress={resetPassword}
                  disabled={loading}
                >
                  <Text style={authStyles.buttonText}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={authStyles.linkContainer} onPress={() => setStep("email")}>
                  <Text style={authStyles.linkText}>
                    <Text style={authStyles.link}>Resend code</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

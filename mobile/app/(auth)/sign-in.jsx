import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
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
import CookVerseLogo from "../../components/CookVerseLogo";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const finishSignIn = async (sessionId) => {
    await setActive({ session: sessionId });
    router.replace(ROUTES.tabs);
  };

  const tryComplete = async (result) => {
    if (result?.status === "complete" && result.createdSessionId) {
      await finishSignIn(result.createdSessionId);
      return true;
    }
    return false;
  };

  const handleSignIn = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      // Primary: single-step email + password (no verification code)
      let result = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (await tryComplete(result)) return;

      // Client Trust or MFA blocked completion — password may still be correct
      if (
        result.status === "needs_client_trust" ||
        result.status === "needs_second_factor"
      ) {
        const totpFactor = signIn.supportedSecondFactors?.find(
          (f) => f.strategy === "totp" || f.strategy === "phone_code"
        );
        if (totpFactor) {
          Alert.alert(
            "Two-factor enabled",
            "This account has two-factor authentication. Disable it in Clerk Dashboard under Multi-factor, or use Google sign-in."
          );
          return;
        }

        Alert.alert(
          "Sign in blocked by Clerk",
          "Clerk Client Trust is requiring an email code after your password. To allow email + password only (no code on sign-in), open Clerk Dashboard → Configure → Attack protection → Client Trust → turn OFF. Then reload the app and sign in again."
        );
        return;
      }

      // Fallback: two-step password factor only (skip email_code first factor)
      if (result.status === "needs_first_factor") {
        const passwordFactor = signIn.supportedFirstFactors?.find(
          (f) => f.strategy === "password"
        );

        if (passwordFactor) {
          result = await signIn.attemptFirstFactor({
            strategy: "password",
            password,
          });

          if (await tryComplete(result)) return;

          if (
            result.status === "needs_client_trust" ||
            result.status === "needs_second_factor"
          ) {
            Alert.alert(
              "Sign in blocked by Clerk",
              "Clerk Client Trust requires an email code after password. Disable it in Clerk Dashboard → Configure → Attack protection → Client Trust → OFF. Then sign in with email and password only."
            );
            return;
          }
        } else {
          const emailCodeOnly = signIn.supportedFirstFactors?.every(
            (f) => f.strategy === "email_code"
          );
          if (emailCodeOnly) {
            Alert.alert(
              "Password sign-in unavailable",
              "This account has no password set. Use Google sign-in or sign up with email and password."
            );
            return;
          }
        }
      }

      Alert.alert(
        "Sign in failed",
        "Incorrect email or password. Please try again."
      );
    } catch (err) {
      const msg = err.errors?.[0]?.message || "Sign in failed";
      const code = err.errors?.[0]?.code;
      if (code === "form_identifier_not_found") {
        Alert.alert("Account not found", "No account exists with this email. Please sign up first.");
      } else if (code === "form_password_incorrect") {
        Alert.alert("Incorrect password", "The password you entered is incorrect. Try again or reset it.");
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId) {
        await setActiveOAuth({ session: createdSessionId });
        router.replace(ROUTES.tabs);
      }
    } catch (err) {
      if (err?.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", err.errors?.[0]?.message || "Google sign in failed");
      }
    }
  }, []);

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CookVerseLogo size="medium" />

          <Text style={[authStyles.title, { marginTop: 8, marginBottom: 8 }]}>Welcome Back</Text>
          <Text style={[authStyles.subtitle, { marginBottom: 28 }]}>
            Sign in with your email and password
          </Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
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

            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 8 }}
              onPress={() => router.push(ROUTES.forgotPassword)}
            >
              <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 14 }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                {
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  marginTop: 12,
                },
              ]}
              onPress={handleGoogleSignIn}
            >
              <Text style={[authStyles.buttonText, { color: COLORS.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push(ROUTES.signUp)}
            >
              <Text style={authStyles.linkText}>
                Don&apos;t have an account? <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;

import { useSignUp } from "@clerk/clerk-expo";
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
import CookVerseLogo from "../../components/CookVerseLogo";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { ROUTES } from "../../constants/routes";

const VerifyEmail = ({ email, onBack }) => {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace(ROUTES.createProfile);
      } else {
        Alert.alert("Error", "Verification incomplete. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

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
          <CookVerseLogo size="small" />

          <Text style={[authStyles.title, { marginTop: 8 }]}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>
            New account — enter the 6-digit code sent to {email}
          </Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter 6-digit code"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleVerification}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={onBack}>
              <Text style={authStyles.linkText}>
                <Text style={authStyles.link}>Back to Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;

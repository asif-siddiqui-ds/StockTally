import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeedbackType =
  | "Problem"
  | "Suggestion"
  | "Question"
  | "Billing"
  | "Data & Sync";

const SUPPORT_EMAIL = "info@dataexpert.co.site";

const feedbackOptions: FeedbackType[] = [
  "Problem",
  "Suggestion",
  "Question",
  "Billing",
  "Data & Sync",
];

const HelpFeedbackScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { companyProfile } = useCompanyProfile();

  const [feedbackType, setFeedbackType] =
    useState<FeedbackType>("Problem");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(
    user?.email || "",
  );
  const [includeDiagnostics, setIncludeDiagnostics] =
    useState(true);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const feedbackSectionY = useRef(0);

  const diagnostics = useMemo(() => {
    const appVersion =
      Application.nativeApplicationVersion ||
      Constants.expoConfig?.version ||
      "Unknown";

    const buildVersion =
      Application.nativeBuildVersion || "Unknown";

    const accountType =
      !user || user.$id === "guest"
        ? "Guest"
        : "Signed in";

    return [
      "StockTally Support Information",
      `App version: ${appVersion}`,
      `Build: ${buildVersion}`,
      `Platform: ${Platform.OS}`,
      `OS version: ${String(Platform.Version)}`,
      `Device: ${Constants.deviceName || "Unknown"}`,
      `Account: ${accountType}`,
      `User ID: ${
        user && user.$id !== "guest"
          ? user.$id
          : "Guest"
      }`,
      `Business: ${
        companyProfile?.companyName || "Not set"
      }`,
      `Submitted: ${new Date().toLocaleString("en-GB")}`,
    ].join("\n");
  }, [user, companyProfile]);

  const composeBody = () => {
    const customerDetails = [
      `Feedback type: ${feedbackType}`,
      `Reply email: ${
        contactEmail.trim() || "Not provided"
      }`,
      "",
      "Message:",
      message.trim(),
    ].join("\n");

    return includeDiagnostics
      ? `${customerDetails}\n\n---\n${diagnostics}`
      : customerDetails;
  };

  const validate = () => {
    if (!subject.trim()) {
      Alert.alert(
        "Subject Required",
        "Please add a short subject.",
      );
      return false;
    }

    if (message.trim().length < 10) {
      Alert.alert(
        "More Detail Needed",
        "Please describe the issue or suggestion in a little more detail.",
      );
      return false;
    }

    return true;
  };

  const openEmail = async () => {
    if (!validate() || sending) return;

    try {
      setSending(true);

      const emailSubject = encodeURIComponent(
        `[StockTally ${feedbackType}] ${subject.trim()}`,
      );
      const emailBody = encodeURIComponent(composeBody());
      const mailtoUrl =
        `mailto:${SUPPORT_EMAIL}` +
        `?subject=${emailSubject}` +
        `&body=${emailBody}`;

      const supported = await Linking.canOpenURL(
        mailtoUrl,
      );

      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        await Share.share({
          title: `StockTally ${feedbackType}`,
          message:
            `To: ${SUPPORT_EMAIL}\n\n` +
            composeBody(),
        });
      }
    } catch (error: any) {
      Alert.alert(
        "Unable to Open Email",
        error.message ||
          "Please copy the support information and send it manually.",
      );
    } finally {
      setSending(false);
    }
  };

  const shareSupportInformation = async () => {
    try {
      await Share.share({
        title: `StockTally ${feedbackType}`,
        message:
          `To: ${SUPPORT_EMAIL}\n\n` +
          composeBody(),
      });
    } catch (error: any) {
      Alert.alert(
        "Unable to Share",
        error.message ||
          "The support information could not be shared.",
      );
    }
  };

  const openFrequentlyAskedQuestion = (
    title: string,
    answer: string,
  ) => {
    Alert.alert(title, answer);
  };

  return (
    <ScreenWrapper
      backgroundColor="#eef3f8"
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
      <LinearGradient
        colors={["#eef3f8", "#dce8f2", "#eef3f8"]}
        style={styles.gradient}
      >
        <View
          style={[
            styles.container,
            { paddingTop: insets.top + 12 },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Help & Feedback
              </Text>
              <Text style={styles.subtitle}>
                Support, suggestions and problem reports
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={["#0f172a", "#1e3a5f", "#28547f"]}
            style={styles.heroCard}
          >
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>?</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>
                How can we help?
              </Text>
              <Text style={styles.heroText}>
                Send feedback directly from StockTally. You can include app and device information to help diagnose problems faster.
              </Text>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>
            Help Centre
          </Text>

          <View style={styles.helpCard}>
            <HelpRow
              icon="📘"
              title="Getting Started"
              subtitle="Stock, invoices, customers and suppliers"
              onPress={() =>
                openFrequentlyAskedQuestion(
                  "Getting Started",
                  "Start by completing Company Profile, then add your stock and suppliers. Use Stock Management for inventory activity, Invoices for billing, and Dashboard for business insights.",
                )
              }
            />

            <Divider />

            <HelpRow
              icon="☁️"
              title="Cloud Sync"
              subtitle="Login, backup and restore assistance"
              onPress={() =>
                openFrequentlyAskedQuestion(
                  "Cloud Sync",
                  "Confirm that you are signed in, have a working internet connection and are using the correct StockTally account. Open Cloud Sync and try again. If the problem continues, send a Data & Sync report below with diagnostics enabled.",
                )
              }
            />

            <Divider />

            <HelpRow
              icon="💳"
              title="Subscription & Pro"
              subtitle="Restore purchases and Pro access help"
              onPress={() =>
                openFrequentlyAskedQuestion(
                  "Subscription Support",
                  "Open Subscription and choose Restore Purchases. Confirm that the App Store or Google Play account matches the account used to buy Pro. Send a Billing report if access is still unavailable.",
                )
              }
            />

            <Divider />

            <HelpRow
              icon="🛡️"
              title="Data & Privacy"
              subtitle="What support information is included"
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://asif-siddiqui-ds.github.io/StockTally/privacy.html"
                )
              }
            />
          </View>

          <View
            onLayout={(event) => {
              feedbackSectionY.current =
                event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.sectionTitle}>
              Send feedback
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>
              What do you need help with?
            </Text>

            <View style={styles.typeWrap}>
              {feedbackOptions.map((option) => {
                const active =
                  feedbackType === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.typeButton,
                      active &&
                        styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setFeedbackType(option)
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        active &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>
              Subject
            </Text>

            <TextInput
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
              placeholder="Example: Cloud backup is not completing"
              placeholderTextColor="#94a3b8"
              maxLength={100}
            />

            <Text style={styles.label}>
              Describe the issue or suggestion
            </Text>

            <TextInput
              value={message}
              onChangeText={setMessage}
              style={[
                styles.input,
                styles.messageInput,
              ]}
              placeholder="Tell us what happened, what you expected and any steps that reproduce the problem."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />

            <View style={styles.characterRow}>
              <Text style={styles.helperText}>
                Please do not include passwords or full payment details.
              </Text>
              <Text style={styles.characterCount}>
                {message.length}/2000
              </Text>
            </View>

            <Text style={styles.label}>
              Reply email
            </Text>

            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              style={styles.input}
              placeholder="Your email address"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.diagnosticRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.diagnosticTitle}>
                  Include diagnostic information
                </Text>
                <Text style={styles.diagnosticText}>
                  App version, device model, account ID and business name. No stock or customer records are included.
                </Text>
              </View>

              <Switch
                value={includeDiagnostics}
                onValueChange={setIncludeDiagnostics}
                trackColor={{
                  false: "#cbd5e1",
                  true: "#93c5fd",
                }}
                thumbColor={
                  includeDiagnostics
                    ? "#1d4ed8"
                    : "#f8fafc"
                }
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.sendButton}
              onPress={openEmail}
              disabled={sending}
            >
              <Text style={styles.sendButtonIcon}>
                ✉
              </Text>
              <Text style={styles.sendButtonText}>
                {sending
                  ? "Opening Email…"
                  : "Send to StockTally Support"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.copyButton}
              onPress={shareSupportInformation}
            >
              <Text style={styles.copyButtonText}>
                Share support information
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            More
          </Text>

          <View style={styles.helpCard}>
            <HelpRow
              icon="⭐"
              title="Rate StockTally"
              subtitle="Support the app with a store review"
              onPress={() =>
                Alert.alert(
                  "Rate StockTally",
                  "The App Store and Google Play review links can be added here once the public store listings are live.",
                )
              }
            />

            <Divider />

            <HelpRow
              icon="💡"
              title="Request a Feature"
              subtitle="Suggest an improvement for StockTally"
              onPress={() => {
                setFeedbackType("Suggestion");
                setSubject("Feature request: ");

                requestAnimationFrame(() => {
                  scrollRef.current?.scrollTo({
                    y: Math.max(
                      feedbackSectionY.current - 12,
                      0,
                    ),
                    animated: true,
                  });
                });
              }}
            />

            <Divider />

            <HelpRow
              icon="📄"
              title="Privacy & Terms"
              subtitle="Review app policies"
              onPress={() =>
                Alert.alert(
                  "Privacy & Terms",
                  "Add your published Privacy Policy and Terms & Conditions links here before release.",
                )
              }
            />
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>
              Support email
            </Text>
            <Text style={styles.contactEmail}>
              {SUPPORT_EMAIL}
            </Text>
            <Text style={styles.contactText}>
              Your email app will open with the feedback and selected diagnostic information already added.
            </Text>
          </View>

          <Text style={styles.footer}>
            StockTally Support
          </Text>
        </View>
      </LinearGradient>
      </ScrollView>
    </ScreenWrapper>
  );
};

const HelpRow = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.helpRow}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View style={styles.helpRowIcon}>
      <Text style={styles.helpRowIconText}>
        {icon}
      </Text>
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.helpRowTitle}>
        {title}
      </Text>
      <Text style={styles.helpRowSubtitle}>
        {subtitle}
      </Text>
    </View>

    <Text style={styles.helpRowArrow}>›</Text>
  </TouchableOpacity>
);

const Divider = () => (
  <View style={styles.divider} />
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: "100%",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 130,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backIcon: {
    color: "#0f172a",
    fontSize: 32,
    marginTop: -3,
  },

  title: {
    color: "#0f172a",
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 3,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 6,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  heroIconText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
  },

  heroTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  heroText: {
    color: "#dbeafe",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 11,
  },

  helpCard: {
    backgroundColor: "#ffffff",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#dce4ec",
    overflow: "hidden",
  },

  helpRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  helpRowIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  helpRowIconText: {
    fontSize: 20,
  },

  helpRowTitle: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "900",
  },

  helpRowSubtitle: {
    color: "#64748b",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  helpRowArrow: {
    color: "#94a3b8",
    fontSize: 27,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#edf2f7",
    marginLeft: 69,
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#dce4ec",
    padding: 16,
  },

  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 14,
  },

  typeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  typeButtonActive: {
    backgroundColor: "#1d4ed8",
  },

  typeButtonText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },

  typeButtonTextActive: {
    color: "#ffffff",
  },

  input: {
    minHeight: 50,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe3eb",
    borderRadius: 13,
    paddingHorizontal: 13,
    color: "#0f172a",
    fontSize: 13,
  },

  messageInput: {
    minHeight: 145,
    paddingTop: 13,
    paddingBottom: 13,
  },

  characterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 7,
  },

  helperText: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 9,
    lineHeight: 13,
  },

  characterCount: {
    color: "#94a3b8",
    fontSize: 9,
  },

  diagnosticRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 13,
    marginTop: 16,
  },

  diagnosticTitle: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "900",
  },

  diagnosticText: {
    color: "#64748b",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
    paddingRight: 10,
  },

  sendButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 15,
    marginTop: 17,
  },

  sendButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    marginRight: 8,
  },

  sendButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  copyButton: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 13,
    marginTop: 10,
  },

  copyButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },

  contactCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 17,
    padding: 15,
    marginTop: 16,
  },

  contactTitle: {
    color: "#1e3a8a",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  contactEmail: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },

  contactText: {
    color: "#475569",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },

  footer: {
    color: "#94a3b8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
  },
});

export default HelpFeedbackScreen;
// app/screens/quotes/view.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { getCachedUserId } from "@/context/AuthContext";
import { buildQuoteA4Html } from "@/lib/quotePdf";
import {
  deleteQuote,
  getQuoteById,
  updateQuoteStatus,
} from "@/lib/quoteStorage";
import {
  CompanyProfile,
  getCompanyProfile,
} from "@/lib/storage";
import type {
  Quote,
  QuoteStatus,
} from "@/types/quote";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as Sharing from "expo-sharing";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  converted: "Converted",
  cancelled: "Cancelled",
};

const getImageMimeType = (uri: string): string => {
  const cleanUri = uri.split("?")[0].toLowerCase();

  if (cleanUri.endsWith(".png")) return "image/png";
  if (cleanUri.endsWith(".webp")) return "image/webp";
  if (cleanUri.endsWith(".gif")) return "image/gif";

  return "image/jpeg";
};

const resolveQuoteLogoSource = async (
  profile: CompanyProfile | null
): Promise<string> => {
  const source = profile?.logoLocal?.trim();

  if (!source) return "";

  if (
    source.startsWith("data:image/") ||
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  try {
    const base64 =
      await FileSystem.readAsStringAsync(source, {
        encoding: FileSystem.EncodingType.Base64,
      });

    return `data:${getImageMimeType(
      source
    )};base64,${base64}`;
  } catch (error) {
    console.warn(
      "⚠️ Unable to prepare quote logo:",
      error
    );
    return "";
  }
};

const QuoteViewScreen = () => {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const quoteId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [quote, setQuote] =
    useState<Quote | null>(null);
  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile | null>(null);
  const [logoSource, setLogoSource] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState(false);

  const loadQuote = useCallback(async () => {
    if (!quoteId) {
      setQuote(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userId =
        (await getCachedUserId()) || "guest";

      const [record, profile] =
        await Promise.all([
          getQuoteById(quoteId),
          getCompanyProfile(userId),
        ]);

      setQuote(record);
      setCompanyProfile(profile);

      const resolvedLogo =
        await resolveQuoteLogoSource(profile);
      setLogoSource(resolvedLogo);
    } catch (error) {
      console.error(
        "Failed to load quote:",
        error
      );

      Alert.alert(
        "Unable to load quote",
        "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useFocusEffect(
    useCallback(() => {
      void loadQuote();
    }, [loadQuote])
  );

  const html = useMemo(() => {
    if (!quote) return "";

    return buildQuoteA4Html({
      quote,
      companyProfile,
      logoSource,
    });
  }, [
    companyProfile,
    logoSource,
    quote,
  ]);

  const canConvert = useMemo(
    () =>
      !!quote &&
      quote.status === "accepted" &&
      !quote.convertedInvoiceId,
    [quote]
  );

  const createPdf = async (): Promise<string> => {
    if (!quote) {
      throw new Error(
        "Quote is not available."
      );
    }

    const result =
      await Print.printToFileAsync({
        html,
        base64: false,
      });

    return result.uri;
  };

  const handlePrint = async () => {
    try {
      setProcessing(true);
      await Print.printAsync({ html });
    } catch (error) {
      console.error(
        "❌ Quote print failed:",
        error
      );

      Alert.alert(
        "Unable to print",
        "The quotation could not be sent to the printer."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!quote) return;

    try {
      setProcessing(true);

      const available =
        await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          "Sharing unavailable",
          "Sharing is not available on this device."
        );
        return;
      }

      const uri = await createPdf();

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${quote.quoteNumber}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error(
        "❌ Quote sharing failed:",
        error
      );

      Alert.alert(
        "Unable to share",
        "The quotation PDF could not be created or shared."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSavePdf = async () => {
    if (!quote) return;

    try {
      setProcessing(true);

      const uri = await createPdf();

      if (Platform.OS === "web") {
        Alert.alert(
          "PDF created",
          "The quotation PDF has been generated."
        );
        return;
      }

      const available =
        await Sharing.isAvailableAsync();

      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Save ${quote.quoteNumber}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "PDF created",
          `Saved temporarily at:\n${uri}`
        );
      }
    } catch (error) {
      console.error(
        "❌ Quote PDF generation failed:",
        error
      );

      Alert.alert(
        "Unable to create PDF",
        "Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const changeStatus = async (
    status: QuoteStatus
  ) => {
    if (!quote || processing) return;

    try {
      setProcessing(true);

      const updated =
        await updateQuoteStatus(
          quote.id,
          status
        );

      setQuote(updated);
    } catch (error) {
      console.error(
        "Failed to update quote status:",
        error
      );

      Alert.alert(
        "Update failed",
        "The quote status could not be changed."
      );
    } finally {
      setProcessing(false);
    }
  };

  const showStatusMenu = () => {
    if (!quote || processing) return;

    const options: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }> = [];

    if (quote.status !== "sent") {
      options.push({
        text: "Mark as sent",
        onPress: () =>
          void changeStatus("sent"),
      });
    }

    if (quote.status !== "accepted") {
      options.push({
        text: "Mark as accepted",
        onPress: () =>
          void changeStatus("accepted"),
      });
    }

    if (quote.status !== "rejected") {
      options.push({
        text: "Mark as rejected",
        onPress: () =>
          void changeStatus("rejected"),
      });
    }

    if (
      quote.status !== "cancelled" &&
      quote.status !== "converted"
    ) {
      options.push({
        text: "Cancel quote",
        style: "destructive",
        onPress: () =>
          void changeStatus("cancelled"),
      });
    }

    options.push({
      text: "Close",
      style: "cancel",
    });

    Alert.alert(
      "Update quote status",
      `Current status: ${
        STATUS_LABELS[quote.status]
      }`,
      options
    );
  };

  const handleDelete = () => {
    if (!quote || processing) return;

    Alert.alert(
      "Delete quote?",
      `${quote.quoteNumber} will be permanently removed.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);
              await deleteQuote(quote.id);

              router.replace(
                "/screens/quotes/quoteList"
              );
            } catch (error) {
              console.error(
                "Failed to delete quote:",
                error
              );

              Alert.alert(
                "Delete failed",
                "The quote could not be deleted."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleConvertToInvoice = () => {
    if (!quote || !canConvert) return;

    Alert.alert(
      "Convert to invoice?",
      "The invoice screen will open with this quote's customer, items, tax, discounts, notes and terms.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            router.push({
              pathname:
                "/screens/invoices/create",
              params: {
                quoteId: quote.id,
              },
            });
          },
        },
      ]
    );
  };

  const handleOpenInvoice = () => {
    if (!quote?.convertedInvoiceId) return;

    router.push({
      pathname: "/screens/invoices/view",
      params: {
        id: quote.convertedInvoiceId,
      },
    });
  };

  const handleEdit = () => {
    if (!quote) return;

    router.push({
      pathname: "/screens/quotes/edit",
      params: {
        id: quote.id,
      },
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={[
            "#0d1b2a",
            "#1b263b",
            "#415a77",
          ]}
          style={styles.gradient}
        >
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="large"
              color="#bfdbfe"
            />
            <Text style={styles.loadingText}>
              Preparing A4 quotation...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  if (!quote) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={[
            "#0d1b2a",
            "#1b263b",
            "#415a77",
          ]}
          style={styles.gradient}
        >
          <View
            style={styles.loadingContainer}
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color="#fca5a5"
            />

            <Text
              style={styles.notFoundTitle}
            >
              Quote not found
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.replace(
                  "/screens/quotes/quoteList"
                )
              }
              style={styles.primaryButton}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Back to quotes
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false }}
      />

      <ScreenWrapper>
        <LinearGradient
          colors={[
            "#0d1b2a",
            "#1b263b",
            "#415a77",
          ]}
          style={styles.gradient}
        >
          <View
            style={[
              styles.container,
              {
                paddingTop: Math.max(
                  insets.top + 6,
                  14
                ),
                paddingBottom: Math.max(
                  insets.bottom + 8,
                  12
                ),
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerIconButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#e2e8f0"
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerTextBlock
                }
              >
                <Text style={styles.title}>
                  {quote.quoteNumber}
                </Text>
                <Text style={styles.subtitle}>
                  Professional A4 quotation
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleEdit}
                disabled={processing}
                style={
                  styles.headerIconButton
                }
              >
                <Ionicons
                  name="create-outline"
                  size={21}
                  color="#e2e8f0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              <WebView
                originWhitelist={["*"]}
                source={{ html }}
                style={styles.webView}
                scalesPageToFit
                showsVerticalScrollIndicator
                showsHorizontalScrollIndicator
              />
            </View>

            <View style={styles.statusPanel}>
              <View>
                <Text
                  style={
                    styles.statusPanelLabel
                  }
                >
                  Quote status
                </Text>
                <Text
                  style={
                    styles.statusPanelValue
                  }
                >
                  {
                    STATUS_LABELS[
                      quote.status
                    ]
                  }
                </Text>
              </View>

              <TouchableOpacity
                disabled={processing}
                onPress={showStatusMenu}
                style={
                  styles.changeStatusButton
                }
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color="#0f172a"
                />
                <Text
                  style={
                    styles.changeStatusText
                  }
                >
                  Change status
                </Text>
              </TouchableOpacity>
            </View>

            {quote.convertedInvoiceId ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleOpenInvoice}
                style={styles.linkedInvoiceCard}
              >
                <View
                  style={
                    styles.linkedInvoiceIcon
                  }
                >
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color="#86efac"
                  />
                </View>

                <View
                  style={
                    styles.linkedInvoiceText
                  }
                >
                  <Text
                    style={
                      styles.linkedInvoiceTitle
                    }
                  >
                    Converted to invoice
                  </Text>
                  <Text
                    style={
                      styles.linkedInvoiceSubtitle
                    }
                  >
                    Tap to open the linked
                    invoice
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#86efac"
                />
              </TouchableOpacity>
            ) : null}

            <View style={styles.actionDock}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.actionBar
                }
                style={styles.actionScroll}
              >
                <TouchableOpacity
                  disabled={processing}
                  onPress={handleSavePdf}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="download-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Save PDF
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={processing}
                  onPress={handlePrint}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="print-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Print
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={processing}
                  onPress={handleShare}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={19}
                    color="#dbeafe"
                  />
                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Share
                  </Text>
                </TouchableOpacity>

                {canConvert ? (
                  <TouchableOpacity
                    disabled={processing}
                    onPress={
                      handleConvertToInvoice
                    }
                    style={[
                      styles.actionButton,
                      styles.convertButton,
                    ]}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={19}
                      color="#0f172a"
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.convertButtonText,
                      ]}
                    >
                      Convert
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  disabled={processing}
                  onPress={handleDelete}
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color="#fca5a5"
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      styles.deleteButtonText,
                    ]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {processing ? (
              <View
                style={
                  styles.processingOverlay
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#0f172a"
                />
                <Text
                  style={
                    styles.processingText
                  }
                >
                  Processing...
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </ScreenWrapper>
    </>
  );
};

export default QuoteViewScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  notFoundTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(15,23,42,0.5)",
    borderWidth: 1,
    borderColor:
      "rgba(148,163,184,0.18)",
  },
  headerTextBlock: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 2,
  },
  previewCard: {
    flex: 1,
    minHeight: 220,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#d9e0e8",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.18)",
  },
  webView: {
    flex: 1,
    backgroundColor: "#d9e0e8",
  },
  statusPanel: {
    minHeight: 62,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor:
      "rgba(191,219,254,0.14)",
  },
  statusPanelLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusPanelValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  changeStatusButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#dbeafe",
  },
  changeStatusText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "800",
  },
  linkedInvoiceCard: {
    minHeight: 62,
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(34,197,94,0.13)",
    borderWidth: 1,
    borderColor:
      "rgba(134,239,172,0.22)",
  },
  linkedInvoiceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(34,197,94,0.14)",
  },
  linkedInvoiceText: {
    flex: 1,
    marginLeft: 10,
  },
  linkedInvoiceTitle: {
    color: "#86efac",
    fontSize: 13,
    fontWeight: "800",
  },
  linkedInvoiceSubtitle: {
    color: "#bbf7d0",
    fontSize: 10,
    marginTop: 3,
  },
  actionDock: {
    height: 66,
    marginTop: 10,
    borderRadius: 16,
    backgroundColor:
      "rgba(15,23,42,0.42)",
    borderWidth: 1,
    borderColor:
      "rgba(191,219,254,0.14)",
    overflow: "hidden",
  },
  actionScroll: {
    flexGrow: 0,
  },
  actionBar: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionButton: {
    height: 48,
    minWidth: 108,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor:
      "rgba(15,23,42,0.72)",
    borderWidth: 1,
    borderColor:
      "rgba(191,219,254,0.18)",
  },
  actionButtonText: {
    color: "#dbeafe",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  convertButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  convertButtonText: {
    color: "#0f172a",
  },
  deleteButton: {
    backgroundColor:
      "rgba(239,68,68,0.12)",
    borderColor:
      "rgba(248,113,113,0.2)",
  },
  deleteButtonText: {
    color: "#fca5a5",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
  },
  processingOverlay: {
    position: "absolute",
    right: 18,
    top: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#dbeafe",
  },
  processingText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
});
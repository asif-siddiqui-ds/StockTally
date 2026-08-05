// app/screens/quotes/quoteList.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import {
  deleteQuote,
  getQuotes,
  updateQuoteStatus,
} from "@/lib/quoteStorage";
import {
  getQuoteCustomerLabel,
  isQuoteExpired,
  type Quote,
  type QuoteStatus,
} from "@/types/quote";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterValue = "all" | QuoteStatus;

const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; text: string; background: string }
> = {
  draft: { label: "Draft", text: "#cbd5e1", background: "rgba(148,163,184,0.18)" },
  sent: { label: "Sent", text: "#93c5fd", background: "rgba(59,130,246,0.18)" },
  accepted: { label: "Accepted", text: "#86efac", background: "rgba(34,197,94,0.18)" },
  rejected: { label: "Rejected", text: "#fca5a5", background: "rgba(239,68,68,0.18)" },
  expired: { label: "Expired", text: "#fcd34d", background: "rgba(245,158,11,0.18)" },
  converted: { label: "Converted", text: "#d8b4fe", background: "rgba(168,85,247,0.18)" },
  cancelled: { label: "Cancelled", text: "#cbd5e1", background: "rgba(100,116,139,0.18)" },
};

const FILTERS: Array<{ label: string; value: FilterValue }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Converted", value: "converted" },
  { label: "Expired", value: "expired" },
];

const formatDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const QuoteListScreen = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadQuotes = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const records = await getQuotes();

      const updated = await Promise.all(
        records.map(async (quote) => {
          if (isQuoteExpired(quote) && quote.status !== "expired") {
            return updateQuoteStatus(quote.id, "expired");
          }
          return quote;
        })
      );

      setQuotes(updated);
    } catch (error) {
      console.error("❌ Failed to load quotes:", error);
      Alert.alert("Unable to load quotes", "Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuotes();
    }, [loadQuotes])
  );

  const currencySource = quotes[0];

  const formatMoney = useCallback(
    (amount: number): string => {
      try {
        return new Intl.NumberFormat(currencySource?.locale || "en-GB", {
          style: "currency",
          currency: currencySource?.currencyCode || "GBP",
        }).format(Number(amount || 0));
      } catch {
        return `${currencySource?.currencySymbol || "£"}${Number(amount || 0).toFixed(2)}`;
      }
    },
    [currencySource]
  );

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      if (filter !== "all" && quote.status !== filter) return false;
      if (!term) return true;

      return [
        quote.quoteNumber,
        quote.reference,
        quote.customerName,
        quote.customerCompany,
        quote.customerEmail,
        quote.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [quotes, filter, search]);

  const openQuote = (quote: Quote) => {
    router.push({ pathname: "/screens/quotes/view", params: { id: quote.id } });
  };

  const editQuote = (quote: Quote) => {
    router.push({ pathname: "/screens/quotes/edit", params: { id: quote.id } });
  };

  const confirmDelete = (quote: Quote) => {
    Alert.alert("Delete quote?", `${quote.quoteNumber} will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(quote.id);
            await deleteQuote(quote.id);
            await loadQuotes(false);
          } catch (error) {
            console.error("❌ Failed to delete quote:", error);
            Alert.alert("Delete failed", "The quote could not be deleted.");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const renderQuote = ({ item }: { item: Quote }) => {
    const status = STATUS_CONFIG[item.status];
    const isProcessing = processingId === item.id;

    return (
      <TouchableOpacity activeOpacity={0.92} onPress={() => openQuote(item)} style={styles.quoteCard}>
        <View style={styles.cardHeader}>
          <View style={styles.identityRow}>
            <View style={styles.documentIcon}>
              <Ionicons name="document-text-outline" size={20} color="#bfdbfe" />
            </View>
            <View style={styles.identityText}>
              <Text style={styles.quoteNumber}>{item.quoteNumber}</Text>
              <Text style={styles.customerName} numberOfLines={1}>
                {getQuoteCustomerLabel(item)}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: status.background }]}> 
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Quote date</Text>
            <Text style={styles.detailValue}>{formatDate(item.quoteDate)}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>{formatDate(item.expiryDate)}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.amountValue}>{formatMoney(item.grandTotal)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(event) => {
              event.stopPropagation();
              editQuote(item);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={16} color="#dbeafe" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={(event) => {
              event.stopPropagation();
              confirmDelete(item);
            }}
            style={styles.actionButton}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fca5a5" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#fca5a5" />
            )}
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(event) => {
              event.stopPropagation();
              openQuote(item);
            }}
            style={styles.chevronButton}
          >
            <Ionicons name="chevron-forward" size={19} color="#bfdbfe" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bfdbfe" />
            <Text style={styles.loadingText}>Loading quotes...</Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient colors={["#0d1b2a", "#1b263b", "#415a77"]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <FlatList
            data={filteredQuotes}
            keyExtractor={(item) => item.id}
            renderItem={renderQuote}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadQuotes(false);
                }}
                tintColor="#bfdbfe"
              />
            }
            ListHeaderComponent={
              <>
                <View style={styles.header}>
                  <View style={styles.headerTextBlock}>
                    <Text style={styles.title}>Quotes</Text>
                    <Text style={styles.subtitle}>Create, send and convert customer quotations.</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/screens/quotes/create")} style={styles.createButton}>
                    <Ionicons name="add" size={21} color="#0f172a" />
                    <Text style={styles.createButtonText}>New</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <Ionicons name="search-outline" size={18} color="#94a3b8" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search quotes or customers"
                    placeholderTextColor="#64748b"
                    style={styles.searchInput}
                  />
                </View>

                <FlatList
                  horizontal
                  data={FILTERS}
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterContent}
                  style={styles.filterList}
                  renderItem={({ item }) => {
                    const selected = filter === item.value;
                    return (
                      <TouchableOpacity
                        onPress={() => setFilter(item.value)}
                        style={[styles.filterChip, selected && styles.filterChipSelected]}
                      >
                        <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={43} color="#93c5fd" />
                <Text style={styles.emptyTitle}>No quotes found</Text>
                <Text style={styles.emptyText}>Create your first quote or change the current search and filter.</Text>
                <TouchableOpacity onPress={() => router.push("/screens/quotes/create")} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Create Quote</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default QuoteListScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 44 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#cbd5e1", fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 15 },
  headerTextBlock: { flex: 1 },
  title: { color: "#f8fafc", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "#cbd5e1", fontSize: 13, marginTop: 3 },
  createButton: { minHeight: 42, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, backgroundColor: "#dbeafe" },
  createButtonText: { color: "#0f172a", fontSize: 13, fontWeight: "900" },
  searchContainer: { minHeight: 48, borderRadius: 14, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "rgba(15,23,42,0.57)", borderWidth: 1, borderColor: "rgba(191,219,254,0.15)" },
  searchInput: { flex: 1, color: "#f8fafc", fontSize: 13 },
  filterList: { marginHorizontal: -16, marginTop: 12, marginBottom: 14 },
  filterContent: { paddingHorizontal: 16, paddingRight: 24, gap: 8 },
  filterChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "rgba(15,23,42,0.48)", borderWidth: 1, borderColor: "rgba(148,163,184,0.18)" },
  filterChipSelected: { backgroundColor: "#dbeafe", borderColor: "#dbeafe" },
  filterText: { color: "#cbd5e1", fontSize: 11, fontWeight: "800" },
  filterTextSelected: { color: "#0f172a" },
  quoteCard: { borderRadius: 18, padding: 15, marginBottom: 11, backgroundColor: "rgba(15,23,42,0.57)", borderWidth: 1, borderColor: "rgba(191,219,254,0.13)" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  identityRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  documentIcon: { width: 41, height: 41, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(59,130,246,0.16)" },
  identityText: { flex: 1 },
  quoteNumber: { color: "#f8fafc", fontSize: 15, fontWeight: "900" },
  customerName: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: "900" },
  divider: { height: 1, backgroundColor: "rgba(148,163,184,0.13)", marginVertical: 13 },
  detailsRow: { flexDirection: "row" },
  detailBlock: { flex: 1 },
  detailLabel: { color: "#64748b", fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  detailValue: { color: "#cbd5e1", fontSize: 11, fontWeight: "700", marginTop: 5 },
  amountValue: { color: "#f8fafc", fontSize: 13, fontWeight: "900", marginTop: 5 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 15 },
  actionButton: { minHeight: 36, borderRadius: 11, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(30,41,59,0.8)" },
  actionText: { color: "#dbeafe", fontSize: 10, fontWeight: "800" },
  deleteText: { color: "#fca5a5" },
  chevronButton: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(59,130,246,0.15)", marginLeft: "auto" },
  emptyState: { alignItems: "center", paddingTop: 65, paddingHorizontal: 24 },
  emptyTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginTop: 13 },
  emptyText: { color: "#94a3b8", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 6 },
  emptyButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#dbeafe", marginTop: 16 },
  emptyButtonText: { color: "#0f172a", fontSize: 12, fontWeight: "900" },
});

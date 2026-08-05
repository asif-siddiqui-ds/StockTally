// app/screens/invoices/invoiceHome.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  featured?: boolean;
};

const MAIN_ACTIONS: MenuItem[] = [
  {
    title: "Invoice Dashboard",
    subtitle:
      "View invoiced totals, payments, outstanding balances and trends.",
    icon: "analytics-outline",
    route: "/screens/invoices/dashboard",
    featured: true,
  },
  {
    title: "Create Invoice",
    subtitle:
      "Create a new invoice using saved customers, stock items or custom items.",
    icon: "add-circle-outline",
    route: "/screens/invoices/create",
  },
  {
    title: "Invoices",
    subtitle:
      "View, search, edit and manage all customer invoices.",
    icon: "receipt-outline",
    route: "/screens/invoices/invoiceList",
  },
  {
    title: "Record Payment",
    subtitle:
      "Choose an unpaid invoice and record a full or partial payment.",
    icon: "cash-outline",
    route: "/screens/invoices/invoiceList",
  },
  {
    title: "Customers",
    subtitle:
      "Manage customer profiles, contact details and invoice history.",
    icon: "people-outline",
    route: "/screens/customers/customerList",
  },
  {
    title: "Quotes",
    subtitle:
      "Create quotations and convert accepted quotes into invoices.",
    icon: "document-text-outline",
    route: "/screens/quotes/quoteList",
  },
  {
    title: "Recurring Invoices",
    subtitle:
      "Manage invoices that repeat weekly, monthly or annually.",
    icon: "repeat-outline",
    route: "/screens/invoices/recurring/recurringList",
  },
];


const InvoiceHomeScreen = () => {
  const openRoute = (route: string) => {
    router.push(route as never);
  };

  const renderMenuCard = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      activeOpacity={0.9}
      onPress={() => openRoute(item.route)}
      style={[
        styles.menuCard,
        item.featured && styles.featuredCard,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          item.featured && styles.featuredIconWrapper,
        ]}
      >
        <Ionicons
          name={item.icon}
          size={25}
          color={item.featured ? "#0f172a" : "#bfdbfe"}
        />
      </View>

      <View style={styles.cardTextBlock}>
        <Text
          style={[
            styles.cardTitle,
            item.featured && styles.featuredCardTitle,
          ]}
        >
          {item.title}
        </Text>

        <Text
          style={[
            styles.cardSubtitle,
            item.featured && styles.featuredCardSubtitle,
          ]}
        >
          {item.subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={21}
        color={item.featured ? "#0f172a" : "#94a3b8"}
      />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color="#bfdbfe"
                />
              </View>

              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>Invoice Centre</Text>
                <Text style={styles.subtitle}>
                  Manage invoices, customers, payments and invoice analytics.
                </Text>
              </View>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openRoute("/screens/invoices/create")}
                style={styles.quickActionPrimary}
              >
                <Ionicons name="add" size={22} color="#0f172a" />
                <Text style={styles.quickActionPrimaryText}>
                  New Invoice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openRoute("/screens/invoices/invoiceList")}
                style={styles.quickActionSecondary}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color="#dbeafe"
                />
                <Text style={styles.quickActionSecondaryText}>
                  View Invoices
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Invoice Management</Text>

            <View style={styles.menuList}>
              {MAIN_ACTIONS.map(renderMenuCard)}
            </View>

            {/* <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Invoice Tools</Text>

              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>
                  In development
                </Text>
              </View>
            </View> */}

            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#93c5fd"
              />

              <Text style={styles.infoText}>
                To record a payment, open the invoice list and select an
                invoice with an outstanding balance. Then tap Record payment.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default InvoiceHomeScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 20,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.17)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.15)",
  },
  headerTextBlock: { flex: 1 },
  title: {
    color: "#f8fafc",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  quickActionPrimary: {
    flex: 1,
    minHeight: 49,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  quickActionPrimaryText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
  },
  quickActionSecondary: {
    flex: 1,
    minHeight: 49,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(15,23,42,0.52)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.25)",
  },
  quickActionSecondaryText: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 22,
    marginBottom: 11,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 11,
  },
  comingSoonBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "rgba(245,158,11,0.16)",
    marginBottom: 11,
  },
  comingSoonText: {
    color: "#fcd34d",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  menuList: { gap: 10 },
  menuCard: {
    minHeight: 94,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(15,23,42,0.56)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },
  featuredCard: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  featuredIconWrapper: {
    backgroundColor: "rgba(15,23,42,0.09)",
  },
  cardTextBlock: { flex: 1 },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  featuredCardTitle: { color: "#0f172a" },
  cardSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  featuredCardSubtitle: { color: "#334155" },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 15,
    padding: 14,
    marginTop: 18,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.14)",
  },
  infoText: {
    flex: 1,
    color: "#bfdbfe",
    fontSize: 11,
    lineHeight: 17,
  },
});

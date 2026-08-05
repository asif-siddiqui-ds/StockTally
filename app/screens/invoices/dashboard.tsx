// app/screens/invoices/dashboard.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { getInvoices } from "@/lib/invoiceStorage";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DateFilter =
  | "today"
  | "week"
  | "month"
  | "lastMonth"
  | "year"
  | "all";

type StatusConfig = {
  label: string;
  colour: string;
  background: string;
};

const DATE_FILTERS: Array<{
  label: string;
  value: DateFilter;
}> = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

const STATUS_CONFIG: Record<InvoiceStatus, StatusConfig> = {
  draft: {
    label: "Draft",
    colour: "#cbd5e1",
    background: "rgba(148,163,184,0.18)",
  },
  sent: {
    label: "Sent",
    colour: "#93c5fd",
    background: "rgba(59,130,246,0.18)",
  },
  unpaid: {
    label: "Unpaid",
    colour: "#fcd34d",
    background: "rgba(245,158,11,0.18)",
  },
  partially_paid: {
    label: "Part Paid",
    colour: "#d8b4fe",
    background: "rgba(168,85,247,0.18)",
  },
  paid: {
    label: "Paid",
    colour: "#86efac",
    background: "rgba(34,197,94,0.18)",
  },
  overdue: {
    label: "Overdue",
    colour: "#fca5a5",
    background: "rgba(239,68,68,0.18)",
  },
  cancelled: {
    label: "Cancelled",
    colour: "#cbd5e1",
    background: "rgba(100,116,139,0.18)",
  },
};

const startOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const getDateRange = (
  filter: DateFilter
): { start?: Date; end?: Date } => {
  const now = new Date();

  switch (filter) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    case "week": {
      const day = now.getDay();
      const daysFromMonday = day === 0 ? 6 : day - 1;
      const start = new Date(now);
      start.setDate(now.getDate() - daysFromMonday);

      return {
        start: startOfDay(start),
        end: endOfDay(now),
      };
    }

    case "month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(now),
      };

    case "lastMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        ),
      };

    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: endOfDay(now),
      };

    case "all":
    default:
      return {};
  }
};

const isWithinRange = (
  value: string | undefined,
  range: { start?: Date; end?: Date }
): boolean => {
  if (!range.start && !range.end) return true;
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;

  return true;
};

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

const getCustomerName = (invoice: Invoice): string =>
  invoice.customerCompany?.trim() ||
  invoice.customerName?.trim() ||
  "Unnamed customer";

const InvoiceDashboardScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dateFilter, setDateFilter] =
    useState<DateFilter>("month");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);

        const records = await getInvoices();
        setInvoices(records);
      } catch (error) {
        console.error(
          "❌ Failed to load invoice dashboard:",
          error
        );

        Alert.alert(
          "Unable to load dashboard",
          "Please try again in a moment."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInvoices(false);
  }, [loadInvoices]);

  const selectedRange = useMemo(
    () => getDateRange(dateFilter),
    [dateFilter]
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        isWithinRange(invoice.invoiceDate, selectedRange)
      ),
    [invoices, selectedRange]
  );

  const activeInvoices = useMemo(
    () =>
      filteredInvoices.filter(
        (invoice) => invoice.status !== "cancelled"
      ),
    [filteredInvoices]
  );

  const currencySource =
    activeInvoices[0] || filteredInvoices[0] || invoices[0];

  const formatMoney = useCallback(
    (amount: number): string => {
      try {
        return new Intl.NumberFormat(
          currencySource?.locale || "en-GB",
          {
            style: "currency",
            currency:
              currencySource?.currencyCode || "GBP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ).format(Number(amount || 0));
      } catch {
        return `${
          currencySource?.currencySymbol || "£"
        }${Number(amount || 0).toFixed(2)}`;
      }
    },
    [currencySource]
  );

  const summary = useMemo(() => {
    return activeInvoices.reduce(
      (result, invoice) => {
        const total = Number(invoice.grandTotal || 0);
        const paid = Number(invoice.amountPaid || 0);
        const balance = Number(invoice.balanceDue || 0);

        result.totalInvoiced += total;
        result.totalReceived += paid;
        result.totalOutstanding += balance;

        if (
          invoice.status === "overdue" &&
          balance > 0
        ) {
          result.totalOverdue += balance;
        }

        if (
          invoice.status === "paid" ||
          balance <= 0
        ) {
          result.paidCount += 1;
        }

        if (balance > 0) {
          result.openCount += 1;
        }

        return result;
      },
      {
        totalInvoiced: 0,
        totalReceived: 0,
        totalOutstanding: 0,
        totalOverdue: 0,
        paidCount: 0,
        openCount: 0,
      }
    );
  }, [activeInvoices]);

  const statusCounts = useMemo(() => {
    const counts: Record<InvoiceStatus, number> = {
      draft: 0,
      sent: 0,
      unpaid: 0,
      partially_paid: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    };

    filteredInvoices.forEach((invoice) => {
      counts[invoice.status] += 1;
    });

    return counts;
  }, [filteredInvoices]);

  const averageInvoiceValue =
    activeInvoices.length > 0
      ? summary.totalInvoiced / activeInvoices.length
      : 0;

  const collectionRate =
    summary.totalInvoiced > 0
      ? Math.min(
          100,
          (summary.totalReceived /
            summary.totalInvoiced) *
            100
        )
      : 0;

  const customersOutstanding = useMemo(() => {
    const uniqueCustomers = new Set<string>();

    activeInvoices.forEach((invoice) => {
      if (Number(invoice.balanceDue || 0) <= 0) return;

      uniqueCustomers.add(
        invoice.customerId ||
          getCustomerName(invoice).toLowerCase()
      );
    });

    return uniqueCustomers.size;
  }, [activeInvoices]);

  const topCustomers = useMemo(() => {
    const grouped = new Map<
      string,
      {
        name: string;
        total: number;
        outstanding: number;
        invoiceCount: number;
      }
    >();

    activeInvoices.forEach((invoice) => {
      const name = getCustomerName(invoice);
      const key =
        invoice.customerId || name.trim().toLowerCase();

      const current = grouped.get(key) || {
        name,
        total: 0,
        outstanding: 0,
        invoiceCount: 0,
      };

      current.total += Number(invoice.grandTotal || 0);
      current.outstanding += Number(
        invoice.balanceDue || 0
      );
      current.invoiceCount += 1;

      grouped.set(key, current);
    });

    return [...grouped.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [activeInvoices]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: Array<{
      key: string;
      label: string;
      invoiced: number;
      received: number;
    }> = [];

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("en-GB", {
        month: "short",
      });

      months.push({
        key,
        label,
        invoiced: 0,
        received: 0,
      });
    }

    invoices.forEach((invoice) => {
      if (invoice.status === "cancelled") return;

      const invoiceDate = new Date(invoice.invoiceDate);

      if (!Number.isNaN(invoiceDate.getTime())) {
        const invoiceKey = `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}`;
        const month = months.find(
          (entry) => entry.key === invoiceKey
        );

        if (month) {
          month.invoiced += Number(
            invoice.grandTotal || 0
          );
        }
      }

      const payments = invoice.payments || [];

      if (payments.length > 0) {
        payments.forEach((payment) => {
          const paymentDate = new Date(
            payment.paymentDate || payment.createdAt
          );

          if (Number.isNaN(paymentDate.getTime())) return;

          const paymentKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
          const month = months.find(
            (entry) => entry.key === paymentKey
          );

          if (month) {
            month.received += Number(payment.amount || 0);
          }
        });
      } else if (
        Number(invoice.amountPaid || 0) > 0
      ) {
        const fallbackDate = new Date(
          invoice.paymentDate ||
            invoice.paidAt ||
            invoice.updatedAt
        );

        if (!Number.isNaN(fallbackDate.getTime())) {
          const paymentKey = `${fallbackDate.getFullYear()}-${fallbackDate.getMonth()}`;
          const month = months.find(
            (entry) => entry.key === paymentKey
          );

          if (month) {
            month.received += Number(
              invoice.amountPaid || 0
            );
          }
        }
      }
    });

    return months;
  }, [invoices]);

  const maxMonthlyValue = useMemo(() => {
    return Math.max(
      1,
      ...monthlyTrend.map((month) =>
        Math.max(month.invoiced, month.received)
      )
    );
  }, [monthlyTrend]);

  const recentInvoices = useMemo(
    () =>
      [...filteredInvoices]
        .sort(
          (a, b) =>
            new Date(
              b.updatedAt || b.createdAt
            ).getTime() -
            new Date(
              a.updatedAt || a.createdAt
            ).getTime()
        )
        .slice(0, 5),
    [filteredInvoices]
  );

  const openInvoice = (invoice: Invoice) => {
    router.push({
      pathname: "/screens/invoices/view",
      params: { id: invoice.id },
    });
  };

  const openInvoiceList = () => {
    router.push("/screens/invoices/invoiceList");
  };

  const createInvoice = () => {
    router.push("/screens/invoices/create");
  };

  const renderMetricCard = ({
    label,
    value,
    icon,
    hint,
    danger = false,
  }: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    hint?: string;
    danger?: boolean;
  }) => (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          danger && styles.metricIconDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={danger ? "#fecaca" : "#bfdbfe"}
        />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          danger && styles.metricValueDanger,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      {hint ? (
        <Text style={styles.metricHint}>{hint}</Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0d1b2a", "#1b263b", "#415a77"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#bfdbfe"
            />
            <Text style={styles.loadingText}>
              Loading invoice dashboard...
            </Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <LinearGradient
        colors={["#0d1b2a", "#1b263b", "#415a77"]}
        style={styles.gradient}
      >
        <SafeAreaView
          style={styles.safeArea}
          edges={["top", "bottom"]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#bfdbfe"
              />
            }
          >
            <View style={styles.header}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.title}>
                  Invoice Dashboard
                </Text>
                <Text style={styles.subtitle}>
                  Track invoices, payments and outstanding
                  balances
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={createInvoice}
                style={styles.createButton}
              >
                <Ionicons
                  name="add"
                  size={21}
                  color="#0f172a"
                />
                <Text style={styles.createButtonText}>
                  New
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
              style={styles.filterScroll}
            >
              {DATE_FILTERS.map((filter) => {
                const selected =
                  dateFilter === filter.value;

                return (
                  <TouchableOpacity
                    key={filter.value}
                    activeOpacity={0.85}
                    onPress={() =>
                      setDateFilter(filter.value)
                    }
                    style={[
                      styles.filterChip,
                      selected &&
                        styles.filterChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected &&
                          styles.filterTextSelected,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.metricGrid}>
              {renderMetricCard({
                label: "Total invoiced",
                value: formatMoney(
                  summary.totalInvoiced
                ),
                icon: "receipt-outline",
                hint: `${activeInvoices.length} active invoices`,
              })}

              {renderMetricCard({
                label: "Received",
                value: formatMoney(
                  summary.totalReceived
                ),
                icon: "cash-outline",
                hint: `${collectionRate.toFixed(
                  0
                )}% collection rate`,
              })}

              {renderMetricCard({
                label: "Outstanding",
                value: formatMoney(
                  summary.totalOutstanding
                ),
                icon: "wallet-outline",
                hint: `${summary.openCount} open invoices`,
              })}

              {renderMetricCard({
                label: "Overdue",
                value: formatMoney(
                  summary.totalOverdue
                ),
                icon: "alert-circle-outline",
                hint: `${statusCounts.overdue} overdue invoices`,
                danger: summary.totalOverdue > 0,
              })}

              {renderMetricCard({
                label: "Average invoice",
                value: formatMoney(
                  averageInvoiceValue
                ),
                icon: "stats-chart-outline",
              })}

              {renderMetricCard({
                label: "Customers owing",
                value: String(customersOutstanding),
                icon: "people-outline",
              })}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Collection progress
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Payments received against invoiced value
                  </Text>
                </View>

                <Text style={styles.collectionPercent}>
                  {collectionRate.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(
                        0,
                        Math.min(100, collectionRate)
                      )}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      styles.legendDotReceived,
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Received{" "}
                    {formatMoney(summary.totalReceived)}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      styles.legendDotOutstanding,
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Outstanding{" "}
                    {formatMoney(
                      summary.totalOutstanding
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Invoice status
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Status breakdown for the selected period
                  </Text>
                </View>

                <Text style={styles.sectionCount}>
                  {filteredInvoices.length}
                </Text>
              </View>

              <View style={styles.statusGrid}>
                {(
                  Object.keys(
                    STATUS_CONFIG
                  ) as InvoiceStatus[]
                ).map((status) => {
                  const config =
                    STATUS_CONFIG[status];
                  const count =
                    statusCounts[status];

                  return (
                    <TouchableOpacity
                      key={status}
                      activeOpacity={0.85}
                      onPress={openInvoiceList}
                      style={styles.statusItem}
                    >
                      <View
                        style={[
                          styles.statusIcon,
                          {
                            backgroundColor:
                              config.background,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusCount,
                            {
                              color: config.colour,
                            },
                          ]}
                        >
                          {count}
                        </Text>
                      </View>

                      <Text style={styles.statusLabel}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Six-month trend
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Invoiced versus payments received
                  </Text>
                </View>
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      styles.legendDotInvoiced,
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Invoiced
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      styles.legendDotReceived,
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Received
                  </Text>
                </View>
              </View>

              <View style={styles.chart}>
                {monthlyTrend.map((month) => {
                  const invoicedHeight = Math.max(
                    3,
                    (month.invoiced /
                      maxMonthlyValue) *
                      128
                  );

                  const receivedHeight = Math.max(
                    3,
                    (month.received /
                      maxMonthlyValue) *
                      128
                  );

                  return (
                    <View
                      key={month.key}
                      style={styles.chartColumn}
                    >
                      <View style={styles.barArea}>
                        <View
                          style={[
                            styles.bar,
                            styles.invoicedBar,
                            {
                              height: invoicedHeight,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.bar,
                            styles.receivedBar,
                            {
                              height: receivedHeight,
                            },
                          ]}
                        />
                      </View>

                      <Text style={styles.monthLabel}>
                        {month.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Top customers
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Ranked by invoiced value
                  </Text>
                </View>
              </View>

              {topCustomers.length === 0 ? (
                <Text style={styles.emptySectionText}>
                  No customer invoice data for this
                  period.
                </Text>
              ) : (
                topCustomers.map((customer, index) => (
                  <View
                    key={`${customer.name}-${index}`}
                    style={[
                      styles.customerRow,
                      index <
                        topCustomers.length - 1 &&
                        styles.rowDivider,
                    ]}
                  >
                    <View style={styles.customerRank}>
                      <Text
                        style={styles.customerRankText}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.customerInfo}>
                      <Text
                        style={styles.customerName}
                        numberOfLines={1}
                      >
                        {customer.name}
                      </Text>
                      <Text
                        style={styles.customerMeta}
                      >
                        {customer.invoiceCount}{" "}
                        {customer.invoiceCount === 1
                          ? "invoice"
                          : "invoices"}{" "}
                        • Outstanding{" "}
                        {formatMoney(
                          customer.outstanding
                        )}
                      </Text>
                    </View>

                    <Text style={styles.customerTotal}>
                      {formatMoney(customer.total)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Recent invoices
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Latest activity in the selected period
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={openInvoiceList}
                  hitSlop={10}
                >
                  <Text style={styles.viewAllText}>
                    View all
                  </Text>
                </TouchableOpacity>
              </View>

              {recentInvoices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="receipt-outline"
                    size={34}
                    color="#93c5fd"
                  />
                  <Text style={styles.emptyTitle}>
                    No invoices found
                  </Text>
                  <Text style={styles.emptyText}>
                    Create an invoice or select a
                    different date range.
                  </Text>

                  <TouchableOpacity
                    onPress={createInvoice}
                    style={styles.emptyButton}
                  >
                    <Text
                      style={styles.emptyButtonText}
                    >
                      Create invoice
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                recentInvoices.map((invoice, index) => {
                  const status =
                    STATUS_CONFIG[invoice.status];

                  return (
                    <TouchableOpacity
                      key={invoice.id}
                      activeOpacity={0.85}
                      onPress={() =>
                        openInvoice(invoice)
                      }
                      style={[
                        styles.invoiceRow,
                        index <
                          recentInvoices.length - 1 &&
                          styles.rowDivider,
                      ]}
                    >
                      <View
                        style={styles.invoiceRowIcon}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={19}
                          color="#bfdbfe"
                        />
                      </View>

                      <View
                        style={styles.invoiceRowInfo}
                      >
                        <Text
                          style={styles.invoiceNumber}
                        >
                          {invoice.invoiceNumber}
                        </Text>
                        <Text
                          style={styles.invoiceCustomer}
                          numberOfLines={1}
                        >
                          {getCustomerName(invoice)} •{" "}
                          {formatDate(
                            invoice.invoiceDate
                          )}
                        </Text>
                      </View>

                      <View
                        style={styles.invoiceAmountBlock}
                      >
                        <Text
                          style={styles.invoiceAmount}
                        >
                          {formatMoney(
                            invoice.grandTotal
                          )}
                        </Text>

                        <View
                          style={[
                            styles.invoiceStatusBadge,
                            {
                              backgroundColor:
                                status.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.invoiceStatusText,
                              {
                                color:
                                  status.colour,
                              },
                            ]}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={createInvoice}
                style={styles.quickActionButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#0f172a"
                />
                <Text style={styles.quickActionText}>
                  Create Invoice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={openInvoiceList}
                style={[
                  styles.quickActionButton,
                  styles.secondaryQuickAction,
                ]}
              >
                <Ionicons
                  name="list-outline"
                  size={21}
                  color="#dbeafe"
                />
                <Text
                  style={[
                    styles.quickActionText,
                    styles.secondaryQuickActionText,
                  ]}
                >
                  Invoice List
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

export default InvoiceDashboardScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 46,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  createButton: {
    minHeight: 42,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 14,
    backgroundColor: "#dbeafe",
  },
  createButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
  filterScroll: {
    marginHorizontal: -16,
    marginBottom: 14,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(15,23,42,0.46)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  filterChipSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
  },
  filterText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  filterTextSelected: {
    color: "#0f172a",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: "48.4%",
    minHeight: 126,
    borderRadius: 17,
    padding: 13,
    backgroundColor: "rgba(15,23,42,0.56)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },
  metricIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
    marginBottom: 10,
  },
  metricIconDanger: {
    backgroundColor: "rgba(239,68,68,0.17)",
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },
  metricValueDanger: {
    color: "#fca5a5",
  },
  metricHint: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 6,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.13)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  sectionCount: {
    color: "#bfdbfe",
    fontSize: 23,
    fontWeight: "900",
  },
  collectionPercent: {
    color: "#86efac",
    fontSize: 23,
    fontWeight: "900",
  },
  progressTrack: {
    height: 11,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#86efac",
  },
  progressLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 12,
  },
  chartLegend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotReceived: {
    backgroundColor: "#86efac",
  },
  legendDotOutstanding: {
    backgroundColor: "#fcd34d",
  },
  legendDotInvoiced: {
    backgroundColor: "#93c5fd",
  },
  legendText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
  },
  statusItem: {
    width: "25%",
    alignItems: "center",
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCount: {
    fontSize: 17,
    fontWeight: "900",
  },
  statusLabel: {
    color: "#cbd5e1",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  chart: {
    height: 166,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
  },
  barArea: {
    height: 134,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
  },
  bar: {
    width: 9,
    minHeight: 3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  invoicedBar: {
    backgroundColor: "#93c5fd",
  },
  receivedBar: {
    backgroundColor: "#86efac",
  },
  monthLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 7,
  },
  customerRow: {
    minHeight: 61,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.13)",
  },
  customerRank: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  customerRankText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "900",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
  customerMeta: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 4,
  },
  customerTotal: {
    color: "#dbeafe",
    fontSize: 13,
    fontWeight: "900",
  },
  invoiceRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  invoiceRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  invoiceRowInfo: {
    flex: 1,
  },
  invoiceNumber: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "800",
  },
  invoiceCustomer: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 4,
  },
  invoiceAmountBlock: {
    alignItems: "flex-end",
  },
  invoiceAmount: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
  },
  invoiceStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 5,
  },
  invoiceStatusText: {
    fontSize: 8,
    fontWeight: "900",
  },
  viewAllText: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "800",
  },
  emptySectionText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 27,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },
  emptyButton: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#dbeafe",
    marginTop: 14,
  },
  emptyButtonText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "800",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#dbeafe",
  },
  secondaryQuickAction: {
    backgroundColor: "rgba(15,23,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.25)",
  },
  quickActionText: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "800",
  },
  secondaryQuickActionText: {
    color: "#dbeafe",
  },
});

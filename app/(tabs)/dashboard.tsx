import ScreenWrapper from "@/components/ScreenWrapper";
import { useCompanyProfile } from "@/context/CompanyProfileContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatCurrencyFromProfile } from "@/lib/currency";
import {
  getReturnItems,
  getSaleItems,
  getStockItems,
  ReturnItem,
  SaleItem,
  StockItem,
} from "@/lib/storage";
import { getSupplierStockInRecords } from "@/lib/supplierStockInStorage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

let BarChart: any = null;

try {
  BarChart =
    require("react-native-chart-kit").BarChart;
} catch (error) {
  console.warn(
    "react-native-chart-kit unavailable:",
    error,
  );
}

let DateTimePickerModal: any = null;

if (Platform.OS !== "web") {
  try {
    DateTimePickerModal =
      require("react-native-modal-datetime-picker").default;
  } catch {
    console.warn(
      "DateTimePickerModal unavailable",
    );
  }
}

const SCREEN_WIDTH =
  Dimensions.get("window").width || 400;

type FilterType =
  | "daily"
  | "weekly"
  | "monthly"
  | "all"
  | "custom";

type SupplierStockInLike = {
  id: string;
  stockItemId?: string;
  supplierId?: string;
  supplierName?: string;
  totalCost?: number;
  paymentStatus?: "paid" | "unpaid";
  date?: string;
};

type TopSeller = {
  name: string;
  quantity: number;
  revenue: number;
};

const safeNumber = (value: unknown): number => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const startOfDay = (date: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

const endOfDay = (date: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

const getDateValue = (value: unknown): number => {
  const result = new Date(
    String(value || ""),
  ).getTime();

  return Number.isFinite(result) ? result : 0;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const Dashboard = () => {
  const {
    permissions,
    loading: subscriptionLoading,
  } = useSubscription();
  const { companyProfile } =
    useCompanyProfile();

  const [stockItems, setStockItems] = useState<
    StockItem[]
  >([]);
  const [saleItems, setSaleItems] = useState<
    SaleItem[]
  >([]);
  const [returnItems, setReturnItems] =
    useState<ReturnItem[]>([]);
  const [
    supplierStockIn,
    setSupplierStockIn,
  ] = useState<SupplierStockInLike[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("monthly");
  const [startDate, setStartDate] = useState(
    new Date(),
  );
  const [endDate, setEndDate] = useState(
    new Date(),
  );
  const [showStartPicker, setShowStartPicker] =
    useState(false);
  const [showEndPicker, setShowEndPicker] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);
  const [dataLoading, setDataLoading] =
    useState(true);
  const [exporting, setExporting] =
    useState(false);

  const currency = useCallback(
    (value: number) =>
      formatCurrencyFromProfile(
        value,
        companyProfile ?? undefined,
      ),
    [companyProfile],
  );

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setDataLoading(true);
        }

        const [
          stock,
          sales,
          returns,
          purchases,
        ] = await Promise.all([
          getStockItems(),
          getSaleItems(),
          getReturnItems(),
          getSupplierStockInRecords(),
        ]);

        setStockItems(stock || []);
        setSaleItems(sales || []);
        setReturnItems(returns || []);
        setSupplierStockIn(
          (purchases ||
            []) as SupplierStockInLike[],
        );
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error,
        );
        Alert.alert(
          "Dashboard Error",
          "Some business data could not be loaded.",
        );
      } finally {
        setRefreshing(false);
        setDataLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const dateRange = useMemo(() => {
    const now = new Date();

    if (filter === "daily") {
      return {
        from: startOfDay(now),
        to: endOfDay(now),
        label: "Today",
      };
    }

    if (filter === "weekly") {
      const dayOffset =
        (now.getDay() - 1 + 7) % 7;
      const from = startOfDay(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOffset,
        ),
      );

      return {
        from,
        to: endOfDay(
          new Date(
            from.getFullYear(),
            from.getMonth(),
            from.getDate() + 6,
          ),
        ),
        label: "This week",
      };
    }

    if (filter === "monthly") {
      return {
        from: new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0,
        ),
        to: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
        label: "This month",
      };
    }

    if (filter === "custom") {
      const first =
        startDate <= endDate
          ? startDate
          : endDate;
      const last =
        startDate <= endDate
          ? endDate
          : startDate;

      return {
        from: startOfDay(first),
        to: endOfDay(last),
        label: `${formatDate(first)} – ${formatDate(
          last,
        )}`,
      };
    }

    return {
      from: null,
      to: null,
      label: "All time",
    };
  }, [filter, startDate, endDate]);

  const isWithinPeriod = useCallback(
    (dateValue: unknown): boolean => {
      if (!dateRange.from || !dateRange.to) {
        return true;
      }

      const timestamp =
        getDateValue(dateValue);

      return (
        timestamp >= dateRange.from.getTime() &&
        timestamp <= dateRange.to.getTime()
      );
    },
    [dateRange],
  );

  const periodSales = useMemo(
    () =>
      saleItems.filter((sale) =>
        isWithinPeriod(sale.date),
      ),
    [saleItems, isWithinPeriod],
  );

  const periodReturns = useMemo(
    () =>
      returnItems.filter((item) =>
        isWithinPeriod(item.date),
      ),
    [returnItems, isWithinPeriod],
  );

  const metrics = useMemo(() => {
    const revenue = periodSales.reduce(
      (total, sale) =>
        total +
        safeNumber(sale.quantity) *
          safeNumber(sale.price),
      0,
    );

    const unitsSold = periodSales.reduce(
      (total, sale) =>
        total + safeNumber(sale.quantity),
      0,
    );

    const returnQuantity =
      periodReturns.reduce(
        (total, item) =>
          total + safeNumber(item.quantity),
        0,
      );

    const currentQuantity =
      stockItems.reduce(
        (total, item) =>
          total + safeNumber(item.quantity),
        0,
      );

    const stockCostValue =
      stockItems.reduce(
        (total, item) =>
          total +
          safeNumber(item.quantity) *
            safeNumber(
              (item as any).costPrice,
            ),
        0,
      );

    const lowStockItems =
      stockItems.filter((item) => {
        const quantity = safeNumber(
          item.quantity,
        );
        const threshold = safeNumber(
          (item as any).lowStockAlert,
        );

        return (
          threshold > 0 &&
          quantity > 0 &&
          quantity <= threshold
        );
      });

    const outOfStockItems =
      stockItems.filter(
        (item) =>
          safeNumber(item.quantity) <= 0,
      );

    const supplierOutstanding =
      supplierStockIn
        .filter(
          (record) =>
            record.paymentStatus ===
            "unpaid",
        )
        .reduce(
          (total, record) =>
            total +
            safeNumber(record.totalCost),
          0,
        );

    const customerOutstanding =
      saleItems
        .filter(
          (sale) => sale.paid === false,
        )
        .reduce(
          (total, sale) =>
            total +
            safeNumber(sale.quantity) *
              safeNumber(sale.price),
          0,
        );

    const unpaidSaleGroups = new Set(
      saleItems
        .filter(
          (sale) => sale.paid === false,
        )
        .map(
          (sale: any) =>
            sale.salesId ||
            `${sale.buyerName}-${sale.date}`,
        ),
    ).size;

    const salesGroups = new Set(
      periodSales.map(
        (sale: any) =>
          sale.salesId ||
          `${sale.buyerName}-${sale.date}`,
      ),
    ).size;

    const averageSale =
      salesGroups > 0
        ? revenue / salesGroups
        : 0;

    return {
      revenue,
      unitsSold,
      returnQuantity,
      currentQuantity,
      stockCostValue,
      lowStockItems,
      outOfStockItems,
      supplierOutstanding,
      customerOutstanding,
      unpaidSaleGroups,
      salesGroups,
      averageSale,
    };
  }, [
    periodSales,
    periodReturns,
    saleItems,
    stockItems,
    supplierStockIn,
  ]);

  const topSellers = useMemo<TopSeller[]>(
    () => {
      const grouped = new Map<
        string,
        TopSeller
      >();

      periodSales.forEach((sale) => {
        const name =
          sale.name || "Unnamed item";
        const existing =
          grouped.get(name) || {
            name,
            quantity: 0,
            revenue: 0,
          };

        existing.quantity += safeNumber(
          sale.quantity,
        );
        existing.revenue +=
          safeNumber(sale.quantity) *
          safeNumber(sale.price);

        grouped.set(name, existing);
      });

      return [...grouped.values()]
        .sort(
          (a, b) =>
            b.revenue - a.revenue,
        )
        .slice(0, 6);
    },
    [periodSales],
  );

  const highestValueStock = useMemo(
    () =>
      stockItems
        .map((item) => ({
          id: item.id,
          name: item.name || "Unnamed item",
          quantity: safeNumber(
            item.quantity,
          ),
          value:
            safeNumber(item.quantity) *
            safeNumber(
              (item as any).costPrice,
            ),
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [stockItems],
  );

  const stockHealth = useMemo(() => {
    const total = stockItems.length;

    const attention =
      metrics.lowStockItems.length +
      metrics.outOfStockItems.length;

    const healthy = Math.max(
      total - attention,
      0,
    );

    const percentage =
      total > 0
        ? Math.round(
            (healthy / total) * 100,
          )
        : 0;

    return {
      healthy,
      attention,
      percentage,
    };
  }, [stockItems, metrics]);

  const alertItems = useMemo(
    () =>
      [
        ...metrics.outOfStockItems.map(
          (item) => ({
            id: item.id,
            name: item.name,
            message: "Out of stock",
            severity: "critical" as const,
          }),
        ),
        ...metrics.lowStockItems.map(
          (item) => ({
            id: item.id,
            name: item.name,
            message: `${safeNumber(
              item.quantity,
            )} ${item.unit || "units"} remaining`,
            severity: "warning" as const,
          }),
        ),
      ].slice(0, 6),
    [metrics],
  );

  const exportReport = async () => {
    if (exporting) return;

    try {
      setExporting(true);

      const reportRows = topSellers
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td style="text-align:right;">${item.quantity}</td>
              <td style="text-align:right;">${escapeHtml(currency(item.revenue))}</td>
            </tr>
          `,
        )
        .join("");

      const alertRows = alertItems
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.message)}</td>
            </tr>
          `,
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #0f172a;
                padding: 26px;
              }
              h1 { margin-bottom: 4px; }
              .muted { color: #64748b; }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin: 22px 0;
              }
              .card {
                border: 1px solid #dbe3eb;
                border-radius: 10px;
                padding: 14px;
              }
              .label {
                color: #64748b;
                font-size: 12px;
              }
              .value {
                font-size: 20px;
                font-weight: bold;
                margin-top: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #dbe3eb;
                padding: 8px;
                font-size: 12px;
                text-align: left;
              }
              th { background: #f1f5f9; }
              h2 { margin-top: 26px; }
            </style>
          </head>

          <body>
            <h1>${escapeHtml(
              companyProfile?.companyName ||
                "StockTally",
            )}</h1>

            <div class="muted">
              Business dashboard · ${escapeHtml(
                dateRange.label,
              )} · Generated ${escapeHtml(
                new Date().toLocaleString(
                  "en-GB",
                ),
              )}
            </div>

            <div class="grid">
              <div class="card">
                <div class="label">Sales revenue</div>
                <div class="value">${escapeHtml(
                  formatCurrencyFromProfile(metrics.revenue),
                )}</div>
              </div>

              <div class="card">
                <div class="label">Units sold</div>
                <div class="value">${metrics.unitsSold}</div>
              </div>

              <div class="card">
                <div class="label">Current stock value</div>
                <div class="value">${escapeHtml(
                  currency(
                    metrics.stockCostValue,
                  ),
                )}</div>
              </div>

              <div class="card">
                <div class="label">Current stock quantity</div>
                <div class="value">${metrics.currentQuantity}</div>
              </div>

              <div class="card">
                <div class="label">Customers owe</div>
                <div class="value">${escapeHtml(
                  currency(
                    metrics.customerOutstanding,
                  ),
                )}</div>
              </div>

              <div class="card">
                <div class="label">You owe suppliers</div>
                <div class="value">${escapeHtml(
                  currency(
                    metrics.supplierOutstanding,
                  ),
                )}</div>
              </div>
            </div>

            <h2>Top-selling items</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Units</th>
                <th>Revenue</th>
              </tr>
              ${
                reportRows ||
                `<tr><td colspan="3">No sales in this period.</td></tr>`
              }
            </table>

            <h2>Stock alerts</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Status</th>
              </tr>
              ${
                alertRows ||
                `<tr><td colspan="2">No current stock alerts.</td></tr>`
              }
            </table>
          </body>
        </html>
      `;

      const { uri } =
        await Print.printToFileAsync({
          html,
        });

      const fileName = `StockTally-Dashboard-${Date.now()}.pdf`;
      const destination = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: destination,
      });

      if (
        await Sharing.isAvailableAsync()
      ) {
        await Sharing.shareAsync(
          destination,
          {
            mimeType: "application/pdf",
            dialogTitle:
              "Share dashboard report",
            UTI: "com.adobe.pdf",
          },
        );
      } else {
        Alert.alert(
          "Report Created",
          `Saved as ${fileName}`,
        );
      }
    } catch (error: any) {
      console.error(
        "Dashboard export error:",
        error,
      );
      Alert.alert(
        "Export Failed",
        error.message ||
          "The dashboard report could not be created.",
      );
    } finally {
      setExporting(false);
    }
  };

  if (subscriptionLoading) {
    return (
      <ScreenWrapper
        backgroundColor="#eef3f8"
      >
        <View style={styles.loadingScreen}>
          <ActivityIndicator
            size="large"
            color="#1d4ed8"
          />
          <Text style={styles.loadingText}>
            Loading dashboard…
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!permissions.analytics) {
    return (
      <ScreenWrapper
        backgroundColor="#eef3f8"
      >
        <LinearGradient
          colors={[
            "#0f172a",
            "#1e3a5f",
            "#28547f",
          ]}
          style={styles.proScreen}
        >
          <View style={styles.proIconCircle}>
            <Text style={styles.proIcon}>
              📊
            </Text>
          </View>

          <Text style={styles.proTitle}>
            Advanced Dashboard
          </Text>

          <Text style={styles.proDescription}>
            Unlock sales trends, stock
            health, outstanding balances and
            downloadable business reports.
          </Text>

          <TouchableOpacity
            style={styles.proButton}
            onPress={() =>
              router.push("/paywall")
            }
          >
            <Text
              style={styles.proButtonText}
            >
              Upgrade to Pro
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      backgroundColor="#eef3f8"
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadDashboard(true)
            }
            tintColor="#1d4ed8"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>
              Business Dashboard
            </Text>

            <Text style={styles.pageSubtitle}>
              Sales, inventory and cash
              position
            </Text>
          </View>

          <TouchableOpacity
            style={styles.exportIconButton}
            onPress={exportReport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator
                size="small"
                color="#1d4ed8"
              />
            ) : (
              <Text
                style={
                  styles.exportIconText
                }
              >
                PDF
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.filterCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterContent
            }
          >
            {[
              {
                label: "Today",
                value: "daily",
              },
              {
                label: "Week",
                value: "weekly",
              },
              {
                label: "Month",
                value: "monthly",
              },
              {
                label: "All time",
                value: "all",
              },
              {
                label: "Custom",
                value: "custom",
              },
            ].map((option) => {
              const active =
                filter === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterButton,
                    active &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilter(
                      option.value as FilterType,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.periodLabel}>
            {dateRange.label}
          </Text>
        </View>

        {filter === "custom" &&
        DateTimePickerModal ? (
          <View style={styles.dateRange}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() =>
                setShowStartPicker(true)
              }
            >
              <Text
                style={styles.dateButtonLabel}
              >
                From
              </Text>
              <Text
                style={styles.dateButtonValue}
              >
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() =>
                setShowEndPicker(true)
              }
            >
              <Text
                style={styles.dateButtonLabel}
              >
                To
              </Text>
              <Text
                style={styles.dateButtonValue}
              >
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showStartPicker}
              mode="date"
              onConfirm={(date: Date) => {
                setShowStartPicker(false);
                setStartDate(date);
              }}
              onCancel={() =>
                setShowStartPicker(false)
              }
            />

            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="date"
              onConfirm={(date: Date) => {
                setShowEndPicker(false);
                setEndDate(date);
              }}
              onCancel={() =>
                setShowEndPicker(false)
              }
            />
          </View>
        ) : null}

        {dataLoading ? (
          <View style={styles.dataLoadingCard}>
            <ActivityIndicator
              color="#1d4ed8"
            />
            <Text
              style={styles.dataLoadingText}
            >
              Analysing your business…
            </Text>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={[
                "#0f172a",
                "#1e3a5f",
                "#28547f",
              ]}
              style={styles.revenueHero}
            >
              <Text
                style={styles.heroEyebrow}
              >
                SALES REVENUE
              </Text>

              <Text
                style={styles.heroValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {currency(metrics.revenue)}
              </Text>

              <View
                style={styles.heroMetricRow}
              >
                <MiniMetric
                  label="Sales"
                  value={String(
                    metrics.salesGroups,
                  )}
                />

                <View
                  style={styles.heroDivider}
                />

                <MiniMetric
                  label="Units sold"
                  value={String(
                    metrics.unitsSold,
                  )}
                />

                <View
                  style={styles.heroDivider}
                />

                <MiniMetric
                  label="Average sale"
                  value={currency(
                    metrics.averageSale,
                  )}
                />
              </View>
            </LinearGradient>

            <Text style={styles.sectionHeading}>
              Financial position
            </Text>

            <View style={styles.cardGrid}>
              <MetricCard
                icon="💳"
                title="Customers Owe"
                value={currency(
                  metrics.customerOutstanding,
                )}
                subtitle={`${metrics.unpaidSaleGroups} unpaid sale${
                  metrics.unpaidSaleGroups ===
                  1
                    ? ""
                    : "s"
                }`}
                tone="amber"
                onPress={() =>
                  router.push(
                    "/(tabs)/saleList",
                  )
                }
              />

              <MetricCard
                icon="🏭"
                title="You Owe"
                value={currency(
                  metrics.supplierOutstanding,
                )}
                subtitle="Unpaid supplier deliveries"
                tone="purple"
                onPress={() =>
                  router.push(
                    "/screens/suppliers/supplierList",
                  )
                }
              />

              <MetricCard
                icon="📦"
                title="Stock Value"
                value={currency(
                  metrics.stockCostValue,
                )}
                subtitle={`${metrics.currentQuantity} units on hand`}
                tone="blue"
                onPress={() =>
                  router.push(
                    "/(tabs)/stockList",
                  )
                }
              />

              <MetricCard
                icon="↩️"
                title="Returns"
                value={String(
                  metrics.returnQuantity,
                )}
                subtitle={`Recorded ${dateRange.label.toLowerCase()}`}
                tone="teal"
                onPress={() =>
                  router.push(
                    "/(tabs)/returnsList",
                  )
                }
              />
            </View>

            <View style={styles.healthCard}>
              <View
                style={styles.healthHeader}
              >
                <View>
                  <Text
                    style={styles.healthTitle}
                  >
                    Stock Health
                  </Text>
                  <Text
                    style={
                      styles.healthSubtitle
                    }
                  >
                    {stockHealth.healthy} of{" "}
                    {stockItems.length} items
                    are healthy
                  </Text>
                </View>

                <Text
                  style={styles.healthPercent}
                >
                  {stockHealth.percentage}%
                </Text>
              </View>

              <View
                style={styles.healthTrack}
              >
                <View
                  style={[
                    styles.healthFill,
                    {
                      width: `${stockHealth.percentage}%`,
                    },
                  ]}
                />
              </View>

              <View
                style={styles.healthStats}
              >
                <HealthStat
                  dotStyle={
                    styles.dotHealthy
                  }
                  label="Healthy"
                  value={
                    stockHealth.healthy
                  }
                />

                <HealthStat
                  dotStyle={
                    styles.dotWarning
                  }
                  label="Low"
                  value={
                    metrics.lowStockItems
                      .length
                  }
                />

                <HealthStat
                  dotStyle={
                    styles.dotCritical
                  }
                  label="Out"
                  value={
                    metrics.outOfStockItems
                      .length
                  }
                />
              </View>
            </View>

            {alertItems.length > 0 ? (
              <SectionCard
                title="Needs Attention"
                actionLabel="View low stock"
                onAction={() =>
                  router.push(
                    "/screens/ReorderListScreen",
                  )
                }
              >
                {alertItems.map(
                  (item, index) => (
                    <View
                      key={`${item.id}-${item.severity}`}
                      style={[
                        styles.alertRow,
                        index ===
                          alertItems.length -
                            1 &&
                          styles.lastRow,
                      ]}
                    >
                      <View
                        style={[
                          styles.alertIcon,
                          item.severity ===
                          "critical"
                            ? styles.alertCritical
                            : styles.alertWarning,
                        ]}
                      >
                        <Text>
                          {item.severity ===
                          "critical"
                            ? "!"
                            : "↓"}
                        </Text>
                      </View>

                      <View
                        style={{ flex: 1 }}
                      >
                        <Text
                          style={
                            styles.rowTitle
                          }
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>

                        <Text
                          style={
                            styles.rowSubtitle
                          }
                        >
                          {item.message}
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </SectionCard>
            ) : (
              <View
                style={
                  styles.allHealthyCard
                }
              >
                <Text
                  style={
                    styles.allHealthyIcon
                  }
                >
                  ✓
                </Text>

                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.allHealthyTitle
                    }
                  >
                    Inventory looks healthy
                  </Text>

                  <Text
                    style={
                      styles.allHealthyText
                    }
                  >
                    No low-stock or
                    out-of-stock alerts.
                  </Text>
                </View>
              </View>
            )}

            <SectionCard
              title="Top Sellers"
              subtitle={dateRange.label}
              actionLabel="Stock out"
              onAction={() =>
                router.push(
                  "/(tabs)/saleList",
                )
              }
            >
              {topSellers.length === 0 ? (
                <EmptyState
                  icon="🛒"
                  text="No sales recorded in this period."
                />
              ) : (
                topSellers.map(
                  (item, index) => {
                    const maximum =
                      topSellers[0]
                        ?.revenue || 1;
                    const percentage =
                      Math.max(
                        (item.revenue /
                          maximum) *
                          100,
                        4,
                      );

                    return (
                      <View
                        key={item.name}
                        style={[
                          styles.sellerRow,
                          index ===
                            topSellers.length -
                              1 &&
                            styles.lastRow,
                        ]}
                      >
                        <View
                          style={
                            styles.rankCircle
                          }
                        >
                          <Text
                            style={
                              styles.rankText
                            }
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <View
                            style={
                              styles.sellerHeader
                            }
                          >
                            <Text
                              style={
                                styles.rowTitle
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {item.name}
                            </Text>

                            <Text
                              style={
                                styles.sellerValue
                              }
                            >
                              {currency(
                                item.revenue,
                              )}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.barTrack
                            }
                          >
                            <View
                              style={[
                                styles.barFill,
                                {
                                  width: `${percentage}%`,
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={
                              styles.rowSubtitle
                            }
                          >
                            {item.quantity} units
                            sold
                          </Text>
                        </View>
                      </View>
                    );
                  },
                )
              )}
            </SectionCard>

            <SectionCard
              title="Highest Stock Value"
              subtitle="Current inventory at cost"
              actionLabel="Stock list"
              onAction={() =>
                router.push(
                  "/(tabs)/stockList",
                )
              }
            >
              {highestValueStock.length ===
              0 ? (
                <EmptyState
                  icon="📦"
                  text="Add cost prices to see inventory value analysis."
                />
              ) : (
                <>
                  {BarChart ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={
                        false
                      }
                    >
                      <BarChart
                        data={{
                          labels:
                            highestValueStock.map(
                              (item) =>
                                item.name.length >
                                9
                                  ? `${item.name.slice(
                                      0,
                                      9,
                                    )}…`
                                  : item.name,
                            ),
                          datasets: [
                            {
                              data: highestValueStock.map(
                                (item) =>
                                  item.value,
                              ),
                            },
                          ],
                        }}
                        width={Math.max(
                          SCREEN_WIDTH - 64,
                          highestValueStock.length *
                            82,
                        )}
                        height={230}
                        yAxisLabel={
                          companyProfile?.currencySymbol ||
                          "£"
                        }
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars={
                          false
                        }
                        chartConfig={{
                          backgroundGradientFrom:
                            "#ffffff",
                          backgroundGradientTo:
                            "#ffffff",
                          decimalPlaces: 0,
                          color: (
                            opacity = 1,
                          ) =>
                            `rgba(37, 99, 235, ${opacity})`,
                          labelColor: () =>
                            "#475569",
                          propsForBackgroundLines:
                            {
                              stroke:
                                "#e2e8f0",
                            },
                          barPercentage:
                            0.62,
                        }}
                        style={
                          styles.chart
                        }
                      />
                    </ScrollView>
                  ) : (
                    highestValueStock.map(
                      (item, index) => (
                        <View
                          key={item.id}
                          style={[
                            styles.valueRow,
                            index ===
                              highestValueStock.length -
                                1 &&
                              styles.lastRow,
                          ]}
                        >
                          <View
                            style={{
                              flex: 1,
                            }}
                          >
                            <Text
                              style={
                                styles.rowTitle
                              }
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={
                                styles.rowSubtitle
                              }
                            >
                              {item.quantity}{" "}
                              units
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.valueText
                            }
                          >
                            {currency(
                              item.value,
                            )}
                          </Text>
                        </View>
                      ),
                    )
                  )}
                </>
              )}
            </SectionCard>

            <Text style={styles.sectionHeading}>
              Quick actions
            </Text>

            <View
              style={
                styles.quickActionGrid
              }
            >
              <QuickAction
                icon="＋"
                title="Add Stock"
                onPress={() =>
                  router.push(
                    "/screens/stock/add",
                  )
                }
              />

              <QuickAction
                icon="↗"
                title="Move Stock"
                onPress={() =>
                  router.push(
                    "/screens/StockMoveScreen",
                  )
                }
              />

              <QuickAction
                icon="✓"
                title="Stock Count"
                onPress={() =>
                  router.push(
                    "/screens/StockTakeSessionScreen",
                  )
                }
              />

              <QuickAction
                icon="☁"
                title="Sync Data"
                onPress={() =>
                  router.push(
                    "/screens/CloudBackupScreen",
                  )
                }
              />
            </View>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportReport}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <>
                  <Text
                    style={
                      styles.exportButtonIcon
                    }
                  >
                    ↓
                  </Text>
                  <Text
                    style={
                      styles.exportButtonText
                    }
                  >
                    Export Dashboard Report
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const MiniMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.miniMetric}>
    <Text style={styles.miniMetricValue}>
      {value}
    </Text>
    <Text style={styles.miniMetricLabel}>
      {label}
    </Text>
  </View>
);

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  tone,
  onPress,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  tone:
    | "blue"
    | "amber"
    | "purple"
    | "teal";
  onPress?: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.86}
    style={styles.metricCard}
    onPress={onPress}
  >
    <View
      style={[
        styles.metricIcon,
        tone === "blue" &&
          styles.metricIconBlue,
        tone === "amber" &&
          styles.metricIconAmber,
        tone === "purple" &&
          styles.metricIconPurple,
        tone === "teal" &&
          styles.metricIconTeal,
      ]}
    >
      <Text style={styles.metricEmoji}>
        {icon}
      </Text>
    </View>

    <Text style={styles.metricTitle}>
      {title}
    </Text>

    <Text
      style={styles.metricValue}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>

    <Text
      style={styles.metricSubtitle}
      numberOfLines={2}
    >
      {subtitle}
    </Text>
  </TouchableOpacity>
);

const HealthStat = ({
  dotStyle,
  label,
  value,
}: {
  dotStyle: object;
  label: string;
  value: number;
}) => (
  <View style={styles.healthStat}>
    <View
      style={[styles.healthDot, dotStyle]}
    />
    <Text style={styles.healthStatLabel}>
      {label}
    </Text>
    <Text style={styles.healthStatValue}>
      {value}
    </Text>
  </View>
);

const SectionCard = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionCardHeader}>
      <View style={{ flex: 1 }}>
        <Text
          style={styles.sectionCardTitle}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={
              styles.sectionCardSubtitle
            }
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
        >
          <Text
            style={styles.sectionAction}
          >
            {actionLabel} ›
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>

    {children}
  </View>
);

const EmptyState = ({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>
      {icon}
    </Text>
    <Text style={styles.emptyText}>
      {text}
    </Text>
  </View>
);

const QuickAction = ({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.quickAction}
    onPress={onPress}
  >
    <View style={styles.quickActionIcon}>
      <Text
        style={styles.quickActionIconText}
      >
        {icon}
      </Text>
    </View>

    <Text style={styles.quickActionTitle}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  pageTitle: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 3,
  },

  exportIconButton: {
    width: 48,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3eb",
    justifyContent: "center",
    alignItems: "center",
  },

  exportIconText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "900",
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#dce4ec",
    paddingVertical: 9,
    marginBottom: 12,
  },

  filterContent: {
    paddingHorizontal: 9,
    gap: 7,
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: "#f1f5f9",
  },

  filterButtonActive: {
    backgroundColor: "#1d4ed8",
  },

  filterText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#ffffff",
  },

  periodLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  dateRange: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  dateButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce4ec",
    borderRadius: 14,
    padding: 12,
  },

  dateButtonLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  dateButtonValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },

  dataLoadingCard: {
    minHeight: 180,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  dataLoadingText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 10,
  },

  revenueHero: {
    borderRadius: 23,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowRadius: 14,
    elevation: 6,
  },

  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  heroValue: {
    color: "#ffffff",
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 5,
  },

  heroMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.09)",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 18,
  },

  miniMetric: {
    flex: 1,
    alignItems: "center",
  },

  miniMetricValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  miniMetricLabel: {
    color: "#bfdbfe",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },

  heroDivider: {
    width: 1,
    height: 29,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  sectionHeading: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 23,
    marginBottom: 11,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metricCard: {
    width: "48.5%",
    minHeight: 153,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dce4ec",
    padding: 14,
  },

  metricIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  metricIconBlue: {
    backgroundColor: "#dbeafe",
  },

  metricIconAmber: {
    backgroundColor: "#fef3c7",
  },

  metricIconPurple: {
    backgroundColor: "#ede9fe",
  },

  metricIconTeal: {
    backgroundColor: "#ccfbf1",
  },

  metricEmoji: {
    fontSize: 17,
  },

  metricTitle: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 11,
  },

  metricValue: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },

  metricSubtitle: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },

  healthCard: {
    backgroundColor: "#ffffff",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#dce4ec",
    padding: 16,
    marginTop: 16,
  },

  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  healthTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "900",
  },

  healthSubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 4,
  },

  healthPercent: {
    color: "#15803d",
    fontSize: 24,
    fontWeight: "900",
  },

  healthTrack: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 17,
  },

  healthFill: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 999,
  },

  healthStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  healthStat: {
    flexDirection: "row",
    alignItems: "center",
  },

  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  dotHealthy: {
    backgroundColor: "#16a34a",
  },

  dotWarning: {
    backgroundColor: "#f59e0b",
  },

  dotCritical: {
    backgroundColor: "#dc2626",
  },

  healthStatLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
  },

  healthStatValue: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 4,
  },

  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#dce4ec",
    padding: 16,
    marginTop: 16,
  },

  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionCardTitle: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionCardSubtitle: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 3,
  },

  sectionAction: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "900",
  },

  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },

  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  alertCritical: {
    backgroundColor: "#fee2e2",
  },

  alertWarning: {
    backgroundColor: "#fef3c7",
  },

  rowTitle: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
  },

  rowSubtitle: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 3,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  allHealthyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },

  allHealthyIcon: {
    width: 38,
    height: 38,
    lineHeight: 38,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  allHealthyTitle: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "900",
  },

  allHealthyText: {
    color: "#15803d",
    fontSize: 10,
    marginTop: 3,
  },

  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },

  rankCircle: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  rankText: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "900",
  },

  sellerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  sellerValue: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "900",
  },

  barTrack: {
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 7,
  },

  barFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 999,
  },

  chart: {
    marginLeft: -11,
    borderRadius: 12,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },

  valueText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 15,
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  emptyText: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },

  quickActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  quickAction: {
    width: "48.5%",
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce4ec",
    borderRadius: 17,
    padding: 13,
  },

  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  quickActionIconText: {
    color: "#1d4ed8",
    fontSize: 18,
    fontWeight: "900",
  },

  quickActionTitle: {
    flex: 1,
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "900",
  },

  exportButton: {
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 16,
    marginTop: 18,
  },

  exportButtonIcon: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    marginRight: 8,
  },

  exportButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  proScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  proIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor:
      "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  proIcon: {
    fontSize: 38,
  },

  proTitle: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 22,
  },

  proDescription: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },

  proButton: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 14,
    marginTop: 25,
  },

  proButtonText: {
    color: "#1d4ed8",
    fontSize: 15,
    fontWeight: "900",
  },
});

export default Dashboard;
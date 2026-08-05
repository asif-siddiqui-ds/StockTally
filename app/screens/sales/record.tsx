import ScreenWrapper from "@/components/ScreenWrapper";
import {
  getActiveCustomers,
} from "@/lib/customerStorage";
import {
  getSaleItems,
  getStockItems,
  saveAllSales,
  saveStockMovement,
  updateStockQuantity,
} from "@/lib/storage";
import {
  Customer,
  getCustomerDisplayName,
  getCustomerSecondaryLabel,
} from "@/types/customer";
import { isGuest } from "@/utils/guest";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import uuid from "react-native-uuid";

const MAX_GUEST_SALES = 50;

const WALK_IN_CUSTOMER = "__walk_in__";
const ADD_NEW_CUSTOMER = "__add_new_customer__";

type CustomerDropdownOption = {
  label: string;
  value: string;
};

type SaleLineItem = {
  stockItemId: string;
  name: string;
  quantity: number;
  price: number;
};

const RecordSale = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [stockItemId, setStockItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState(WALK_IN_CUSTOMER);
  const [buyerName, setBuyerName] = useState("Walk-in Customer");

  const [saleItems, setSaleItems] = useState<SaleLineItem[]>([]);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const textColor = isDark ? "#ffffff" : "#333333";

  const loadScreenData = useCallback(async () => {
    try {
      const [items, activeCustomers] = await Promise.all([
        getStockItems(),
        getActiveCustomers(),
      ]);

      setStockItems(items || []);
      setCustomers(activeCustomers || []);

      /*
       * Keep the current selected customer after returning from
       * another screen. If that customer no longer exists, reset
       * the sale to Walk-in Customer.
       */
      if (
        selectedCustomerId !== WALK_IN_CUSTOMER &&
        selectedCustomerId !== ADD_NEW_CUSTOMER
      ) {
        const selectedStillExists = activeCustomers.some(
          (customer) => customer.id === selectedCustomerId,
        );

        if (!selectedStillExists) {
          setSelectedCustomerId(WALK_IN_CUSTOMER);
          setBuyerName("Walk-in Customer");
        }
      }
    } catch (error) {
      console.error("Failed to load sale screen data:", error);
      Alert.alert(
        "Error",
        "Could not load stock items or customers.",
      );
    }
  }, [selectedCustomerId]);

  useFocusEffect(
    useCallback(() => {
      loadScreenData();
    }, [loadScreenData]),
  );

  const customerOptions = useMemo<CustomerDropdownOption[]>(
    () => [
      {
        label: "Walk-in Customer",
        value: WALK_IN_CUSTOMER,
      },
      ...customers.map((customer) => {
        const primary = getCustomerDisplayName(customer);
        const secondary = getCustomerSecondaryLabel(customer);

        return {
          label: secondary
            ? `${primary} · ${secondary}`
            : primary,
          value: customer.id,
        };
      }),
      {
        label: "➕ Add New Customer",
        value: ADD_NEW_CUSTOMER,
      },
    ],
    [customers],
  );

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) => customer.id === selectedCustomerId,
      ) || null,
    [customers, selectedCustomerId],
  );

  const saleTotal = useMemo(
    () =>
      saleItems.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0) *
            Number(item.price || 0),
        0,
      ),
    [saleItems],
  );

  const applyCustomerSelection = (
    option: CustomerDropdownOption,
  ) => {
    if (option.value === ADD_NEW_CUSTOMER) {
      /*
       * The customer list reloads automatically when this screen
       * receives focus again after creating the customer.
       */
      router.push({
        pathname: "/screens/customers/create",
        params: {
          returnTo: "recordSale",
        },
      });

      return;
    }

    if (option.value === WALK_IN_CUSTOMER) {
      setSelectedCustomerId(WALK_IN_CUSTOMER);
      setBuyerName("Walk-in Customer");
      return;
    }

    const customer = customers.find(
      (item) => item.id === option.value,
    );

    if (!customer) {
      Alert.alert(
        "Customer Not Found",
        "The selected customer could not be found.",
      );
      return;
    }

    setSelectedCustomerId(customer.id);
    setBuyerName(getCustomerDisplayName(customer));
  };

  const validateItem = (): boolean => {
    if (
      !stockItemId ||
      quantity === "" ||
      price === ""
    ) {
      Alert.alert(
        "Missing Details",
        "Please select an item and enter quantity and price.",
      );
      return false;
    }

    const stockItem = stockItems.find(
      (item) => item.id === stockItemId,
    );

    if (!stockItem) {
      Alert.alert(
        "Error",
        "Selected stock item not found.",
      );
      return false;
    }

    const requestedQuantity = Number(quantity);
    const availableQuantity = Number(
      stockItem.quantity || 0,
    );

    /*
     * Include quantities already added to this unsaved sale so
     * the same stock item cannot be added twice beyond availability.
     */
    const alreadyAddedQuantity = saleItems
      .filter(
        (item) => item.stockItemId === stockItemId,
      )
      .reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0,
      );

    if (
      requestedQuantity + alreadyAddedQuantity >
      availableQuantity
    ) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${Math.max(
          availableQuantity - alreadyAddedQuantity,
          0,
        )} ${stockItem.unit || "units"} remain available for this sale.`,
      );
      return false;
    }

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      Alert.alert(
        "Invalid Quantity",
        "Quantity must be a positive whole number.",
      );
      return false;
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      Alert.alert(
        "Invalid Price",
        "Enter a valid unit price.",
      );
      return false;
    }

    return true;
  };

  const handleAddItem = () => {
    if (!validateItem()) return;

    const selectedStock = stockItems.find(
      (item) => item.id === stockItemId,
    );

    if (!selectedStock) return;

    const newItem: SaleLineItem = {
      stockItemId,
      name: selectedStock.name || itemName,
      quantity: Number(quantity),
      price: Number(price),
    };

    setSaleItems((previous) => [
      ...previous,
      newItem,
    ]);

    setStockItemId("");
    setItemName("");
    setQuantity("");
    setPrice("");

    Alert.alert(
      "Added",
      `${selectedStock.name} added to the sale.`,
    );
  };

  const removeSaleItem = (index: number) => {
    setSaleItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const handleSaveSale = async () => {
    if (saving) return;

    if (await isGuest()) {
      const currentSales = await getSaleItems();

      if (currentSales.length >= MAX_GUEST_SALES) {
        Alert.alert(
          "Limit Reached",
          `You can only record up to ${MAX_GUEST_SALES} sales in the free version. Upgrade to Pro for unlimited access.`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Upgrade",
              onPress: () =>
                router.push("/paywall"),
            },
          ],
        );

        return;
      }
    }

    if (!buyerName.trim()) {
      Alert.alert(
        "Customer Required",
        "Please select a customer or use Walk-in Customer.",
      );
      return;
    }

    if (saleItems.length === 0) {
      Alert.alert(
        "No Items",
        "Please add at least one item before saving.",
      );
      return;
    }

    Alert.alert(
      "Payment Status",
      "Mark this sale as Paid or Unpaid?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unpaid",
          style: "destructive",
          onPress: () => saveSale(false),
        },
        {
          text: "Paid",
          onPress: () => saveSale(true),
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const saveSale = async (
    paidStatus: boolean,
  ) => {
    try {
      setSaving(true);

      const salesId = uuid.v4() as string;
      const date = new Date().toISOString();
      const existingSales = await getSaleItems();

      /*
       * Keep buyerName for compatibility with the existing sales
       * list, while customerId creates a permanent link to the
       * customer database.
       */
      const customerId =
        selectedCustomerId === WALK_IN_CUSTOMER
          ? undefined
          : selectedCustomerId;

      const customerName = selectedCustomer
        ? getCustomerDisplayName(selectedCustomer)
        : buyerName.trim();

      const newSaleRecords = saleItems.map(
        (item) => ({
          salesId,
          stockItemId: item.stockItemId,
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),

          customerId,
          buyerName: customerName,

          /*
           * Optional customer snapshots preserve useful information
           * even if the saved customer is edited later.
           */
          // customerCompany:
          //   selectedCustomer?.companyName || "",
          // customerContact:
          //   selectedCustomer?.contactName || "",
          // customerEmail:
          //   selectedCustomer?.email || "",
          // customerPhone:
          //   selectedCustomer?.phone || "",

          paid: paidStatus,
          type: "single_sale",
          date,
          synced: false,
          syncedAt: "",
        }),
      );

      await saveAllSales([
        ...existingSales,
        ...newSaleRecords,
      ]);

      for (const item of saleItems) {
        const stockItem = stockItems.find(
          (stock) =>
            stock.id === item.stockItemId,
        );

        if (!stockItem) continue;

        const oldQuantity = Number(
          stockItem.quantity || 0,
        );
        const soldQuantity = Number(
          item.quantity || 0,
        );
        const newQuantity =
          oldQuantity - soldQuantity;

        if (newQuantity < 0) {
          throw new Error(
            `${stockItem.name} no longer has enough stock.`,
          );
        }

        await updateStockQuantity(
          item.stockItemId,
          newQuantity,
        );

        await saveStockMovement({
          stockItemId: item.stockItemId,
          itemName:
            item.name || stockItem.name,
          type: "OUT",
          quantity: soldQuantity,
          source: "QUICK_SALE",
          sourceLabel: "Quick sale",
          balanceAfter: newQuantity,
          referenceId: salesId,
          referenceType: "SALE",
          note: paidStatus
            ? `Paid quick sale to ${customerName}`
            : `Unpaid quick sale to ${customerName}`,
        });
      }

      Alert.alert(
        "Sale Recorded",
        paidStatus
          ? "Paid sale recorded successfully."
          : "Unpaid sale recorded successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/screens/stock/stockOutHistory",
                params: {
                  salesId,
                },
              }),
          },
        ],
      );
    } catch (error: any) {
      console.error(
        "Error saving sale:",
        error,
      );

      Alert.alert(
        "Error",
        error.message ||
          "Failed to record sale.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      backgroundColor={
        isDark ? "#0A0A0A" : "#ffffff"
      }
    >
      <LinearGradient
        colors={[
          "#bbc5d0ff",
          "#1b263b",
          "#415a77",
        ]}
        style={styles.gradient}
      >
        <View style={styles.scrollContainer}>
          <View style={styles.form}>
            <Text style={styles.title}>
              Record Sale
            </Text>

            <Text style={styles.subtitle}>
              Select a saved customer or use
              Walk-in Customer.
            </Text>

            <Text style={styles.label}>
              Customer
            </Text>

            <Dropdown
              style={styles.dropdown}
              containerStyle={
                styles.dropdownContainer
              }
              selectedTextStyle={
                styles.selectedTextStyle
              }
              placeholderStyle={
                styles.placeholderStyle
              }
              itemTextStyle={
                styles.itemTextStyle
              }
              data={customerOptions}
              labelField="label"
              valueField="value"
              placeholder="Select customer"
              value={selectedCustomerId}
              onChange={
                applyCustomerSelection
              }
              maxHeight={300}
            />

            {selectedCustomer ? (
              <View
                style={
                  styles.customerSummary
                }
              >
                <Text
                  style={
                    styles.customerSummaryName
                  }
                >
                  {getCustomerDisplayName(
                    selectedCustomer,
                  )}
                </Text>

                {getCustomerSecondaryLabel(
                  selectedCustomer,
                ) ? (
                  <Text
                    style={
                      styles.customerSummaryDetail
                    }
                  >
                    {getCustomerSecondaryLabel(
                      selectedCustomer,
                    )}
                  </Text>
                ) : null}

                {selectedCustomer.phone ? (
                  <Text
                    style={
                      styles.customerSummaryDetail
                    }
                  >
                    {selectedCustomer.phone}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.sectionDivider} />

            <Text style={styles.label}>
              Stock Item
            </Text>

            <Dropdown
              style={styles.dropdown}
              containerStyle={
                styles.dropdownContainer
              }
              selectedTextStyle={
                styles.selectedTextStyle
              }
              placeholderStyle={
                styles.placeholderStyle
              }
              itemTextStyle={
                styles.itemTextStyle
              }
              data={stockItems.map((item) => ({
                label: `${item.name} (${item.quantity} in stock)`,
                value: item.id,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Stock Item"
              value={stockItemId}
              onChange={(item) => {
                setStockItemId(item.value);

                const selectedItem =
                  stockItems.find(
                    (stock) =>
                      stock.id === item.value,
                  );

                if (selectedItem) {
                  setItemName(
                    selectedItem.name,
                  );

                  /*
                   * Use salePrice when available, but do not
                   * overwrite a price the user already entered.
                   */
                  if (
                    price === "" &&
                    selectedItem.salePrice !==
                      undefined
                  ) {
                    setPrice(
                      Number(
                        selectedItem.salePrice ||
                          0,
                      ),
                    );
                  }
                }
              }}
              maxHeight={300}
            />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>
                  Quantity
                </Text>

                <TextInput
                  value={
                    quantity === ""
                      ? ""
                      : String(quantity)
                  }
                  onChangeText={(value) =>
                    setQuantity(
                      value === ""
                        ? ""
                        : parseInt(
                            value,
                            10,
                          ),
                    )
                  }
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  style={styles.input}
                  placeholder="Qty"
                  placeholderTextColor={
                    "#666666"
                  }
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.label}>
                  Unit Price
                </Text>

                <TextInput
                  value={
                    price === ""
                      ? ""
                      : String(price)
                  }
                  onChangeText={(value) =>
                    setPrice(
                      value === ""
                        ? ""
                        : parseFloat(value),
                    )
                  }
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={
                    Keyboard.dismiss
                  }
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={
                    "#666666"
                  }
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleAddItem}
                style={styles.buttonFlex}
                disabled={saving}
              >
                <LinearGradient
                  colors={[
                    "#2196F3",
                    "#0D47A1",
                  ]}
                  style={
                    styles.gradientButton
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    + Add Item
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveSale}
                style={styles.buttonFlex}
                disabled={saving}
              >
                <LinearGradient
                  colors={[
                    "#4CAF50",
                    "#2E7D32",
                  ]}
                  style={
                    styles.gradientButton
                  }
                >
                  {saving ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Save Sale
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {saleItems.length > 0 ? (
              <View
                style={
                  styles.previewContainer
                }
              >
                <View
                  style={
                    styles.previewHeader
                  }
                >
                  <Text
                    style={
                      styles.previewTitle
                    }
                  >
                    Added Items
                  </Text>

                  <Text
                    style={
                      styles.previewTotal
                    }
                  >
                    £{saleTotal.toFixed(2)}
                  </Text>
                </View>

                {saleItems.map(
                  (item, index) => (
                    <View
                      key={`${item.stockItemId}-${index}`}
                      style={
                        styles.itemPreview
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.previewItemName,
                            {
                              color:
                                textColor,
                            },
                          ]}
                        >
                          {index + 1}.{" "}
                          {item.name}
                        </Text>

                        <Text
                          style={
                            styles.previewItemMeta
                          }
                        >
                          {item.quantity} × £
                          {item.price.toFixed(
                            2,
                          )}{" "}
                          = £
                          {(
                            item.quantity *
                            item.price
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          removeSaleItem(
                            index,
                          )
                        }
                        style={
                          styles.removeButton
                        }
                      >
                        <Text
                          style={
                            styles.removeText
                          }
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ),
                )}
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: "100%",
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 150,
  },

  form: {
    backgroundColor:
      "rgba(239, 230, 230, 1)",
    borderRadius: 16,
    padding: 20,
  },

  title: {
    color: "#111827",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 6,
  },

  label: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 7,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#ffffff",
  },

  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },

  dropdownContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },

  selectedTextStyle: {
    color: "#111827",
    fontSize: 15,
  },

  placeholderStyle: {
    color: "#6b7280",
    fontSize: 15,
  },

  itemTextStyle: {
    color: "#111827",
    fontSize: 15,
  },

  customerSummary: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },

  customerSummaryName: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "900",
  },

  customerSummaryDetail: {
    color: "#475569",
    fontSize: 13,
    marginTop: 3,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#d1d5db",
    marginTop: 20,
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
  },

  inputHalf: {
    flex: 1,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  buttonFlex: {
    flex: 1,
  },

  gradientButton: {
    minHeight: 50,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  previewContainer: {
    marginTop: 24,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  previewTitle: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 18,
  },

  previewTotal: {
    color: "#15803d",
    fontWeight: "900",
    fontSize: 19,
  },

  itemPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    borderRadius: 8,
    backgroundColor:
      "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 7,
  },

  previewItemName: {
    fontSize: 14,
    fontWeight: "700",
  },

  previewItemMeta: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 3,
  },

  removeButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  removeText: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "900",
  },
});

export default RecordSale;
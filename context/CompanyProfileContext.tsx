import { useAuth } from "@/context/AuthContext";
import {
    CompanyProfile,
    getCompanyProfile,
    saveCompanyProfile,
} from "@/lib/storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type CompanyProfileContextType = {
  companyProfile: CompanyProfile | null;
  loadingCompanyProfile: boolean;
  refreshCompanyProfile: () => Promise<void>;
  updateCompanyProfile: (
    profile: Omit<CompanyProfile, "id" | "synced" | "syncedAt">
  ) => Promise<CompanyProfile>;
};

const CompanyProfileContext = createContext<CompanyProfileContextType | undefined>(
  undefined
);

export function CompanyProfileProvider({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth();

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [loadingCompanyProfile, setLoadingCompanyProfile] = useState(true);

  const refreshCompanyProfile = async () => {
    try {
      setLoadingCompanyProfile(true);

      const userId = user?.$id || "guest";
      const profile = await getCompanyProfile(userId);

      setCompanyProfile(profile);
    } catch (error) {
      console.warn("⚠️ Failed to refresh company profile:", error);
      setCompanyProfile(null);
    } finally {
      setLoadingCompanyProfile(false);
    }
  };

  const updateCompanyProfile = async (
    profile: Omit<CompanyProfile, "id" | "synced" | "syncedAt">
  ) => {
    const savedProfile = await saveCompanyProfile(profile);
    setCompanyProfile(savedProfile);
    return savedProfile;
  };

  useEffect(() => {
    if (authLoading) return;
    refreshCompanyProfile();
  }, [user?.$id, authLoading]);

  return (
    <CompanyProfileContext.Provider
      value={{
        companyProfile,
        loadingCompanyProfile,
        refreshCompanyProfile,
        updateCompanyProfile,
      }}
    >
      {children}
    </CompanyProfileContext.Provider>
  );
}

export function useCompanyProfile() {
  const context = useContext(CompanyProfileContext);

  if (!context) {
    throw new Error(
      "useCompanyProfile must be used inside CompanyProfileProvider"
    );
  }

  return context;
}
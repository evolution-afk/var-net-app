import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface UserContextValue {
  telegramId: string | null;
  walletBalance: number;
  isLoading: boolean;
  error: string | null;
  setUser: (telegramId: string, walletBalance: number) => void;
  setWalletBalance: (walletBalance: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setUser = useCallback((id: string, balance: number) => {
    setTelegramId(id);
    setWalletBalance(balance);
  }, []);
  const updateWalletBalance = useCallback((balance: number) => {
    setWalletBalance(balance);
  }, []);

  const value = useMemo(
    () => ({
      telegramId,
      walletBalance,
      isLoading,
      error,
      setUser,
      setWalletBalance: updateWalletBalance,
      setLoading,
      setError,
    }),
    [telegramId, walletBalance, isLoading, error, setUser, updateWalletBalance],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

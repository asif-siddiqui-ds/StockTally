import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Models, OAuthProvider } from "react-native-appwrite";

import { makeRedirectUri } from "expo-auth-session";

import { account } from "@/appwrite";

const AuthContext = createContext<{
    user: Models.User<{}> | null;
    session: Models.Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    handleSuccessOrFailure: (secret: string, userId: string) => Promise<void>;
}>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => {},
    signInWithGoogle: async () => {},
    handleSuccessOrFailure: async () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
        null
    );
    const [session, setSession] = useState<Models.Session | null>(null);
    const hasInitialised = useRef(false);

    const checkSessionFromAppwrite = async () => {
        try {
            console.log("Checking user from appwrite");
            const responseSession = await account.getSession("current");
            setSession(responseSession);
            const responseUser = await account.get();
            setUser(responseUser);
        } catch (error) {
            if (
                error instanceof Error &&
                "type" in error &&
                (error as any).type.includes("general_unauthorized_scope")
            ) {
                const loggedIn = await SecureStore.getItemAsync("loggedIn");
                if (loggedIn) {
                    SecureStore.deleteItemAsync("loggedIn");
                    console.log(
                        "Logged out because session deleted from backend"
                    );
                }
                setSession(null);
                setUser(null);
                await SecureStore.deleteItemAsync("session");
                await SecureStore.deleteItemAsync("user");
            } else {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        if (!hasInitialised.current) {
            init();
            hasInitialised.current = true;
        }
    }, []);

    const init = async () => {
        await checkAuth();
    };

    const checkAuth = async () => {
        try {
            const sessionString = await SecureStore.getItemAsync("session");
            if (sessionString) {
                console.log("Session string", sessionString);
                setSession(JSON.parse(sessionString));
            }
            const userString = await SecureStore.getItemAsync("user");
            if (userString) {
                console.log("User string", userString);
                setUser(JSON.parse(userString));
            }
            setLoading(false);
            await checkSessionFromAppwrite();
        } catch (error) {
            console.error("Error checking auth:", error);
        }
    };

    const signInWithGoogle = async () => {
        console.log("Signing in with Google");
        const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
        if (!deepLink.hostname) {
            deepLink.hostname = "localhost";
        }

        const scheme = `${deepLink.protocol}//`;

        const provider = OAuthProvider.Google;

        const loginUrl = await account.createOAuth2Token(
            provider,
            `${deepLink}`,
            `${deepLink}`
        );

        console.log("Opening auth session with Google");

        WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
        console.log("Sign in complete from Google");
    };

    const signOut = async () => {
        console.log("Signing out");
        setLoading(true);
        try {
            await account.deleteSession("current");
            setSession(null);
            setUser(null);
            await SecureStore.deleteItemAsync("session");
            await SecureStore.deleteItemAsync("user");
            await SecureStore.deleteItemAsync("loggedIn");
            console.log("Signed out");
        } catch (error) {
            if (
                error instanceof Error &&
                "type" in error &&
                (error as any).type.includes("general_unauthorized_scope")
            ) {
                setSession(null);
                setUser(null);
                await SecureStore.deleteItemAsync("session");
                await SecureStore.deleteItemAsync("user");
                await SecureStore.deleteItemAsync("loggedIn");
                console.log("Signed out");
            } else {
                console.error(error);
            }
        }
        setLoading(false);
    };

    const handleSuccessOrFailure = async (secret: string, userId: string) => {
        try {
            console.log("Handling success or failure", secret, userId);
            if (userId && secret) {
                await account.createSession(userId, secret);

                const session = await account.getSession("current");
                setSession(session);
                const user = await account.get();
                setUser(user);

                await SecureStore.setItemAsync(
                    "session",
                    JSON.stringify(session)
                );
                await SecureStore.setItemAsync("user", JSON.stringify(user));
                await SecureStore.setItemAsync("loggedIn", "true");
            } else {
                throw new Error("Missing userId or secret in the response URL");
            }
        } catch (error) {
            console.error("Error handling success or failure:", error);
        }
    };

    const contextData = {
        user,
        session,
        loading,
        signOut,
        signInWithGoogle,
        handleSuccessOrFailure,
    };
    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

const uAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext, AuthProvider, uAuth };


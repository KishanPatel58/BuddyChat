import { AuthState, User } from "@/types";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { API_BASE_URL } from "@/constants/config";
import { useAuth, useUser } from "@clerk/expo";
export const api = axios.create({
    baseURL: API_BASE_URL
})
const _tokenRef = { current: null as string | null };
interface AppContextType {
    auth: AuthState;
    logout: () => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({ token: null, user: null, loading: true })
    const [users, setUsers] = useState<User[]>([])

    const { getToken, isLoaded: authLoaded, isSignedIn, signOut } = useAuth()
    const {user: clerkUser, isLoaded: userLoaded} = useUser();
    const getTokenRef = useRef(getToken);

    const logout = useCallback(
        async () => {
            _tokenRef.current = null;
            await signOut();
            setAuth({token: null, user: null, loading: false})
        },
        [signOut]
    )
    const updateUser = useCallback(
        async (user: User) => {
            setAuth((prev)=>({...prev, user}))
        },
        []
    )
    useEffect(()=>{
        getTokenRef.current = getToken;
    },[getToken])
    // attach clerk token on every request.
    useEffect(()=>{
        const interceptor = api.interceptors.request.use(async (config)=>{
            try {
                if(isSignedIn){
                    const token = await getTokenRef.current();
                    if(token){
                        config.headers.Authorization = `Bearer ${token}`;
                        _tokenRef.current = token;
                    }
                }
            } catch (error) {
                console.error("Axios Interceptor Error:",error)
            }
            return config;
        })
        return () => {
            api.interceptors.request.eject(interceptor);
        }
    },[isSignedIn])
    // Keep local Authstate in sync with Clerk profile state.
    useEffect(()=>{
        if(!authLoaded || !userLoaded) return;
        if(isSignedIn && clerkUser){
            const mappedUser: User = {
                _id: clerkUser.id,
                name: clerkUser.fullName || "Anonymous",
                email: clerkUser.emailAddresses[0].emailAddress || "",
                handle: clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || clerkUser.id,
                avatar: clerkUser.imageUrl || "",
                bio: (clerkUser.publicMetadata?.bio as string) || "Hey there! I am using BuddyChat.",
                isOnline: true,
                lastSeen: new Date().toISOString()
            }
            setAuth({token: _tokenRef.current, user: mappedUser, loading: false});
        } else {
            setAuth({token: null, user: null, loading: false})
        }
    },[isSignedIn, authLoaded, userLoaded, clerkUser])
    return (
        <AppContext.Provider value={{ auth, logout, updateUser, users, setUsers }}>
            {children}
        </AppContext.Provider>
    )
}

export function UseApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("UseApp must be use inside AppProvider.");
    return ctx;
}
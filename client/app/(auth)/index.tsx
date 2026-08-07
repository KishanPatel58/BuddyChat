import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from '@/assets/styles/AuthScreen.styles'
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { LinearGradient } from "expo-linear-gradient"
import { Colors } from '@/constants/Colors'
import { SvgXml } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'

type Mode = "login" | "register"
export default function AuthScreen() {
    const [mode, setMode] = useState<Mode>("register")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [handle, setHandle] = useState("")
    const router = useRouter();
    const svgMarkup = `<svg width="86" height="82" viewBox="0 0 86 82" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40.645 0S35.39 16.94 27.453 24.957C18.847 33.648 0 38.505 0 38.505h25.645c8.284 0 15-6.716 15-15zm0 82S35.39 65.06 27.453 57.043C18.847 48.352 0 43.495 0 43.495h25.645c8.284 0 15 6.716 15 15zm4.277-82s5.254 16.94 13.191 24.957c8.606 8.691 27.453 13.548 27.453 13.548H59.922c-8.284 0-15-6.716-15-15zm0 82s5.254-16.94 13.191-24.957c8.606-8.691 27.453-13.548 27.453-13.548H59.922c-8.284 0-15 6.716-15 15z" fill="#fff"/></svg>`
    const handleSubmit = async () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setVerifying(true)
        }, 3000)
    }
    const handleVerify = async () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            router.replace("/(tabs)")
        }, 3000)
    }
    if (verifying) {
        return (
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                        {/* Logo */}
                        <View style={styles.logoRow}>
                            <LinearGradient colors={[Colors.primary, Colors.primaryContainer]} style={styles.logoBox}>
                                <SvgXml xml={svgMarkup} width="50%" height="50%" />
                            </LinearGradient>
                            <Text style={styles.appName}>BuddyChat</Text>
                        </View>
                        {/* Hero Text */}
                        <Text style={styles.heading}>Verify Email</Text>
                        <Text style={styles.subheading}>We have sent a 6-digit verification code to {email}.</Text>

                        {/* Form */}
                        <View style={styles.form}>

                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>Verification Code</Text>
                                <TextInput
                                    style={styles.input}
                                    value={verificationCode}
                                    onChangeText={setVerificationCode}
                                    placeholder='Enter 6-digit code'
                                    placeholderTextColor={Colors.outlineVariant}
                                    keyboardType='number-pad'
                                    autoCapitalize='none'
                                />
                            </View>
                            {/* Back to Sign up link */}
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleText}>Did not receive a code?</Text>
                                <TouchableOpacity onPress={() => setVerifying(false)}>
                                    <Text style={styles.toggleLink}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Submit */}
                            <TouchableOpacity
                                disabled={loading}
                                activeOpacity={0.88}
                                style={styles.btnWrapper}
                                onPress={handleVerify}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryContainer]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.btn}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Colors.onPrimary} size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.btnText}>Verify Code</Text>
                                            <Ionicons name='arrow-forward' size={18} color={Colors.onPrimary} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Logo */}
                    <View style={styles.logoRow}>
                        <LinearGradient colors={[Colors.primary, Colors.primaryContainer]} style={styles.logoBox}>
                            <SvgXml xml={svgMarkup} width="50%" height="50%" />
                        </LinearGradient>
                        <Text style={styles.appName}>BuddyChat</Text>
                    </View>
                    {/* Hero Text */}
                    <Text style={styles.heading}>{mode === "login" ? "Welcome back 👋" : "Create Account"}</Text>
                    <Text style={styles.subheading}>{mode === "login" ? "Sign in to continue chatting." : "Fill in your details to get started."}</Text>

                    {/* Form */}
                    <View style={styles.form}>
                        {mode === "register" && (
                            <>
                                <View style={styles.field}>
                                    <Text style={styles.fieldLabel}>Full Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder='Your name'
                                        placeholderTextColor={Colors.outlineVariant}
                                        autoCapitalize='words'
                                    />
                                </View>
                                <View style={styles.field}>
                                    <Text style={styles.fieldLabel}>Username Handle</Text>
                                    <View style={styles.handleRow}>
                                        <Text style={styles.atSign}>@</Text>
                                        <TextInput
                                            style={[styles.input, styles.handleInput]}
                                            value={handle}
                                            onChangeText={(v) => setHandle(v.toLowerCase().replace(/\s/g, ""))}
                                            placeholder='username'
                                            placeholderTextColor={Colors.outlineVariant}
                                            autoCapitalize='none'
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={(v) => setEmail(v.toLowerCase())}
                                placeholder='you@example.com'
                                placeholderTextColor={Colors.outlineVariant}
                                keyboardType='email-address'
                                autoCapitalize='none'
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Password</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder='••••••••••'
                                placeholderTextColor={Colors.outlineVariant}
                                secureTextEntry
                            />
                        </View>
                        {/* Toggle Mode */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleText}>
                                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                            </Text>
                            <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")}>
                                <Text style={styles.toggleLink}>{mode === "login" ? "Sign up" : "Sign in"}</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Submit */}
                        <TouchableOpacity
                            disabled={loading}
                            activeOpacity={0.88}
                            style={styles.btnWrapper}
                            onPress={handleSubmit}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.primaryContainer]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.btn}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.onPrimary} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.btnText}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
                                        <Ionicons name='arrow-forward' size={18} color={Colors.onPrimary} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
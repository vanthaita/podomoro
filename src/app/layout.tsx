// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Pomodoro Timer: Boost Your Focus & Productivity",
    description:
        "A free online Pomodoro timer to help you focus and manage your time effectively. Track your work sessions, take short breaks, and boost your productivity.",
    keywords: [
        "pomodoro",
        "pomodoro timer",
        "focus timer",
        "productivity",
        "time management",
        "work timer",
        "study timer",
        "online timer",
        "break timer",
        "free pomodoro",
        "pomodoro technique",
        "timeboxing",
        "task management",
        "concentration",
        "efficient work",
        "work-life balance",
        "student tool",
        "remote work",
        "online learning",
        "free tool",
        "focus app",
        "productive app",
        "làm việc hiệu quả",
        "quản lý thời gian",
        "tập trung",
        "kỹ thuật pomodoro",
        "nghỉ giải lao",
        "công cụ học tập",
        "công cụ làm việc",
        "hẹn giờ làm việc",
        "hẹn giờ học tập",
        "生産性",
        "ポモドーロ",
        "ポモドーロテクニック",
        "時間管理",
        "集中",
        "作業タイマー",
        "勉強タイマー",
        "休憩タイマー",
        "無料タイマー",
        "オンラインツール",
        "集中アプリ",
        "効率的な作業",
    ],
    openGraph: {
        title: "Pomodoro Timer: Boost Your Focus & Productivity",
        description:
            "A free online Pomodoro timer to help you focus and manage your time effectively. Track your work sessions, take short breaks, and boost your productivity.",
        url: "https://podomoro-y3e3.vercel.app/",
        siteName: "Pomodoro Timer",
         locale: 'en_US',
        type: 'website'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
                <ToastContainer />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
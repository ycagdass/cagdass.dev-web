import { Geist } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SITE_CONFIG } from "@/config/config"
import { Toaster } from "@/components/ui/sonner"
import { defaultMetadata } from "@/config/metadata"
import LocaleProvider from "@/i18n/LocaleProvider"
import LayoutShell from "@/components/LayoutShell"
import Script from "next/script";

const appleTitle = SITE_CONFIG.siteName
const statsScriptUrl = process.env.NEXT_PUBLIC_STATS_SCRIPT_URL
const statsWebsiteId = process.env.NEXT_PUBLIC_STATS_WEBSITE_ID

const geist = Geist({
    subsets: ["latin"],
})

export const metadata = defaultMetadata

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <meta name="apple-mobile-web-app-title" content={appleTitle} />
        </head>
        <body
            className={`${geist.className} flex min-h-screen flex-col bg-background text-foreground`}
        >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LocaleProvider>
                <Toaster richColors closeButton />
                <LayoutShell>
                    {children}
                </LayoutShell>
            </LocaleProvider>
        </ThemeProvider>
                {statsScriptUrl && statsWebsiteId && (
                    <Script
                        src={statsScriptUrl}
                        data-website-id={statsWebsiteId}
                        strategy="afterInteractive"
                    />
                )}
        </body>
        </html>
    )
}

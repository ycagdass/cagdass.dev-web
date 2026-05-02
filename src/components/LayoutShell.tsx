"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function LayoutShell({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const reduceMotion = useReducedMotion()
    const isCms = pathname.startsWith("/cg38")

    return (
        <>
            {!isCms && <Navbar />}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    className="flex-1"
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
            {!isCms && <Footer />}
        </>
    )
}

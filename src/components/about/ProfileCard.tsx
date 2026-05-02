import {useState} from "react";
import {TFunction} from "i18next";
import {motion} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {containerVariants, itemVariants, profileVariants, socialButtonVariants} from "@/components/about/MotionSpecs";
import {Button} from "@/components/ui/button";
import {useSiteContent} from "@/hooks/useSiteContent";

const MotionButton = motion.create(Button);

export function ProfileCard({socialLinks, t}: { socialLinks: any; t: TFunction; }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const content = useSiteContent()

    return (
        <motion.div
            className="flex flex-col items-center w-full max-w-2xl"
            variants={{
                hidden: {opacity: 0, y: -20},
                visible: {opacity: 1, y: 0},
            }}
        >
            <motion.div
                className="relative mb-4 h-[180px] w-[180px]"
                variants={profileVariants}
                whileHover="hover"
            >
                <div
                    className={`relative h-full w-full overflow-hidden rounded-4xl border-2 border-border ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <Image
                        src={content.site.profileImageUrl || "/ycagdass.jpg"}
                        alt={t("profile.photo")}
                        width={180}
                        height={180}
                        className="h-full w-full object-cover"
                        priority
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            </motion.div>

            <motion.h1
                className="mb-1 text-2xl font-bold tracking-tight"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                }}
            >
                {content.about.profileTitle || content.about.name || t("profile.name")}
            </motion.h1>

            <motion.p
                className="mb-4 text-base font-light tracking-wide text-muted-foreground"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", stiffness: 300, damping: 24 },
                    },
                }}
            >
                {content.about.profileSubtitle || content.about.subtitle || t("profile.subtitle")}
            </motion.p>

            <motion.div
                className="mb-8 flex flex-wrap justify-center gap-3"
                variants={containerVariants}
            >
                {socialLinks.map((link, index) => (
                    <motion.div key={index} variants={itemVariants} custom={index}>
                        <MotionButton
                            variant="outline"
                            size="icon"
                            asChild
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            variants={socialButtonVariants}
                        >
                            <Link
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link.icon}
                            </Link>
                        </MotionButton>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}

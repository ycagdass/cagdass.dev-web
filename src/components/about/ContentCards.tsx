import {Card, CardContent} from "@/components/ui/card";
import {HugeiconsIcon} from "@hugeicons/react";
import {
    Analytics01Icon,
    ComputerProgrammingIcon,
    FireIcon, HeartCheckIcon, LinkSquareIcon, Mail02Icon,
    SourceCodeIcon, TelegramIcon,
    UserArrowLeftRightIcon
} from "@hugeicons/core-free-icons";
import {AnimatePresence, motion} from "framer-motion";
import {buttonVariants, cardVariants, containerVariants, itemVariants} from "@/components/about/MotionSpecs";
import {TFunction} from "i18next";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {ComponentType, useState} from "react";
import {ChevronDown} from "lucide-react";

const MotionButton = motion.create(Button);
const MotionCard = motion.create(Card);

export function AnimatedContactButton({href, icon, label}: { href: string; icon: any; label: string; }) {
    return (
        <motion.div variants={itemVariants}>
            <MotionButton
                variant="outline"
                className="w-full hover:bg-accent hover:text-accent-foreground"
                asChild
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
            >
                <Link href={href} className="flex items-center justify-center gap-2">
                    <HugeiconsIcon icon={icon} className="h-4 w-4"/>
                    <span>{label}</span>
                </Link>
            </MotionButton>
        </motion.div>
    );
}


export function AboutCard_Contact({
                                      classNameVal,
                                      t,
                                      email = "yusuf38cagdas@gmail.com",
                                      telegramUrl = "https://t.me/neurocagdas",
                                  }: {
    classNameVal?: string;
    t: TFunction;
    email?: string;
    telegramUrl?: string;
}) {
    return (
        <motion.div
            className={classNameVal}
            variants={containerVariants}
        >
            <AnimatedContactButton href={"/projects"} icon={SourceCodeIcon} label={t("nav.projects")}/>
            <AnimatedContactButton href={"/articles"} icon={LinkSquareIcon} label={t("nav.articles")}/>
            <AnimatedContactButton href={`mailto:${email}`} icon={Mail02Icon} label={t("nav.mail")}/>

            <motion.div variants={itemVariants} className="md:col-span-2">
                <MotionButton
                    variant="default"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    asChild
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                >
                    <Link
                        href={telegramUrl}
                        className="flex items-center justify-center gap-2"
                    >
                        <HugeiconsIcon icon={TelegramIcon} className="h-4 w-4"/>
                        <span>{t("nav.contactme")}</span>
                    </Link>
                </MotionButton>
            </motion.div>
        </motion.div>
    )
}

interface Skill {
    name: string,
    icon?: ComponentType<{ size: number, className?: string }>,
    iconUrl?: string,
    description?: string
}

export function AboutCard_Skills({
                                     classNameVal,
                                     t,
                                     skills,
                                     title,
                                 }: {
    classNameVal?: string
    t: TFunction
    skills: Skill[]
    title?: string
}) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <motion.div className={classNameVal} variants={itemVariants}>
            <Card className="p-6">
                <CardContent className="p-0">
                    <div
                        className="mb-3 flex items-start justify-between cursor-pointer select-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <HugeiconsIcon icon={ComputerProgrammingIcon} className="h-5 w-5" />
                            {title || t("tool-tech")}
                        </h4>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                    </div>

                    <div className="relative overflow-hidden">
                        <motion.div
                            className="w-full max-w-2xl"
                            variants={itemVariants}
                            animate={{
                                height: isExpanded ? "auto" : "170px",
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                        >
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
                                {skills.map((skill, index) => (
                                    <Card key={index} className={"p-1"}>
                                        <div key={index} className="flex flex-col items-center gap-1" title={skill.name}>
                                            <SkillIcon skill={skill} />
                                            <span className="text-[11px] text-center text-muted-foreground">{skill.name}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {!isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function SkillIcon({ skill }: { skill: Skill }) {
    const [failed, setFailed] = useState(false);

    if (skill.iconUrl && !failed) {
        return (
            <div className="flex h-10 w-10 items-center justify-center">
                <img
                    src={skill.iconUrl}
                    alt={skill.name}
                    className="h-8 w-8 object-contain brightness-90"
                    onError={() => setFailed(true)}
                />
            </div>
        );
    }

    if (skill.icon) {
        const Icon = skill.icon;
        return (
            <div className="flex h-10 w-10 items-center justify-center">
                <Icon size={25} />
            </div>
        );
    }

    return null;
}

export function AboutCard_Statistics({
                                         classNameVal,
                                         t,
    stats
                                     }: {
    classNameVal?: string;
    t: TFunction;
    stats: any;
}) {
    return (
        <motion.div className={classNameVal} variants={itemVariants}>
            <Card className="p-6">
                <CardContent className="p-0">
                    <div className="mb-3 flex items-start justify-between">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            <HugeiconsIcon icon={Analytics01Icon} className="h-5 w-5"/>
                            {t("stats.stats")}
                        </h4>
                    </div>
                    <motion.div
                        className="grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-4"
                        variants={containerVariants}
                    >
                        {stats.map((stat, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <MotionCard
                                    className="p-4 text-center"
                                    variants={cardVariants}
                                    whileHover="hover"
                                >
                                    <CardContent className="p-0">
                                        <div className="mb-2 flex justify-center text-primary">
                                            {stat.icon}
                                        </div>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </div>
                                    </CardContent>
                                </MotionCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export function AboutCard_AboutMe({
                                      classNameVal,
                                      t,
                                      aboutText,
                                  }: {
    classNameVal?: string;
    t: TFunction;
    aboutText?: string;
}) {
    return (
        <motion.div className={classNameVal} variants={itemVariants}>
            <Card className="p-6">
                <CardContent className="p-0">

                    <motion.div
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.p
                            className="text-sm leading-[1.65] font-medium text-foreground/80"
                            variants={itemVariants}
                        >
                            {aboutText || t("about")}
                        </motion.p>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

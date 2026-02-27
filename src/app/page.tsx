"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  CircleDot,
  CreditCard,
  Zap,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConnectPrompt } from "@/components/home/ConnectPrompt";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

function HeroMotionGraphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="relative flex aspect-square w-full max-w-[260px] items-center justify-center xs:max-w-[300px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px]"
    >
      {/* Soft glow orbs */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute h-48 w-48 rounded-full bg-primary-500/15 blur-[50px] sm:h-56 sm:w-56 sm:blur-[60px]" />
        <div className="absolute h-36 w-36 rounded-full bg-accent-500/12 blur-[40px] sm:h-44 sm:w-44 sm:blur-[50px]" />
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary-500/15"
            style={{
              width: `${48 + i * 16}%`,
              height: `${48 + i * 16}%`,
            }}
            animate={{ rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
            transition={{
              duration: 22 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500 shadow-glow-primary sm:size-2.5"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            />
          </motion.div>
        ))}

        <motion.div
          className="relative z-10 flex size-24 items-center justify-center rounded-[16px] bg-surface shadow-elevation-3 sm:size-28 lg:size-32"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="flex size-14 items-center justify-center rounded-xl bg-primary-500/10 sm:size-16 lg:size-20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25 }}
          >
            <Shield className="size-7 text-primary-600 sm:size-8 lg:size-10" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-[22%] right-[12%] size-2.5 rounded-full bg-accent-500 shadow-glow-accent sm:size-3"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
        />
      </div>
    </motion.div>
  );
}

function RevealSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-secondary">
      {/* Hero */}
      <section className="relative mx-auto max-w-container-xl px-4 py-10 sm:px-6 sm:py-14 md:py-16 lg:px-8 lg:py-20 2xl:py-24">
        <div className="grid min-h-0 items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 2xl:gap-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.15 },
              },
            }}
            className="order-2 min-w-0 lg:order-1"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-3 py-1.5 text-caption font-medium text-primary-600 sm:text-small"
            >
              <CircleDot className="size-3.5 sm:size-4" />
              Decentralised Credit Infrastructure
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-5 text-h2 font-bold leading-tight tracking-tight text-gray-900 sm:text-h1 sm:leading-[1.2] lg:text-[32px] lg:leading-[40px]"
            >
              Reputation-Based Lending
              <br />
              <span className="text-primary-600">Without Heavy Collateral</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-[38ch] text-body leading-relaxed text-gray-600 sm:mt-5 sm:text-body-lg"
            >
              CredTrust is a decentralised credit infrastructure on Creditcoin. Build your on-chain reputation, access capital, or earn yield as a lender—all with transparent, trustless smart contracts.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col flex-wrap gap-4 sm:mt-10 sm:flex-row sm:items-center"
            >
              <ConnectPrompt />
              <Link href="/loans" className="inline-flex">
                <Button
                  variant="secondary"
                  size="lg"
                  rightIcon={<ArrowRight className="size-5" />}
                >
                  Browse Loan Requests
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="order-1 flex min-h-[240px] justify-center sm:min-h-[280px] md:min-h-[320px] lg:order-2 lg:min-h-[360px] xl:min-h-[400px]"
          >
            <HeroMotionGraphic />
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <RevealSection>
        <section className="border-y border-gray-200 bg-surface py-6 sm:py-8 md:py-10">
          <div className="mx-auto max-w-container-xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 xs:gap-6 sm:gap-8">
              {[
                { value: "0%", label: "Forced Liquidation" },
                { value: "$10M+", label: "Credit Capacity" },
                { value: "2k+", label: "Active Scores" },
                { value: "100%", label: "On-Chain" },
              ].map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center"
                >
                  <p className="text-h4 font-bold text-gray-900 sm:text-h3">{value}</p>
                  <p className="mt-1 text-caption text-gray-500 sm:text-small">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Features */}
      <section className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
        <RevealSection>
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-h3 font-bold text-gray-900 sm:text-h2">
              Built for Trustless Finance
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-body text-gray-600 sm:mt-4">
              Our protocol layers transparency and reputation onto lending logic.
            </p>
          </div>
        </RevealSection>

        <div className="grid gap-4 xs:gap-5 sm:grid-cols-2 sm:gap-6 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {[
            {
              icon: Shield,
              title: "Portable Reputation",
              desc: "Your credit score lives on-chain. Use it across the ecosystem.",
              delay: 0,
            },
            {
              icon: Wallet,
              title: "No Heavy Collateral",
              desc: "Access capital based on repayment history, not over-collateralisation.",
              delay: 0.08,
            },
            {
              icon: TrendingUp,
              title: "Transparent Risk",
              desc: "Lenders see borrower history. Borrowers know exactly how they're scored.",
              delay: 0.16,
            },
            {
              icon: Shield,
              title: "Trustless Execution",
              desc: "Smart contracts handle loans and repayments. No intermediaries.",
              delay: 0.24,
            },
          ].map(({ icon: Icon, title, desc, delay }, i) => (
            <RevealSection key={title} delay={delay}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                transition={{ duration: 0.25 }}
              >
                <Card
                  variant="elevated"
                  className="h-full border-gray-200/80 transition-shadow duration-300 hover:shadow-elevation-2"
                >
                  <CardHeader>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: delay + 0.1 }}
                      className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600"
                    >
                      <Icon className="size-5 sm:size-6" strokeWidth={1.5} aria-hidden />
                    </motion.div>
                    <CardTitle className="text-h4 text-gray-900">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-small leading-relaxed text-gray-600 sm:text-body">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-surface py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-container-xl px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="mb-12 text-center sm:mb-16">
              <h2 className="text-h3 font-bold text-gray-900 sm:text-h2">
                How CredTrust Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-body text-gray-600 sm:mt-4">
                Simple steps to access or provide credit on-chain.
              </p>
            </div>
          </RevealSection>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8 md:gap-10 lg:gap-12">
            {[
              { icon: Wallet, step: "1", title: "Connect Wallet", desc: "Link your Web3 wallet to access the protocol." },
              { icon: CreditCard, step: "2", title: "Create or Fund", desc: "Request a loan as a borrower or fund requests as a lender." },
              { icon: Zap, step: "3", title: "Repay & Build", desc: "Repay on time to build your on-chain credit score." },
            ].map(({ icon: Icon, step, title, desc }, i) => (
              <RevealSection key={step} delay={i * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex size-14 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 sm:size-16"
                  >
                    <Icon className="size-6 sm:size-7" strokeWidth={1.5} />
                  </motion.div>
                  <span className="mt-3 text-caption font-semibold text-primary-600">Step {step}</span>
                  <h3 className="mt-1 text-h4 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 max-w-[260px] text-small leading-relaxed text-gray-600">{desc}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <RevealSection>
        <section className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl bg-gray-900 px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14"
          >
            <div className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div>
                <h3 className="text-h3 font-bold text-white sm:text-h2">
                  Decentralised credit is the missing piece of DeFi.
                </h3>
                <p className="mt-3 text-body text-gray-400 sm:mt-4">
                  Join the protocol that turns history into collateral.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 xs:flex-row xs:flex-wrap sm:gap-4">
                <Link href="/loans/create">
                  <Button size="lg" className="w-full shadow-glow-primary sm:w-auto">
                    Create Loan Request
                  </Button>
                </Link>
                <Link href="/loans">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                  >
                    Browse Markets
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </RevealSection>

      <footer className="border-t border-gray-200 py-8 text-center sm:py-10 md:py-12">
        <p className="text-caption text-gray-500 sm:text-small">
          © 2026 CredTrust Protocol. Built on Creditcoin.
        </p>
      </footer>
    </div>
  );
}

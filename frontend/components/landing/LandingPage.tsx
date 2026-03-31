"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { StatsSection } from "./StatsSection";
import { StrategyDemo } from "./StrategyDemo";
import { LandingFooter } from "./LandingFooter";
import { CustomCursor } from "@/components/CustomCursor";

export function LandingPage() {
  // Set dark theme for landing
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <div className="relative" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <CustomCursor />
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <StrategyDemo />
      <LandingFooter />
    </div>
  );
}

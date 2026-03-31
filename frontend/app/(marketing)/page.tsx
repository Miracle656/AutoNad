import { Navbar }        from '@/components/Navbar'
import { Hero }          from '@/components/Hero'
import { StatsBar }      from '@/components/StatsBar'
import { HowItWorks }    from '@/components/HowItWorks'
import { Marquee }       from '@/components/Marquee'
import { AgentEngine }   from '@/components/AgentEngine'
import { OrdersSection } from '@/components/OrdersSection'
import { DemoSection }   from '@/components/DemoSection'
import { Roadmap }       from '@/components/Roadmap'
import { CTA }           from '@/components/CTA'
import { Footer }        from '@/components/Footer'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Marquee />
      <AgentEngine />
      <OrdersSection />
      <DemoSection />
      <Roadmap />
      <CTA />
      <Footer />
    </main>
  )
}

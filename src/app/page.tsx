import Link from "next/link";
import { LayoutDashboard, Zap, Network, Layers, Quote } from "lucide-react";
import styles from "./landing.module.css";
import { getUserFromCookie } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getUserFromCookie();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <rect width="18" height="18" x="3" y="3" />
              <path d="M8 7v10" />
              <path d="M12 7v10" />
              <path d="M16 7v10" />
            </svg>
            LOG HORIZON
          </div>
          
          <div className={styles.nav}>
            {user ? (
              <Link href="/board" className={styles.signupBtn}>
                Go to Board
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.loginBtn}>
                  Login
                </Link>
                <Link href="/login" className={styles.signupBtn}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.heroTitle}>
          Stop Hoarding Links.<br />
          <span className={styles.heroHighlight}>Start Organizing Them.</span>
        </h1>
        
        <p className={styles.heroSubtitle}>
          Log Horizon is a visual, brutalist Kanban board designed to kill your endless bookmark folders. Paste a link, and we'll automatically fetch the preview, categorize it, and drop it on your board.
        </p>

        <Link href={user ? "/board" : "/login"} className={styles.ctaBtn}>
          Start Your Board ➔
        </Link>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={32} />
            </div>
            <h3 className={styles.featureTitle}>Auto-Scraping</h3>
            <p className={styles.featureDesc}>
              No more blind URLs. We automatically fetch the title, description, and preview image for every link you save.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Network size={32} />
            </div>
            <h3 className={styles.featureTitle}>Smart Categorization</h3>
            <p className={styles.featureDesc}>
              Drop a YouTube video? It goes to YouTube. CodePen? Into the CodePen column. The app organizes itself so you don't have to.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Layers size={32} />
            </div>
            <h3 className={styles.featureTitle}>Visual Kanban</h3>
            <p className={styles.featureDesc}>
              Drag and drop your links across columns. Maintain a spatial memory of your resources instead of losing them in a list.
            </p>
          </div>
        </div>

        {/* Social Proof / Testimonials Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Trusted by Creators</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <Quote className={styles.quoteIcon} size={48} />
              <p className={styles.testimonialText}>"I used to have hundreds of unread bookmarks in Chrome. Log Horizon made organizing my design inspiration actually fun. The visual layout is a game changer."</p>
              <div className={styles.testimonialAuthor}>Alex Rivera</div>
              <div className={styles.testimonialRole}>Frontend Developer</div>
            </div>
            
            <div className={styles.testimonialCard}>
              <Quote className={styles.quoteIcon} size={48} />
              <p className={styles.testimonialText}>"The auto-scraping feature is brilliant. I just paste a YouTube tutorial and it instantly grabs the thumbnail and drops it in the YouTube column. Flawless."</p>
              <div className={styles.testimonialAuthor}>Sarah Chen</div>
              <div className={styles.testimonialRole}>UI/UX Designer</div>
            </div>
            
            <div className={styles.testimonialCard}>
              <Quote className={styles.quoteIcon} size={48} />
              <p className={styles.testimonialText}>"A brutalist, no-nonsense tool that solves a real problem. No more lost context when saving articles for later. It's my new default homepage."</p>
              <div className={styles.testimonialAuthor}>Marcus Johnson</div>
              <div className={styles.testimonialRole}>Software Engineer</div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>FAQ</h2>
          <div className={styles.faqContainer}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Is Log Horizon free to use?</h3>
              <p className={styles.faqAnswer}>Yes, Log Horizon is completely free for individual users. You can save unlimited links and create as many custom categories as you need.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I export my data?</h3>
              <p className={styles.faqAnswer}>Your data belongs to you. Export functionality (JSON/CSV) is currently on our roadmap and will be released in an upcoming update.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How does auto-categorization work?</h3>
              <p className={styles.faqAnswer}>When you paste a link without selecting a category, our engine analyzes the domain. If it's a YouTube link, it goes to YouTube. If it's a CodePen, it goes to CodePen. Otherwise, it falls back to a general category.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Are my saved links private?</h3>
              <p className={styles.faqAnswer}>Absolutely. All your boards are strictly private to your account. We do not share your saved links or browsing habits with any third parties.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            LOG HORIZON &copy; {new Date().getFullYear()}
          </div>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Privacy Policy</a>
            <a href="#" className={styles.footerLink}>Terms of Service</a>
            <a href="#" className={styles.footerLink}>Twitter</a>
            <a href="#" className={styles.footerLink}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

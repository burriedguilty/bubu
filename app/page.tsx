import Intro from '../components/Intro';
import AboutSection from '../components/AboutSection';
import BottomSection from '../components/BottomSection';
import SkyBackground from '../components/SkyBackground';
import SectionDivider from '../components/SectionDivider';

export default function Home() {
  return (
    <SkyBackground>
      <main className="min-h-screen relative">
        {/* Intro Section that shows logo first, then hero section when clicked */}
        <Intro />
        
        {/* Divider between Hero and About */}
        <SectionDivider 
          text="$BUBU" 
          textColor="amber" 
          backgroundColor="transparent"
        />
        
        {/* About Section */}
        <AboutSection />
        
        {/* Divider between About and Bottom */}
        <SectionDivider 
          text="$BUBU" 
          textColor="blue-purple" 
          backgroundColor="transparent"
          overlayGradient="linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(59, 130, 246, 0.1))"
          borderTop={true}
          borderBottom={true}
        />
        
        {/* Bottom Section */}
        <BottomSection />
      </main>
    </SkyBackground>
  );
}

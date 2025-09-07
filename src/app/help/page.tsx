// src/app/help/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './help.module.css';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'booking', name: 'Booking & Tickets' },
    { id: 'tracking', name: 'Bus Tracking' },
    { id: 'payment', name: 'Payments' },
    { id: 'account', name: 'Account' },
    { id: 'technical', name: 'Technical Issues' }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'tracking',
      question: 'How do I track my bus in real-time?',
      answer: 'Download our mobile app or visit our website. Enter your route number or search by destination to see live bus locations and arrival times.'
    },
    {
      id: 2,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit/debit cards, mobile payments (PayHere, Dialog eZ Cash), and our digital wallet.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'How do I book a ticket?',
      answer: 'You can book tickets through our mobile app, website, or at physical ticket counters. Online booking is available 24/7.'
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the OTP verification process.'
    },
    {
      id: 5,
      category: 'technical',
      question: 'The app is not working properly',
      answer: 'Try clearing app cache, updating to the latest version, or restarting your device. Contact support if issues persist.'
    },
    {
      id: 6,
      category: 'booking',
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify bookings up to 30 minutes before departure time through the app or website.'
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.helpPageContainer}>
      {/* Animated Background Scene */}
      <div className={styles.backgroundScene}>
        {/* Main Road */}
        <div className={styles.mainRoad}></div>
        <div className={styles.mainRoadMarkingContainer}>
          <div className={styles.mainRoadMarking}></div>
        </div>
        
        {/* Secondary Road */}
        <div className={styles.secondaryRoad}></div>
        <div className={styles.secondaryRoadMarkingContainer}>
          <div className={styles.secondaryRoadMarking}></div>
        </div>
        
        {/* Enhanced Railway */}
        <div className={styles.railwayBase}></div>
        <div className={styles.railwayTracksContainer}>
          <div className={styles.railTop}></div>
          <div className={styles.railBottom}></div>
          <div className={styles.railTiesContainer}>
            {Array(30).fill(0).map((_, i) => (
              <div key={i} className={styles.railTie} style={{ marginLeft: `${i * 30}px` }}></div>
            ))}
          </div>
          <div className={styles.railGravel}></div>
        </div>

        {/* FIX: Added styles.animateTrainMove to make the train move */}
        <div className={`${styles.train} ${styles.animateSlightBounce} ${styles.animateTrainMove}`}>
          <div className={styles.trainCarriageContainer}>
            {/* Locomotive */}
            <div className={styles.locomotive}>
              <div className={styles.locomotiveBody}></div>
              <div className={styles.locomotiveCabin}></div>
              <div className={styles.locomotiveRoof}></div>
              <div className={styles.locomotiveCatcher}></div>
              <div className={styles.locomotiveBuffer}></div>
              <div className={styles.locomotiveSign}>දුම්රිය සේවය</div>
              <div className={styles.chimney}>
                <div className={styles.chimneyTop}></div>
                <div className={`${styles.animateSteam} ${styles.steam}`}></div>
                <div className={`${styles.animateSteam} ${styles.animationDelay200} ${styles.steam}`}></div>
                <div className={`${styles.animateSteam} ${styles.animationDelay400} ${styles.steam}`}></div>
                <div className={`${styles.animateSteam} ${styles.animationDelay600} ${styles.steam}`}></div>
                <div className={`${styles.animateSteam} ${styles.animationDelay800} ${styles.steam}`}></div>
              </div>
              <div className={styles.locomotiveDome}></div>
              <div className={styles.locomotiveWhistle}></div>
              <div className={`${styles.animateWheels} ${styles.locomotiveWheel} ${styles.wheelLarge1}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelSpokesDiagonal}></div>
                <div className={styles.wheelHub}></div>
              </div>
              <div className={`${styles.animateWheels} ${styles.locomotiveWheel} ${styles.wheelLarge2}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelSpokesDiagonal}></div>
                <div className={styles.wheelHub}></div>
              </div>
              <div className={`${styles.animateWheels} ${styles.locomotiveWheel} ${styles.wheelLarge3}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelSpokesDiagonal}></div>
                <div className={styles.wheelHub}></div>
              </div>
              <div className={styles.pistonHousing}>
                <div className={`${styles.animatePiston} ${styles.piston}`}></div>
              </div>
              <div className={`${styles.locomotiveWindow} ${styles.window1}`}></div>
              <div className={`${styles.locomotiveWindow} ${styles.window2}`}></div>
              <div className={`${styles.animateLightBlink} ${styles.locomotiveHeadlight}`}></div>
            </div>
            
            {/* Red Carriage */}
            <div className={styles.carriage}>
              <div className={`${styles.carriageBody} ${styles.redCarriage}`}>
                <div className={styles.carriageStripe}></div>
              </div>
              <div className={`${styles.carriageRoof} ${styles.redCarriageRoof}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow1}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow2}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow3}`}></div>
              <div className={`${styles.animateWheels} ${styles.carriageWheel} ${styles.carriageWheel1}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelHubSmall}></div>
              </div>
              <div className={`${styles.animateWheels} ${styles.carriageWheel} ${styles.carriageWheel2}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelHubSmall}></div>
              </div>
            </div>
            
            {/* Purple Carriage */}
            <div className={styles.carriage}>
              <div className={`${styles.carriageBody} ${styles.purpleCarriage}`}>
                <div className={styles.carriageStripe}></div>
              </div>
              <div className={`${styles.carriageRoof} ${styles.purpleCarriageRoof}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow1}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow2}`}></div>
              <div className={`${styles.carriageWindow} ${styles.carriageWindow3}`}></div>
              <div className={`${styles.animateLightBlink} ${styles.animationDelay500} ${styles.carriageTaillight}`}></div>
              <div className={`${styles.animateWheels} ${styles.carriageWheel} ${styles.carriageWheel1}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelHubSmall}></div>
              </div>
              <div className={`${styles.animateWheels} ${styles.carriageWheel} ${styles.carriageWheel2}`}>
                <div className={styles.wheelInnerBorder}></div>
                <div className={styles.wheelSpokeHorizontal}></div>
                <div className={styles.wheelSpokeVertical}></div>
                <div className={styles.wheelHubSmall}></div>
              </div>
              <div className={styles.carriageConnector}></div>
            </div>
          </div>
        </div>

        {/* Enhanced Yellow Public Bus - Main Road */}
        <div className={`${styles.bus} ${styles.animateCarRight} ${styles.animationDelay1000}`}>
          <div className={styles.vehicleRelativeContainer}>
            <div className={styles.busBodyBase}></div>
            <div className={styles.busFrontHood}></div>
            <div className={styles.busEntry}>
              <div className={styles.busEntryDoor}>
                <div className={styles.busDoorHandle}></div>
                <div className={styles.busDoorDivider1}></div>
                <div className={styles.busDoorDivider2}></div>
              </div>
            </div>
            <div className={styles.busWindowsSection}>
              <div className={styles.busWindowGrid}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.busWindow}>
                    {i % 2 === 0 && <div className={styles.passengerSilhouette}></div>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.busRoof}></div>
            <div className={styles.busDestinationBoard}><div className={styles.busDestinationText}>කොළඹ</div></div>
            <div className={styles.busFrontLights}>
              <div className={styles.busFrontLightInner}></div>
            </div>
            <div className={styles.busFrontLightBeam}></div>
            <div className={`${styles.busTurnSignal} ${styles.animateLightBlink} ${styles.animationDelay300}`}></div>
            <div className={`${styles.busRearLights} ${styles.animateLightBlink} ${styles.animationDelay700}`}></div>
            <div className={styles.busLogo}>
              <div className={styles.busLogoText}>
                <div>ශ්‍රී</div>
                <div style={{ marginTop: '1px' }}>EXPRESS</div>
              </div>
            </div>
            <div className={`${styles.busWheel} ${styles.busWheelFront}`}><div className={`${styles.animateWheels} ${styles.busWheelRim}`}></div></div>
            <div className={`${styles.busWheel} ${styles.busWheelMiddle}`}><div className={`${styles.animateWheels} ${styles.busWheelRim}`}></div></div>
            <div className={`${styles.busWheel} ${styles.busWheelRear}`}><div className={`${styles.animateWheels} ${styles.busWheelRim}`}></div></div>
            <div className={`${styles.busWheelArch} ${styles.busWheelArchFront}`}></div>
            <div className={`${styles.busWheelArch} ${styles.busWheelArchMiddle}`}></div>
            <div className={`${styles.busWheelArch} ${styles.busWheelArchRear}`}></div>
            <div className={styles.busNumberPlate}><div className={styles.busNumberPlateText}>NA-5432</div></div>
            <div className={styles.busRoofRack}>
              <div className={`${styles.luggageItem} ${styles.luggage1}`}></div>
              <div className={`${styles.luggageItem} ${styles.luggage2}`}></div>
              <div className={`${styles.luggageItem} ${styles.luggage3}`}></div>
            </div>
            <div className={styles.busWiper}></div>
            <div className={styles.driverSilhouette}>
              <div className={styles.driverEye}></div>
              <div className={`${styles.driverEye} ${styles.driverEyeRight}`}></div>
            </div>
            <div className={styles.exhaustPipe}></div>
            <div className={`${styles.exhaustSmoke} ${styles.smoke1}`}></div>
            <div className={`${styles.exhaustSmoke} ${styles.smoke2}`}></div>
            <div className={`${styles.exhaustSmoke} ${styles.smoke3}`}></div>
          </div>
        </div>

        {/* Enhanced Yellow Minibus - Secondary Road */}
        <div className={`${styles.minibus} ${styles.animateCarLeft} ${styles.animationDelay2000}`}>
          <div className={styles.vehicleRelativeContainer}>
            <div className={styles.minibusBodyBase}></div>
            <div className={styles.minibusHood}></div>
            <div className={styles.minibusCabinWindows}>
              <div className={styles.minibusWindowGrid}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.minibusWindow}>
                    {(i === 0 || i === 2) && <div className={styles.minibusPassengerSilhouette}></div>}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.minibusWindshield}>
              <div className={styles.minibusWindshieldReflection}></div>
            </div>
            <div className={styles.minibusDriverSilhouette}>
              <div className={styles.minibusDriverEye}></div>
              <div className={`${styles.minibusDriverEye} ${styles.minibusDriverEyeRight}`}></div>
            </div>
            <div className={styles.minibusEntryDoor}>
              <div className={styles.minibusDoorHandle}></div>
              <div className={styles.minibusDoorStep1}></div>
              <div className={styles.minibusDoorStep2}></div>
            </div>
            <div className={styles.minibusRouteNumber}><div className={styles.minibusRouteNumberText}>154</div></div>
            <div className={`${styles.minibusWheel} ${styles.minibusWheelFront}`}><div className={`${styles.animateWheels} ${styles.minibusWheelRim}`}></div></div>
            <div className={`${styles.minibusWheel} ${styles.minibusWheelRear}`}><div className={`${styles.animateWheels} ${styles.minibusWheelRim}`}></div></div>
            <div className={`${styles.minibusWheelArch} ${styles.minibusWheelArchFront}`}></div>
            <div className={`${styles.minibusWheelArch} ${styles.minibusWheelArchRear}`}></div>
            <div className={styles.minibusHeadlight}>
              <div className={styles.minibusHeadlightInner}></div>
            </div>
            <div className={styles.minibusLightBeam}></div>
            <div className={`${styles.minibusTurnSignal} ${styles.animateLightBlink} ${styles.animationDelay400}`}></div>
            <div className={`${styles.minibusTailLight} ${styles.animateLightBlink} ${styles.animationDelay500}`}></div>
            <div className={styles.minibusLicensePlate}><div className={styles.minibusLicensePlateText}>NC-3214</div></div>
            <div className={styles.minibusCompanyLogo}><div className={styles.minibusCompanyLogoText}>බස් සේවා</div></div>
            <div className={styles.minibusRoofRack}>
              <div className={`${styles.minibusLuggage} ${styles.minibusLuggage1}`}></div>
              <div className={`${styles.minibusLuggage} ${styles.minibusLuggage2}`}></div>
            </div>
            <div className={styles.minibusExhaustPipe}></div>
            <div className={`${styles.minibusExhaustSmoke} ${styles.minibusSmoke1}`}></div>
            <div className={`${styles.minibusExhaustSmoke} ${styles.minibusSmoke2}`}></div>
          </div>
        </div>

        {/* Enhanced 3-Wheeler Tuk-Tuk - Secondary Road */}
        <div className={`${styles.tukTuk} ${styles.animateCarRight} ${styles.animationDelay1500}`}>
          <div className={styles.vehicleRelativeContainer}>
            <div className={styles.tukTukCanopy}></div>
            <div className={styles.tukTukBody}></div>
            <div className={styles.tukTukFrontSection}></div>
            <div className={styles.tukTukWindshield}>
              <div className={styles.tukTukWindshieldReflection}></div>
            </div>
            <div className={styles.tukTukDriverSilhouette}></div>
            <div className={styles.tukTukPassengerCompartment}>
              <div className={`${styles.tukTukPassenger} ${styles.tukTukPassenger1}`}></div>
              <div className={`${styles.tukTukPassenger} ${styles.tukTukPassenger2}`}></div>
            </div>
            <div className={`${styles.tukTukWheel} ${styles.tukTukWheelFront}`}><div className={`${styles.animateWheels} ${styles.tukTukWheelRim}`}></div></div>
            <div className={`${styles.tukTukWheel} ${styles.tukTukWheelRear1}`}><div className={`${styles.animateWheels} ${styles.tukTukWheelRim}`}></div></div>
            <div className={`${styles.tukTukWheel} ${styles.tukTukWheelRear2}`}><div className={`${styles.animateWheels} ${styles.tukTukWheelRim}`}></div></div>
            <div className={styles.tukTukHandlebars}></div>
            <div className={styles.tukTukHeadlight}>
              <div className={styles.tukTukHeadlightInner}></div>
            </div>
            <div className={styles.tukTukLightBeam}></div>
            <div className={styles.tukTukMeter}>
              <div className={`${styles.animateLightBlink} ${styles.animationDelay1000} ${styles.tukTukMeterLight}`}></div>
            </div>
            <div className={`${styles.tukTukTaillight} ${styles.animateLightBlink} ${styles.animationDelay800}`}></div>
            <div className={styles.tukTukLicensePlate}><div className={styles.tukTukLicensePlateText}>TK-123</div></div>
            <div className={styles.tukTukTrim}></div>
            <div className={styles.tukTukFrameConnector}></div>
            <div className={styles.tukTukExhaustPipe}></div>
            <div className={`${styles.tukTukExhaustSmoke} ${styles.tukTukSmoke1}`}></div>
            <div className={`${styles.tukTukExhaustSmoke} ${styles.tukTukSmoke2}`}></div>
          </div>
        </div>

        {/* Enhanced Motorcycle - Main Road */}
        <div className={`${styles.motorcycle} ${styles.animateCarLeft} ${styles.animationDelay1200}`}>
          <div className={styles.vehicleRelativeContainer}>
            <div className={styles.motorcycleFrame}></div>
            <div className={styles.motorcycleFuelTank}>
              <div className={styles.motorcycleFuelTankReflection}></div>
            </div>
            <div className={styles.motorcycleSeat}></div>
            <div className={styles.motorcycleRearFender}></div>
            <div className={styles.motorcycleFrontForks}></div>
            <div className={styles.motorcycleHandlebar}></div>
            <div className={styles.motorcycleEngine}></div>
            <div className={styles.motorcycleExhaustPipe}></div>
            <div className={`${styles.motorcycleExhaustSmoke} ${styles.motorcycleSmoke1}`}></div>
            <div className={`${styles.motorcycleExhaustSmoke} ${styles.motorcycleSmoke2}`}></div>
            <div className={`${styles.motorcycleWheel} ${styles.motorcycleWheelFront}`}><div className={`${styles.animateWheels} ${styles.motorcycleWheelRim}`}></div></div>
            <div className={`${styles.motorcycleWheel} ${styles.motorcycleWheelRear}`}><div className={`${styles.animateWheels} ${styles.motorcycleWheelRim}`}></div></div>
            <div className={styles.motorcycleHeadlight}>
              <div className={styles.motorcycleHeadlightInner}></div>
            </div>
            <div className={styles.motorcycleLightBeam}></div>
            <div className={`${styles.motorcycleTaillight} ${styles.animateLightBlink} ${styles.animationDelay100}`}></div>
            <div className={styles.motorcycleRider}>
              <div className={styles.motorcycleHelmet}>
                <div className={styles.motorcycleVisor}></div>
              </div>
              <div className={styles.motorcycleArm}></div>
            </div>
            <div className={styles.motorcycleLicensePlate}><div className={styles.motorcycleLicensePlateText}>MC</div></div>
          </div>
        </div>
      </div>

      {/* Page Content Wrapper */}
      <div className={styles.contentWrapper}>
        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.navBrand}>
              <span className={styles.navBrandSri}>ශ්‍රී</span>
              <span className={styles.navBrandExpress}>Express</span>
            </Link>
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/contact" className={styles.navLink}>Contact</Link>
              <Link href="/login" className={styles.navLoginButton}>Login</Link>
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className={styles.headerSection}>
          <h1 className={`${styles.headerTitle} ${styles.animateFadeInDown}`}>
            Help Center
          </h1>
          <p className={`${styles.headerSubtitle} ${styles.animateFadeInUp}`}>
            Find answers to your questions and get help with Sri Express services
          </p>
        </section>

        {/* Main Content: Search, Categories, FAQ */}
        <main className={styles.mainContent}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${styles.searchInput} ${styles.inputFocus}`}
          />

          {/* Categories */}
          <div className={styles.categoriesContainer}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div>
            {filteredFAQs.map(item => (
              <details key={item.id} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  {item.question}
                </summary>
                <div className={styles.faqAnswer}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className={styles.noResults}>
              No help articles found. Try a different search term or category.
            </div>
          )}
        </main>

        {/* Contact Support Section */}
        <section className={styles.contactSupportSection}>
          <h2 className={styles.contactSupportTitle}>
            Still need help?
          </h2>
          <p className={styles.contactSupportText}>
            Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
          <div className={styles.contactSupportButtons}>
            <Link href="/contact" className={`${styles.contactButton} ${styles.buttonHover}`}>
              Contact Support
            </Link>
            <Link href="/support" className={`${styles.contactButton} ${styles.buttonHover}`}>
              Track Ticket
            </Link>
            <a href="tel:+94112345678" className={`${styles.callButton} ${styles.buttonHover}`}>
              Call: +94 11 234 5678
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://newperfecttutionclasses.netlify.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "New Perfect Tution Classes | Best Tution Class in Juhapura by Firoz Sir",
    template: "%s | New Perfect Tution Classes — Firoz Sir Juhapura",
  },
  description:
    "New Perfect Tution Classes by Firoz Sir is the best tution class in Juhapura, Ahmedabad. Guided by Firoz Sir (best teacher in Juhapura) for 9th, 10th Board, and Primary classes. Tution class near me in Juhapura.",
  keywords: [
    "juhapura",
    "tution class in juhapura",
    "tuition class in juhapura",
    "best teacher in juhapura",
    "firoz sir",
    "new perfect tution classes",
    "new perfect tution class",
    "new perfect tution classes by firoz sir",
    "tution class near me",
    "tuition class near me in juhapura",
    "best tution class in juhapura",
    "best tuition class in juhapura",
    "Firoz Sir Ahmedabad",
    "Firoz Sir Juhapura",
    "Firoz Sir coaching centre",
    "9th std coaching Ahmedabad",
    "10th Board exam coaching Juhapura",
    "best maths teacher Juhapura Ahmedabad",
  ],
  authors: [{ name: "Firoz Sir", url: SITE_URL }],
  creator: "Firoz Sir",
  publisher: "New Perfect Tution Classes",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "r3B29g8W4pCVsklCB0c-3QBmU07Y1-MQT-uy3satRQw",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: "New Perfect Tution Classes | Best Tution Class in Juhapura by Firoz Sir",
    description:
      "Looking for the best tution class in Juhapura? Join New Perfect Tution Classes led by Firoz Sir (best teacher in Juhapura). Premier coaching for 9th & 10th Board exam success.",
    siteName: "New Perfect Tution Classes — Firoz Sir",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Perfect Tution Classes by Firoz Sir | Juhapura, Ahmedabad",
    description: "Best tution class in Juhapura by Firoz Sir. Expert coaching for 9th, 10th Board & Primary students.",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "name": "New Perfect Tution Classes",
    "alternateName": [
      "New Perfect Tution Class",
      "New Perfect Tution Classes by Firoz Sir",
      "Firoz Sir Tuition Classes",
      "Best Tution Class in Juhapura"
    ],
    "url": SITE_URL,
    "telephone": "+919925432574",
    "email": "firozshaikh914@gmail.com",
    "priceRange": "₹₹",
    "description": "New Perfect Tution Classes by Firoz Sir is the best tution class in Juhapura, Ahmedabad for 9th, 10th Board exams, and Primary students.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3, Samim Society, Near Sharifabad Society, Juhapura",
      "addressLocality": "Ahmedabad",
      "addressRegion": "Gujarat",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.0003,
      "longitude": 72.5312
    },
    "hasMap": "https://maps.google.com/?q=3+Samim+Society+Near+Sharifabad+Society+Juhapura+Ahmedabad",
    "areaServed": [
      "Juhapura",
      "Sarkhej",
      "Fatehwadi",
      "Vejalpur",
      "Ahmedabad"
    ],
    "founder": {
      "@type": "Person",
      "name": "Firoz Sir",
      "jobTitle": "Head Educator & Best Teacher in Juhapura",
      "knowsAbout": ["Mathematics", "Science", "SSC Board Preparation", "Secondary Education"],
      "workLocation": "Juhapura, Ahmedabad"
    },
    "employee": {
      "@type": "Person",
      "name": "Firoz Sir",
      "jobTitle": "Head Educator & Founder"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Firoz Sir",
    "jobTitle": "Head Educator & Best Teacher in Juhapura",
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": "New Perfect Tution Classes"
    },
    "description": "Firoz Sir is the best teacher in Juhapura, Ahmedabad with 10+ years experience guiding 9th, 10th Board, and Primary students at New Perfect Tution Classes.",
    "knowsAbout": ["Mathematics", "Science", "SSC Board Preparation"]
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "10th Board Exam Coaching by Firoz Sir in Juhapura",
    "description": "Intensive 10th SSC Board preparation by Firoz Sir at New Perfect Tution Classes in Juhapura, Ahmedabad.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "New Perfect Tution Classes",
      "sameAs": SITE_URL
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "9th Standard Foundation Coaching by Firoz Sir",
    "description": "Concept-first 9th standard coaching by Firoz Sir at New Perfect Tution Classes in Juhapura, Ahmedabad.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "New Perfect Tution Classes",
      "sameAs": SITE_URL
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Who is Firoz Sir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Firoz Sir is the best teacher in Juhapura and the Head Educator at New Perfect Tution Classes in Juhapura, Ahmedabad, with over 10 years of experience coaching 9th, 10th Board, and Primary students."
        }
      },
      {
        "@type": "Question",
        "name": "Which is the best tution class in Juhapura?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New Perfect Tution Classes by Firoz Sir is widely recognized as the best tution class in Juhapura, Ahmedabad. We offer small batch sizes, individual attention, and a proven track record of board exam toppers."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find a top tution class near me in Juhapura?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New Perfect Tution Classes is centrally located at 3, Samim Society, Near Sharifabad Society, Juhapura, Ahmedabad, making it the perfect tution class near me for students in Juhapura, Sarkhej, and Fatehwadi."
        }
      },
      {
        "@type": "Question",
        "name": "Where is New Perfect Tution Classes by Firoz Sir located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New Perfect Tution Classes by Firoz Sir is located at 3, Samim Society, Near Sharifabad Society, Juhapura, Ahmedabad, Gujarat, India."
        }
      },
      {
        "@type": "Question",
        "name": "Which courses are offered by Firoz Sir at New Perfect Tution Class?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Firoz Sir offers expert coaching for 9th Standard, 10th Standard Board Preparation, and Primary Standard classes (1st to 8th)."
        }
      }
    ]
  }
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full bg-[hsl(210_60%_4%)]`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="google-site-verification" content="r3B29g8W4pCVsklCB0c-3QBmU07Y1-MQT-uy3satRQw" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

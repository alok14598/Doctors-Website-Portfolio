/**
 * PLACEHOLDER CONTENT.
 *
 * Every clinic detail below is invented — "Meridian Family Clinic" does not
 * exist, the doctors are fictional, and the registration numbers are formatted
 * to look plausible but are not real. Replace this file with the real clinic's
 * details (and add real photos under /public/doctors) to go live. No doctor
 * photos are seeded: the UI falls back to initials, which is better than a
 * stock photo implying a person who does not work there.
 *
 * Idempotent: every write is an upsert keyed on a natural unique field, so
 * re-running will not duplicate rows.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { passwordPolicySchema } from '../src/lib/schemas/auth';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const BCRYPT_ROUNDS = 12;

const clinic = {
  name: 'Meridian Family Clinic',
  tagline: 'Everyday care, delivered carefully.',
  about:
    'Meridian Family Clinic has looked after families in Koramangala since 2011. We are a ' +
    'single-location practice, which is deliberate — it means the doctor who saw your child ' +
    'last winter is the one who sees them this winter, and your notes, scans and lab work all ' +
    'sit in one place.\n\nSix consultants cover family medicine, paediatrics, dermatology, ' +
    'orthopaedics, gynaecology and dentistry. Routine diagnostics happen on site, so most ' +
    'visits end with an answer rather than a referral.',
  mission:
    'To give every patient unhurried time with a doctor who knows their history, and to be ' +
    'straightforward about what we can and cannot treat here.',
  addressLine1: '2nd Floor, Meridian House',
  addressLine2: '18th Main Road, 5th Block, Koramangala',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560095',
  country: 'India',
  phone: '+91 80 4567 8900',
  altPhone: '+91 98450 11223',
  email: 'care@meridianclinic.example',
  mapEmbedUrl: null,
  // The hero headline is split so the second half renders in the accent colour.
  heroTitle: 'Trusted family care',
  heroTitleAccent: 'for a healthier you',
  // Drop a real clinic photograph in /public and set its path here; the hero
  // falls back to a gradient panel while this is null.
  heroImageUrl: null,
  emergencyNote:
    'We are not an emergency department. For chest pain, severe bleeding, breathing difficulty ' +
    'or a suspected stroke, call 108 or go to the nearest hospital emergency room.',
  accreditations: ['NABH Entry-Level Certified', 'NABL-accredited partner laboratory'],
  foundedYear: 2011,
};

const openingHours = [
  { dayOfWeek: 1, opensAt: '09:00', closesAt: '20:00' },
  { dayOfWeek: 2, opensAt: '09:00', closesAt: '20:00' },
  { dayOfWeek: 3, opensAt: '09:00', closesAt: '20:00' },
  { dayOfWeek: 4, opensAt: '09:00', closesAt: '20:00' },
  { dayOfWeek: 5, opensAt: '09:00', closesAt: '20:00' },
  { dayOfWeek: 6, opensAt: '09:00', closesAt: '14:00', note: 'Dental by appointment only' },
  { dayOfWeek: 0, isClosed: true, note: 'Telephone advice line open 10:00 – 13:00' },
];

const specialties = [
  {
    name: 'Family Medicine',
    slug: 'family-medicine',
    summary: 'First point of contact for illness, long-term conditions and health checks.',
    sortOrder: 1,
  },
  {
    name: 'Paediatrics',
    slug: 'paediatrics',
    summary: 'Newborn to adolescent care, including immunisation and growth monitoring.',
    sortOrder: 2,
  },
  {
    name: 'Dermatology',
    slug: 'dermatology',
    summary: 'Skin, hair and nail conditions, medical and minor surgical.',
    sortOrder: 3,
  },
  {
    name: 'Orthopaedics',
    slug: 'orthopaedics',
    summary: 'Joint, bone and sports injuries, with on-site X-ray.',
    sortOrder: 4,
  },
  {
    name: 'Obstetrics & Gynaecology',
    slug: 'obstetrics-gynaecology',
    summary: "Women's health across every stage, from screening to pregnancy care.",
    sortOrder: 5,
  },
  {
    name: 'Dentistry',
    slug: 'dentistry',
    summary: 'Preventive, restorative and cosmetic dental treatment.',
    sortOrder: 6,
  },
];

const services = [
  {
    name: 'General Consultation',
    slug: 'general-consultation',
    summary: 'A 20-minute appointment with a family physician for any new or ongoing concern.',
    description:
      'Most visits start here. Your doctor takes a full history, examines you, and either ' +
      'treats the problem the same day or orders the tests needed to narrow it down. If the ' +
      'answer sits outside what we can manage here, you will leave with a named referral and ' +
      'a copy of your notes rather than a vague suggestion to see a specialist.',
    category: 'CONSULTATION' as const,
    durationMinutes: 20,
    preparation: 'Bring any current medicines, including over-the-counter ones, and past reports.',
    sortOrder: 1,
  },
  {
    name: 'Child Health & Immunisation',
    slug: 'child-health-immunisation',
    summary: 'Well-baby checks, growth monitoring and the full national immunisation schedule.',
    description:
      'We follow the IAP immunisation schedule and keep a running growth chart for every child ' +
      'registered with us, so a dip in weight gain is caught at the visit rather than a year ' +
      'later. Appointments for children under two are scheduled in the quieter morning slots ' +
      'to keep waiting-room time short.',
    category: 'PREVENTIVE' as const,
    durationMinutes: 25,
    preparation: 'Bring the immunisation card and, for a first visit, the birth record.',
    sortOrder: 2,
  },
  {
    name: 'Annual Health Check',
    slug: 'annual-health-check',
    summary: 'A structured screening package with blood work, ECG and a consultation to review it.',
    description:
      'Blood and urine samples are collected on site before 10:00, the ECG is done the same ' +
      'morning, and you return in the afternoon or the next day to go through the results with ' +
      'a physician. We will tell you plainly which numbers matter for you and which are noise.',
    category: 'PREVENTIVE' as const,
    durationMinutes: 90,
    preparation: 'Fast for 10–12 hours beforehand. Water is fine; take regular medicines as usual.',
    sortOrder: 3,
  },
  {
    name: 'Skin & Hair Clinic',
    slug: 'skin-hair-clinic',
    summary:
      'Acne, eczema, pigmentation, hair loss and suspicious moles, assessed with dermoscopy.',
    description:
      'Chronic skin conditions are managed over a planned course rather than a single visit, ' +
      'with photographs at each review so progress is measured instead of remembered. Moles ' +
      'and lesions are examined with a dermoscope; anything doubtful is biopsied here and sent ' +
      'to an accredited histopathology lab.',
    category: 'CONSULTATION' as const,
    durationMinutes: 25,
    sortOrder: 4,
  },
  {
    name: 'Minor Procedures',
    slug: 'minor-procedures',
    summary: 'Suturing, abscess drainage, mole and cyst excision, ingrown nail correction.',
    description:
      'Carried out under local anaesthetic in a dedicated procedure room, usually within the ' +
      'same appointment. You will be told the expected healing time, what to watch for, and ' +
      'when to come back for a dressing change or suture removal before you leave.',
    category: 'PROCEDURE' as const,
    durationMinutes: 45,
    preparation: 'Arrange for someone to accompany you if the site will be bandaged.',
    sortOrder: 5,
  },
  {
    name: 'Orthopaedic Assessment',
    slug: 'orthopaedic-assessment',
    summary: 'Joint and back pain, sports injuries and fracture follow-up, with X-ray on site.',
    description:
      'Digital X-ray sits next to the consulting room, so imaging and interpretation happen in ' +
      'one visit. Simple fractures are splinted or cast here; anything needing surgery is ' +
      'referred the same day to one of three hospitals we work with regularly.',
    category: 'CONSULTATION' as const,
    durationMinutes: 30,
    sortOrder: 6,
  },
  {
    name: "Women's Health & Antenatal Care",
    slug: 'womens-health-antenatal-care',
    summary:
      'Cervical screening, contraception advice, menopause care and routine antenatal visits.',
    description:
      'Antenatal visits follow the standard schedule with ultrasound performed on site. ' +
      'Delivery is booked at a partner hospital, but the visits before and after it happen ' +
      'here, with the same doctor each time. Screening and contraception appointments are ' +
      'scheduled in a separate clinic so the waiting room is never shared with antenatal care.',
    category: 'CONSULTATION' as const,
    durationMinutes: 30,
    sortOrder: 7,
  },
  {
    name: 'Diagnostic Laboratory',
    slug: 'diagnostic-laboratory',
    summary: 'Routine blood, urine and swab tests collected on site, most reported the same day.',
    description:
      'Samples are collected in our own phlebotomy room and processed by an NABL-accredited ' +
      'partner laboratory. Routine panels are reported the same evening; specialised assays ' +
      'take two to three days. Reports are released to you directly, not only to the doctor.',
    category: 'DIAGNOSTICS' as const,
    durationMinutes: 15,
    preparation: 'Check with reception whether your specific test needs fasting.',
    sortOrder: 8,
  },
  {
    name: 'Digital X-ray & ECG',
    slug: 'digital-xray-ecg',
    summary: 'Low-dose digital radiography and 12-lead ECG, reported within the hour.',
    description:
      'Our digital X-ray uses a markedly lower dose than film and produces images a doctor can ' +
      'review on screen immediately. A 12-lead ECG takes under ten minutes and is read by the ' +
      'consulting physician before you leave.',
    category: 'DIAGNOSTICS' as const,
    durationMinutes: 20,
    preparation: 'Tell the technician if you are or might be pregnant before an X-ray.',
    sortOrder: 9,
  },
  {
    name: 'Dental Care',
    slug: 'dental-care',
    summary: 'Scaling, fillings, root canal treatment, extractions and crowns.',
    description:
      'A single dental chair with digital intraoral imaging, so a cavity can be shown to you on ' +
      'screen rather than described. Root canal treatment is completed over two sittings. ' +
      'Children are seen in the Saturday morning clinic, where appointments are longer.',
    category: 'DENTAL' as const,
    durationMinutes: 40,
    sortOrder: 10,
  },
];

const doctors = [
  {
    name: 'Dr. Ananya Rao',
    slug: 'ananya-rao',
    designation: 'Consultant Family Physician · Clinical Lead',
    specialtySlug: 'family-medicine',
    qualifications: ['MBBS', 'MD (Family Medicine)', 'Diploma in Diabetology'],
    bio:
      'Ananya founded the clinic in 2011 after eight years in hospital general medicine, with a ' +
      'particular interest in how diabetes and hypertension are actually managed between ' +
      'appointments rather than during them. She runs the chronic-care register, which means ' +
      'patients on long-term medication get called in for review instead of waiting until ' +
      'something goes wrong. She consults in English, Kannada and Hindi.',
    experienceYears: 21,
    languages: ['English', 'Kannada', 'Hindi'],
    registrationNo: 'KMC/2004/18432',
    consultingDays: [1, 2, 3, 4, 5],
    consultingHours: '9:00 am – 1:00 pm',
    serviceSlugs: ['general-consultation', 'annual-health-check', 'diagnostic-laboratory'],
    sortOrder: 1,
  },
  {
    name: 'Dr. Vikram Iyer',
    slug: 'vikram-iyer',
    designation: 'Consultant Paediatrician',
    specialtySlug: 'paediatrics',
    qualifications: ['MBBS', 'MD (Paediatrics)', 'Fellowship in Neonatology'],
    bio:
      'Vikram has looked after newborns and children for fifteen years, six of them in a ' +
      'tertiary neonatal unit. He is unusually patient with anxious first-time parents and ' +
      'firm about the things that matter — immunisation on schedule, and not treating viral ' +
      'fevers with antibiotics. He keeps the under-twos in the early morning slots so sick ' +
      'children spend as little time as possible in a shared waiting room.',
    experienceYears: 15,
    languages: ['English', 'Tamil', 'Hindi'],
    registrationNo: 'KMC/2010/24117',
    consultingDays: [1, 2, 3, 4, 5, 6],
    consultingHours: '9:00 am – 12:30 pm',
    serviceSlugs: ['child-health-immunisation', 'general-consultation'],
    sortOrder: 2,
  },
  {
    name: 'Dr. Meera Krishnan',
    slug: 'meera-krishnan',
    designation: 'Consultant Dermatologist',
    specialtySlug: 'dermatology',
    qualifications: ['MBBS', 'MD (Dermatology, Venereology & Leprosy)'],
    bio:
      'Meera treats the long, unglamorous conditions — adult acne, eczema, psoriasis, ' +
      'pigmentation — where progress is measured over months. She photographs every course of ' +
      'treatment at each review so improvement is demonstrated rather than recalled, and she ' +
      'will tell you when a cosmetic procedure is not worth the money.',
    experienceYears: 12,
    languages: ['English', 'Malayalam', 'Kannada'],
    registrationNo: 'KMC/2013/29806',
    consultingDays: [1, 3, 5],
    consultingHours: '4:00 pm – 8:00 pm',
    serviceSlugs: ['skin-hair-clinic', 'minor-procedures'],
    sortOrder: 3,
  },
  {
    name: 'Dr. Sandeep Hegde',
    slug: 'sandeep-hegde',
    designation: 'Consultant Orthopaedic Surgeon',
    specialtySlug: 'orthopaedics',
    qualifications: ['MBBS', 'MS (Orthopaedics)', 'Fellowship in Sports Medicine'],
    bio:
      'Sandeep splits his week between the clinic and operating lists at two partner hospitals. ' +
      'At Meridian he sees joint and back pain, sports injuries and fracture follow-ups, with ' +
      'X-ray in the next room. He is conservative about surgery: a good share of the knees and ' +
      'shoulders he sees are managed with a loading programme and time rather than an operation.',
    experienceYears: 17,
    languages: ['English', 'Kannada', 'Konkani'],
    registrationNo: 'KMC/2008/21574',
    consultingDays: [2, 4, 6],
    consultingHours: '5:00 pm – 8:00 pm',
    serviceSlugs: ['orthopaedic-assessment', 'digital-xray-ecg'],
    sortOrder: 4,
  },
  {
    name: 'Dr. Fatima Sheikh',
    slug: 'fatima-sheikh',
    designation: 'Consultant Obstetrician & Gynaecologist',
    specialtySlug: 'obstetrics-gynaecology',
    qualifications: ['MBBS', 'MS (Obstetrics & Gynaecology)', 'Diploma in Ultrasonography'],
    bio:
      'Fatima runs two separate clinics — antenatal care on Tuesdays and Thursdays, and ' +
      "general women's health on Mondays and Fridays — so patients are never waiting among a " +
      'group they would rather not be. She performs her own ultrasound scans, which keeps the ' +
      'scan and its explanation in the same conversation.',
    experienceYears: 14,
    languages: ['English', 'Hindi', 'Urdu'],
    registrationNo: 'KMC/2011/26349',
    consultingDays: [1, 2, 4, 5],
    consultingHours: '10:00 am – 1:00 pm',
    serviceSlugs: ['womens-health-antenatal-care', 'annual-health-check'],
    sortOrder: 5,
  },
  {
    name: 'Dr. Rohan Mathew',
    slug: 'rohan-mathew',
    designation: 'Consultant Dental Surgeon',
    specialtySlug: 'dentistry',
    qualifications: ['BDS', 'MDS (Conservative Dentistry & Endodontics)'],
    bio:
      'Rohan handles everything from a routine scaling to multi-visit root canal treatment. He ' +
      'shows patients their own intraoral images before proposing anything, on the principle ' +
      'that nobody should agree to dental work they cannot see the reason for. Saturday ' +
      'mornings are reserved for children, with longer appointments.',
    experienceYears: 10,
    languages: ['English', 'Malayalam', 'Hindi'],
    registrationNo: 'KSDC/2015/A-7742',
    consultingDays: [1, 3, 5, 6],
    consultingHours: '10:00 am – 2:00 pm',
    serviceSlugs: ['dental-care'],
    sortOrder: 6,
  },
];

const facilities = [
  {
    name: 'Digital X-ray Suite',
    description:
      'Low-dose digital radiography in the room next to orthopaedics, so imaging and ' +
      'interpretation happen in a single visit.',
    category: 'DIAGNOSTICS' as const,
    sortOrder: 1,
  },
  {
    name: 'On-site Phlebotomy & Sample Collection',
    description:
      'Blood and urine samples drawn here from 7:30 am, processed by an NABL-accredited partner ' +
      'laboratory. Most routine panels are reported the same evening.',
    category: 'DIAGNOSTICS' as const,
    sortOrder: 2,
  },
  {
    name: '12-lead ECG',
    description:
      'Performed within ten minutes of being requested and read by the consulting physician ' +
      'before you leave.',
    category: 'DIAGNOSTICS' as const,
    sortOrder: 3,
  },
  {
    name: 'Ultrasound Room',
    description:
      'Obstetric and abdominal scanning, performed by the consulting gynaecologist rather than ' +
      'a separate technician, so the scan and its explanation are one conversation.',
    category: 'DIAGNOSTICS' as const,
    sortOrder: 4,
  },
  {
    name: 'Dermoscopy & Skin Imaging',
    description:
      'Dermoscope and standardised photography for tracking moles, lesions and chronic skin ' +
      'conditions across a course of treatment.',
    category: 'DIAGNOSTICS' as const,
    sortOrder: 5,
  },
  {
    name: 'Minor Procedure Room',
    description:
      'A dedicated sterile room for suturing, excisions, abscess drainage and nail surgery ' +
      'under local anaesthetic.',
    category: 'TREATMENT' as const,
    sortOrder: 6,
  },
  {
    name: 'Nebulisation & Day Observation Bay',
    description:
      'Four reclining chairs for nebulisation, intravenous fluids and short observation, with a ' +
      'nurse present throughout.',
    category: 'TREATMENT' as const,
    sortOrder: 7,
  },
  {
    name: 'Dental Operatory',
    description:
      'A single chair with digital intraoral imaging, rotary endodontics and an autoclave ' +
      'sterilisation cycle logged for every instrument tray.',
    category: 'TREATMENT' as const,
    sortOrder: 8,
  },
  {
    name: 'Immunisation Cold Chain',
    description:
      'Vaccines held in a temperature-logged medical refrigerator with battery backup, so the ' +
      'cold chain survives a power cut.',
    category: 'TREATMENT' as const,
    sortOrder: 9,
  },
  {
    name: 'In-house Pharmacy',
    description:
      'Stocks the medicines our doctors prescribe most, open through clinic hours, so a ' +
      'prescription does not mean another trip.',
    category: 'PHARMACY' as const,
    sortOrder: 10,
  },
  {
    name: 'Step-free Access & Accessible Washroom',
    description:
      'Lift access from street level, step-free throughout, with a wheelchair available at ' +
      'reception and an accessible washroom on the same floor.',
    category: 'AMENITY' as const,
    sortOrder: 11,
  },
  {
    name: 'Quiet Waiting Area & Feeding Room',
    description:
      'Separate seating for children and for patients who would rather wait away from a busy ' +
      'room, plus a private feeding and nappy-change room.',
    category: 'AMENITY' as const,
    sortOrder: 12,
  },
  {
    name: 'Basement Parking',
    description: 'Twelve patient parking bays in the basement, including two accessible bays.',
    category: 'AMENITY' as const,
    sortOrder: 13,
  },
  {
    name: 'Digital Records & Report Access',
    description:
      'Your history, prescriptions and reports stay in one record, and reports are released to ' +
      'you directly rather than only to the doctor who ordered them.',
    category: 'AMENITY' as const,
    sortOrder: 14,
  },
];

const testimonials = [
  {
    patientName: 'Priya N.',
    rating: 5,
    quote:
      'Dr. Rao has managed my father’s diabetes for six years. What is different here is that ' +
      'they call us for review — we have never had to notice a problem ourselves first.',
    treatment: 'Chronic care',
    sortOrder: 1,
  },
  {
    patientName: 'Arjun & Divya',
    rating: 5,
    quote:
      'Both our children have been with Dr. Iyer since they were born. He has turned us away ' +
      'without antibiotics more often than he has prescribed them, and he has always been right.',
    treatment: 'Paediatrics',
    sortOrder: 2,
  },
  {
    patientName: 'Sridhar K.',
    rating: 4,
    quote:
      'X-ray done, read and explained inside forty minutes of walking in with a bad knee. ' +
      'Dr. Hegde talked me out of the surgery I had arrived convinced I needed.',
    treatment: 'Orthopaedics',
    sortOrder: 3,
  },
  {
    patientName: 'Latha M.',
    rating: 5,
    quote:
      'The antenatal clinic runs on a separate day from everything else, so I was never sitting ' +
      'in a waiting room full of coughing patients while pregnant. Small thing, mattered a lot.',
    treatment: 'Antenatal care',
    sortOrder: 4,
  },
  {
    patientName: 'Imran S.',
    rating: 5,
    quote:
      'Dr. Krishnan photographed my skin at every visit and showed me the comparison. After ' +
      'years of being told to be patient, I could finally see it working.',
    treatment: 'Dermatology',
    sortOrder: 5,
  },
];

const faqs = [
  {
    question: 'Do I need an appointment, or can I walk in?',
    answer:
      'Walk-ins are welcome for family medicine during clinic hours, though you may wait. ' +
      'Specialist clinics — dermatology, orthopaedics, gynaecology and dental — run on fixed ' +
      'days, so for those please request an appointment first.',
    category: 'APPOINTMENTS' as const,
    sortOrder: 1,
  },
  {
    question: 'What happens after I submit an appointment request?',
    answer:
      'Reception calls you back on the number you gave, usually within one working day, to ' +
      'confirm a time. The request itself does not reserve a slot — the call does. If your ' +
      'concern is urgent, please telephone us instead of using the form.',
    category: 'APPOINTMENTS' as const,
    sortOrder: 2,
  },
  {
    question: 'Can I ask to see a particular doctor?',
    answer:
      'Yes, and we would encourage it for anything ongoing. Name the doctor on the request ' +
      'form and we will offer you their next available slot rather than the clinic’s.',
    category: 'APPOINTMENTS' as const,
    sortOrder: 3,
  },
  {
    question: 'What should I bring to a first visit?',
    answer:
      'Photo ID, any current medicines in their original packaging, and past reports or ' +
      'discharge summaries if you have them. For a child, bring the immunisation card.',
    category: 'FIRST_VISIT' as const,
    sortOrder: 4,
  },
  {
    question: 'How long will I be at the clinic?',
    answer:
      'A general consultation is booked for twenty minutes and most visits are done inside the ' +
      'hour. An annual health check involves morning samples and an afternoon review, so allow ' +
      'for two visits or one long one.',
    category: 'FIRST_VISIT' as const,
    sortOrder: 5,
  },
  {
    question: 'Which payment methods do you accept?',
    answer:
      'Cash, UPI, and all major debit and credit cards. Consultation fees are payable at ' +
      'reception after the visit; laboratory and imaging charges are billed separately.',
    category: 'PAYMENTS' as const,
    sortOrder: 6,
  },
  {
    question: 'Do you handle insurance or cashless claims?',
    answer:
      'We are an outpatient clinic, and most policies reimburse outpatient care rather than ' +
      'settling it cashless. We provide itemised invoices, prescriptions and reports in the ' +
      'format insurers ask for, so you can claim afterwards.',
    category: 'PAYMENTS' as const,
    sortOrder: 7,
  },
  {
    question: 'Are lab tests and X-rays done here or sent elsewhere?',
    answer:
      'Samples are collected here and processed by an NABL-accredited partner laboratory. ' +
      'X-ray, ECG, ultrasound and dermoscopy are all performed on site and read by the ' +
      'consulting doctor.',
    category: 'FACILITIES' as const,
    sortOrder: 8,
  },
  {
    question: 'Is the clinic accessible by wheelchair?',
    answer:
      'Yes. There is lift access from street level, the floor is step-free throughout, a ' +
      'wheelchair is available at reception, and there is an accessible washroom and two ' +
      'accessible parking bays.',
    category: 'FACILITIES' as const,
    sortOrder: 9,
  },
  {
    question: 'Do you treat emergencies?',
    answer:
      'No. We are an outpatient clinic with no emergency department and no inpatient beds. For ' +
      'chest pain, severe bleeding, breathing difficulty or a suspected stroke, call 108 or go ' +
      'to the nearest hospital emergency room.',
    category: 'FACILITIES' as const,
    sortOrder: 10,
  },
];

const seedAdmin = async (): Promise<void> => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Clinic Administrator';

  if (!email || !password) {
    console.warn('  ⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user');
    return;
  }

  const policy = passwordPolicySchema.safeParse(password);
  if (!policy.success) {
    throw new Error(
      `SEED_ADMIN_PASSWORD is too weak:\n${policy.error.issues.map((i) => `  - ${i.message}`).join('\n')}`,
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash, role: 'OWNER' },
    create: { email: email.toLowerCase(), name, passwordHash, role: 'OWNER' },
  });

  console.log(`  ✓ admin user ${email}`);
};

const main = async (): Promise<void> => {
  console.log('Seeding Meridian Family Clinic (PLACEHOLDER content)…');

  // The profile is a singleton; keyed on name so re-runs update in place.
  const existingProfile = await prisma.clinicProfile.findFirst();
  if (existingProfile) {
    await prisma.clinicProfile.update({ where: { id: existingProfile.id }, data: clinic });
  } else {
    await prisma.clinicProfile.create({ data: clinic });
  }
  console.log('  ✓ clinic profile');

  for (const hour of openingHours) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: hour.dayOfWeek },
      update: hour,
      create: hour,
    });
  }
  console.log(`  ✓ ${openingHours.length} opening hours`);

  const specialtyIds = new Map<string, string>();
  for (const specialty of specialties) {
    const row = await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: specialty,
      create: specialty,
    });
    specialtyIds.set(specialty.slug, row.id);
  }
  console.log(`  ✓ ${specialties.length} specialties`);

  const serviceIds = new Map<string, string>();
  for (const service of services) {
    const row = await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
    serviceIds.set(service.slug, row.id);
  }
  console.log(`  ✓ ${services.length} services`);

  for (const { specialtySlug, serviceSlugs, ...doctor } of doctors) {
    const specialtyId = specialtyIds.get(specialtySlug);
    if (!specialtyId) throw new Error(`Unknown specialty slug: ${specialtySlug}`);

    const row = await prisma.doctor.upsert({
      where: { slug: doctor.slug },
      update: { ...doctor, specialtyId },
      create: { ...doctor, specialtyId },
    });

    // Replace the join rows outright so removing a slug above removes the link.
    await prisma.doctorService.deleteMany({ where: { doctorId: row.id } });
    await prisma.doctorService.createMany({
      data: serviceSlugs.map((slug) => {
        const serviceId = serviceIds.get(slug);
        if (!serviceId) throw new Error(`Unknown service slug: ${slug}`);
        return { doctorId: row.id, serviceId };
      }),
    });
  }
  console.log(`  ✓ ${doctors.length} doctors`);

  for (const facility of facilities) {
    const existing = await prisma.facility.findFirst({ where: { name: facility.name } });
    if (existing) {
      await prisma.facility.update({ where: { id: existing.id }, data: facility });
    } else {
      await prisma.facility.create({ data: facility });
    }
  }
  console.log(`  ✓ ${facilities.length} facilities`);

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { patientName: testimonial.patientName },
    });
    const data = { ...testimonial, isPublished: true };
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data });
    } else {
      await prisma.testimonial.create({ data });
    }
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data: faq });
    } else {
      await prisma.faq.create({ data: faq });
    }
  }
  console.log(`  ✓ ${faqs.length} FAQs`);

  await seedAdmin();

  console.log('Done.');
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

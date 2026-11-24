"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./TeamMembers.module.css";

type Person = {
  name: string;
  image: string;
  alt: string;
  role: string;
  about?: string;
};

type Partner = {
  name: string;
  logo: string;
  website: string;
  about: string;
};

// A slot is one box of the hierarchy (e.g. "Chief Wildlife Warden"); a row
// holds the slots that sit side by side at the same level.
type Slot = { label?: string; people: Person[] };
type Group = { id: string; title: string; rows: Slot[][] };

type Selected =
  | { kind: "person"; data: Person }
  | { kind: "partner"; data: Partner };

const groups: Group[] = [
  {
    id: "board-members",
    title: "Administrators",
    rows: [
      [
        {
          label: "Forest Minister",
          people: [
            {
              name: "Thiru. R. V. Ranjith Kumar",
              image: "/members/r-v-ranjith-kumar.jpg",
              alt: "Thiru. R. V. Ranjith Kumar",
              role: "Honourable Minister of Forests, Government of Tamil Nadu",
            },
          ],
        },
      ],
      [
        {
          label: "Forest Secretary",
          people: [
            {
              name: "Tmt. Kakarla Usha, IAS",
              image: "/members/kakarla-usha.png",
              alt: "Tmt. Kakarla Usha, IAS",
              role: "Additional Chief Secretary to the Government of Tamil Nadu, Environment, Climate Change & Forests Department",
            },
          ],
        },
        {
          label: "Head of the Forest Force",
          people: [
            {
              name: "Thiru. A. Udhayan, IFS",
              image: "/members/Udhayan.jpeg",
              alt: "Thiru. A. Udhayan, IFS",
              role: "Principal Chief Conservator of Forests & Head of Forest Force, Tamil Nadu",
              about:
                "Principal Chief Conservator of Forests (PCCF) and Head of Forest Force(HoFF), Tamil Nadu, Thiru. A. Udhayan, IFS assumed charge as PCCF & HoFF in August 2026.",
            },
          ],
        },
        {
          label: "Chief Wildlife Warden",
          people: [
            {
              name: "Thiru Rakesh Kumar Dogra, IFS",
              image: "/members/rakesh-kumar-dogra.jpg",
              alt: "Thiru Rakesh Kumar Dogra, IFS",
              role: "Principal Chief Conservator of Forests & Chief Wildlife Warden, Tamil Nadu",
              about:
                "Principal Chief Conservator of Forests and Chief Wildlife Warden, Tamil Nadu, Thiru Rakesh Kumar Dogra oversees the protection and management of the state’s rich biodiversity. He is responsible for enforcing wildlife laws, supervising conservation activities across national parks, tiger reserves, and wildlife sanctuaries, and coordinating with national-level conservation programs. In his role, he ensures that strategic initiatives such as Project Nilgiri Tahr are implemented effectively, emphasizing habitat restoration, population monitoring, and field-level protection to secure the long-term survival of Tamil Nadu’s state animal and the high-altitude ecosystems it inhabits.",
            },
          ],
        },
      ],
    ],
  },
  {
    id: "project-administrators",
    title: "Project Administrators",
    rows: [
      [
        {
          label: "Project Director",
          people: [
            {
              name: "Tmt R. Padmawathe, I.F.S.",
              image: "/members/Padmawathe.jpeg",
              alt: "Tmt R. Padmawathe, I.F.S.",
              role: "The Chief Conservator of Forests and Controlling Officer, Project Nilgiri Tahr",
              about:
                "Tmt R. Padmawathe, I.F.S., The Chief Conservator of Forests and Controlling Officer Project Nilgiri Tahr.",
            },
          ],
        },
        {
          label: "Project Director",
          people: [
            {
              name: "SELVI.S.SENBAGAPRIYA, IFS",
              image: "/members/SENBAGAPRIYA.jpeg",
              alt: "selvi.s.senbagapriya",
              role: "Project Director, Project Nilgiri Tahr",
              about:
                "Ms. Senbagapriya, IFS, has been Project Director of Project Nilgiri Tahr in Coimbatore from January 2026. She was the Deputy Director (Administration) of AIWC (R, T & E), Vandalur, in the Tamil Nadu Forest Department from January 2024 to January 2026. She belongs to the 2013 batch of the Indian Forest Service (IFS), Tamil Nadu Cadre. She holds a bachelor’s degree in agriculture from Tamil Nadu Agricultural University, Coimbatore, and a postgraduate degree in Geography from the University of Madras, Chennai. She has eight years of experience in wildlife and biodiversity conservation, having worked in two territorial divisions and two wildlife divisions within the Tamil Nadu Forest Department.",
            },
          ],
        },
        {
          label: "Assistant Director",
          people: [
            {
              name: "Thiru.K.Ganeshram",
              image: "/members/thiru-k-ganesh-ram.png",
              alt: "Thiru.K.Ganesh Ram",
              role: "Assistant Director, Project Nilgiri Tahr",
              about:
                "Assistant Director of Project Nilgiri Tahr, Has Contributed much for Declaration of Nanjarayan tank Bird Sanctuary in Tiruppur Forest Division. Dedicated service for Forest and Wildlife protection and Conservation by untired field inspection in all Ranges of Tiruppur Forest Division and under the leadership and guidance, major Elephant tusk and Sandal wood offence were detected, accused was arrested and remanded in Udumalpet Range. Regular inspection in all Antipoaching campsheds , wildlife census and All Scheme works and guiding Range officers and field staffs in all aspects for best outcome of all works. Excellently formed the Medicinal Tree garden in Palani Range in Kodaikanal wildlife sanctuary under 110 announcement scheme and now it look like a natural Evergreen Forest in Palani Town.",
            },
          ],
        },
      ],
    ],
  },
  {
    id: "scientific-committee",
    title: "Scientific Committee",
    rows: [
      [
        {
          people: [
            {
              name: "Thiru. D. Venkatesh, IFS",
              image: "/members/member-2.png",
              alt: "Thiru. D. Venkatesh, IFS",
              role: "Chief Conservator of Forests & Field Director, Anamalai Tiger Reserve",
            },
            {
              name: "Thiru. S. Anand, IFS",
              image: "/members/member-3.png",
              alt: "Thiru. S. Anand, IFS",
              role: "Conservator of Forests & Field Director, Srivilliputhur Megamalai Tiger Reserve",
            },
            {
              name: "Thiru. R. Kirubashankar, IFS",
              image: "/members/member-4.png",
              alt: "Thiru. R. Kirubashankar, IFS",
              role: "Conservator of Forests & Field Director, Mudumalai Tiger Reserve",
            },
            {
              name: "Dr. S. S. Sathyakumar",
              image: "/members/dr-s-s-sathyaKumar.jpeg",
              alt: "Dr. S. S. Sathyakumar",
              role: "Rtd. Scientist G & Senior Professor, WII",
              about:
                "Scientist-G and Senior Professor at the Wildlife Institute of India (WII), Dehradun, is a wildlife ecologist with over 35 years of experience in mountain ecosystems and wildlife conservation. He specializes in the study of mountain ungulates, habitat ecology, and human-wildlife interactions. He has led numerous projects across the Himalayas, focusing on wildlife surveys, habitat management, and community-based conflict resolution. His expertise also includes training forest department staff and stakeholders in conservation practices. Dr. Sathyakumar has published over 260 research papers, reports, and book chapters and serves on several IUCN/SSC specialist groups, contributing to global wildlife conservation efforts",
            },
            {
              name: "Vivek Menon ",
              image: "/members/vivek-menon.jpg",
              alt: "Vivek Menon ",
              role: "Chair of the IUCN Species Survival Commission & Founder, Trustee and Executive Director, WTI",
              about:
                "Senior Advisor to the CEO & President of IFAW Asia, long-time leader of the Wildlife Trust of India (WTI), author, environmental commentator, and wildlife photographer, with a strong advocacy background. He has trained enforcement and wildlife protection staff in many countries, lectured internationally, and served on multiple IUCN commissions (Species Survival Commission, Asian Elephant Specialist Group, etc.). He has authored and edited several books (including /'Indian Mammals: A Field Guide/'), published over 250 scientific and popular articles, and been involved in founding multiple environmental NGOs. His professional focus includes wildlife protection policy, natural heritage conservation, and raising public awareness.",
            },
            {
              name: "Dr. Yash Veer Bhatnagar ",
              image: "/members/Yash-Veer.jpeg",
              alt: "Dr. Yash Veer Bhatnagar ",
              role: "Country Representative, International Union for Conservation of Nature",
              about:
                "Country Representative at IUCN, PhD (Wildlife Sciences) is a conservation scientist with over 30 years of experience focused on high-altitude ecosystems, mountain ungulates, and human-wildlife coexistence. He completed a Master’s in Agricultural Entomology and another in Wildlife Science from the Wildlife Institute of India (WII), and earned his PhD for research on ranging and habitat use by Himalayan ibex. He has worked at Nature Conservation Foundation since 2003, co-directing its High Altitude Program, and prior to that with WII and the Snow Leopard Trust. His expertise includes wildlife ecology, habitat modelling, participatory conservation planning, policy support, and conflict resolution between people and wildlife. He has more than 90 publications spanning peer-reviewed papers, technical reports and field studies.",
            },
            {
              name: "Dr. Sreekumar Chirukandoth (TANUVAS)",
              image: "/members/sreeKumar.jpg",
              alt: "Dr. Sreekumar Chirukandoth (TANUVAS)",
              role: "HOD (Wildlife Division), Tamil Nadu Veterinary and Animal Sciences University",
              about:
                "Professor at Tamil Nadu Veterinary and Animal Sciences University (TANUVAS), Head of the Department of Wildlife Science, is a veterinarian and parasitologist with deep experience in wildlife health, diagnostics, and disease in both captive and free-range species. He teaches undergraduate, postgraduate, and doctoral students, manages wildlife health management programs, works with forest departments, NGOs, and zoos. His research spans molecular parasitology, immunology, infection in wildlife, disease diagnosis, and treatment. He has over 200 publications in related fields.",
            },
            {
              name: "Dr. S. Arumugam",
              image: "/members/shri-aarumugam.jpg",
              alt: "Dr. S. Arumugam",
              role: "Botanist, Botanical Survey of India, Coimbatore",
              about:
                "Botanist at the Southern Regional Centre, Botanical Survey of India (BSI), Coimbatore, is a plant taxonomist with over 14 years of experience in floristics and angiosperm taxonomy, specializing in the grass family (Poaceae). He began his career as a Research Fellow in 2010 and became permanent staff in 2012.  He has contributed to key projects, including the Floristic Assessment of Megamalai Wildlife Sanctuary, Cyperaceae of Tamil Nadu, and the Flora of India (Poaceae Volumes 31 & 32), covering 25 genera and 139 species. Dr. Arumugam has published 20 research papers, described eight new taxa, rediscovered one species, and reported six new state records. He has presented his work at national and international conferences, supporting conservation and ecological restoration efforts across Tamil Nadu.",
            },
          ],
        },
      ],
    ],
  },
  {
    id: "research-team",
    title: "Research Team",
    rows: [
      [
        {
          people: [
            /*  {
              name: "Dr.M.Ashok Kumar",
              image: "/members/dr-m-ashok-kumar.png",
              alt: "Dr.M.Ashok Kumar",
              about:
                "Senior Scientist and Research Coordinator is an ecologist with over 20 years of experience in ecology, wildlife conservation, wildlife management, and academia, he earned his doctoral degree in wildlife biology from AVC College in 2012. He has worked with conservation NGOs, including WWF-India and BNHS, as well as academic institutions such as Kerala Veterinary and Animal Sciences University, JNCASR-Deemed University, and AVC College. His expertise includes conducting wildlife surveys, radio-collaring large mammals, data analysis, and reporting. He has published more than 15 research articles, three book chapters, popular articles, and scientific reports.",
            }, */
            {
              name: "Dr.T.T.Shameer",
              image: "/members/Shameer.png",
              alt: "Dr.T.T.Shameer",
              role: "Senior Scientist & Research Coordinator",
              about:
                "Dr. T.T. Shameer holds a Ph.D. in Wildlife Biology. He specialises in Landscape Ecology, Population & Community Ecology, Ecological Modelling, and Climate Change. He has worked with organisations such as the WII, UNDP, AIWC and various State Forest Departments, researching carnivores from Tigers to Fishing Cats. He is a prolific researcher with a notable publication record. He has authored 20-plus scientific articles published in various international peer-reviewed journals. Also, he is a reviewer for high-impact journals such as Scientific Reports, Global Ecology and Conservation, and Journal for Nature Conservation, and he further contributes to the scientific community through peer review and evaluation of research work. He served as a Scientist at AIWC for 3.58 years, from 2022 to 2026, working on various projects focused on Human-Wildlife Conflict, wetland identification, Wildlife Policy, Species Recovery, Migratory Species Ecology, Capacity Building, Nilgiri Tahr, Indian fox, jackal, and pangolins. Currently at Project Nilgiri, he serves as Senior Scientist and Research Coordinator. Research Gate https://www.researchgate.net/profile/Thekke-Shameer.",
            },
            {
              name: "Dr.B.Subbaiyan",
              image: "/members/dr-b-subbaiyan.png",
              alt: "Dr.B.Subbaiyan",
              role: "Senior Research Fellow",
              about:
                "Senior Research Fellow of Project Nilgiri Tahr, is a plant taxonomist and conservationist. He graduated in Botany from Government Arts College, Coimbatore. He worked as a biologist at Anamalai Tiger Reserve from 2018-2020. He has co-authored two books and published 8 research articles in reputed scientific journals.",
            },
            {
              name: "Mr. N. Rajeshkumar",
              image: "/members/Rajeshkumar.jpeg",
              alt: "Mr. N. Rajeshkumar",
              role: "Senior Research Fellow",
              about:
                "Mr. N. Rajeshkumar completed Bachelor of Science in Biochemistry (2008 to 2011), PSG College of Arts & Science, Coimbatore and completed Master of Science in Environmental Science (2011 to 2013) from Bharathiar University, Coimbatore. His area of interest are Ornithology, Animal Ecology, Plant-bird interaction, Wildlife Conservation, and management. He has on 13 years’ working experience in different roles and responsibilities as Naturalist, Research Fellow, Ornithologist, Conservation Biologist from different research institutions and Departments such as SACON, Thattekkad Bird Sanctuary, Idukki Wildlife Sanctuary, Silent Valley National Park. He contributed towards wildlife research and conservation in various aspects with 4 Technical reports, 9 Research Publications in International Peer-reviewed Journals and 5 newsletter articles. Also, he worked on species specific studies on Owls in Andaman Island, Hornbills in Munnar Landscape, Sri Lanka Frogmouth in Thattekkad Bird Sanctuary and Nilgiri Tahr in the Western Ghats. He was working as Senior Research Fellow in Project Nilgiri Tahr, Coimbatore.",
            },
            /*  {
              name: "K.Manigandan",
              image: "/members/k-manigandan.png",
              alt: "K.Manigandan",
              role: "Senior Research Fellow",
              about:
                "Mr. K. Manigandan, Senior Research Fellow of Project Nilgiri Tahr, is a Wildlife Biologist. He received his Bachelor of Science in Zoology, Government Arts College, Coimbatore and Master of Science in Wildlife Biology from Government Arts College, The Nilgiris. He has studied Human Elephant Conflicts in Hosur Forest Division, Cauvery North Wildlife Sanctuary during his Master's. He worked as a Field Officer in A Rocha India (NGO), Bannerghatta National Park, Bangalore for Research and Monitoring of the Elephant Corridors. He is keen on Nature & Wildlife Conservation through Scientific Research and Conservation Education.",
            }, */
            {
              name: "K.Ragavendran",
              image: "/members/k-ragavendran.png",
              alt: "K.Ragavendran",
              role: "Senior Research Fellow",
              about:
                "K. Ragavendran has completed a Bachelor's and a Master of Science in Zoology from St. Xavier’s College, Palayamkottai. He joined as a Project Associate at Xavier Research Foundation. The core concept of the project is to promote organic farming and environmental protection in every village in Tirunelveli district. He has published seven research articles in highly reputed journals and one book. He has research experience with two funding agencies: the Jesuitenweltweit Funding Agency and the Indian Council of Medical Research (ICMR). Recently, he completed a project as a Project Associate at AIWC, with a project entitled “Fireflies: Ecology, Species Diversity, Distribution, and Habitats in Anamalai Tiger Reserve.” Currently, he has joined as a Senior Research Fellow in Project Nilgiri Tahr.",
            },
          ],
        },
      ],
    ],
  },
];

const partners: Partner[] = [
  {
    name: "GOVERNMENT OF TAMIL NADU FOREST DEPARTMENT(TNFD)",
    logo: "/logo/header-right-logo.png",
    website: "https://www.forests.tn.gov.in/",
    about:
      "The Tamil Nadu Forest Department is the primary government agency responsible for protecting and managing the state’s forests, wildlife, and biodiversity. With a network of forest divisions, wildlife sanctuaries, national parks, and tiger reserves, TNFD plays a vital role in implementing wildlife protection laws, habitat restoration projects, and eco-tourism initiatives. The department leads on-ground efforts for Nilgiri Tahr conservation, including synchronized surveys, anti-poaching patrols, and landscape-level planning to ensure the survival of this iconic species.",
  },
  {
    name: "Advanced Institute for Wildlife Conservation(AIWC)",
    logo: "/logo/aiwc-logo.png",
    website: "https://www.aiwc.res.in/",
    about:
      "The Advanced Institute for Wildlife Conservation (AIWC), established by the Government of Tamil Nadu, is a premier research and training centre focused on wildlife health, conservation genetics, and wildlife forensics. Based in Vandalur, Chennai, AIWC provides scientific support to conservation programs across the state. The institute contributes to Nilgiri Tahr conservation by offering expertise in disease diagnostics, health monitoring, and training forest staff in modern wildlife management techniques.",
  },
  {
    name: "Tamil Nadu Veterinary and Animal Sciences University (TANUVAS)",
    logo: "/logo/tnvasu.png",
    website: "https://www.tanuvas.ac.in/",
    about:
      "Tamil Nadu Veterinary and Animal Sciences University (TANUVAS) is a leading institution in veterinary science, animal health, and wildlife medicine. Its faculty and research teams support conservation by studying wildlife diseases, developing diagnostic tools, and conducting field-based health assessments. TANUVAS plays a crucial role in Project Nilgiri Tahr through veterinary care, treatment protocols, and disease management strategies that help maintain healthy wild populations.",
  },
  {
    name: "PSGR Krishnammal College for Women",
    logo: "/logo/psgr.jpg",
    website: "https://www.psgrkcw.ac.in/",
    about:
      "PSGR Krishnammal College for Women, Coimbatore, is a distinguished educational institution known for its strong emphasis on environmental education, sustainability, and community engagement. The college collaborates with Project Nilgiri Tahr in conservation awareness programs, student-driven outreach activities, and capacity-building initiatives. Through research projects and public campaigns, PSGR Krishnammal helps build climate and conservation literacy, fostering future champions for wildlife protection and ecological balance.",
  },
];

export default function TeamMembers() {
  const [isClient, setIsClient] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close on Escape and lock background scroll while the modal is open
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  function generateRandomPositions(count: number) {
    const positions = [];

    for (let i = 0; i < count; i++) {
      const top = Math.floor(Math.random() * 91) + 5; // 5 to 95
      const left = Math.floor(Math.random() * 91) + 5; // 5 to 95

      positions.push({ top, left });
    }

    return positions;
  }

  // Function to generate random leaf decorations
  const leafDecorations = useMemo(() => {
    // Only render on client to avoid hydration issues
    if (!isClient) return [];

    const leafTypes = ["🍃", "🌿", "🍂", "🌱", "🌾"];
    const colors = ["#b7aa52", "#918940", "#503c16", "#43351b"];

    const positions = generateRandomPositions(50);

    return positions.map((pos, i) => {
      const randomLeaf = leafTypes[i % leafTypes.length];
      const randomColor = colors[i % colors.length];
      const randomSize = 1.2 + (i % 3) * 0.8;
      const randomOpacity = (5 + (i % 8)) / 100;
      const randomDuration = 5 + (i % 4);
      const randomDelay = i % 3;
      const isReverse = i % 2 === 0;

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            fontSize: `clamp(${randomSize}rem, ${randomSize + 1}vw, ${
              randomSize + 1.5
            }rem)`,
            opacity: randomOpacity,
            color: randomColor,
            zIndex: 1,
            animation: `float ${randomDuration}s ease-in-out infinite ${
              isReverse ? "reverse" : ""
            } ${randomDelay}s`,
            pointerEvents: "none",
          }}
        >
          {randomLeaf}
        </div>
      );
    });
  }, [isClient]);

  const renderPersonCard = (person: Person, key: string) => (
    <motion.button
      key={key}
      type="button"
      className={styles.card}
      whileHover={{ y: -4 }}
      onClick={() => setSelected({ kind: "person", data: person })}
    >
      <div className={styles.avatar}>
        <Image
          src={person.image}
          alt={person.alt}
          fill
          sizes="96px"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </div>
      <h3 className={styles.name}>{person.name}</h3>
      <p className={styles.role}>{person.role}</p>
    </motion.button>
  );

  return (
    <section className={styles.wrapper}>
      {/* Dynamic leaf decorations - only render on client */}
      {isClient && leafDecorations}

      <div className={styles.inner}>
        {groups.map((group) => (
          <motion.div
            key={group.id}
            id={group.id}
            className={styles.teamSection}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <h2 className={styles.sectionTitle}>{group.title}</h2>

            {group.rows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.row}>
                {row.map((slot, slotIndex) => (
                  <div key={slotIndex} className={styles.slot}>
                    {slot.label && (
                      <h4 className={styles.slotLabel}>{slot.label}</h4>
                    )}
                    <div className={styles.cards}>
                      {slot.people.map((person, i) =>
                        renderPersonCard(
                          person,
                          `${group.id}-${rowIndex}-${slotIndex}-${i}`,
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        ))}

        <motion.div
          id="our-partners"
          className={styles.teamSection}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <h2 className={styles.sectionTitle}>Our Partners</h2>
          <div className={styles.cards}>
            {partners.map((partner) => (
              <motion.button
                key={partner.name}
                type="button"
                className={styles.card}
                whileHover={{ y: -4 }}
                onClick={() => setSelected({ kind: "partner", data: partner })}
              >
                <div className={styles.logo}>
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    sizes="72px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h3 className={styles.name}>{partner.name}</h3>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* === Detail Modal === */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-modal-title"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close"
                onClick={() => setSelected(null)}
              >
                ×
              </button>

              {selected.kind === "person" ? (
                <>
                  <div className={styles.modalHeader}>
                    <div className={styles.modalAvatar}>
                      <Image
                        src={selected.data.image}
                        alt={selected.data.alt}
                        fill
                        sizes="120px"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                    </div>
                    <h3 id="team-modal-title" className={styles.modalName}>
                      {selected.data.name}
                    </h3>
                    <p className={styles.modalRole}>{selected.data.role}</p>
                  </div>
                  {selected.data.about && (
                    <p className={styles.modalAbout}>{selected.data.about}</p>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.modalHeader}>
                    <div className={styles.modalLogo}>
                      <Image
                        src={selected.data.logo}
                        alt={selected.data.name}
                        fill
                        sizes="96px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <h3 id="team-modal-title" className={styles.modalName}>
                      {selected.data.name}
                    </h3>
                  </div>
                  <p className={styles.modalAbout}>{selected.data.about}</p>
                  <a
                    href={selected.data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.websiteLink}
                  >
                    Visit website →
                  </a>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

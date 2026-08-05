// Kerala Administrative Hierarchy Data
// Source: Local Government Directory (LGD), Kerala

export interface Ward {
  id: string;
  name: string;
}

export interface LocalBody {
  id: string;
  name: string;
  type: "panchayat" | "municipality" | "corporation";
  wards: Ward[];
}

export interface Taluk {
  id: string;
  name: string;
  localBodies: LocalBody[];
}

export interface District {
  id: string;
  name: string;
  taluks: Taluk[];
}

// Generate sequential wards for a local body
function w(lbId: string, count: number): Ward[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${lbId}-W${String(i + 1).padStart(2, "0")}`,
    name: `Ward ${i + 1}`,
  }));
}

// Local body shorthand
type LBTuple = [id: string, name: string, type: "panchayat" | "municipality" | "corporation", wardCount: number];
function lb([id, name, type, wc]: LBTuple): LocalBody {
  return { id, name, type, wards: w(id, wc) };
}

export const KERALA_DISTRICTS: District[] = [
  // ── 1. Thiruvananthapuram ─────────────────────────────────────────────────
  {
    id: "TVM", name: "Thiruvananthapuram",
    taluks: [
      { id: "TVM-TVM", name: "Thiruvananthapuram", localBodies: [
        lb(["TVM-TVM-01", "Thiruvananthapuram Corporation", "corporation", 100]),
        lb(["TVM-TVM-02", "Nemom Grama Panchayat", "panchayat", 13]),
        lb(["TVM-TVM-03", "Karakulam Grama Panchayat", "panchayat", 16]),
        lb(["TVM-TVM-04", "Aryanad Grama Panchayat", "panchayat", 15]),
      ]},
      { id: "TVM-NDM", name: "Nedumangad", localBodies: [
        lb(["TVM-NDM-01", "Nedumangad Municipality", "municipality", 30]),
        lb(["TVM-NDM-02", "Vellanad Grama Panchayat", "panchayat", 15]),
        lb(["TVM-NDM-03", "Palode Grama Panchayat", "panchayat", 13]),
        lb(["TVM-NDM-04", "Maranalloor Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "TVM-NYK", name: "Neyyattinkara", localBodies: [
        lb(["TVM-NYK-01", "Neyyattinkara Municipality", "municipality", 37]),
        lb(["TVM-NYK-02", "Balaramapuram Grama Panchayat", "panchayat", 17]),
        lb(["TVM-NYK-03", "Kallara Grama Panchayat", "panchayat", 14]),
        lb(["TVM-NYK-04", "Karode Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "TVM-VRK", name: "Varkala", localBodies: [
        lb(["TVM-VRK-01", "Varkala Municipality", "municipality", 29]),
        lb(["TVM-VRK-02", "Edava Grama Panchayat", "panchayat", 13]),
        lb(["TVM-VRK-03", "Navaikulam Grama Panchayat", "panchayat", 14]),
        lb(["TVM-VRK-04", "Vakkom Grama Panchayat", "panchayat", 16]),
      ]},
      { id: "TVM-KTK", name: "Kattakkada", localBodies: [
        lb(["TVM-KTK-01", "Kattakkada Grama Panchayat", "panchayat", 19]),
        lb(["TVM-KTK-02", "Manickal Grama Panchayat", "panchayat", 13]),
        lb(["TVM-KTK-03", "Andoorkonam Grama Panchayat", "panchayat", 14]),
      ]},
    ],
  },

  // ── 2. Kollam ──────────────────────────────────────────────────────────────
  {
    id: "KLM", name: "Kollam",
    taluks: [
      { id: "KLM-KLM", name: "Kollam", localBodies: [
        lb(["KLM-KLM-01", "Kollam Corporation", "corporation", 55]),
        lb(["KLM-KLM-02", "Karunagappally Municipality", "municipality", 33]),
        lb(["KLM-KLM-03", "Alappad Grama Panchayat", "panchayat", 17]),
        lb(["KLM-KLM-04", "Shaktikulangara Grama Panchayat", "panchayat", 15]),
      ]},
      { id: "KLM-KTK", name: "Kottarakkara", localBodies: [
        lb(["KLM-KTK-01", "Kottarakkara Municipality", "municipality", 31]),
        lb(["KLM-KTK-02", "Thrikkovilvattom Grama Panchayat", "panchayat", 16]),
        lb(["KLM-KTK-03", "Kulakkada Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "KLM-PNL", name: "Punalur", localBodies: [
        lb(["KLM-PNL-01", "Punalur Municipality", "municipality", 28]),
        lb(["KLM-PNL-02", "Pathanapuram Grama Panchayat", "panchayat", 15]),
        lb(["KLM-PNL-03", "Oachira Grama Panchayat", "panchayat", 13]),
      ]},
    ],
  },

  // ── 3. Pathanamthitta ──────────────────────────────────────────────────────
  {
    id: "PTA", name: "Pathanamthitta",
    taluks: [
      { id: "PTA-ADR", name: "Adoor", localBodies: [
        lb(["PTA-ADR-01", "Adoor Municipality", "municipality", 35]),
        lb(["PTA-ADR-02", "Pandalam Grama Panchayat", "panchayat", 16]),
        lb(["PTA-ADR-03", "Thiruvalla Municipality", "municipality", 33]),
      ]},
      { id: "PTA-PTA", name: "Pathanamthitta", localBodies: [
        lb(["PTA-PTA-01", "Pathanamthitta Municipality", "municipality", 33]),
        lb(["PTA-PTA-02", "Kozhencherry Grama Panchayat", "panchayat", 15]),
        lb(["PTA-PTA-03", "Ranni Grama Panchayat", "panchayat", 14]),
      ]},
    ],
  },

  // ── 4. Alappuzha ───────────────────────────────────────────────────────────
  {
    id: "ALP", name: "Alappuzha",
    taluks: [
      { id: "ALP-ABP", name: "Ambalapuzha", localBodies: [
        lb(["ALP-ABP-01", "Alappuzha Municipality", "municipality", 52]),
        lb(["ALP-ABP-02", "Kanjikuzhy Grama Panchayat", "panchayat", 14]),
        lb(["ALP-ABP-03", "Chennamkary Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "ALP-CGR", name: "Chengannur", localBodies: [
        lb(["ALP-CGR-01", "Chengannur Municipality", "municipality", 34]),
        lb(["ALP-CGR-02", "Vallikunnam Grama Panchayat", "panchayat", 15]),
        lb(["ALP-CGR-03", "Puliyoor Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "ALP-KTN", name: "Kuttanad", localBodies: [
        lb(["ALP-KTN-01", "Neelamperoor Grama Panchayat", "panchayat", 14]),
        lb(["ALP-KTN-02", "Ramankary Grama Panchayat", "panchayat", 13]),
        lb(["ALP-KTN-03", "Chambakulam Grama Panchayat", "panchayat", 15]),
      ]},
    ],
  },

  // ── 5. Kottayam ────────────────────────────────────────────────────────────
  {
    id: "KTM", name: "Kottayam",
    taluks: [
      { id: "KTM-KTM", name: "Kottayam", localBodies: [
        lb(["KTM-KTM-01", "Kottayam Municipality", "municipality", 52]),
        lb(["KTM-KTM-02", "Ettumanoor Municipality", "municipality", 31]),
        lb(["KTM-KTM-03", "Ayarkunnam Grama Panchayat", "panchayat", 16]),
      ]},
      { id: "KTM-CHG", name: "Changanacherry", localBodies: [
        lb(["KTM-CHG-01", "Changanacherry Municipality", "municipality", 39]),
        lb(["KTM-CHG-02", "Puthuppally Grama Panchayat", "panchayat", 15]),
        lb(["KTM-CHG-03", "Bharananganam Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "KTM-KJP", name: "Kanjirappally", localBodies: [
        lb(["KTM-KJP-01", "Kanjirappally Municipality", "municipality", 34]),
        lb(["KTM-KJP-02", "Pala Municipality", "municipality", 31]),
        lb(["KTM-KJP-03", "Erattupetta Grama Panchayat", "panchayat", 15]),
      ]},
    ],
  },

  // ── 6. Idukki ──────────────────────────────────────────────────────────────
  {
    id: "IDK", name: "Idukki",
    taluks: [
      { id: "IDK-DVK", name: "Devikulam", localBodies: [
        lb(["IDK-DVK-01", "Munnar Grama Panchayat", "panchayat", 13]),
        lb(["IDK-DVK-02", "Devikulam Grama Panchayat", "panchayat", 14]),
        lb(["IDK-DVK-03", "Anavilasom Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "IDK-TDP", name: "Thodupuzha", localBodies: [
        lb(["IDK-TDP-01", "Thodupuzha Municipality", "municipality", 34]),
        lb(["IDK-TDP-02", "Manakkad Grama Panchayat", "panchayat", 14]),
        lb(["IDK-TDP-03", "Vazhathoppu Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "IDK-PRM", name: "Peerumade", localBodies: [
        lb(["IDK-PRM-01", "Kumily Grama Panchayat", "panchayat", 14]),
        lb(["IDK-PRM-02", "Vandanmedu Grama Panchayat", "panchayat", 13]),
        lb(["IDK-PRM-03", "Peerumade Grama Panchayat", "panchayat", 14]),
      ]},
    ],
  },

  // ── 7. Ernakulam ───────────────────────────────────────────────────────────
  {
    id: "EKM", name: "Ernakulam",
    taluks: [
      { id: "EKM-KCI", name: "Kochi", localBodies: [
        lb(["EKM-KCI-01", "Kochi Corporation", "corporation", 74]),
        lb(["EKM-KCI-02", "North Paravur Municipality", "municipality", 39]),
        lb(["EKM-KCI-03", "Cheranalloor Grama Panchayat", "panchayat", 15]),
        lb(["EKM-KCI-04", "Thiruvaniyoor Grama Panchayat", "panchayat", 16]),
      ]},
      { id: "EKM-ALV", name: "Aluva", localBodies: [
        lb(["EKM-ALV-01", "Aluva Municipality", "municipality", 37]),
        lb(["EKM-ALV-02", "Angamaly Municipality", "municipality", 32]),
        lb(["EKM-ALV-03", "Choornikkara Grama Panchayat", "panchayat", 15]),
        lb(["EKM-ALV-04", "Kadungalloor Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "EKM-MVP", name: "Muvattupuzha", localBodies: [
        lb(["EKM-MVP-01", "Muvattupuzha Municipality", "municipality", 34]),
        lb(["EKM-MVP-02", "Ramamangalam Grama Panchayat", "panchayat", 15]),
        lb(["EKM-MVP-03", "Koothattukulam Municipality", "municipality", 31]),
      ]},
    ],
  },

  // ── 8. Thrissur ────────────────────────────────────────────────────────────
  {
    id: "TCR", name: "Thrissur",
    taluks: [
      { id: "TCR-TCR", name: "Thrissur", localBodies: [
        lb(["TCR-TCR-01", "Thrissur Corporation", "corporation", 55]),
        lb(["TCR-TCR-02", "Irinjalakuda Municipality", "municipality", 31]),
        lb(["TCR-TCR-03", "Nadathara Grama Panchayat", "panchayat", 14]),
        lb(["TCR-TCR-04", "Puthur Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "TCR-CVK", name: "Chavakkad", localBodies: [
        lb(["TCR-CVK-01", "Guruvayur Municipality", "municipality", 29]),
        lb(["TCR-CVK-02", "Chavakkad Municipality", "municipality", 31]),
        lb(["TCR-CVK-03", "Thiruthippuram Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "TCR-TLP", name: "Talappilly", localBodies: [
        lb(["TCR-TLP-01", "Thrippunithura Municipality", "municipality", 35]),
        lb(["TCR-TLP-02", "Chalissery Grama Panchayat", "panchayat", 14]),
        lb(["TCR-TLP-03", "Chiralayam Grama Panchayat", "panchayat", 13]),
      ]},
    ],
  },

  // ── 9. Palakkad ────────────────────────────────────────────────────────────
  {
    id: "PKD", name: "Palakkad",
    taluks: [
      { id: "PKD-PKD", name: "Palakkad", localBodies: [
        lb(["PKD-PKD-01", "Palakkad Municipality", "municipality", 52]),
        lb(["PKD-PKD-02", "Ottapalam Municipality", "municipality", 31]),
        lb(["PKD-PKD-03", "Parali Grama Panchayat", "panchayat", 14]),
        lb(["PKD-PKD-04", "Pirayiri Grama Panchayat", "panchayat", 15]),
      ]},
      { id: "PKD-CHT", name: "Chittur", localBodies: [
        lb(["PKD-CHT-01", "Chittur-Thathamangalam Municipality", "municipality", 30]),
        lb(["PKD-CHT-02", "Muthalamada Grama Panchayat", "panchayat", 13]),
        lb(["PKD-CHT-03", "Kannambra Grama Panchayat", "panchayat", 14]),
      ]},
      { id: "PKD-MKD", name: "Mannarkad", localBodies: [
        lb(["PKD-MKD-01", "Mannarkad Municipality", "municipality", 29]),
        lb(["PKD-MKD-02", "Agali Grama Panchayat", "panchayat", 13]),
        lb(["PKD-MKD-03", "Sholayur Grama Panchayat", "panchayat", 13]),
      ]},
    ],
  },

  // ── 10. Malappuram ─────────────────────────────────────────────────────────
  {
    id: "MLP", name: "Malappuram",
    taluks: [
      { id: "MLP-MJR", name: "Manjeri", localBodies: [
        lb(["MLP-MJR-01", "Manjeri Municipality", "municipality", 41]),
        lb(["MLP-MJR-02", "Malappuram Municipality", "municipality", 45]),
        lb(["MLP-MJR-03", "Kizhuparamba Grama Panchayat", "panchayat", 14]),
        lb(["MLP-MJR-04", "Tanur Municipality", "municipality", 31]),
      ]},
      { id: "MLP-ERN", name: "Ernad", localBodies: [
        lb(["MLP-ERN-01", "Nilambur Municipality", "municipality", 32]),
        lb(["MLP-ERN-02", "Wandoor Grama Panchayat", "panchayat", 15]),
        lb(["MLP-ERN-03", "Pulikkal Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "MLP-PNI", name: "Ponnani", localBodies: [
        lb(["MLP-PNI-01", "Ponnani Municipality", "municipality", 35]),
        lb(["MLP-PNI-02", "Kuttippuram Grama Panchayat", "panchayat", 14]),
        lb(["MLP-PNI-03", "Thrithala Grama Panchayat", "panchayat", 14]),
      ]},
    ],
  },

  // ── 11. Kozhikode ──────────────────────────────────────────────────────────
  {
    id: "KZD", name: "Kozhikode",
    taluks: [
      { id: "KZD-KZD", name: "Kozhikode", localBodies: [
        lb(["KZD-KZD-01", "Kozhikode Corporation", "corporation", 75]),
        lb(["KZD-KZD-02", "Feroke Municipality", "municipality", 31]),
        lb(["KZD-KZD-03", "Beypore Grama Panchayat", "panchayat", 13]),
        lb(["KZD-KZD-04", "Olavanna Grama Panchayat", "panchayat", 16]),
      ]},
      { id: "KZD-VDK", name: "Vadakara", localBodies: [
        lb(["KZD-VDK-01", "Vadakara Municipality", "municipality", 34]),
        lb(["KZD-VDK-02", "Koyilandy Municipality", "municipality", 34]),
        lb(["KZD-VDK-03", "Nadapuram Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "KZD-TMS", name: "Thamarassery", localBodies: [
        lb(["KZD-TMS-01", "Thamarassery Grama Panchayat", "panchayat", 16]),
        lb(["KZD-TMS-02", "Kalpetta Municipality", "municipality", 31]),
        lb(["KZD-TMS-03", "Vythiri Grama Panchayat", "panchayat", 14]),
      ]},
    ],
  },

  // ── 12. Wayanad ────────────────────────────────────────────────────────────
  {
    id: "WYD", name: "Wayanad",
    taluks: [
      { id: "WYD-MND", name: "Mananthavady", localBodies: [
        lb(["WYD-MND-01", "Mananthavady Municipality",   "municipality", 28]),
        lb(["WYD-MND-02", "Thirunelly Grama Panchayat",  "panchayat", 13]),
        lb(["WYD-MND-03", "Thrissilery Grama Panchayat", "panchayat", 13]),
        lb(["WYD-MND-04", "Edavaka Grama Panchayat",     "panchayat", 15]),
        lb(["WYD-MND-05", "Payyampally Grama Panchayat", "panchayat", 13]),
        lb(["WYD-MND-06", "Vellamunda Grama Panchayat",  "panchayat", 14]),
        lb(["WYD-MND-07", "Noolpuzha Grama Panchayat",   "panchayat", 15]),
        lb(["WYD-MND-08", "Mullenkolly Grama Panchayat", "panchayat", 13]),
      ]},
      { id: "WYD-SBT", name: "Sulthan Bathery", localBodies: [
        lb(["WYD-SBT-01", "Sulthan Bathery Municipality", "municipality", 23]),
        lb(["WYD-SBT-02", "Ambalavayal Grama Panchayat",  "panchayat", 15]),
        lb(["WYD-SBT-03", "Nenmeni Grama Panchayat",      "panchayat", 13]),
        lb(["WYD-SBT-04", "Poothadi Grama Panchayat",     "panchayat", 15]),
        lb(["WYD-SBT-05", "Pulpally Grama Panchayat",     "panchayat", 16]),
        lb(["WYD-SBT-06", "Meenangadi Grama Panchayat",   "panchayat", 14]),
      ]},
      { id: "WYD-VTR", name: "Vythiri", localBodies: [
        lb(["WYD-VTR-01", "Kalpetta Municipality",         "municipality", 28]),
        lb(["WYD-VTR-02", "Meppadi Grama Panchayat",       "panchayat", 16]),
        lb(["WYD-VTR-03", "Vythiri Grama Panchayat",       "panchayat", 15]),
        lb(["WYD-VTR-04", "Pozhuthana Grama Panchayat",    "panchayat", 14]),
        lb(["WYD-VTR-05", "Padinharathara Grama Panchayat","panchayat", 15]),
        lb(["WYD-VTR-06", "Kainatty Grama Panchayat",      "panchayat", 13]),
      ]},
    ],
  },

  // ── 13. Kannur ─────────────────────────────────────────────────────────────
  {
    id: "KNR", name: "Kannur",
    taluks: [
      { id: "KNR-KNR", name: "Kannur", localBodies: [
        lb(["KNR-KNR-01", "Kannur Corporation",         "corporation", 55]),
        lb(["KNR-KNR-02", "Thalassery Municipality",    "municipality", 52]),
        lb(["KNR-KNR-03", "Chokli Grama Panchayat",    "panchayat", 14]),
        lb(["KNR-KNR-04", "Pappinisseri Grama Panchayat","panchayat", 16]),
      ]},
      { id: "KNR-TLP", name: "Taliparamba", localBodies: [
        lb(["KNR-TLP-01", "Taliparamba Municipality",   "municipality", 33]),
        lb(["KNR-TLP-02", "Payyanur Municipality",      "municipality", 30]),
        lb(["KNR-TLP-03", "Kelakam Grama Panchayat",   "panchayat", 13]),
      ]},
      { id: "KNR-IRT", name: "Iritty", localBodies: [
        lb(["KNR-IRT-01", "Iritty Grama Panchayat",    "panchayat", 17]),
        lb(["KNR-IRT-02", "Keezhallur Grama Panchayat","panchayat", 14]),
        lb(["KNR-IRT-03", "Aralam Grama Panchayat",    "panchayat", 13]),
      ]},
    ],
  },

  // ── 14. Kasaragod ──────────────────────────────────────────────────────────
  {
    id: "KSD", name: "Kasaragod",
    taluks: [
      { id: "KSD-KSD", name: "Kasaragod", localBodies: [
        lb(["KSD-KSD-01", "Kasaragod Municipality",      "municipality", 46]),
        lb(["KSD-KSD-02", "Kanhangad Municipality",      "municipality", 35]),
        lb(["KSD-KSD-03", "Mogral Puthur Grama Panchayat","panchayat", 15]),
        lb(["KSD-KSD-04", "Pallikkara Grama Panchayat",  "panchayat", 14]),
      ]},
      { id: "KSD-HSD", name: "Hosdurg", localBodies: [
        lb(["KSD-HSD-01", "Nileshwar Municipality",      "municipality", 32]),
        lb(["KSD-HSD-02", "Cheemeni Grama Panchayat",   "panchayat", 14]),
        lb(["KSD-HSD-03", "Kodom Belur Grama Panchayat","panchayat", 13]),
      ]},
    ],
  },
];

// Helper: find district by ID
export function findDistrict(districtId: string): District | undefined {
  return KERALA_DISTRICTS.find((d) => d.id === districtId);
}

// Helper: find taluk by ID (across all districts)
export function findTaluk(talukId: string): Taluk | undefined {
  for (const d of KERALA_DISTRICTS) {
    const t = d.taluks.find((t) => t.id === talukId);
    if (t) return t;
  }
  return undefined;
}

// Helper: find local body by ID (across all taluks)
export function findLocalBody(localBodyId: string): LocalBody | undefined {
  for (const d of KERALA_DISTRICTS) {
    for (const t of d.taluks) {
      const lb = t.localBodies.find((lb) => lb.id === localBodyId);
      if (lb) return lb;
    }
  }
  return undefined;
}
